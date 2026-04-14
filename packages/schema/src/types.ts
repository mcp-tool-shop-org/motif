// ────────────────────────────────────────────
// @motif-studio/schema — canonical types v1
// ────────────────────────────────────────────

// ── Pack metadata ──

export interface SoundtrackPackMeta {
  id: string;
  name: string;
  version: string;
  description?: string;
  author?: string;
  tags?: string[];
  schemaVersion: "1";
}

// ── Audio assets ──

export type AudioAssetKind = "loop" | "oneshot" | "stinger" | "ambient";

export type AssetSourceType =
  | "drums"
  | "tonal"
  | "ambience"
  | "stinger"
  | "texture"
  | "fx";

export interface AudioAsset {
  id: string;
  name: string;
  src: string;
  kind: AudioAssetKind;
  durationMs: number;
  bpm?: number;
  key?: string;
  loopStartMs?: number;
  loopEndMs?: number;
  tags?: string[];
  notes?: string;
  /** Trim in-point in milliseconds (import workflow). */
  trimStartMs?: number;
  /** Trim out-point in milliseconds (import workflow). */
  trimEndMs?: number;
  /** Classification of the source material. */
  sourceType?: AssetSourceType;
  /** Original filename before import. */
  originalFilename?: string;
  /** Whether this asset was created via the import workflow. */
  imported?: boolean;
  /** Root MIDI note for tonal samples (e.g. 60 = C4). */
  rootNote?: number;
}

// ── Stems ──

export type StemRole =
  | "base"
  | "danger"
  | "combat"
  | "boss"
  | "recovery"
  | "mystery"
  | "faction"
  | "accent";

export interface Stem {
  id: string;
  name: string;
  assetId: string;
  role: StemRole;
  gainDb?: number;
  mutedByDefault?: boolean;
  loop: boolean;
  tags?: string[];
}

// ── Scenes ──

export type SceneCategory =
  | "exploration"
  | "tension"
  | "combat"
  | "boss"
  | "victory"
  | "aftermath"
  | "stealth"
  | "safe-zone";

export interface SceneLayerRef {
  stemId: string;
  required?: boolean;
  startMode?: "immediate" | "next-bar" | "after-transition";
  gainDb?: number;
}

export interface Scene {
  id: string;
  name: string;
  category: SceneCategory;
  layers: SceneLayerRef[];
  /** Clips activated in this scene */
  clipLayers?: SceneClipRef[];
  fallbackSceneId?: string;
  /** Seamless loop region with crossfade tail. If omitted, scene loops its full duration. */
  loopRegion?: LoopRegion;
  tags?: string[];
  notes?: string;
}

// ── Loop Regions ──

/**
 * Defines a seamless loop region with optional crossfade tail.
 * When playback reaches loopEndMs, it crossfades back to loopStartMs.
 */
export interface LoopRegion {
  /** Loop start point in milliseconds from clip/scene start */
  loopStartMs: number;
  /** Loop end point in milliseconds from clip/scene start */
  loopEndMs: number;
  /** Duration of crossfade between loop end and loop start (default 0 = hard cut) */
  crossfadeDurationMs?: number;
  /** Number of times to loop (Infinity = loop forever, default for scenes). Omit or 0 = play once. */
  count?: number;
}

// ── Triggers ──

export type TriggerOp = "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "includes";

export interface TriggerCondition {
  field: string;
  op: TriggerOp;
  value: string | number | boolean;
}

export interface TriggerBinding {
  id: string;
  name: string;
  sceneId: string;
  conditions: TriggerCondition[];
  priority: number;
  stopProcessing?: boolean;
}

// ── Transitions ──

export type TransitionMode =
  | "immediate"
  | "crossfade"
  | "bar-sync"
  | "stinger-then-switch"
  | "cooldown-fade";

export interface TransitionRule {
  id: string;
  name: string;
  fromSceneId: string;
  toSceneId: string;
  mode: TransitionMode;
  durationMs?: number;
  stingerAssetId?: string;
  notes?: string;
}

// ── Instruments ──

export type InstrumentCategory =
  | "drums"
  | "bass"
  | "pad"
  | "lead"
  | "pulse";

export interface InstrumentPreset {
  id: string;
  name: string;
  category: InstrumentCategory;
  /** Synth engine parameters (oscillator type, envelope, filter, etc.) */
  params: Record<string, number | string | boolean>;
}

// ── Clips ──

export type ClipLane = "drums" | "bass" | "harmony" | "motif" | "accent";

/** Section role for intro→loop→outro flow */
export type SectionRole = "intro" | "loop" | "outro";

/** Intensity level for scene escalation */
export type IntensityLevel = "low" | "mid" | "high";

/** Quantize mode for clip launch timing */
export type QuantizeMode = "none" | "beat" | "bar";

