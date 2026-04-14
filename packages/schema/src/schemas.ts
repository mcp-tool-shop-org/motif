import { z } from "zod";

// ── Enums ──

export const AudioAssetKindSchema = z.enum(["loop", "oneshot", "stinger", "ambient"]);

export const AssetSourceTypeSchema = z.enum([
  "drums",
  "tonal",
  "ambience",
  "stinger",
  "texture",
  "fx",
]);

export const StemRoleSchema = z.enum([
  "base",
  "danger",
  "combat",
  "boss",
  "recovery",
  "mystery",
  "faction",
  "accent",
]);

export const SceneCategorySchema = z.enum([
  "exploration",
  "tension",
  "combat",
  "boss",
  "victory",
  "aftermath",
  "stealth",
  "safe-zone",
]);

export const TriggerOpSchema = z.enum(["eq", "neq", "gt", "gte", "lt", "lte", "includes"]);

export const TransitionModeSchema = z.enum([
  "immediate",
  "crossfade",
  "bar-sync",
  "stinger-then-switch",
  "cooldown-fade",
]);

export const LayerStartModeSchema = z.enum(["immediate", "next-bar", "after-transition"]);

// ── Pack metadata ──

export const SoundtrackPackMetaSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  version: z.string().min(1),
  description: z.string().optional(),
  author: z.string().optional(),
  tags: z.array(z.string()).optional(),
  schemaVersion: z.literal("1"),
});

// ── Audio asset ──

export const AudioAssetSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    src: z.string().min(1),
    kind: AudioAssetKindSchema,
    durationMs: z.number().gt(0, "durationMs must be greater than 0"),
    bpm: z.number().positive().optional(),
    key: z.string().optional(),
    loopStartMs: z.number().gte(0, "loopStartMs must be >= 0").optional(),
    loopEndMs: z.number().positive().optional(),
    tags: z.array(z.string()).optional(),
    notes: z.string().optional(),
    trimStartMs: z.number().gte(0).optional(),
    trimEndMs: z.number().positive().optional(),
    sourceType: AssetSourceTypeSchema.optional(),
    originalFilename: z.string().optional(),
    imported: z.boolean().optional(),
    rootNote: z.number().int().gte(0).lte(127).optional(),
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
  )
  .refine(
    (a) => {
      if (a.trimStartMs != null && a.trimEndMs != null) {
        return a.trimEndMs > a.trimStartMs;
      }
      return true;
    },
    {
      message: "trimEndMs must be greater than trimStartMs",
      path: ["trimEndMs"],
    },
  );

// ── Stem ──

export const StemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  assetId: z.string().min(1),
  role: StemRoleSchema,
  gainDb: z.number().optional(),
  mutedByDefault: z.boolean().optional(),
  loop: z.boolean(),
  tags: z.array(z.string()).optional(),
});

// ── Loop Region ──

export const LoopRegionSchema = z
  .object({
    loopStartMs: z.number().gte(0, "loopStartMs must be >= 0"),
    loopEndMs: z.number().positive("loopEndMs must be > 0"),
    crossfadeDurationMs: z.number().gte(0).optional(),
    count: z.number().gte(0).optional(),
  })
  .refine((lr) => lr.loopEndMs > lr.loopStartMs, {
    message: "loopEndMs must be greater than loopStartMs",
    path: ["loopEndMs"],
  })
  .refine(
    (lr) => {
      if (lr.crossfadeDurationMs != null) {
        const regionDuration = lr.loopEndMs - lr.loopStartMs;
        return lr.crossfadeDurationMs <= regionDuration;
      }
      return true;
    },
    {
      message:
        "crossfadeDurationMs must not exceed the loop region duration",
      path: ["crossfadeDurationMs"],
    },
  );

// ── Scene ──

export const SceneLayerRefSchema = z.object({
  stemId: z.string().min(1),
  required: z.boolean().optional(),
  startMode: LayerStartModeSchema.optional(),
  gainDb: z.number().optional(),
});

