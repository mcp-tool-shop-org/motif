// ────────────────────────────────────────────
// Mixer — bus routing, FX chain, per-stem pan
// ────────────────────────────────────────────

import type {
  BusId,
  BusState,
  FxSlotState,
  FxType,
  FxParams,
  MixerSnapshot,
  StemMixState,
} from "./mixer-types.js";
import { defaultParamsForFx } from "./mixer-types.js";
import { createFxNodes, disposeFxNodes, type FxNodeSet } from "./fx.js";
import { dbToGain } from "./scene-player.js";

const ALL_BUSES: BusId[] = ["drums", "music", "master"];

/** Maximum FX slots per stem to prevent CPU overload */
const MAX_STEM_FX_SLOTS = 4;

/** Per-stem FX insert chain */
interface StemFxInsert {
  fxChain: FxNodeSet[];
  fxSlotStates: FxSlotState[];
}

/** Per-stem routing state inside the mixer */
interface StemRoute {
  stemId: string;
  /** The stem's gain node (owned by ScenePlayer, connected into our chain) */
  stemGainNode: GainNode;
  panNode: StereoPannerNode;
  bus: BusId;
  panValue: number;
}

/** Internal bus representation */
interface BusRoute {
  id: BusId;
  inputGain: GainNode;
  outputGain: GainNode;
  fxChain: FxNodeSet[];
  fxSlotStates: FxSlotState[];
  gainDb: number;
  muted: boolean;
}

export class Mixer {
  private ctx: BaseAudioContext;
  private buses = new Map<BusId, BusRoute>();
  private stemRoutes = new Map<string, StemRoute>();
  private stemFxSlots = new Map<string, StemFxInsert>();
  private masterGain: GainNode;
  private masterGainDb = 0;

  constructor(ctx: BaseAudioContext, destination: AudioNode) {
    this.ctx = ctx;
    this.masterGain = ctx.createGain();
    this.masterGain.connect(destination);

    // Create buses: drums and music feed into master bus
    for (const busId of ALL_BUSES) {
      const inputGain = ctx.createGain();
      const outputGain = ctx.createGain();
      inputGain.connect(outputGain);

      const route: BusRoute = {
        id: busId,
        inputGain,
        outputGain,
        fxChain: [],
        fxSlotStates: [],
        gainDb: 0,
        muted: false,
      };
      this.buses.set(busId, route);
    }

    // Wire bus outputs: drums → master input, music → master input
    const masterBus = this.buses.get("master")!;
    this.buses.get("drums")!.outputGain.connect(masterBus.inputGain);
    this.buses.get("music")!.outputGain.connect(masterBus.inputGain);
    // master bus output → masterGain → destination
    masterBus.outputGain.connect(this.masterGain);

    // Default: master bus gets a compressor
    this.addFxSlot("master", "compressor");
  }

  /** Get the master gain node (for transition player to ramp) */
  getMasterGain(): GainNode {
    return this.masterGain;
  }

  /** Connect a stem's gain node through [stem FX inserts] → pan → bus routing. Returns the pan node. */
  connectStem(
    stemId: string,
    stemGainNode: GainNode,
    bus: BusId = "music",
    panValue = 0,
  ): StereoPannerNode {
    // Clean up old route if exists
    this.disconnectStem(stemId);

    const panNode = this.ctx.createStereoPanner();
    panNode.pan.value = panValue;

    // Build chain: stemGain → [stem FX inserts] → panNode → bus
    this.rebuildStemFxChain(stemId, stemGainNode, panNode);

    const busRoute = this.buses.get(bus) ?? this.buses.get("music")!;
    panNode.connect(busRoute.inputGain);

    this.stemRoutes.set(stemId, { stemId, stemGainNode, panNode, bus, panValue });
    return panNode;
  }

  /** Disconnect a stem from the mixer (preserves FX assignments for reconnection) */
  disconnectStem(stemId: string): void {
    const route = this.stemRoutes.get(stemId);
    if (!route) return;
    try {
      route.stemGainNode.disconnect();
    } catch {
      // Already disconnected
    }
    // Disconnect stem FX chain outputs
    const insert = this.stemFxSlots.get(stemId);
    if (insert) {
      for (const fx of insert.fxChain) {
        try { fx.output.disconnect(); } catch { /* ok */ }
      }
    }
    try {
      route.panNode.disconnect();
    } catch {
      // Already disconnected
    }
    this.stemRoutes.delete(stemId);
    // NOTE: stemFxSlots are intentionally preserved so FX survive scene transitions
  }

  /** Disconnect all stems */
  disconnectAllStems(): void {
    for (const stemId of [...this.stemRoutes.keys()]) {
      this.disconnectStem(stemId);
    }
  }

  /** Set pan for a stem (-1 to +1) */
  setPan(stemId: string, pan: number): void {
    const route = this.stemRoutes.get(stemId);
    if (!route) return;
    route.panValue = Math.max(-1, Math.min(1, pan));
    route.panNode.pan.value = route.panValue;
  }