/** A single note event in a clip */
export interface ClipNote {
  /** MIDI note number (0–127). For drums, maps to kit piece index. */
  pitch: number;
  /** Start time in ticks from clip start (1 beat = 480 ticks) */
  startTick: number;
  /** Duration in ticks */
  durationTicks: number;
  /** Velocity 0–127 */
  velocity: number;
}

/** A named variant of a clip (alternate pattern) */
export interface ClipVariant {
  id: string;
  name: string;
  notes: ClipNote[];
  tags?: string[];
}

export interface Clip {
  id: string;
  name: string;
  lane: ClipLane;
  /** Which instrument preset this clip uses */
  instrumentId: string;
  /** BPM for playback timing */
  bpm: number;
  /** Length of the clip in beats */
  lengthBeats: number;
  /** Time signature numerator (default 4) */
  timeSignature?: number;
  /** Quantize grid: ticks per snap (120 = 16th, 240 = 8th, 480 = quarter) */
  quantize?: number;
  /** Key root (0–11 pitch class, 0 = C) */
  keyRoot?: number;
  /** Scale name (e.g. "major", "minor", "pentatonic") */
  keyScale?: string;
  /** The note data (default variant) */
  notes: ClipNote[];
  /** Named variants (A/B patterns) */
  variants?: ClipVariant[];
  /** Loop this clip */
  loop: boolean;
  /** Seamless loop region with crossfade tail. If omitted and loop=true, loops full clip. */
  loopRegion?: LoopRegion;
  gainDb?: number;
  tags?: string[];
}

/** Reference to a clip in a scene */
export interface SceneClipRef {
  clipId: string;
  /** Override gain for this clip in this scene */
  gainDb?: number;
  /** Start muted (user can unmute live) */
  mutedByDefault?: boolean;
  /** Playback order within this scene (lower = first) */
  order?: number;
  /** Section role: intro plays once, loop repeats, outro plays on exit */
  sectionRole?: SectionRole;
  /** Intensity tier — clips activate based on current intensity */
  intensity?: IntensityLevel;
  /** Which variant to use (default = main notes) */
  variantId?: string;
}

// ── Pack ──

export interface SoundtrackPack {
  meta: SoundtrackPackMeta;
  assets: AudioAsset[];
  stems: Stem[];
  scenes: Scene[];
  bindings: TriggerBinding[];
  transitions: TransitionRule[];
  /** Built-in instrument presets */
  instruments?: InstrumentPreset[];
  /** Composed clips */
  clips?: Clip[];
  /** Named cue structures */
  cues?: Cue[];
  sampleSlices?: SampleSlice[];
  sampleKits?: SampleKit[];
  sampleInstruments?: SampleInstrument[];
  performanceCaptures?: PerformanceCapture[];
  motifFamilies?: MotifFamily[];
  scoreProfiles?: ScoreProfile[];
  cueFamilies?: CueFamily[];
  scoreMap?: ScoreMapEntry[];
  derivations?: DerivationRecord[];
  automationLanes?: AutomationLane[];
  macroMappings?: MacroMapping[];
  sectionEnvelopes?: SectionEnvelope[];
  automationCaptures?: AutomationCapture[];
  templates?: LibraryTemplate[];
  snapshots?: Snapshot[];
  branches?: Branch[];
  favorites?: Favorite[];
  collections?: Collection[];
}

// ── Sample slicing ──

export interface SampleSlice {
  id: string;
  assetId: string;
  name: string;
  startMs: number;
  endMs: number;
  rootNote?: number;
}

// ── Sample kits ──

export interface SampleKitSlot {
  pitch: number;
  assetId: string;
  sliceId?: string;
  gainDb?: number;
  label?: string;
}

export interface SampleKit {
  id: string;
  name: string;
  slots: SampleKitSlot[];
  tags?: string[];
}

// ── Sample instruments ──

export interface SampleInstrument {
  id: string;
  name: string;
  assetId: string;
  rootNote: number;
  pitchMin: number;
  pitchMax: number;
  attackMs?: number;
  decayMs?: number;
  sustainLevel?: number;
  releaseMs?: number;
  filterCutoffHz?: number;
  filterQ?: number;
}

// ── Motif families ──

export interface MotifFamily {
  id: string;
  name: string;
  /** Source scene/clip/asset IDs this motif is built from. */
  sourceIds: string[];
  /** IDs of derived variants. */
  variantIds?: string[];
  /** Related scene IDs that use this motif. */
  relatedSceneIds?: string[];
  tags?: string[];
  notes?: string;
}

// ── Cue structures ──

export type CueSectionRole = "intro" | "body" | "escalation" | "climax" | "outro" | "transition";

