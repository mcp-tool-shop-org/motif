import { MOTIF_RUNTIME_SAMPLE_RATE_HZ } from "@motif-studio/schema";

/**
 * Ingest reference level (Director-ratified 2026-08-19).
 * A consistent cue-family reference — not a claim about final game loudness.
 */
export const MUSIC_BED_TARGET_LUFS = -14;

/**
 * SFX ceiling. Quiet one-shots are not lifted to the music bed;
 * anything hotter than this is attenuated.
 */
export const SFX_CEILING_LUFS = -14;

export const RUNTIME_SAMPLE_RATE_HZ = MOTIF_RUNTIME_SAMPLE_RATE_HZ;

export const RESAMPLER_NAME = "kaiser-sinc";

export const RESAMPLER_QUALITY =
  "kaiser-windowed sinc, beta=10, 64 zero-crossings; 44.1 kHz to 48 kHz uses 147:160 polyphase";

/** Absolute RMS floor (−60 dBFS) for near-silent stem detection. */
export const NEAR_SILENT_RMS = 1e-3;

/** Vocals are near-silent if this many dB below the mix RMS. */
export const NEAR_SILENT_RELATIVE_DB = 40;

export const WAV_BIT_DEPTH = 24 as const;

export const PEAK_LIMIT = 0.999;

/**
 * Maximum ingest BOOST in dB (cuts are uncapped). Measured rationale:
 * wave-2 normalized contracts-s302 with +13.19 dB and it played ~7-10 dB
 * louder than every neighbor. Takes needing more than +6 dB of boost are
 * regeneration candidates, not boost candidates — the record flags them
 * with `boostCapped: true`.
 */
export const BOOST_CAP_DB = 6;
