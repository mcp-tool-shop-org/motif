import type { SoundtrackPack } from "@motif-studio/schema";
import { buildGroundedPack } from "@motif-studio/scene-mapper";

// ── Minimal Pack — smallest valid pack ──

export const minimalPack: SoundtrackPack = {
  meta: {
    id: "minimal-pack",
    name: "Minimal Pack",
    version: "1.0.0",
    description: "The smallest valid soundtrack pack — one asset, one stem, one scene.",
    author: "motif",
    tags: ["minimal", "tutorial"],
    schemaVersion: "1",
  },
  assets: [
    {
      id: "asset-drone",
      name: "Ambient Drone",
      src: "audio/drone.ogg",
      kind: "loop",
      durationMs: 16000,
      bpm: 60,
      key: "Cm",
    },
  ],
  stems: [
    {
      id: "stem-drone",
      name: "Drone Layer",
      assetId: "asset-drone",
      role: "base",
      loop: true,
    },
  ],
  scenes: [
    {
      id: "scene-ambient",
      name: "Ambient",
      category: "exploration",
      layers: [{ stemId: "stem-drone", required: true }],
    },
  ],
  bindings: [
    {
      id: "bind-ambient",
      name: "Default Ambient",
      sceneId: "scene-ambient",
      conditions: [{ field: "mode", op: "eq", value: "exploration" }],
      priority: 0,
    },
  ],
  transitions: [],
};

// ── Combat Escalation Pack — combat → boss → victory progression ──

