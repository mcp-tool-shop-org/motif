import { z } from "zod";

// ── Enums (runtime-specific, decoupled from authoring) ──

export const RuntimeAudioCodecSchema = z.enum(["ogg", "wav", "mp3", "flac"]);

export const RuntimeAudioAssetKindSchema = z.enum([
  "loop",
  "oneshot",
  "stinger",
  "ambient",
]);

export const RuntimeStemRoleSchema = z.union([
  z.enum([
    "base",
    "danger",
    "combat",
    "boss",
    "recovery",
    "mystery",
    "faction",
    "accent",
  ]),
  z.string(),
]);

export const RuntimeSceneCategorySchema = z.union([
  z.enum([
    "exploration",
    "tension",
    "combat",
    "boss",
    "victory",
    "aftermath",
    "stealth",
    "safe-zone",
  ]),
  z.string(),
]);

export const RuntimeTriggerOpSchema = z.enum([
  "eq",
  "neq",
  "gt",
  "gte",
  "lt",
  "lte",
  "includes",
]);

export const RuntimeTransitionModeSchema = z.enum([
  "immediate",
  "crossfade",
  "bar-sync",
  "stinger-then-switch",
  "cooldown-fade",
]);

export const RuntimeLayerStartModeSchema = z.enum([
  "immediate",
  "next-bar",
  "after-transition",
]);

// ── Runtime pack meta ──

export const RuntimeSoundtrackPackMetaSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  version: z.string().min(1),
  schemaVersion: z.enum(["1"]).describe("Supported schema versions: 1"),
  description: z.string().optional(),
  author: z.string().optional(),
  tags: z.array(z.string()).optional(),
  contentHash: z.string().optional(),
  exportedAt: z.string().optional(),
});

// ── Runtime audio asset ──

export const RuntimeAudioAssetSchema = z
  .object({
    id: z.string().min(1),
    src: z.string().min(1),
    kind: RuntimeAudioAssetKindSchema,
    durationMs: z.number().gt(0, "durationMs must be greater than 0"),
    bpm: z.number().positive().optional(),
    key: z.string().optional(),
    loopStartMs: z.number().gte(0).optional(),
    loopEndMs: z.number().positive().optional(),
    tags: z.array(z.string()).optional(),
    codec: RuntimeAudioCodecSchema.optional(),
    sampleRateHz: z.number().positive().optional(),
    channels: z.number().int().positive().optional(),
    bitDepth: z.number().int().positive().optional(),
  })
  .refine(
    (a) => {
      if (a.loopStartMs != null && a.loopEndMs != null) {
        return a.loopEndMs > a.loopStartMs;
      }
      return true;
    },
    {
      message: "loopEndMs must be greater than loopStartMs",
      path: ["loopEndMs"],
    },
  );

// ── Runtime stem ──

export const RuntimeStemSchema = z.object({
  id: z.string().min(1),
  assetId: z.string().min(1),
  role: RuntimeStemRoleSchema,
  gainDb: z.number().optional(),
  mutedByDefault: z.boolean().optional(),
  loop: z.boolean(),
  tags: z.array(z.string()).optional(),
});

// ── Runtime scene layer ──

export const RuntimeSceneLayerSchema = z.object({
  stemId: z.string().min(1),
  required: z.boolean().optional(),
  startMode: RuntimeLayerStartModeSchema.optional(),
  gainDb: z.number().optional(),
});

// ── Runtime scene ──

export const RuntimeSceneSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: RuntimeSceneCategorySchema,
  layers: z
    .array(RuntimeSceneLayerSchema)
    .min(1, "Scene must have at least one layer"),
  fallbackSceneId: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

// ── Runtime trigger condition ──

export const RuntimeTriggerConditionSchema = z.object({
  field: z.string().min(1),
  op: RuntimeTriggerOpSchema,
  value: z.union([z.string(), z.number(), z.boolean()]),
});

// ── Runtime trigger binding ──

export const RuntimeTriggerBindingSchema = z.object({
  id: z.string().min(1),
  sceneId: z.string().min(1),
  priority: z.number().int("priority must be an integer"),
  stopProcessing: z.boolean().optional(),
  conditions: z
    .array(RuntimeTriggerConditionSchema)
    .min(1, "Binding must have at least one condition"),
});

// ── Runtime transition rule ──

export const RuntimeTransitionRuleSchema = z
  .object({
    id: z.string().min(1),
    fromSceneId: z.string().min(1),
    toSceneId: z.string().min(1),
    mode: RuntimeTransitionModeSchema,
    durationMs: z.number().positive().optional(),
    stingerAssetId: z.string().min(1).optional(),
  })
  .refine(
    (t) => {
      if (t.mode === "crossfade" || t.mode === "cooldown-fade") {
        return t.durationMs != null;
      }
      return true;
    },
    {
      message:
        "durationMs is required for crossfade and cooldown-fade transitions",
      path: ["durationMs"],
    },
  )
  .refine(
    (t) => {
      if (t.mode === "stinger-then-switch") {
        return t.stingerAssetId != null;
      }
      return true;
    },
    {
      message:
        "stingerAssetId is required for stinger-then-switch transitions",
      path: ["stingerAssetId"],
    },
  );

// ── Runtime soundtrack pack ──

export const RuntimeSoundtrackPackSchema = z.object({
  meta: RuntimeSoundtrackPackMetaSchema,
  assets: z.array(RuntimeAudioAssetSchema),
  stems: z.array(RuntimeStemSchema),
  scenes: z.array(RuntimeSceneSchema),
  bindings: z.array(RuntimeTriggerBindingSchema),
  transitions: z.array(RuntimeTransitionRuleSchema),
});