export const SceneSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: SceneCategorySchema,
  layers: z.array(SceneLayerRefSchema).min(1, "Scene must have at least one layer"),
  clipLayers: z.lazy(() => z.array(SceneClipRefSchema)).optional(),
  fallbackSceneId: z.string().optional(),
  loopRegion: LoopRegionSchema.optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

// ── Triggers ──

export const TriggerConditionSchema = z.object({
  field: z.string().min(1),
  op: TriggerOpSchema,
  value: z.union([z.string(), z.number(), z.boolean()]),
});

export const TriggerBindingSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  sceneId: z.string().min(1),
  conditions: z
    .array(TriggerConditionSchema)
    .min(1, "Binding must have at least one condition"),
  priority: z.number().int("priority must be an integer"),
  stopProcessing: z.boolean().optional(),
});

// ── Transitions ──

export const TransitionRuleSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    fromSceneId: z.string().min(1),
    toSceneId: z.string().min(1),
    mode: TransitionModeSchema,
    durationMs: z.number().positive().optional(),
    stingerAssetId: z.string().min(1).optional(),
    notes: z.string().optional(),
  })
  .refine(
    (t) => {
      if (t.mode === "crossfade" || t.mode === "cooldown-fade") {
        return t.durationMs != null;
      }
      return true;
    },
    {
      message: "durationMs is required for crossfade and cooldown-fade transitions",
      path: ["durationMs"],
    },
  );

// ── Instruments ──

export const InstrumentCategorySchema = z.enum([
  "drums",
  "bass",
  "pad",
  "lead",
  "pulse",
]);

export const InstrumentPresetSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: InstrumentCategorySchema,
  params: z.record(z.string(), z.union([z.number(), z.string(), z.boolean()])),
});

// ── Clips ──

export const ClipLaneSchema = z.enum(["drums", "bass", "harmony", "motif", "accent"]);
export const SectionRoleSchema = z.enum(["intro", "loop", "outro"]);
export const IntensityLevelSchema = z.enum(["low", "mid", "high"]);
export const QuantizeModeSchema = z.enum(["none", "beat", "bar"]);

export const ClipNoteSchema = z.object({
  pitch: z.number().int().gte(0).lte(127),
  startTick: z.number().int().gte(0),
  durationTicks: z.number().int().positive(),
  velocity: z.number().int().gte(0).lte(127),
});

export const ClipVariantSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  notes: z.array(ClipNoteSchema),
  tags: z.array(z.string()).optional(),
});

export const ClipSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  lane: ClipLaneSchema,
  instrumentId: z.string().min(1),
  bpm: z.number().positive(),
  lengthBeats: z.number().positive(),
  timeSignature: z.number().int().positive().optional(),
  quantize: z.number().int().positive().optional(),
  keyRoot: z.number().int().gte(0).lte(11).optional(),
  keyScale: z.string().optional(),
  notes: z.array(ClipNoteSchema),
  variants: z.array(ClipVariantSchema).optional(),
  loop: z.boolean(),
  loopRegion: LoopRegionSchema.optional(),
  gainDb: z.number().optional(),
  tags: z.array(z.string()).optional(),
});

export const SceneClipRefSchema = z.object({
  clipId: z.string().min(1),
  gainDb: z.number().optional(),
  mutedByDefault: z.boolean().optional(),
  order: z.number().int().optional(),
  sectionRole: SectionRoleSchema.optional(),
  intensity: IntensityLevelSchema.optional(),
  variantId: z.string().optional(),
});

// ── Cue structures ──

export const CueSectionRoleSchema = z.enum([
  "intro",
  "body",
  "escalation",
  "climax",
  "outro",
  "transition",
]);

export const CueSectionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  role: CueSectionRoleSchema,
  durationBars: z.number().int().positive(),
  sceneId: z.string().optional(),
  clipIds: z.array(z.string()).optional(),
  intensity: IntensityLevelSchema.optional(),
  transitionMode: TransitionModeSchema.optional(),
  variantIds: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

