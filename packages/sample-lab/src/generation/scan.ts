import { readdirSync } from "node:fs";
import { join } from "node:path";
import type { GenerationKind, GenerationStemRole } from "@motif-studio/schema";
import { GenerationError } from "./errors.js";

export interface RunArtifactFiles {
  kind: GenerationKind;
  mix?: string;
  stems?: Record<GenerationStemRole, string>;
  sfx?: string;
  lufs: string;
  generationJson?: string;
}

function find(files: string[], re: RegExp): string | undefined {
  return files.find((name) => re.test(name));
}

/**
 * Classify a run-artifact folder by the confirmation-run naming convention:
 * `*track_mix.flac`, `*stem_{bass,drums,other,vocals}.flac`, `*sfx.flac`, `*lufs.txt`.
 */
export function scanRunArtifact(dir: string): RunArtifactFiles {
  const names = readdirSync(dir);
  const mix = find(names, /track_mix\.flac$/i);
  const bass = find(names, /stem_bass\.flac$/i);
  const drums = find(names, /stem_drums\.flac$/i);
  const other = find(names, /stem_other\.flac$/i);
  const vocals = find(names, /stem_vocals\.flac$/i);
  const sfx = find(names, /sfx\.flac$/i);
  const trackLufs = find(names, /track_lufs\.txt$/i);
  const sfxLufs = find(names, /sfx_lufs\.txt$/i);
  const generationJson = find(names, /^generation\.json$/i);
  const stemCount = [bass, drums, other, vocals].filter(Boolean).length;

  if (mix && stemCount === 4) {
    const lufs = trackLufs;
    if (!lufs) {
      throw new GenerationError("ARTIFACT_LUFS", `No track LUFS manifest in ${dir}`);
    }
    return {
      kind: "music",
      mix: join(dir, mix),
      stems: {
        bass: join(dir, bass!),
        drums: join(dir, drums!),
        other: join(dir, other!),
        vocals: join(dir, vocals!),
      },
      lufs: join(dir, lufs),
      generationJson: generationJson ? join(dir, generationJson) : undefined,
    };
  }

  if (sfx) {
    const lufs = sfxLufs ?? trackLufs;
    if (!lufs) {
      throw new GenerationError("ARTIFACT_LUFS", `No SFX LUFS manifest in ${dir}`);
    }
    return {
      kind: "sfx",
      sfx: join(dir, sfx),
      lufs: join(dir, lufs),
      generationJson: generationJson ? join(dir, generationJson) : undefined,
    };
  }

  throw new GenerationError(
    "ARTIFACT_LAYOUT",
    `Not a music (mix+4 stems) or SFX run-artifact folder: ${dir}`,
  );
}