export const combatEscalationPack: SoundtrackPack = {
  meta: {
    id: "combat-escalation-pack",
    name: "Combat Escalation Pack",
    version: "1.0.0",
    description:
      "A multi-phase combat pack: patrol → skirmish → boss → victory with layered stems and transition stingers.",
    author: "motif",
    tags: ["combat", "boss", "escalation", "rpg"],
    schemaVersion: "1",
  },
  assets: [
    {
      id: "asset-patrol-base",
      name: "Patrol Base",
      src: "audio/patrol-base.ogg",
      kind: "loop",
      durationMs: 16000,
      bpm: 100,
      key: "Dm",
    },
    {
      id: "asset-patrol-perc",
      name: "Patrol Percussion",
      src: "audio/patrol-perc.ogg",
      kind: "loop",
      durationMs: 16000,
      bpm: 100,
    },
    {
      id: "asset-skirmish-base",
      name: "Skirmish Base",
      src: "audio/skirmish-base.ogg",
      kind: "loop",
      durationMs: 8000,
      bpm: 130,
      key: "Em",
    },
    {
      id: "asset-skirmish-strings",
      name: "Skirmish Strings",
      src: "audio/skirmish-strings.ogg",
      kind: "loop",
      durationMs: 8000,
      bpm: 130,
      key: "Em",
    },
    {
      id: "asset-boss-base",
      name: "Boss Base",
      src: "audio/boss-base.ogg",
      kind: "loop",
      durationMs: 8000,
      bpm: 160,
      key: "Gm",
    },
    {
      id: "asset-boss-choir",
      name: "Boss Choir",
      src: "audio/boss-choir.ogg",
      kind: "loop",
      durationMs: 8000,
      bpm: 160,
      key: "Gm",
    },
    {
      id: "asset-victory-fanfare",
      name: "Victory Fanfare",
      src: "audio/victory-fanfare.ogg",
      kind: "oneshot",
      durationMs: 5000,
    },
    {
      id: "asset-stinger-engage",
      name: "Engage Stinger",
      src: "audio/stinger-engage.ogg",
      kind: "stinger",
      durationMs: 1200,
    },
    {
      id: "asset-stinger-boss",
      name: "Boss Stinger",
      src: "audio/stinger-boss.ogg",
      kind: "stinger",
      durationMs: 2000,
    },
  ],
  stems: [
    {
      id: "stem-patrol-base",
      name: "Patrol Base",
      assetId: "asset-patrol-base",
      role: "base",
      loop: true,
    },
    {
      id: "stem-patrol-perc",
      name: "Patrol Percussion",
      assetId: "asset-patrol-perc",
      role: "accent",
      loop: true,
      mutedByDefault: true,
      gainDb: -2,
    },
    {
      id: "stem-skirmish-base",
      name: "Skirmish Base",
      assetId: "asset-skirmish-base",
      role: "combat",
      loop: true,
    },
    {
      id: "stem-skirmish-strings",
      name: "Skirmish Strings",
      assetId: "asset-skirmish-strings",
      role: "danger",
      loop: true,
      mutedByDefault: true,
    },
    {
      id: "stem-boss-base",
      name: "Boss Base",
      assetId: "asset-boss-base",
      role: "boss",
      loop: true,
    },
    {
      id: "stem-boss-choir",
      name: "Boss Choir",
      assetId: "asset-boss-choir",
      role: "boss",
      loop: true,
      gainDb: -4,
    },
    {
      id: "stem-victory",
      name: "Victory Fanfare",
      assetId: "asset-victory-fanfare",
      role: "recovery",
      loop: false,
    },
  ],
  scenes: [
    {
      id: "scene-patrol",
      name: "Patrol",
      category: "exploration",
      layers: [
        { stemId: "stem-patrol-base", required: true, startMode: "immediate" },
        { stemId: "stem-patrol-perc", startMode: "next-bar" },
      ],
      fallbackSceneId: "scene-patrol",
      tags: ["outdoor"],
    },
    {
      id: "scene-skirmish",
      name: "Skirmish",
      category: "combat",
      layers: [
        { stemId: "stem-skirmish-base", required: true },
        { stemId: "stem-skirmish-strings" },
      ],
      fallbackSceneId: "scene-patrol",
    },
    {
      id: "scene-boss",
      name: "Boss Fight",
      category: "boss",
      layers: [
        { stemId: "stem-boss-base", required: true },
        { stemId: "stem-boss-choir" },
      ],
      fallbackSceneId: "scene-skirmish",
    },
    {
      id: "scene-victory",
      name: "Victory",
      category: "victory",
      layers: [{ stemId: "stem-victory", required: true }],
      fallbackSceneId: "scene-patrol",
    },
  ],
  bindings: [
    {
      id: "bind-patrol",
      name: "Patrol Mode",
      sceneId: "scene-patrol",
      conditions: [{ field: "inCombat", op: "eq", value: false }],
      priority: 0,
    },
    {
      id: "bind-skirmish",
      name: "Skirmish Engaged",
      sceneId: "scene-skirmish",
      conditions: [
        { field: "inCombat", op: "eq", value: true },
        { field: "boss", op: "eq", value: false },
      ],
      priority: 10,
    },
    {
      id: "bind-boss",
      name: "Boss Encounter",
      sceneId: "scene-boss",
      conditions: [
        { field: "inCombat", op: "eq", value: true },
        { field: "boss", op: "eq", value: true },
      ],
      priority: 20,
    },
    {
      id: "bind-victory",
      name: "Victory Event",
      sceneId: "scene-victory",
      conditions: [{ field: "victory", op: "eq", value: true }],
      priority: 30,
      stopProcessing: true,
    },
  ],
  transitions: [
    {
      id: "trans-patrol-to-skirmish",
      name: "Patrol → Skirmish",
      fromSceneId: "scene-patrol",
      toSceneId: "scene-skirmish",
      mode: "stinger-then-switch",
      stingerAssetId: "asset-stinger-engage",
      durationMs: 1200,
    },
    {
      id: "trans-skirmish-to-boss",
      name: "Skirmish → Boss",
      fromSceneId: "scene-skirmish",
      toSceneId: "scene-boss",
      mode: "stinger-then-switch",
      stingerAssetId: "asset-stinger-boss",
      durationMs: 2000,
    },
    {
      id: "trans-boss-to-victory",
      name: "Boss → Victory",
      fromSceneId: "scene-boss",
      toSceneId: "scene-victory",
      mode: "immediate",
    },
    {
      id: "trans-victory-to-patrol",
      name: "Victory → Patrol",
      fromSceneId: "scene-victory",
      toSceneId: "scene-patrol",
      mode: "crossfade",
      durationMs: 3000,
    },
    {
      id: "trans-skirmish-to-patrol",
      name: "Skirmish → Patrol (disengage)",
      fromSceneId: "scene-skirmish",
      toSceneId: "scene-patrol",
      mode: "crossfade",
      durationMs: 2000,
    },
  ],
};

// ── Starter Adventure Pack ──