export interface CueSection {
  id: string;
  name: string;
  role: CueSectionRole;
  /** Duration in bars */
  durationBars: number;
  /** Scene to activate during this section */
  sceneId?: string;
  /** Override clips for this section */
  clipIds?: string[];
  /** Intensity target for this section */
  intensity?: IntensityLevel;
  /** Transition mode entering this section */
  transitionMode?: TransitionMode;
  /** Optional variant IDs to prefer in this section */
  variantIds?: string[];
  /** Free-form notes */
  notes?: string;
}

export interface Cue {
  id: string;
  name: string;
  /** Default tempo for this cue */
  bpm?: number;
  /** Default key context */
  keyRoot?: number;
  keyScale?: string;
  /** Time signature (beats per bar, default 4) */
  beatsPerBar?: number;
  /** Ordered sections */
  sections: CueSection[];
  tags?: string[];
  notes?: string;
}

// ── Performance capture ──

export type CaptureActionType =
  | "scene-launch"
  | "clip-launch"
  | "intensity-change"
  | "section-advance"
  | "stop";

export interface PerformanceCaptureEvent {
  /** Timestamp in ticks from cue start */
  tick: number;
  /** Bar number (derived from tick + bpm + beatsPerBar) */
  bar: number;
  /** Beat within the bar */
  beat: number;
  /** What happened */
  action: CaptureActionType;
  /** Target scene ID (for scene-launch) */
  sceneId?: string;
  /** Target clip ID (for clip-launch) */
  clipId?: string;
  /** Intensity level (for intensity-change) */
  intensity?: IntensityLevel;
  /** Quantization that was applied */
  quantize?: QuantizeMode;
}

export interface PerformanceCapture {
  id: string;
  name: string;
  /** Cue this was captured against (optional) */
  cueId?: string;
  bpm: number;
  beatsPerBar: number;
  /** Total duration in bars */
  totalBars: number;
  events: PerformanceCaptureEvent[];
  /** When captured */
  createdAt: string;
}

// ── Score profiles ──

export interface ScoreProfile {
  id: string;
  name: string;
  key?: string;
  scale?: string;
  tempoMin?: number;
  tempoMax?: number;
  intensityMin?: number;
  intensityMax?: number;
  preferredKitIds?: string[];
  preferredInstrumentIds?: string[];
  motifFamilyIds?: string[];
  samplePaletteTags?: string[];
  tags?: string[];
  notes?: string;
  /** Default intensity curve tendency (0–1) for this profile. */
  defaultIntensity?: number;
  /** Default brightness range (0–1) for this profile. */
  defaultBrightness?: number;
  /** Default space/reverb tendency (0–1) for this profile. */
  defaultSpace?: number;
  /** Default transition energy (0–1). */
  defaultTransitionEnergy?: number;
}

// ── Cue families ──

export type CueFamilyRole =
  | "exploration"
  | "combat"
  | "boss"
  | "recovery"
  | "stealth"
  | "tension"
  | "victory"
  | "mystery";

export interface CueFamily {
  id: string;
  name: string;
  role: CueFamilyRole;
  sceneIds: string[];
  motifFamilyIds?: string[];
  scoreProfileId?: string;
  tags?: string[];
  notes?: string;
}

// ── Score map entries ──

export type ScoreMapContextType =
  | "region"
  | "faction"
  | "biome"
  | "encounter"
  | "safe-zone";

export interface ScoreMapEntry {
  id: string;
  name: string;
  contextType: ScoreMapContextType;
  scoreProfileId?: string;
  cueFamilyIds?: string[];
  motifFamilyIds?: string[];
  preferredKitIds?: string[];
  preferredInstrumentIds?: string[];
  tags?: string[];
  notes?: string;
}

// ── Derivation records ──

export type DerivationTransform =
  | "intensify"
  | "resolve"
  | "darken"
  | "brighten"
  | "simplify"
  | "elaborate"
  | "reharmonize";

export interface DerivationRecord {
  id: string;
  sourceId: string;
  targetId: string;
  transform: DerivationTransform;
  notes?: string;
}

// ── Automation ──

/** Automatable parameter targets. */
export type AutomationParam =
  | "volume"
  | "pan"
  | "filterCutoff"
  | "reverbSend"
  | "delaySend"
  | "intensity";

/** Interpolation curve for automation segments. */
export type AutomationCurve = "linear" | "exponential" | "step" | "smooth";

/** A single automation keyframe. */
export interface AutomationPoint {
  /** Time offset in milliseconds from the start of the target. */
  timeMs: number;
  /** Normalised value 0–1. */
  value: number;
  /** Interpolation curve to the next point. */
  curve?: AutomationCurve;
}

/** What the automation lane is attached to. */
export type AutomationTargetKind = "clip-layer" | "scene-layer" | "cue-section";

