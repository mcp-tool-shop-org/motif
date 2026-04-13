// ────────────────────────────────────────────
// @motif/runtime-pack — runtime types
// ────────────────────────────────────────────

// ── Runtime pack metadata ──

export interface RuntimeSoundtrackPackMeta {
  id: string;
  name: string;
  version: string;
  schemaVersion: "1";
  description?: string;
  author?: string;
  tags?: string[];
  contentHash?: string;
  exportedAt?: string;
}

// ── Runtime audio asset ──

export type RuntimeAudioCodec = 'ogg' | 'wav' | 'mp3' | 'flac';

export interface RuntimeAudioAsset {
  id: string;
  src: string;
  kind: "loop" | "oneshot" | "stinger" | "ambient";
  durationMs: number;
  bpm?: number;
  key?: string;
  loopStartMs?: number;
  loopEndMs?: number;
  tags?: string[];
  codec?: RuntimeAudioCodec;
  sampleRateHz?: number;
  channels?: number;
  bitDepth?: number;
}

// ── Runtime stem ──

export interface RuntimeStem {
  id: string;
  assetId: string;
  role:
    | "base"
    | "danger"
    | "combat"
    | "boss"
    | "recovery"
    | "mystery"
    | "faction"
    | "accent";
  gainDb?: number;
  mutedByDefault?: boolean;
  loop: boolean;
  tags?: string[];
}

// ── Runtime scene layer ──

export interface RuntimeSceneLayer {
  stemId: string;
  required?: boolean;
  startMode?: "immediate" | "next-bar" | "after-transition";
  gainDb?: number;
}

// ── Runtime scene ──

export interface RuntimeScene {
  id: string;
  name: string;
  category:
    | "exploration"
    | "tension"
    | "combat"
    | "boss"
    | "victory"
    | "aftermath"
    | "stealth"
    | "safe-zone";
  layers: RuntimeSceneLayer[];
  fallbackSceneId?: string;
  tags?: string[];
}

// ── Runtime trigger binding ──

export interface RuntimeTriggerBinding {
  id: string;
  sceneId: string;
  priority: number;
  stopProcessing?: boolean;
  conditions: Array<{
    field: string;
    op: "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "includes";
    value: string | number | boolean;
  }>;
}

// ── Runtime transition rule ──

export interface RuntimeTransitionRule {
  id: string;
  fromSceneId: string;
  toSceneId: string;
  mode:
    | "immediate"
    | "crossfade"
    | "bar-sync"
    | "stinger-then-switch"
    | "cooldown-fade";
  durationMs?: number;
  stingerAssetId?: string;
}

// ── Runtime soundtrack pack ──

export interface RuntimeSoundtrackPack {
  meta: RuntimeSoundtrackPackMeta;
  assets: RuntimeAudioAsset[];
  stems: RuntimeStem[];
  scenes: RuntimeScene[];
  bindings: RuntimeTriggerBinding[];
  transitions: RuntimeTransitionRule[];
}
