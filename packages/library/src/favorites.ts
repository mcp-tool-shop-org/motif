import type { Favorite, Collection, LibraryEntityKind } from "@motif-studio/schema";

/** Create a favorite reference. */
export function createFavorite(
  id: string,
  entityId: string,
  entityKind: LibraryEntityKind,
  notes?: string,
): Favorite {
  const fav: Favorite = {
    id,
    entityId,
    entityKind,
    addedAt: new Date().toISOString(),
  };
  if (notes != null) fav.notes = notes;
  return fav;
}

/** Check whether an entity is favorited. */
export function isFavorited(
  favorites: Favorite[],
  entityId: string,
): boolean {
  return favorites.some((f) => f.entityId === entityId);
}

/** Get favorites by kind. */
export function favoritesOfKind(
  favorites: Favorite[],
  kind: LibraryEntityKind,
): Favorite[] {
  return favorites.filter((f) => f.entityKind === kind);
}

/** Create a named collection. */
export function createCollection(
  id: string,
  name: string,
  favoriteIds: string[] = [],
  options?: { tags?: string[]; notes?: string },
): Collection {
  const c: Collection = {
    id,
    name,
    favoriteIds,
    createdAt: new Date().toISOString(),
  };
  if (options?.tags) c.tags = options.tags;
  if (options?.notes) c.notes = options.notes;
  return c;
}

/** Add a favorite to a collection. */
export function addToCollection(
  collection: Collection,
  favoriteId: string,
): Collection {
  if (collection.favoriteIds.includes(favoriteId)) return collection;
  return { ...collection, favoriteIds: [...collection.favoriteIds, favoriteId] };
}

/** Remove a favorite from a collection. */
export function removeFromCollection(
  collection: Collection,
  favoriteId: string,
): Collection {
  return {
    ...collection,
    favoriteIds: collection.favoriteIds.filter((id) => id !== favoriteId),
  };
}

/** Resolve favorites within a collection. */
export function resolveCollection(
  collection: Collection,
  favorites: Favorite[],
): Favorite[] {
  const idSet = new Set(collection.favoriteIds);
  return favorites.filter((f) => idSet.has(f.id));
}

/** Search collections by name (case-insensitive). */
export function searchCollections(
  collections: Collection[],
  query: string,
): Collection[] {
  const q = query.toLowerCase();
  return collections.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      (c.tags ?? []).some((tag) => tag.toLowerCase().includes(q)),
  );
}
