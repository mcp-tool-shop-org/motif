// ────────────────────────────────────────────
// Star Freight: Grounded — Automation Layer
// Macro mappings (gameplay → audio parameters)
// Section envelopes (entry/exit shapes per cue section)
// ────────────────────────────────────────────

import type { MacroMapping, SectionEnvelope } from "@motif-studio/schema";

// ══════════════════════════════════════════
// MACRO MAPPINGS — 12 rules connecting gameplay macros to audio params
//
// Macros: intensity (0-1), tension (0-1), brightness (0-1), space (0-1)
// Params: volume, pan, filterCutoff, reverbSend, delaySend, intensity
//
// These drive real-time adaptive response. When combat_intensity rises,
// the engine pushes intensity macro up → filter opens, reverb tightens,
// volume swells. When safe_zone activates, tension drops → filter
// closes, reverb expands, delay softens.
// ══════════════════════════════════════════

export const GROUNDED_MACRO_MAPPINGS: MacroMapping[] = [
  // ── Intensity macro (combat urgency, danger level) ──
  {
    id: "mm-intensity-filter",
    macro: "intensity",
    param: "filterCutoff",
    weight: 0.7,
    // Higher intensity → filter opens (brighter, more harmonics)
  },
  {
    id: "mm-intensity-volume",
    macro: "intensity",
    param: "volume",
    weight: 0.3,
    // Higher intensity → slightly louder (subtle swell)
  },
  {
    id: "mm-intensity-reverb-inv",
    macro: "intensity",
    param: "reverbSend",
    weight: 0.4,
    invert: true,
    // Higher intensity → less reverb (tighter, more present)
  },

  // ── Tension macro (unease, suspicion, investigation) ──
  {
    id: "mm-tension-filter",
    macro: "tension",
    param: "filterCutoff",
    weight: 0.4,
    // Higher tension → filter rises (more edge)
  },
  {
    id: "mm-tension-delay",
    macro: "tension",
    param: "delaySend",
    weight: 0.5,
    // Higher tension → more delay (echoing, uncertain)
  },
  {
    id: "mm-tension-volume",
    macro: "tension",
    param: "volume",
    weight: 0.15,
    // Subtle volume nudge with tension
  },

  // ── Brightness macro (hope, wonder, alien beauty) ──
  {
    id: "mm-brightness-filter",
    macro: "brightness",
    param: "filterCutoff",
    weight: 0.6,
    // Brighter → filter wide open (shimmer, harmonics)
  },
  {
    id: "mm-brightness-reverb",
    macro: "brightness",
    param: "reverbSend",
    weight: 0.3,
    // Brighter → more reverb (spacious, airy)
  },

  // ── Space macro (environment size, isolation vs companionship) ──
  {
    id: "mm-space-reverb",
    macro: "space",
    param: "reverbSend",
    weight: 0.8,
    // More space → more reverb (cavernous stations, open void)
  },
  {
    id: "mm-space-delay",
    macro: "space",
    param: "delaySend",
    weight: 0.4,
    // More space → more delay (echoes in large environments)
  },
  {
    id: "mm-space-volume-inv",
    macro: "space",
    param: "volume",
    weight: 0.2,
    invert: true,
    // More space → slightly quieter (distant, receding)
  },

  // ── Cross-cutting: Keth communion-specific ──
  {
    id: "mm-brightness-intensity-keth",
    macro: "brightness",
    param: "intensity",
    weight: 0.5,
    targetId: "sc-communion",
    // At Communion: brightness directly drives layer intensity
    // (brighter = more Keth voice layers active)
  },
];

// ══════════════════════════════════════════
// SECTION ENVELOPES — 18 entry/exit shapes for cue sections
//
// Each envelope shapes how a section enters or exits:
// - fade-in: linear ramp up
// - fade-out: linear ramp down
// - swell: quadratic rise (slow start, dramatic finish)
// - duck: dip-and-recover (sin curve)
// - filter-rise: smooth S-curve opening
// - filter-fall: smooth S-curve closing
// ══════════════════════════════════════════

