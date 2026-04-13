"use client";

import type { RuntimeMusicState } from "@motif-studio/schema";

/** Known fields on RuntimeMusicState (excludes the index signature) */
type RuntimeMusicStateField = "mode" | "danger" | "inCombat" | "boss" | "safeZone" | "victory" | "region" | "faction" | "encounterType";

interface StateEditorProps {
  state: RuntimeMusicState;
  onChange: (field: RuntimeMusicStateField, value: string | number | boolean) => void;
  compact?: boolean;
}

export function StateEditor({ state, onChange, compact }: StateEditorProps) {
  const cls = compact ? "state-editor compact" : "state-editor";
  return (
    <div className={cls}>
      <div className="field-group">
        <label className="field-label">Mode</label>
        <select
          className="field-input"
          value={(state.mode as string) ?? ""}
          onChange={(e) => onChange("mode", e.target.value)}
        >
          <option value="">—</option>
          <option value="exploration">exploration</option>
          <option value="combat">combat</option>
          <option value="stealth">stealth</option>
          <option value="cutscene">cutscene</option>
          <option value="boss">boss</option>
          <option value="menu">menu</option>
        </select>
      </div>
      <div className="field-group">
        <label className="field-label">Danger</label>
        <input
          className="field-input"
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={Number(state.danger ?? 0)}
          onChange={(e) => onChange("danger", parseFloat(e.target.value))}
        />
        <span className="range-value">{Number(state.danger ?? 0).toFixed(1)}</span>
      </div>
      <div className="field-row">
        <label className="field-checkbox">
          <input
            type="checkbox"
            checked={Boolean(state.inCombat)}
            onChange={(e) => onChange("inCombat", e.target.checked)}
          />
          inCombat
        </label>
        <label className="field-checkbox">
          <input
            type="checkbox"
            checked={Boolean(state.boss)}
            onChange={(e) => onChange("boss", e.target.checked)}
          />
          boss
        </label>
      </div>
      <div className="field-row">
        <label className="field-checkbox">
          <input
            type="checkbox"
            checked={Boolean(state.safeZone)}
            onChange={(e) => onChange("safeZone", e.target.checked)}
          />
          safeZone
        </label>
        <label className="field-checkbox">
          <input
            type="checkbox"
            checked={Boolean(state.victory)}
            onChange={(e) => onChange("victory", e.target.checked)}
          />
          victory
        </label>
      </div>
      {!compact && (
        <>
          <div className="field-group">
            <label className="field-label">Region</label>
            <input
              className="field-input"
              type="text"
              value={(state.region as string) ?? ""}
              onChange={(e) => onChange("region", e.target.value)}
              placeholder="e.g. forest, desert"
            />
          </div>
          <div className="field-group">
            <label className="field-label">Faction</label>
            <input
              className="field-input"
              type="text"
              value={(state.faction as string) ?? ""}
              onChange={(e) => onChange("faction", e.target.value)}
              placeholder="e.g. alliance, horde"
            />
          </div>
        </>
      )}
    </div>
  );
}