export const CueSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  bpm: z.number().positive().optional(),
  keyRoot: z.number().int().gte(0).lte(11).optional(),
  keyScale: z.string().optional(),
  beatsPerBar: z.number().int().positive().optional(),
  sections: z.array(CueSectionSchema).min(1),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

// ── Performance capture ──

export const CaptureActionTypeSchema = z.enum([
  "scene-launch",
  "clip-launch",
  "intensity-change",
  "section-advance",
  "stop",
]);

export const PerformanceCaptureEventSchema = z.object({
  tick: z.number().int().gte(0),
  bar: z.number().int().gte(0),
  beat: z.number().int().gte(0),
  action: CaptureActionTypeSchema,
  sceneId: z.string().optional(),
  clipId: z.string().optional(),
  intensity: IntensityLevelSchema.optional(),
  quantize: QuantizeModeSchema.optional(),
});

export const PerformanceCaptureSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  cueId: z.string().optional(),
  bpm: z.number().positive(),
  beatsPerBar: z.number().int().positive(),
  totalBars: z.number().int().positive(),
  events: z.array(PerformanceCaptureEventSchema),
  createdAt: z.string().min(1),
});

// ── Pack ──

export const SampleSliceSchema = z
  .object({
    id: z.string().min(1),
    assetId: z.string().min(1),
    name: z.string().min(1),
    startMs: z.number().gte(0),
    endMs: z.number().positive(),
    rootNote: z.number().int().gte(0).lte(127).optional(),
  })
  .refine((s) => s.endMs > s.startMs, {
    message: "endMs must be greater than startMs",
    path: ["endMs"],
  });

export const SampleKitSlotSchema = z.object({
  pitch: z.number().int().gte(0).lte(127),
  assetId: z.string().min(1),
  sliceId: z.string().optional(),
  gainDb: z.number().optional(),
  label: z.string().optional(),
});

export const SampleKitSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  slots: z.array(SampleKitSlotSchema),
  tags: z.array(z.string()).optional(),
});

export const SampleInstrumentSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    assetId: z.string().min(1),
    rootNote: z.number().int().gte(0).lte(127),
    pitchMin: z.number().int().gte(0).lte(127),
    pitchMax: z.number().int().gte(0).lte(127),
    attackMs: z.number().gte(0).optional(),
    decayMs: z.number().gte(0).optional(),
    sustainLevel: z.number().gte(0).lte(1).optional(),
    releaseMs: z.number().gte(0).optional(),
    filterCutoffHz: z.number().positive().optional(),
    filterQ: z.number().positive().optional(),
  })
  .refine((i) => i.pitchMax >= i.pitchMin, {
    message: "pitchMax must be >= pitchMin",
    path: ["pitchMax"],
  });

// ── Motif families ──

export const MotifFamilySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  sourceIds: z.array(z.string().min(1)).min(1, "Must have at least one source"),
  variantIds: z.array(z.string()).optional(),
  relatedSceneIds: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

// ── Score profiles ──

export const ScoreProfileSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    key: z.string().optional(),
    scale: z.string().optional(),
    tempoMin: z.number().positive().optional(),
    tempoMax: z.number().positive().optional(),
    intensityMin: z.number().gte(0).lte(1).optional(),
    intensityMax: z.number().gte(0).lte(1).optional(),
    preferredKitIds: z.array(z.string()).optional(),
    preferredInstrumentIds: z.array(z.string()).optional(),
    motifFamilyIds: z.array(z.string()).optional(),
    samplePaletteTags: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    notes: z.string().optional(),
    defaultIntensity: z.number().gte(0).lte(1).optional(),
    defaultBrightness: z.number().gte(0).lte(1).optional(),
    defaultSpace: z.number().gte(0).lte(1).optional(),
    defaultTransitionEnergy: z.number().gte(0).lte(1).optional(),
  })
  .refine(
    (p) => {
      if (p.tempoMin != null && p.tempoMax != null) return p.tempoMax >= p.tempoMin;
      return true;
    },
    { message: "tempoMax must be >= tempoMin", path: ["tempoMax"] },
  )
  .refine(
    (p) => {
      if (p.intensityMin != null && p.intensityMax != null) return p.intensityMax >= p.intensityMin;
      return true;
    },
    { message: "intensityMax must be >= intensityMin", path: ["intensityMax"] },
  );