  /** Get pan for a stem */
  getPan(stemId: string): number {
    return this.stemRoutes.get(stemId)?.panValue ?? 0;
  }

  /** Change bus assignment for a stem */
  setStemBus(stemId: string, bus: BusId): void {
    const route = this.stemRoutes.get(stemId);
    if (!route || route.bus === bus) return;
    // Disconnect pan from old bus
    try {
      route.panNode.disconnect();
    } catch {
      // ok
    }
    // Connect to new bus
    const busRoute = this.buses.get(bus) ?? this.buses.get("music")!;
    route.panNode.connect(busRoute.inputGain);
    route.bus = bus;
  }

  /** Get bus assignment for a stem */
  getStemBus(stemId: string): BusId {
    return this.stemRoutes.get(stemId)?.bus ?? "music";
  }

  /** Set master gain in dB */
  setMasterGain(gainDb: number): void {
    this.masterGainDb = gainDb;
    this.masterGain.gain.value = dbToGain(gainDb);
  }

  /** Get master gain in dB */
  getMasterGainDb(): number {
    return this.masterGainDb;
  }

  /** Set gain for a bus in dB */
  setBusGain(busId: BusId, gainDb: number): void {
    const bus = this.buses.get(busId);
    if (!bus) return;
    bus.gainDb = gainDb;
    if (!bus.muted) {
      bus.outputGain.gain.value = dbToGain(gainDb);
    }
  }

  /** Mute/unmute a bus */
  setBusMuted(busId: BusId, muted: boolean): void {
    const bus = this.buses.get(busId);
    if (!bus) return;
    bus.muted = muted;
    bus.outputGain.gain.value = muted ? 0 : dbToGain(bus.gainDb);
  }

  /** Add an FX slot to a bus */
  addFxSlot(busId: BusId, type: FxType): void {
    const bus = this.buses.get(busId);
    if (!bus) return;

    const params = defaultParamsForFx(type);
    const fxNodes = createFxNodes(this.ctx, type, params);
    bus.fxSlotStates.push({ type, params, bypassed: false });
    bus.fxChain.push(fxNodes);
    this.rebuildBusFxChain(bus);
  }

  /** Remove an FX slot from a bus by index */
  removeFxSlot(busId: BusId, slotIndex: number): void {
    const bus = this.buses.get(busId);
    if (!bus || slotIndex < 0 || slotIndex >= bus.fxChain.length) return;

    disposeFxNodes(bus.fxChain[slotIndex]);
    bus.fxChain.splice(slotIndex, 1);
    bus.fxSlotStates.splice(slotIndex, 1);
    this.rebuildBusFxChain(bus);
  }

  /** Update FX parameters for a slot */
  updateFxSlot(busId: BusId, slotIndex: number, params: FxParams): void {
    const bus = this.buses.get(busId);
    if (!bus || slotIndex < 0 || slotIndex >= bus.fxChain.length) return;

    bus.fxSlotStates[slotIndex].params = params;
    bus.fxChain[slotIndex].update(params);
  }

  /** Bypass/enable an FX slot */
  setFxBypassed(busId: BusId, slotIndex: number, bypassed: boolean): void {
    const bus = this.buses.get(busId);
    if (!bus || slotIndex < 0 || slotIndex >= bus.fxChain.length) return;

    bus.fxSlotStates[slotIndex].bypassed = bypassed;
    this.rebuildBusFxChain(bus);
  }

  // ── Per-stem FX insert API ──

  /** Add an FX insert to a stem (max 4 per stem) */
  addStemFx(stemId: string, type: FxType, params?: FxParams): void {
    let insert = this.stemFxSlots.get(stemId);
    if (!insert) {
      insert = { fxChain: [], fxSlotStates: [] };
      this.stemFxSlots.set(stemId, insert);
    }
    if (insert.fxChain.length >= MAX_STEM_FX_SLOTS) return; // CPU guard

    const resolvedParams = params ?? defaultParamsForFx(type);
    const fxNodes = createFxNodes(this.ctx, type, resolvedParams);
    insert.fxSlotStates.push({ type, params: resolvedParams, bypassed: false });
    insert.fxChain.push(fxNodes);

    // Rebuild if the stem is currently connected
    const route = this.stemRoutes.get(stemId);
    if (route) {
      this.rebuildStemFxChain(stemId, route.stemGainNode, route.panNode);
    }
  }

  /** Remove an FX insert from a stem by slot index */
  removeStemFx(stemId: string, slotIndex: number): void {
    const insert = this.stemFxSlots.get(stemId);
    if (!insert || slotIndex < 0 || slotIndex >= insert.fxChain.length) return;

    disposeFxNodes(insert.fxChain[slotIndex]);
    insert.fxChain.splice(slotIndex, 1);
    insert.fxSlotStates.splice(slotIndex, 1);

    // Rebuild if the stem is currently connected
    const route = this.stemRoutes.get(stemId);
    if (route) {
      this.rebuildStemFxChain(stemId, route.stemGainNode, route.panNode);
    }
  }

