import type { AudioAsset, AssetSourceType, AudioAssetKind } from "@motif-studio/schema";

const SOURCE_PATTERNS: Record<AssetSourceType, RegExp> = {
  drums: /drum|kick|snare|hat|perc|clap|tom|cymbal/i,
  tonal: /piano|synth|lead|pad|bass|string|chord|key/i,
  ambience: /ambient|ambience|atmo|wind|rain|forest|nature/i,
  stinger: /stinger|hit|impact|riser|swell/i,
  texture: /texture|noise|grain|drone/i,
  fx: /fx|effect|sweep|whoosh|zap|glitch/i,
};

/** Infer a source type from a filename or asset name. */
export function inferSourceType(name: string): AssetSourceType | undefined {
  for (const [type, re] of Object.entries(SOURCE_PATTERNS)) {
    if (re.test(name)) return type as AssetSourceType;
  }
  return undefined;
}

/** Map a source type to the most appropriate AudioAssetKind. */
export function sourceTypeToKind(sourceType: AssetSourceType): AudioAssetKind {
  switch (sourceType) {
    case "drums":
      return "oneshot";
    case "tonal":
      return "loop";
    case "ambience":
      return "ambient";
    case "stinger":
      return "stinger";
    case "texture":
      return "ambient";
    case "fx":
      return "oneshot";
  }
}

/** Sanitise a filename into a kebab-case id. */
export function filenameToId(filename: string): string {
  return filename
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

/** Build an AudioAsset from an imported file's metadata. */
export function buildImportedAsset(
  filename: string,
  durationMs: number,
  src: string,
): AudioAsset {
  const id = filenameToId(filename);
  const sourceType = inferSourceType(filename);
  const kind = sourceType ? sourceTypeToKind(sourceType) : "oneshot";
  return {
    id,
    name: filename.replace(/\.[^.]+$/, ""),
    src,
    kind,
    durationMs,
    imported: true,
    originalFilename: filename,
    sourceType,
  };
}