export const starterPack: SoundtrackPack = {
  meta: {
    id: "starter-pack",
    name: "Starter Adventure Pack",
    version: "1.0.0",
    description: "A basic exploration and combat soundtrack pack.",
    author: "motif",
    tags: ["starter", "rpg"],
    schemaVersion: "1",
  },
  assets: [
    {
      id: "asset-explore-base",
      name: "Exploration Base",
      src: "audio/explore-base.ogg",
      kind: "loop",
      durationMs: 16000,
      bpm: 90,
      key: "Am",
    },
    {
      id: "asset-explore-accent",
      name: "Exploration Accent",
      src: "audio/explore-accent.ogg",
      kind: "loop",
      durationMs: 16000,
      bpm: 90,
      loopStartMs: 0,
      loopEndMs: 16000,
    },
    {
      id: "asset-tension-base",
      name: "Tension Base",
      src: "audio/tension-base.ogg",
      kind: "loop",
      durationMs: 8000,
      bpm: 110,
      key: "Dm",
    },
    {
      id: "asset-combat-base",
      name: "Combat Base",
      src: "audio/combat-base.ogg",
      kind: "loop",
      durationMs: 8000,
      bpm: 140,
      key: "Em",
    },
    {
      id: "asset-combat-danger",
      name: "Combat Danger Layer",
      src: "audio/combat-danger.ogg",
      kind: "loop",
      durationMs: 8000,
      bpm: 140,
    },
    {
      id: "asset-victory-fanfare",
      name: "Victory Fanfare",
      src: "audio/victory-fanfare.ogg",
      kind: "oneshot",
      durationMs: 4000,
    },
    {
      id: "asset-stinger-combat",
      name: "Combat Stinger",
      src: "audio/stinger-combat.ogg",
      kind: "stinger",
      durationMs: 1500,
    },
    {
      id: "asset-safe-ambient",
      name: "Safe Zone Ambient",
      src: "audio/safe-ambient.ogg",
      kind: "ambient",
      durationMs: 30000,
      tags: ["calm", "town"],
    },
  ],
  stems: [
    {
      id: "stem-explore-base",
      name: "Explore Base",
      assetId: "asset-explore-base",
      role: "base",
      loop: true,
    },
    {
      id: "stem-explore-accent",
      name: "Explore Accent",
      assetId: "asset-explore-accent",
      role: "accent",
      loop: true,
      mutedByDefault: true,
      gainDb: -3,
    },
    {
      id: "stem-tension-base",
      name: "Tension Base",
      assetId: "asset-tension-base",
      role: "danger",
      loop: true,
    },
    {
      id: "stem-combat-base",
      name: "Combat Base",
      assetId: "asset-combat-base",
      role: "combat",
      loop: true,
    },
    {
      id: "stem-combat-danger",
      name: "Combat Danger",
      assetId: "asset-combat-danger",
      role: "danger",
      loop: true,
      mutedByDefault: true,
    },
    {
      id: "stem-victory",
      name: "Victory Fanfare",
      assetId: "asset-victory-fanfare",
      role: "recovery",
      loop: false,
    },
    {
      id: "stem-safe-ambient",
      name: "Safe Ambient",
      assetId: "asset-safe-ambient",
      role: "base",
      loop: true,
    },
  ],
  scenes: [
    {
      id: "scene-exploration",
      name: "Exploration",
      category: "exploration",
      layers: [
        {
          stemId: "stem-explore-base",
          required: true,
          startMode: "immediate",
        },
        { stemId: "stem-explore-accent", startMode: "next-bar" },
      ],
      fallbackSceneId: "scene-safe-zone",
      tags: ["outdoor", "default"],
    },
    {
      id: "scene-tension",
      name: "Rising Tension",
      category: "tension",
      layers: [{ stemId: "stem-tension-base", required: true }],
      fallbackSceneId: "scene-exploration",
    },
    {
      id: "scene-combat",
      name: "Combat",
      category: "combat",
      layers: [
        { stemId: "stem-combat-base", required: true },
        { stemId: "stem-combat-danger" },
      ],
      fallbackSceneId: "scene-tension",
    },
    {
      id: "scene-victory",
      name: "Victory",
      category: "victory",
      layers: [{ stemId: "stem-victory", required: true }],
      fallbackSceneId: "scene-exploration",
    },
    {
      id: "scene-safe-zone",
      name: "Safe Zone",
      category: "safe-zone",
      layers: [{ stemId: "stem-safe-ambient", required: true }],
      tags: ["town", "rest"],
    },
  ],
  bindings: [
    {
      id: "bind-explore",
      name: "Explore Mode",
      sceneId: "scene-exploration",
      conditions: [{ field: "mode", op: "eq", value: "exploration" }],
      priority: 0,
    },
    {
      id: "bind-tension",
      name: "Danger Rising",
      sceneId: "scene-tension",
      conditions: [{ field: "danger", op: "gte", value: 0.5 }],
      priority: 10,
    },
    {
      id: "bind-combat",
      name: "In Combat",
      sceneId: "scene-combat",
      conditions: [{ field: "inCombat", op: "eq", value: true }],
      priority: 20,
    },
    {
      id: "bind-victory",
      name: "Victory Event",
      sceneId: "scene-victory",
      conditions: [{ field: "victory", op: "eq", value: true }],
      priority: 30,
      stopProcessing: true,
    },
    {
      id: "bind-safe",
      name: "Safe Zone",
      sceneId: "scene-safe-zone",
      conditions: [{ field: "safeZone", op: "eq", value: true }],
      priority: 5,
    },
  ],
  transitions: [
    {
      id: "trans-explore-to-tension",
      name: "Explore → Tension",
      fromSceneId: "scene-exploration",
      toSceneId: "scene-tension",
      mode: "crossfade",
      durationMs: 2000,
    },
    {
      id: "trans-tension-to-combat",
      name: "Tension → Combat",
      fromSceneId: "scene-tension",
      toSceneId: "scene-combat",
      mode: "stinger-then-switch",
      stingerAssetId: "asset-stinger-combat",
      durationMs: 1500,
    },
    {
      id: "trans-combat-to-victory",
      name: "Combat → Victory",
      fromSceneId: "scene-combat",
      toSceneId: "scene-victory",
      mode: "immediate",
    },
    {
      id: "trans-victory-to-explore",
      name: "Victory → Explore",
      fromSceneId: "scene-victory",
      toSceneId: "scene-exploration",
      mode: "cooldown-fade",
      durationMs: 3000,
    },
  ],
};