  /** Update FX parameters for a stem FX slot */
  updateStemFx(stemId: string, slotIndex: number, params: FxParams): void {
    const insert = this.stemFxSlots.get(stemId);
    if (!insert || slotIndex < 0 || slotIndex >= insert.fxChain.length) return;

    insert.fxSlotStates[slotIndex].params = params;
    insert.fxChain[slotIndex].update(params);
  }

  /** Get per-stem FX slot states */
  getStemFxSlots(stemId: string): readonly FxSlotState[] {
    return this.stemFxSlots.get(stemId)?.fxSlotStates ?? [];
  }

  /** Remove all FX assignments for stems that no longer exist */
  pruneOrphanedStemFx(activeStemIds: Set<string>): void {
    for (const stemId of [...this.stemFxSlots.keys()]) {
      if (!activeStemIds.has(stemId)) {
        const insert = this.stemFxSlots.get(stemId)!;
        for (const fx of insert.fxChain) disposeFxNodes(fx);
        this.stemFxSlots.delete(stemId);
      }
    }
  }

  /** Get a snapshot of the current mixer state */
  getSnapshot(): MixerSnapshot {
    // TODO: gainDb, muted, and solo live on ScenePlayer's StemHandle, not the mixer.
    // getSnapshot() returns defaults (gainDb: 0, muted: false, solo: false) for all stems.
    // To provide accurate values, the mixer would need a reference to the scene player's handles.
    const stems: StemMixState[] = [];
    for (const route of this.stemRoutes.values()) {
      stems.push({
        stemId: route.stemId,
        gainDb: 0,
        pan: route.panValue,
        muted: false,
        solo: false,
        bus: route.bus,
        fxSlots: [...(this.stemFxSlots.get(route.stemId)?.fxSlotStates ?? [])],
      });
    }

    const buses: BusState[] = ALL_BUSES.map((busId) => {
      const bus = this.buses.get(busId);
      if (!bus) return { id: busId, gainDb: 0, muted: false, fxSlots: [] };
      return {
        id: busId,
        gainDb: bus.gainDb,
        muted: bus.muted,
        fxSlots: [...bus.fxSlotStates],
      };
    });

    return {
      stems,
      buses,
      masterGainDb: this.masterGainDb,
    };
  }

  /** Dispose all resources */
  dispose(): void {
    this.disconnectAllStems();
    // Clean up all stem FX
    for (const insert of this.stemFxSlots.values()) {
      for (const fx of insert.fxChain) disposeFxNodes(fx);
    }
    this.stemFxSlots.clear();
    for (const bus of this.buses.values()) {
      for (const fx of bus.fxChain) {
        disposeFxNodes(fx);
      }
      try {
        bus.inputGain.disconnect();
        bus.outputGain.disconnect();
      } catch {
        // ok
      }
    }
    try {
      this.masterGain.disconnect();
    } catch {
      // ok
    }
    this.buses.clear();
  }

  /** Rebuild stem FX insert chain: stemGainNode → [active FX] → panNode */
  private rebuildStemFxChain(
    stemId: string,
    stemGainNode: GainNode,
    panNode: StereoPannerNode,
  ): void {
    // Disconnect stemGainNode from everything
    try {
      stemGainNode.disconnect();
    } catch {
      // ok
    }

    const insert = this.stemFxSlots.get(stemId);
    if (!insert || insert.fxChain.length === 0) {
      // No FX — direct connection
      stemGainNode.connect(panNode);
      return;
    }

    // Disconnect existing FX outputs
    for (const fx of insert.fxChain) {
      try { fx.output.disconnect(); } catch { /* ok */ }
    }

    // Build chain: stemGainNode → [active FX in sequence] → panNode
    let current: AudioNode = stemGainNode;
    for (let i = 0; i < insert.fxChain.length; i++) {
      if (insert.fxSlotStates[i].bypassed) continue;
      const fx = insert.fxChain[i];
      current.connect(fx.input);
      current = fx.output;
    }
    current.connect(panNode);
  }

  /** Rebuild the FX chain for a bus (disconnect and reconnect) */
  private rebuildBusFxChain(bus: BusRoute): void {
    // Disconnect existing chain
    try {
      bus.inputGain.disconnect();
    } catch {
      // ok
    }
    for (const fx of bus.fxChain) {
      try {
        fx.output.disconnect();
      } catch {
        // ok
      }
    }

    // Build chain: inputGain → [active FX slots in sequence] → outputGain
    let current: AudioNode = bus.inputGain;
    for (let i = 0; i < bus.fxChain.length; i++) {
      if (bus.fxSlotStates[i].bypassed) continue;
      const fx = bus.fxChain[i];
      current.connect(fx.input);
      current = fx.output;
    }
    current.connect(bus.outputGain);
  }
}
