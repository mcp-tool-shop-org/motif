"use client";

import type { RuntimeMusicState } from "@motif-studio/schema";
import type { PackField } from "../pack-fields";

type StateValue = string | number | boolean | undefined;

interface StateEditorProps {
  state: RuntimeMusicState;
  onChange: (field: string, value: StateValue) => void;
  compact?: boolean;
  /**
   * Fields this pack's bindings key on that the built-in controls don't cover
   * (a library pack's `cue`, Grounded's `location`…). Rendered above the
   * built-ins because for such packs they're the only controls that resolve.
   */
  packFields?: PackField[];
}

export function StateEditor({ state, onChange, compact, packFields }: StateEditorProps) {
  const cls = compact ? "state-editor compact" : "state-editor";
  return (
    <div className={cls}>
      {packFields && packFields.length > 0 && (
        <div className="pack-fields">
          <div className="pack-fields-label" title="Derived from this pack's bindings">
            Pack Fields
          </div>
          {packFields.map((f) => (
            <PackFieldControl key={f.field} field={f} state={state} onChange={onChange} />
          ))}
        </div>
      )}
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

interface PackFieldControlProps {
  field: PackField;
  state: RuntimeMusicState;
  onChange: (field: string, value: StateValue) => void;
}

/**
 * One derived control. Options round-trip through their string form so the
 * select keeps readable DOM values while non-string option types survive.
 */
function PackFieldControl({ field, state, onChange }: PackFieldControlProps) {
  const current = state[field.field];

  if (field.control === "boolean") {
    return (
      <div className="field-row">
        <label className="field-checkbox">
          <input
            type="checkbox"
            checked={current === true}
            onChange={(e) => onChange(field.field, e.target.checked)}
          />
          {field.field}
        </label>
      </div>
    );
  }

  if (field.control === "number") {
    return (
      <div className="field-group">
        <label className="field-label" htmlFor={`pf-${field.field}`}>
          {field.field}
        </label>
        <input
          id={`pf-${field.field}`}
          className="field-input"
          type="number"
          step="0.1"
          value={typeof current === "number" ? current : ""}
          onChange={(e) =>
            onChange(
              field.field,
              e.target.value === "" ? undefined : parseFloat(e.target.value),
            )
          }
        />
      </div>
    );
  }

  if (field.control === "enum") {
    return (
      <div className="field-group">
        <label className="field-label" htmlFor={`pf-${field.field}`}>
          {field.field}
        </label>
        <select
          id={`pf-${field.field}`}
          className="field-input"
          value={current === undefined ? "" : String(current)}
          onChange={(e) =>
            onChange(
              field.field,
              e.target.value === ""
                ? undefined
                : field.options.find((o) => String(o) === e.target.value),
            )
          }
        >
          <option value="">—</option>
          {field.options.map((o) => (
            <option key={String(o)} value={String(o)}>
              {String(o)}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="field-group">
      <label className="field-label" htmlFor={`pf-${field.field}`}>
        {field.field}
      </label>
      <input
        id={`pf-${field.field}`}
        className="field-input"
        type="text"
        value={current === undefined ? "" : String(current)}
        onChange={(e) =>
          onChange(field.field, e.target.value === "" ? undefined : e.target.value)
        }
      />
    </div>
  );
}
