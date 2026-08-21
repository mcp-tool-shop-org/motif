import type { SoundtrackPack, TriggerCondition } from "@motif-studio/schema";

/**
 * Runtime-state fields the built-in StateEditor controls already cover.
 * Anything else a pack binds on has to be derived — see `derivedPackFields`.
 */
export const BUILT_IN_STATE_FIELDS: readonly string[] = [
  "mode",
  "danger",
  "inCombat",
  "boss",
  "safeZone",
  "victory",
  "region",
  "faction",
];

/** Which control the simulator renders for a derived field. */
export type PackFieldControl = "enum" | "boolean" | "number" | "text";

export interface PackField {
  /** The runtime-state key the pack's conditions read. */
  field: string;
  control: PackFieldControl;
  /**
   * Distinct `eq` values in pack order — the exact menu that can match.
   * Empty for `number`/`text` fields, whose matching values aren't enumerable.
   */
  options: (string | number | boolean)[];
}

const NUMERIC_OPS = new Set(["gt", "gte", "lt", "lte"]);

/** Every condition in the pack, binding order then condition order. */
function packConditions(pack: SoundtrackPack): TriggerCondition[] {
  return pack.bindings.flatMap((b) => b.conditions);
}

function controlFor(
  conditions: TriggerCondition[],
  options: (string | number | boolean)[],
): PackFieldControl {
  // A comparison anywhere means the field is a magnitude, not a menu — even if
  // some other binding happens to test it with `eq`.
  if (conditions.some((c) => NUMERIC_OPS.has(c.op))) return "number";
  if (options.length === 0) return "text"; // only `neq` / `includes` — freeform
  if (options.every((v) => typeof v === "boolean")) return "boolean";
  return "enum";
}

/**
 * The runtime-state fields this pack's bindings key on that the built-in
 * controls can't set — the reason a pack could show up in Preview with every
 * binding rejected. Library packs derive one (`cue`); Star Freight: Grounded
 * derives its whole `location` / `combat_active` / … vocabulary.
 *
 * Returned in pack order so the picker reads like the bindings list.
 */
export function derivedPackFields(pack: SoundtrackPack): PackField[] {
  const byField = new Map<string, TriggerCondition[]>();

  for (const condition of packConditions(pack)) {
    if (BUILT_IN_STATE_FIELDS.includes(condition.field)) continue;
    const existing = byField.get(condition.field);
    if (existing) existing.push(condition);
    else byField.set(condition.field, [condition]);
  }

  return [...byField.entries()].map(([field, conditions]) => {
    const options: (string | number | boolean)[] = [];
    for (const c of conditions) {
      if (c.op === "eq" && !options.includes(c.value)) options.push(c.value);
    }
    return { field, control: controlFor(conditions, options), options };
  });
}

/**
 * A pack whose bindings are a flat menu on one field: every binding is a single
 * `eq` on the same key. That's the shape a genre library pack derives — the game
 * names the cue it wants — and it's the only shape where seeding the simulator
 * with a value is unambiguous (see `syncPackFields`). A multi-axis game pack
 * returns null: there is no defensible default combination of its flags.
 */
export function singleAxisMenuField(pack: SoundtrackPack): PackField | null {
  if (pack.bindings.length === 0) return null;

  let field: string | undefined;
  for (const binding of pack.bindings) {
    if (binding.conditions.length !== 1) return null;
    const [condition] = binding.conditions;
    if (condition.op !== "eq") return null;
    if (field === undefined) field = condition.field;
    else if (condition.field !== field) return null;
  }
  if (field === undefined || BUILT_IN_STATE_FIELDS.includes(field)) return null;

  const derived = derivedPackFields(pack).find((f) => f.field === field);
  return derived?.control === "enum" ? derived : null;
}
