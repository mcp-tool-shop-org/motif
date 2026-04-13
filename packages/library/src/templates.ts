import type { LibraryTemplate, LibraryEntityKind } from "@motif/schema";

/** Create a library template from entity data. */
export function createTemplate(
  id: string,
  name: string,
  kind: LibraryEntityKind,
  data: Record<string, unknown>,
  options?: { tags?: string[]; notes?: string },
): LibraryTemplate {
  const t: LibraryTemplate = {
    id,
    name,
    kind,
    data,
    createdAt: new Date().toISOString(),
  };
  if (options?.tags) t.tags = options.tags;
  if (options?.notes) t.notes = options.notes;
  return t;
}

/** Instantiate a template, returning new entity data with a fresh ID. */
export function instantiateTemplate(
  template: LibraryTemplate,
  newId: string,
): Record<string, unknown> {
  return { ...template.data, id: newId };
}

/** Filter templates by entity kind. */
export function templatesOfKind(
  templates: LibraryTemplate[],
  kind: LibraryEntityKind,
): LibraryTemplate[] {
  return templates.filter((t) => t.kind === kind);
}

/** Search templates by name (case-insensitive substring). */
export function searchTemplates(
  templates: LibraryTemplate[],
  query: string,
): LibraryTemplate[] {
  const q = query.toLowerCase();
  return templates.filter(
    (t) =>
      t.name.toLowerCase().includes(q) ||
      (t.tags ?? []).some((tag) => tag.toLowerCase().includes(q)),
  );
}

/** Get templates matching any of the given tags. */
export function templatesByTag(
  templates: LibraryTemplate[],
  tags: string[],
): LibraryTemplate[] {
  const set = new Set(tags.map((t) => t.toLowerCase()));
  return templates.filter(
    (t) => (t.tags ?? []).some((tag) => set.has(tag.toLowerCase())),
  );
}