// ── Cue families ──

export const CueFamilyRoleSchema = z.enum([
  "exploration",
  "combat",
  "boss",
  "recovery",
  "stealth",
  "tension",
  "victory",
  "mystery",
]);

export const CueFamilySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  role: CueFamilyRoleSchema,
  sceneIds: z.array(z.string().min(1)),
  motifFamilyIds: z.array(z.string()).optional(),
  scoreProfileId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

// ── Score map entries ──

export const ScoreMapContextTypeSchema = z.enum([
  "region",
  "faction",
  "biome",
  "encounter",
  "safe-zone",
]);

export const ScoreMapEntrySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  contextType: ScoreMapContextTypeSchema,
  scoreProfileId: z.string().optional(),
  cueFamilyIds: z.array(z.string()).optional(),
  motifFamilyIds: z.array(z.string()).optional(),
  preferredKitIds: z.array(z.string()).optional(),
  preferredInstrumentIds: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

// ── Derivation records ──

export const DerivationTransformSchema = z.enum([
  "intensify",
  "resolve",
  "darken",
  "brighten",
  "simplify",
  "elaborate",
  "reharmonize",
]);

export const DerivationRecordSchema = z.object({
  id: z.string().min(1),
  sourceId: z.string().min(1),
  targetId: z.string().min(1),
  transform: DerivationTransformSchema,
  notes: z.string().optional(),
});

// ── Automation ──

export const AutomationParamSchema = z.enum([
  "volume",
  "pan",
  "filterCutoff",
  "reverbSend",
  "delaySend",
  "intensity",
]);

export const AutomationCurveSchema = z.enum(["linear", "exponential", "step", "smooth"]);

export const AutomationPointSchema = z.object({
  timeMs: z.number().gte(0),
  value: z.number().gte(0).lte(1),
  curve: AutomationCurveSchema.optional(),
});

export const AutomationTargetKindSchema = z.enum(["clip-layer", "scene-layer", "cue-section"]);

export const AutomationTargetSchema = z.object({
  kind: AutomationTargetKindSchema,
  targetId: z.string().min(1),
  layerRef: z.string().optional(),
});

export const AutomationLaneSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  param: AutomationParamSchema,
  target: AutomationTargetSchema,
  points: z.array(AutomationPointSchema),
  defaultValue: z.number().gte(0).lte(1).optional(),
  notes: z.string().optional(),
});

// ── Macros ──

export const MacroParamSchema = z.enum(["intensity", "tension", "brightness", "space"]);

export const MacroMappingSchema = z.object({
  id: z.string().min(1),
  macro: MacroParamSchema,
  param: AutomationParamSchema,
  weight: z.number().gte(0).lte(1),
  targetId: z.string().optional(),
  invert: z.boolean().optional(),
});

export const MacroStateSchema = z.object({
  intensity: z.number().gte(0).lte(1),
  tension: z.number().gte(0).lte(1),
  brightness: z.number().gte(0).lte(1),
  space: z.number().gte(0).lte(1),
});

// ── Section envelopes ──

export const SectionEnvelopeShapeSchema = z.enum([
  "fade-in",
  "fade-out",
  "swell",
  "duck",
  "filter-rise",
  "filter-fall",
]);

