"use client";

import type { RuntimeMusicState } from "@motif-studio/schema";
import { BUILT_IN_STATE_FIELDS } from "../pack-fields";

export function StateChips({ state }: { state: RuntimeMusicState }) {
  const chips: string[] = [];
  if (state.mode) chips.push(`mode: ${state.mode}`);
  if (state.danger != null && state.danger !== 0)
    chips.push(`danger: ${state.danger}`);
  if (state.inCombat) chips.push("inCombat");
  if (state.boss) chips.push("boss");
  if (state.safeZone) chips.push("safeZone");
  if (state.victory) chips.push("victory");
  if (state.region) chips.push(`region: ${state.region}`);
  if (state.faction) chips.push(`faction: ${state.faction}`);

  // Whatever else this pack binds on — a library pack's `cue`, Grounded's
  // `location`/`combat_active`/… — so a trace row shows what actually matched.
  for (const [key, value] of Object.entries(state)) {
    if (BUILT_IN_STATE_FIELDS.includes(key)) continue;
    if (value === undefined || value === "") continue;
    chips.push(`${key}: ${String(value)}`);
  }

  if (chips.length === 0) chips.push("(empty state)");

  return (
    <div className="state-chips">
      {chips.map((chip) => (
        <span key={chip} className="state-chip">
          {chip}
        </span>
      ))}
    </div>
  );
}