// ── Synth Demo Pack — fully self-contained, no audio files needed ──
// All sound is generated through synth/drum voices using factory presets.
// MIDI note reference: C4=60, D4=62, E4=64, F4=65, G4=67, A4=69, B4=71
// Drum map: kick=36, snare=38, closedHat=42, openHat=46, clap=39
// Tick grid: quarter=480, 8th=240, 16th=120

export const synthDemoPack: SoundtrackPack = {
  meta: {
    id: "synth-demo-pack",
    name: "Synth Demo — Game Soundtrack",
    version: "1.0.0",
    description:
      "A fully synthesized adaptive soundtrack. No audio files required — all sound generated from clips through synth and drum voices.",
    author: "motif",
    tags: ["synth", "demo", "rpg", "adaptive"],
    schemaVersion: "1",
  },

  // No audio assets needed — everything is clip-based synthesis
  assets: [],
  stems: [],

  clips: [
    // ─── Town / Safe Zone (C major, 80 BPM) ───
    {
      id: "clip-town-pad",
      name: "Town Pad",
      lane: "harmony",
      instrumentId: "pad-warm",
      bpm: 80,
      lengthBeats: 8,
      loop: true,
      keyRoot: 0,
      keyScale: "major",
      notes: [
        // C major chord (C4-E4-G4) held for 4 beats
        { pitch: 60, startTick: 0, durationTicks: 1920, velocity: 70 },
        { pitch: 64, startTick: 0, durationTicks: 1920, velocity: 65 },
        { pitch: 67, startTick: 0, durationTicks: 1920, velocity: 60 },
        // F major chord (F4-A4-C5) held for 4 beats
        { pitch: 65, startTick: 1920, durationTicks: 1920, velocity: 70 },
        { pitch: 69, startTick: 1920, durationTicks: 1920, velocity: 65 },
        { pitch: 72, startTick: 1920, durationTicks: 1920, velocity: 60 },
      ],
    },
    {
      id: "clip-town-arp",
      name: "Town Arpeggio",
      lane: "motif",
      instrumentId: "pulse-arp",
      bpm: 80,
      lengthBeats: 8,
      loop: true,
      keyRoot: 0,
      keyScale: "major",
      gainDb: -4,
      notes: [
        // C arpeggio over 4 beats (8th notes)
        { pitch: 72, startTick: 0, durationTicks: 200, velocity: 80 },
        { pitch: 76, startTick: 240, durationTicks: 200, velocity: 70 },
        { pitch: 79, startTick: 480, durationTicks: 200, velocity: 75 },
        { pitch: 76, startTick: 720, durationTicks: 200, velocity: 65 },
        { pitch: 72, startTick: 960, durationTicks: 200, velocity: 80 },
        { pitch: 79, startTick: 1200, durationTicks: 200, velocity: 70 },
        { pitch: 76, startTick: 1440, durationTicks: 200, velocity: 75 },
        { pitch: 72, startTick: 1680, durationTicks: 200, velocity: 65 },
        // F arpeggio over 4 beats
        { pitch: 77, startTick: 1920, durationTicks: 200, velocity: 80 },
        { pitch: 81, startTick: 2160, durationTicks: 200, velocity: 70 },
        { pitch: 84, startTick: 2400, durationTicks: 200, velocity: 75 },
        { pitch: 81, startTick: 2640, durationTicks: 200, velocity: 65 },
        { pitch: 77, startTick: 2880, durationTicks: 200, velocity: 80 },
        { pitch: 84, startTick: 3120, durationTicks: 200, velocity: 70 },
        { pitch: 81, startTick: 3360, durationTicks: 200, velocity: 75 },
        { pitch: 77, startTick: 3600, durationTicks: 200, velocity: 65 },
      ],
    },

    // ─── Exploration (A minor, 100 BPM) ───
    {
      id: "clip-explore-bass",
      name: "Exploration Bass",
      lane: "bass",
      instrumentId: "bass-sub",
      bpm: 100,
      lengthBeats: 8,
      loop: true,
      keyRoot: 9,
      keyScale: "minor",
      notes: [
        // Am bass pattern: A2-A2-E2-E2 | F2-F2-G2-G2
        { pitch: 45, startTick: 0, durationTicks: 420, velocity: 100 },
        { pitch: 45, startTick: 480, durationTicks: 420, velocity: 90 },
        { pitch: 40, startTick: 960, durationTicks: 420, velocity: 100 },
        { pitch: 40, startTick: 1440, durationTicks: 420, velocity: 85 },
        { pitch: 41, startTick: 1920, durationTicks: 420, velocity: 100 },
        { pitch: 41, startTick: 2400, durationTicks: 420, velocity: 90 },
        { pitch: 43, startTick: 2880, durationTicks: 420, velocity: 100 },
        { pitch: 43, startTick: 3360, durationTicks: 420, velocity: 85 },
      ],
    },
    {
      id: "clip-explore-melody",
      name: "Exploration Melody",
      lane: "motif",
      instrumentId: "lead-pluck",
      bpm: 100,
      lengthBeats: 8,
      loop: true,
      keyRoot: 9,
      keyScale: "minor",
      notes: [
        // Thoughtful A minor melody
        { pitch: 69, startTick: 0, durationTicks: 360, velocity: 85 },
        { pitch: 72, startTick: 480, durationTicks: 240, velocity: 80 },
        { pitch: 71, startTick: 720, durationTicks: 240, velocity: 75 },
        { pitch: 69, startTick: 960, durationTicks: 480, velocity: 85 },
        { pitch: 67, startTick: 1440, durationTicks: 480, velocity: 80 },
        // Second phrase
        { pitch: 65, startTick: 1920, durationTicks: 360, velocity: 85 },
        { pitch: 67, startTick: 2400, durationTicks: 240, velocity: 80 },
        { pitch: 69, startTick: 2640, durationTicks: 240, velocity: 75 },
        { pitch: 72, startTick: 2880, durationTicks: 480, velocity: 90 },
        { pitch: 69, startTick: 3360, durationTicks: 480, velocity: 80 },
      ],
    },

    // ─── Tension (D minor, 110 BPM) ───
    {
      id: "clip-tension-pad",
      name: "Tension Pad",
      lane: "harmony",
      instrumentId: "pad-dark",
      bpm: 110,
      lengthBeats: 8,
      loop: true,
      keyRoot: 2,
      keyScale: "minor",
      notes: [
        // Dm → Bb → Gm → A (dark progression)
        { pitch: 62, startTick: 0, durationTicks: 1920, velocity: 75 },
        { pitch: 65, startTick: 0, durationTicks: 1920, velocity: 70 },
        { pitch: 69, startTick: 0, durationTicks: 1920, velocity: 65 },
        // Bb chord
        { pitch: 58, startTick: 1920, durationTicks: 1920, velocity: 75 },
        { pitch: 62, startTick: 1920, durationTicks: 1920, velocity: 70 },
        { pitch: 65, startTick: 1920, durationTicks: 1920, velocity: 65 },
      ],
    },
    {
      id: "clip-tension-pulse",
      name: "Tension Pulse",
      lane: "accent",
      instrumentId: "pulse-tick",
      bpm: 110,
      lengthBeats: 4,
      loop: true,
      keyRoot: 2,
      keyScale: "minor",
      gainDb: -2,
      notes: [
        // Urgent 16th-note pulse on D5
        { pitch: 74, startTick: 0, durationTicks: 60, velocity: 90 },
        { pitch: 74, startTick: 120, durationTicks: 60, velocity: 60 },
        { pitch: 74, startTick: 240, durationTicks: 60, velocity: 70 },
        { pitch: 74, startTick: 360, durationTicks: 60, velocity: 55 },
        { pitch: 74, startTick: 480, durationTicks: 60, velocity: 90 },
        { pitch: 74, startTick: 600, durationTicks: 60, velocity: 60 },
        { pitch: 74, startTick: 720, durationTicks: 60, velocity: 70 },
        { pitch: 74, startTick: 840, durationTicks: 60, velocity: 55 },
        { pitch: 74, startTick: 960, durationTicks: 60, velocity: 85 },
        { pitch: 74, startTick: 1080, durationTicks: 60, velocity: 55 },
        { pitch: 74, startTick: 1200, durationTicks: 60, velocity: 70 },
        { pitch: 74, startTick: 1320, durationTicks: 60, velocity: 55 },
        { pitch: 74, startTick: 1440, durationTicks: 60, velocity: 90 },
        { pitch: 74, startTick: 1560, durationTicks: 60, velocity: 60 },
        { pitch: 74, startTick: 1680, durationTicks: 60, velocity: 70 },
        { pitch: 74, startTick: 1800, durationTicks: 60, velocity: 55 },
      ],
    },

    // ─── Combat (E minor, 140 BPM) ───
    {
      id: "clip-combat-drums",
      name: "Combat Drums",
      lane: "drums",
      instrumentId: "drums-standard",
      bpm: 140,
      lengthBeats: 4,
      loop: true,
      notes: [
        // Driving 4-on-the-floor with snare on 2&4
        // Beat 1: kick + hat
        { pitch: 36, startTick: 0, durationTicks: 120, velocity: 110 },
        { pitch: 42, startTick: 0, durationTicks: 60, velocity: 80 },
        { pitch: 42, startTick: 120, durationTicks: 60, velocity: 60 },
        // Beat 1.5: hat
        { pitch: 42, startTick: 240, durationTicks: 60, velocity: 70 },
        { pitch: 42, startTick: 360, durationTicks: 60, velocity: 55 },
        // Beat 2: snare + hat
        { pitch: 38, startTick: 480, durationTicks: 120, velocity: 105 },
        { pitch: 42, startTick: 480, durationTicks: 60, velocity: 80 },
        { pitch: 42, startTick: 600, durationTicks: 60, velocity: 60 },
        // Beat 2.5: hat + kick
        { pitch: 36, startTick: 720, durationTicks: 120, velocity: 90 },
        { pitch: 42, startTick: 720, durationTicks: 60, velocity: 70 },
        { pitch: 42, startTick: 840, durationTicks: 60, velocity: 55 },
        // Beat 3: kick + hat
        { pitch: 36, startTick: 960, durationTicks: 120, velocity: 110 },
        { pitch: 42, startTick: 960, durationTicks: 60, velocity: 80 },
        { pitch: 42, startTick: 1080, durationTicks: 60, velocity: 60 },
        // Beat 3.5: hat
        { pitch: 42, startTick: 1200, durationTicks: 60, velocity: 70 },
        { pitch: 42, startTick: 1320, durationTicks: 60, velocity: 55 },
        // Beat 4: snare + open hat
        { pitch: 38, startTick: 1440, durationTicks: 120, velocity: 110 },
        { pitch: 46, startTick: 1440, durationTicks: 120, velocity: 85 },
        { pitch: 42, startTick: 1680, durationTicks: 60, velocity: 60 },
        { pitch: 42, startTick: 1800, durationTicks: 60, velocity: 55 },
      ],
    },
    {
      id: "clip-combat-bass",
      name: "Combat Bass",
      lane: "bass",
      instrumentId: "bass-saw",
      bpm: 140,
      lengthBeats: 4,
      loop: true,
      keyRoot: 4,
      keyScale: "minor",
      notes: [
        // Aggressive E minor bass riff
        { pitch: 40, startTick: 0, durationTicks: 200, velocity: 110 },
        { pitch: 40, startTick: 240, durationTicks: 100, velocity: 90 },
        { pitch: 43, startTick: 480, durationTicks: 200, velocity: 105 },
        { pitch: 45, startTick: 720, durationTicks: 200, velocity: 100 },
        { pitch: 40, startTick: 960, durationTicks: 200, velocity: 110 },
        { pitch: 40, startTick: 1200, durationTicks: 100, velocity: 85 },
        { pitch: 38, startTick: 1440, durationTicks: 200, velocity: 105 },
        { pitch: 40, startTick: 1680, durationTicks: 200, velocity: 100 },
      ],
    },
    {
      id: "clip-combat-lead",
      name: "Combat Lead",
      lane: "motif",
      instrumentId: "lead-bright",
      bpm: 140,
      lengthBeats: 8,
      loop: true,
      keyRoot: 4,
      keyScale: "minor",
      gainDb: -2,
      notes: [
        // Aggressive Em lead melody
        { pitch: 76, startTick: 0, durationTicks: 360, velocity: 100 },
        { pitch: 79, startTick: 480, durationTicks: 240, velocity: 95 },
        { pitch: 76, startTick: 720, durationTicks: 240, velocity: 90 },
        { pitch: 74, startTick: 960, durationTicks: 480, velocity: 100 },
        { pitch: 72, startTick: 1440, durationTicks: 240, velocity: 85 },
        { pitch: 74, startTick: 1680, durationTicks: 240, velocity: 90 },
        // Second phrase — climbs higher
        { pitch: 76, startTick: 1920, durationTicks: 240, velocity: 100 },
        { pitch: 79, startTick: 2160, durationTicks: 240, velocity: 95 },
        { pitch: 81, startTick: 2400, durationTicks: 480, velocity: 110 },
        { pitch: 79, startTick: 2880, durationTicks: 240, velocity: 90 },
        { pitch: 76, startTick: 3120, durationTicks: 240, velocity: 85 },
        { pitch: 74, startTick: 3360, durationTicks: 480, velocity: 95 },
      ],
    },

    // ─── Victory (C major, 120 BPM, oneshot) ───
    {
      id: "clip-victory-fanfare",
      name: "Victory Fanfare",
      lane: "motif",
      instrumentId: "lead-square",
      bpm: 120,
      lengthBeats: 8,
      loop: false,
      keyRoot: 0,
      keyScale: "major",
      notes: [
        // Triumphant C major fanfare
        { pitch: 72, startTick: 0, durationTicks: 240, velocity: 110 },
        { pitch: 72, startTick: 240, durationTicks: 120, velocity: 100 },
        { pitch: 72, startTick: 360, durationTicks: 120, velocity: 100 },
        { pitch: 76, startTick: 480, durationTicks: 960, velocity: 115 },
        // Descend and rise
        { pitch: 74, startTick: 1440, durationTicks: 240, velocity: 100 },
        { pitch: 72, startTick: 1680, durationTicks: 240, velocity: 95 },
        { pitch: 76, startTick: 1920, durationTicks: 240, velocity: 110 },
        { pitch: 79, startTick: 2160, durationTicks: 720, velocity: 120 },
        // Final sustained note
        { pitch: 84, startTick: 2880, durationTicks: 960, velocity: 120 },
      ],
    },
    {
      id: "clip-victory-pad",
      name: "Victory Pad",
      lane: "harmony",
      instrumentId: "pad-glass",
      bpm: 120,
      lengthBeats: 8,
      loop: false,
      keyRoot: 0,
      keyScale: "major",
      notes: [
        // Bright C major → G major resolution
        { pitch: 60, startTick: 0, durationTicks: 1920, velocity: 80 },
        { pitch: 64, startTick: 0, durationTicks: 1920, velocity: 75 },
        { pitch: 67, startTick: 0, durationTicks: 1920, velocity: 70 },
        // G major
        { pitch: 59, startTick: 1920, durationTicks: 1920, velocity: 85 },
        { pitch: 62, startTick: 1920, durationTicks: 1920, velocity: 80 },
        { pitch: 67, startTick: 1920, durationTicks: 1920, velocity: 75 },
      ],
    },
  ],

  scenes: [
    {
      id: "scene-town",
      name: "Town",
      category: "safe-zone",
      layers: [],
      clipLayers: [
        { clipId: "clip-town-pad", order: 0 },
        { clipId: "clip-town-arp", order: 1 },
      ],
      tags: ["town", "rest", "calm"],
    },
    {
      id: "scene-explore",
      name: "Exploration",
      category: "exploration",
      layers: [],
      clipLayers: [
        { clipId: "clip-explore-bass", order: 0 },
        { clipId: "clip-explore-melody", order: 1, gainDb: -2 },
      ],
      fallbackSceneId: "scene-town",
      tags: ["outdoor", "default"],
    },
    {
      id: "scene-tension",
      name: "Rising Tension",
      category: "tension",
      layers: [],
      clipLayers: [
        { clipId: "clip-tension-pad", order: 0 },
        { clipId: "clip-tension-pulse", order: 1 },
      ],
      fallbackSceneId: "scene-explore",
    },
    {
      id: "scene-combat",
      name: "Combat",
      category: "combat",
      layers: [],
      clipLayers: [
        { clipId: "clip-combat-drums", order: 0 },
        { clipId: "clip-combat-bass", order: 1 },
        { clipId: "clip-combat-lead", order: 2, intensity: "mid" },
      ],
      fallbackSceneId: "scene-tension",
    },
    {
      id: "scene-victory",
      name: "Victory",
      category: "victory",
      layers: [],
      clipLayers: [
        { clipId: "clip-victory-fanfare", order: 0 },
        { clipId: "clip-victory-pad", order: 1 },
      ],
      fallbackSceneId: "scene-explore",
    },
  ],

  bindings: [
    {
      id: "bind-town",
      name: "Safe Zone",
      sceneId: "scene-town",
      conditions: [{ field: "safeZone", op: "eq", value: true }],
      priority: 5,
    },
    {
      id: "bind-explore",
      name: "Explore Mode",
      sceneId: "scene-explore",
      conditions: [{ field: "mode", op: "eq", value: "exploration" }],
      priority: 0,
    },
    {
      id: "bind-tension",
      name: "Danger Rising",
      sceneId: "scene-tension",
      conditions: [{ field: "danger", op: "gte", value: 0.5 }],
      priority: 10,
    },
    {
      id: "bind-combat",
      name: "In Combat",
      sceneId: "scene-combat",
      conditions: [{ field: "inCombat", op: "eq", value: true }],
      priority: 20,
    },
    {
      id: "bind-victory",
      name: "Victory Event",
      sceneId: "scene-victory",
      conditions: [{ field: "victory", op: "eq", value: true }],
      priority: 30,
      stopProcessing: true,
    },
  ],

  transitions: [
    {
      id: "trans-town-to-explore",
      name: "Town → Explore",
      fromSceneId: "scene-town",
      toSceneId: "scene-explore",
      mode: "crossfade",
      durationMs: 2000,
    },
    {
      id: "trans-explore-to-tension",
      name: "Explore → Tension",
      fromSceneId: "scene-explore",
      toSceneId: "scene-tension",
      mode: "crossfade",
      durationMs: 1500,
    },
    {
      id: "trans-tension-to-combat",
      name: "Tension → Combat",
      fromSceneId: "scene-tension",
      toSceneId: "scene-combat",
      mode: "immediate",
    },
    {
      id: "trans-combat-to-victory",
      name: "Combat → Victory",
      fromSceneId: "scene-combat",
      toSceneId: "scene-victory",
      mode: "immediate",
    },
    {
      id: "trans-victory-to-explore",
      name: "Victory → Explore",
      fromSceneId: "scene-victory",
      toSceneId: "scene-explore",
      mode: "crossfade",
      durationMs: 3000,
    },
  ],
};

// ── Example pack registry ──

const groundedPack = buildGroundedPack();

export const examplePacks = [
  { id: "minimal-pack", name: "Minimal Pack", pack: minimalPack },
  { id: "starter-pack", name: "Starter Adventure Pack", pack: starterPack },
  { id: "combat-escalation-pack", name: "Combat Escalation Pack", pack: combatEscalationPack },
  { id: "synth-demo-pack", name: "Synth Demo — Game Soundtrack", pack: synthDemoPack },
  { id: "star-freight-grounded", name: "Star Freight: Grounded — Prologue", pack: groundedPack },
] as const;