export const GROUNDED_SECTION_ENVELOPES: SectionEnvelope[] = [
  // ── Act 1: Ardent ──
  {
    id: "env-ardent-intro-entry",
    targetId: "arr-intro",
    shape: "fade-in",
    durationMs: 3000,
    depth: 0.8,
    position: "entry",
    notes: "Corridor — music fades in from silence",
  },
  {
    id: "env-sweep-esc-entry",
    targetId: "asw-esc",
    shape: "filter-rise",
    durationMs: 2000,
    depth: 0.9,
    position: "entry",
    notes: "Evidence found — filter opens as tension crystallizes",
  },
  {
    id: "env-ambush-intro-entry",
    targetId: "amb-intro",
    shape: "swell",
    durationMs: 1500,
    depth: 1.0,
    position: "entry",
    notes: "Ambush drop — dramatic quadratic swell into combat",
  },
  {
    id: "env-ambush-outro-exit",
    targetId: "amb-outro",
    shape: "fade-out",
    durationMs: 4000,
    depth: 1.0,
    position: "exit",
    notes: "Wingmate falls — combat fades to numb silence",
  },
  {
    id: "env-court-climax-entry",
    targetId: "cm-climax",
    shape: "swell",
    durationMs: 2000,
    depth: 0.9,
    position: "entry",
    notes: "Guilty verdict — requiem swells to peak",
  },
  {
    id: "env-court-outro-exit",
    targetId: "cm-outro",
    shape: "fade-out",
    durationMs: 6000,
    depth: 1.0,
    position: "exit",
    notes: "Identity dies — long fade into 6-month time skip silence",
  },

  // ── Act 2: Freeport ──
  {
    id: "env-freeport-intro-entry",
    targetId: "fp-intro",
    shape: "fade-in",
    durationMs: 4000,
    depth: 0.7,
    position: "entry",
    notes: "Bunk wakes — slow emergence from silence after time skip",
  },
  {
    id: "env-crew-outro-exit",
    targetId: "cr-outro",
    shape: "filter-rise",
    durationMs: 2000,
    depth: 0.8,
    position: "exit",
    notes: "Handshake — filter opens as hope enters, bar-syncs to lane",
  },
  {
    id: "env-lane-intro-entry",
    targetId: "ln-intro",
    shape: "fade-in",
    durationMs: 3000,
    depth: 0.6,
    position: "entry",
    notes: "Launch — music opens up into vastness of space",
  },

  // ── Act 3: Communion & Investigation ──
  {
    id: "env-communion-intro-entry",
    targetId: "com-intro",
    shape: "filter-rise",
    durationMs: 4000,
    depth: 1.0,
    position: "entry",
    notes: "Docking protocol — phrygian filter opens slowly, alien world reveals",
  },
  {
    id: "env-communion-esc-entry",
    targetId: "com-esc",
    shape: "swell",
    durationMs: 3000,
    depth: 0.8,
    position: "entry",
    notes: "Keth culture — layers swell as wonder deepens",
  },
  {
    id: "env-investigation-climax-entry",
    targetId: "inv-climax",
    shape: "filter-rise",
    durationMs: 1500,
    depth: 0.95,
    position: "entry",
    notes: "Solen's code — filter rips open as conspiracy crystallizes",
  },
  {
    id: "env-investigation-outro-exit",
    targetId: "inv-outro",
    shape: "filter-fall",
    durationMs: 2500,
    depth: 0.8,
    position: "exit",
    notes: "Don't come back — filter closes, uncertainty settles",
  },
  {
    id: "env-patrol-intro-entry",
    targetId: "pt-intro",
    shape: "swell",
    durationMs: 1000,
    depth: 0.7,
    position: "entry",
    notes: "Hail — authority theme swells in quickly",
  },
  {
    id: "env-patrol-outro-exit",
    targetId: "pt-outro",
    shape: "fade-out",
    durationMs: 2000,
    depth: 0.8,
    position: "exit",
    notes: "Move along — authority recedes",
  },

  // ── Derelict combat ──
  {
    id: "env-derelict-esc-entry",
    targetId: "der-esc",
    shape: "swell",
    durationMs: 2000,
    depth: 0.9,
    position: "entry",
    notes: "Crew synergy — combat intensifies as teamwork clicks",
  },
  {
    id: "env-derelict-climax-entry",
    targetId: "der-climax",
    shape: "filter-rise",
    durationMs: 1000,
    depth: 1.0,
    position: "entry",
    notes: "Cleared — full filter open, redemptive peak",
  },
  {
    id: "env-derelict-outro-exit",
    targetId: "der-outro",
    shape: "fade-out",
    durationMs: 4000,
    depth: 1.0,
    position: "exit",
    notes: "Callum saved — combat fades into reflective lane travel",
  },
];