export const SectionEnvelopeSchema = z.object({
  id: z.string().min(1),
  targetId: z.string().min(1),
  shape: SectionEnvelopeShapeSchema,
  durationMs: z.number().positive(),
  depth: z.number().gte(0).lte(1).optional(),
  position: z.enum(["entry", "exit"]),
  notes: z.string().optional(),
});

// ── Automation capture ──

export const AutomationCaptureSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  recordedAt: z.string().min(1),
  source: z.union([MacroParamSchema, AutomationParamSchema]),
  points: z.array(AutomationPointSchema),
  laneId: z.string().optional(),
  notes: z.string().optional(),
});

// ── Library: templates, snapshots, branches, favorites, collections ──

export const LibraryEntityKindSchema = z.enum([
  "scene",
  "clip",
  "sample-kit",
  "sample-instrument",
  "score-profile",
  "cue-family",
  "motif-family",
  "automation-lane",
  "macro-setup",
  "section-envelope",
]);

export const LibraryTemplateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  kind: LibraryEntityKindSchema,
  data: z.record(z.string(), z.unknown()),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
  createdAt: z.string().min(1),
});

export const SnapshotSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  entityId: z.string().min(1),
  entityKind: LibraryEntityKindSchema,
  data: z.record(z.string(), z.unknown()),
  createdAt: z.string().min(1),
  notes: z.string().optional(),
});

export const BranchSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  sourceSnapshotId: z.string().min(1),
  entityId: z.string().min(1),
  entityKind: LibraryEntityKindSchema,
  createdAt: z.string().min(1),
  notes: z.string().optional(),
});

export const FavoriteSchema = z.object({
  id: z.string().min(1),
  entityId: z.string().min(1),
  entityKind: LibraryEntityKindSchema,
  addedAt: z.string().min(1),
  notes: z.string().optional(),
});

export const CollectionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  favoriteIds: z.array(z.string().min(1)),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
  createdAt: z.string().min(1),
});

export const SoundtrackPackSchema = z.object({
  meta: SoundtrackPackMetaSchema,
  assets: z.array(AudioAssetSchema),
  stems: z.array(StemSchema),
  scenes: z.array(SceneSchema),
  bindings: z.array(TriggerBindingSchema),
  transitions: z.array(TransitionRuleSchema),
  instruments: z.array(InstrumentPresetSchema).optional(),
  clips: z.array(ClipSchema).optional(),
  cues: z.array(CueSchema).optional(),
  sampleSlices: z.array(SampleSliceSchema).optional(),
  sampleKits: z.array(SampleKitSchema).optional(),
  sampleInstruments: z.array(SampleInstrumentSchema).optional(),
  motifFamilies: z.array(MotifFamilySchema).optional(),
  scoreProfiles: z.array(ScoreProfileSchema).optional(),
  cueFamilies: z.array(CueFamilySchema).optional(),
  scoreMap: z.array(ScoreMapEntrySchema).optional(),
  derivations: z.array(DerivationRecordSchema).optional(),
  automationLanes: z.array(AutomationLaneSchema).optional(),
  macroMappings: z.array(MacroMappingSchema).optional(),
  sectionEnvelopes: z.array(SectionEnvelopeSchema).optional(),
  automationCaptures: z.array(AutomationCaptureSchema).optional(),
  performanceCaptures: z.array(PerformanceCaptureSchema).optional(),
  templates: z.array(LibraryTemplateSchema).optional(),
  snapshots: z.array(SnapshotSchema).optional(),
  branches: z.array(BranchSchema).optional(),
  favorites: z.array(FavoriteSchema).optional(),
  collections: z.array(CollectionSchema).optional(),
});

// ── Runtime state ──

export const RuntimeMusicStateSchema = z
  .object({
    mode: z.string().optional(),
    danger: z.number().optional(),
    inCombat: z.boolean().optional(),
    boss: z.boolean().optional(),
    safeZone: z.boolean().optional(),
    victory: z.boolean().optional(),
    region: z.string().optional(),
    faction: z.string().optional(),
    encounterType: z.string().optional(),
  })
  .passthrough();