/** Identifies the attachment point for an automation lane. */
export interface AutomationTarget {
  kind: AutomationTargetKind;
  /** ID of the clip, scene, or cue section this lane lives on. */
  targetId: string;
  /** Optional sub-selector (e.g. layer index, stem ID). */
  layerRef?: string;
}

/** A single automation lane with keyframes. */
export interface AutomationLane {
  id: string;
  name: string;
  param: AutomationParam;
  target: AutomationTarget;
  points: AutomationPoint[];
  /** Default value when no automation point covers a time. */
  defaultValue?: number;
  notes?: string;
}

// ── Macros ──

/** High-value macro controls that drive multiple parameters at once. */
export type MacroParam = "intensity" | "tension" | "brightness" | "space";

/** A single macro-to-parameter influence rule. */
export interface MacroMapping {
  id: string;
  macro: MacroParam;
  /** Target parameter to influence. */
  param: AutomationParam;
  /** Influence weight 0–1 (how much macro movement affects param). */
  weight: number;
  /** Optional target scope (if absent, applies globally). */
  targetId?: string;
  /** Invert the mapping (macro up → param down). */
  invert?: boolean;
}

/** Snapshot of current macro positions (0–1 each). */
export interface MacroState {
  intensity: number;
  tension: number;
  brightness: number;
  space: number;
}

// ── Section envelopes ──

/** Envelope shape applied to entry/exit of a cue section. */
export type SectionEnvelopeShape =
  | "fade-in"
  | "fade-out"
  | "swell"
  | "duck"
  | "filter-rise"
  | "filter-fall";

/** Shaped entry/exit behaviour for a cue section. */
export interface SectionEnvelope {
  id: string;
  /** Scene or cue section this envelope applies to. */
  targetId: string;
  shape: SectionEnvelopeShape;
  durationMs: number;
  /** Intensity/depth of the effect, 0–1. */
  depth?: number;
  /** Which end of the section: entry or exit. */
  position: "entry" | "exit";
  notes?: string;
}

// ── Automation capture ──

/** A recorded performance of macro/parameter moves. */
export interface AutomationCapture {
  id: string;
  name: string;
  /** When this capture was recorded (ISO string). */
  recordedAt: string;
  /** The macro or param that was performed. */
  source: MacroParam | AutomationParam;
  /** Recorded keyframes. */
  points: AutomationPoint[];
  /** Target lane ID to apply captured data to (optional). */
  laneId?: string;
  notes?: string;
}

// ── Library: templates, snapshots, branches, favorites, collections ──

/** Entity kinds that can be templated, snapshotted, favorited, or branched. */
export type LibraryEntityKind =
  | "scene"
  | "clip"
  | "sample-kit"
  | "sample-instrument"
  | "score-profile"
  | "cue-family"
  | "motif-family"
  | "automation-lane"
  | "macro-setup"
  | "section-envelope";

/** A reusable template / preset saved from an entity. */
export interface LibraryTemplate {
  id: string;
  name: string;
  kind: LibraryEntityKind;
  /** Serialised snapshot of the entity data (JSON-safe). */
  data: Record<string, unknown>;
  tags?: string[];
  notes?: string;
  createdAt: string;
}

/** A frozen snapshot of an entity at a point in time. */
export interface Snapshot {
  id: string;
  label: string;
  entityId: string;
  entityKind: LibraryEntityKind;
  /** Serialised entity data at snapshot time. */
  data: Record<string, unknown>;
  createdAt: string;
  notes?: string;
}

/** A branch created from a snapshot, tracking lineage. */
export interface Branch {
  id: string;
  name: string;
  /** Snapshot this branch was forked from. */
  sourceSnapshotId: string;
  /** The new entity ID produced by this branch. */
  entityId: string;
  entityKind: LibraryEntityKind;
  createdAt: string;
  notes?: string;
}

/** A user-favorited entity reference. */
export interface Favorite {
  id: string;
  entityId: string;
  entityKind: LibraryEntityKind;
  addedAt: string;
  notes?: string;
}

/** A named collection of favorites. */
export interface Collection {
  id: string;
  name: string;
  favoriteIds: string[];
  tags?: string[];
  notes?: string;
  createdAt: string;
}

// ── Runtime state ──

export interface RuntimeMusicState {
  mode?: string;
  danger?: number;
  inCombat?: boolean;
  boss?: boolean;
  safeZone?: boolean;
  victory?: boolean;
  region?: string;
  faction?: string;
  encounterType?: string;
  [key: string]: unknown;
}

// ── Validation ──

export interface ValidationIssue {
  path: string;
  code: string;
  message: string;
}

export interface ValidationResult<T> {
  ok: boolean;
  data?: T;
  issues: ValidationIssue[];
}
