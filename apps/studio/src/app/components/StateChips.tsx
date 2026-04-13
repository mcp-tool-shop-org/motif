"use client";

import type { RuntimeMusicState } from "@motif/schema";

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
