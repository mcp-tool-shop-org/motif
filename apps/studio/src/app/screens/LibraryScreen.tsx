"use client";

import { useState } from "react";
import { useStudioStore } from "../store";
import type { LibraryEntityKind } from "@motif/schema";

type Tab = "templates" | "snapshots" | "branches" | "favorites" | "collections" | "compare";

const ENTITY_KINDS: LibraryEntityKind[] = [
  "scene", "clip", "sample-kit", "sample-instrument", "score-profile",
  "cue-family", "motif-family", "automation-lane", "macro-setup", "section-envelope",
];

export function LibraryScreen() {
  const [tab, setTab] = useState<Tab>("templates");

  const tabs: { key: Tab; label: string }[] = [
    { key: "templates", label: "Templates" },
    { key: "snapshots", label: "Snapshots" },
    { key: "branches", label: "Branches" },
    { key: "favorites", label: "Favorites" },
    { key: "collections", label: "Collections" },
    { key: "compare", label: "Compare" },
  ];

  return (
    <section>
      <h2>Library</h2>

      <div role="tablist" style={{ display: "flex", gap: "0.25rem", marginBottom: "1rem" }}>
        {tabs.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            style={{
              fontWeight: tab === t.key ? "bold" : "normal",
              borderBottom: tab === t.key ? "2px solid currentColor" : "2px solid transparent",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "0.5rem 1rem",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "templates" && <TemplatesPanel />}
      {tab === "snapshots" && <SnapshotsPanel />}
      {tab === "branches" && <BranchesPanel />}
      {tab === "favorites" && <FavoritesPanel />}
      {tab === "collections" && <CollectionsPanel />}
      {tab === "compare" && <ComparePanel />}
    </section>
  );
}

// ── Templates Panel ──

function TemplatesPanel() {
  const pack = useStudioStore((s) => s.pack)!;
  const addTemplate = useStudioStore((s) => s.addTemplate);
  const updateTemplate = useStudioStore((s) => s.updateTemplate);
  const deleteTemplate = useStudioStore((s) => s.deleteTemplate);
  const templates = pack.templates ?? [];

  const [selectedId, setSelectedId] = useState("");
  const [filterKind, setFilterKind] = useState<LibraryEntityKind | "">("");
  const [search, setSearch] = useState("");

  const filtered = templates.filter((t) => {
    if (filterKind && t.kind !== filterKind) return false;
    if (search) {
      const q = search.toLowerCase();
      return t.name.toLowerCase().includes(q) || (t.tags ?? []).some((tag) => tag.toLowerCase().includes(q));
    }
    return true;
  });

  const template = templates.find((t) => t.id === selectedId);

  const handleCreate = () => {
    const id = `tpl-${Date.now()}`;
    addTemplate({
      id,
      name: "New Template",
      kind: (filterKind || "scene") as LibraryEntityKind,
      data: {},
      createdAt: new Date().toISOString(),
    });
    setSelectedId(id);
  };

  return (
    <div>
      <h3>Templates</h3>
      <p style={{ color: "#888", fontSize: "0.85rem" }}>
        Save and reuse starting points for scenes, kits, profiles, macros, and more.
      </p>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
        <input
          placeholder="Search templates…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ minWidth: 150 }}
        />
        <select value={filterKind} onChange={(e) => setFilterKind(e.target.value as LibraryEntityKind | "")}>
          <option value="">All kinds</option>
          {ENTITY_KINDS.map((k) => <option key={k} value={k}>{k}</option>)}
        </select>
        <button onClick={handleCreate}>+ New Template</button>
      </div>

      <div style={{ display: "flex", gap: "1rem" }}>
        <div style={{ minWidth: 200 }}>
          {filtered.map((t) => (
            <div
              key={t.id}
              onClick={() => setSelectedId(t.id)}
              style={{
                padding: "0.3rem 0.5rem",
                cursor: "pointer",
                background: selectedId === t.id ? "#333" : "transparent",
                borderRadius: 4,
                marginBottom: 2,
              }}
            >
              <span style={{ fontSize: "0.7rem", color: "#888", textTransform: "uppercase" }}>
                {t.kind}
              </span>
              <br />
              {t.name}
            </div>
          ))}
          {filtered.length === 0 && <p style={{ color: "#666" }}>No templates yet.</p>}
        </div>

        {template && (
          <div style={{ flex: 1 }}>
            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "0.25rem 1rem", maxWidth: 450 }}>
              <label>Name</label>
              <input value={template.name} onChange={(e) => updateTemplate(template.id, { name: e.target.value })} />
              <label>Kind</label>
              <select value={template.kind} onChange={(e) => updateTemplate(template.id, { kind: e.target.value as LibraryEntityKind })}>
                {ENTITY_KINDS.map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
              <label>Tags</label>
              <input
                value={(template.tags ?? []).join(", ")}
                onChange={(e) => updateTemplate(template.id, { tags: e.target.value ? e.target.value.split(",").map((t) => t.trim()) : undefined })}
                placeholder="tag1, tag2"
              />
              <label>Notes</label>
              <textarea
                value={template.notes ?? ""}
                onChange={(e) => updateTemplate(template.id, { notes: e.target.value || undefined })}
                rows={2}
                style={{ resize: "vertical" }}
              />
              <label>Created</label>
              <span style={{ color: "#888", fontSize: "0.85rem" }}>{template.createdAt}</span>
            </div>

            <div style={{ marginTop: "0.5rem" }}>
              <strong>Data keys:</strong>{" "}
              <span style={{ color: "#888", fontSize: "0.85rem" }}>
                {Object.keys(template.data).join(", ") || "(empty)"}
              </span>
            </div>

            <button onClick={() => { deleteTemplate(template.id); setSelectedId(""); }} style={{ marginTop: "0.5rem", color: "#f66" }}>
              Delete Template
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Snapshots Panel ──

function SnapshotsPanel() {
  const pack = useStudioStore((s) => s.pack)!;
  const addSnapshot = useStudioStore((s) => s.addSnapshot);
  const deleteSnapshot = useStudioStore((s) => s.deleteSnapshot);
  const snapshots = pack.snapshots ?? [];
  const scenes = pack.scenes;
  const profiles = pack.scoreProfiles ?? [];
  const cueFamilies = pack.cueFamilies ?? [];

  const [selectedId, setSelectedId] = useState("");
  const [entityKind, setEntityKind] = useState<LibraryEntityKind>("scene");
  const [entityId, setEntityId] = useState("");
  const [label, setLabel] = useState("");

  const snapshot = snapshots.find((s) => s.id === selectedId);

  // Resolve available entities for snapshotting
  const entityOptions: { id: string; name: string }[] =
    entityKind === "scene" ? scenes.map((s) => ({ id: s.id, name: s.name })) :
    entityKind === "score-profile" ? profiles.map((p) => ({ id: p.id, name: p.name })) :
    entityKind === "cue-family" ? cueFamilies.map((f) => ({ id: f.id, name: f.name })) :
    [];

  const handleSnapshot = () => {
    if (!entityId || !label) return;
    const entity = entityKind === "scene" ? scenes.find((s) => s.id === entityId) :
      entityKind === "score-profile" ? profiles.find((p) => p.id === entityId) :
      entityKind === "cue-family" ? cueFamilies.find((f) => f.id === entityId) :
      null;
    if (!entity) return;
    const id = `snap-${Date.now()}`;
    addSnapshot({
      id,
      label,
      entityId,
      entityKind,
      data: { ...entity } as unknown as Record<string, unknown>,
      createdAt: new Date().toISOString(),
    });
    setSelectedId(id);
    setLabel("");
  };

  return (
    <div>
      <h3>Snapshots</h3>
      <p style={{ color: "#888", fontSize: "0.85rem" }}>
        Freeze a version of any entity before making changes. Restore or branch from it later.
      </p>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
        <select value={entityKind} onChange={(e) => { setEntityKind(e.target.value as LibraryEntityKind); setEntityId(""); }}>
          {ENTITY_KINDS.map((k) => <option key={k} value={k}>{k}</option>)}
        </select>
        <select value={entityId} onChange={(e) => setEntityId(e.target.value)}>
          <option value="">Select entity…</option>
          {entityOptions.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
        </select>
        <input placeholder="Label (e.g. 'before overhaul')" value={label} onChange={(e) => setLabel(e.target.value)} style={{ minWidth: 180 }} />
        <button onClick={handleSnapshot} disabled={!entityId || !label}>Snapshot</button>
      </div>

      <div style={{ display: "flex", gap: "1rem" }}>
        <div style={{ minWidth: 220 }}>
          {snapshots.map((s) => (
            <div
              key={s.id}
              onClick={() => setSelectedId(s.id)}
              style={{
                padding: "0.3rem 0.5rem",
                cursor: "pointer",
                background: selectedId === s.id ? "#333" : "transparent",
                borderRadius: 4,
                marginBottom: 2,
              }}
            >
              <span style={{ fontSize: "0.7rem", color: "#888" }}>{s.entityKind} · {s.entityId}</span>
              <br />
              {s.label}
            </div>
          ))}
          {snapshots.length === 0 && <p style={{ color: "#666" }}>No snapshots yet.</p>}
        </div>

        {snapshot && (
          <div style={{ flex: 1 }}>
            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "0.25rem 1rem", maxWidth: 450 }}>
              <label>Label</label>
              <span>{snapshot.label}</span>
              <label>Entity</label>
              <span>{snapshot.entityKind}: {snapshot.entityId}</span>
              <label>Created</label>
              <span style={{ color: "#888", fontSize: "0.85rem" }}>{snapshot.createdAt}</span>
              <label>Notes</label>
              <span>{snapshot.notes ?? "—"}</span>
            </div>
            <div style={{ marginTop: "0.5rem" }}>
              <strong>Data keys:</strong>{" "}
              <span style={{ color: "#888", fontSize: "0.85rem" }}>
                {Object.keys(snapshot.data).join(", ")}
              </span>
            </div>
            <button onClick={() => { deleteSnapshot(snapshot.id); setSelectedId(""); }} style={{ marginTop: "0.5rem", color: "#f66" }}>
              Delete Snapshot
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Branches Panel ──

function BranchesPanel() {
  const pack = useStudioStore((s) => s.pack)!;
  const addBranch = useStudioStore((s) => s.addBranch);
  const deleteBranch = useStudioStore((s) => s.deleteBranch);
  const branches = pack.branches ?? [];
  const snapshots = pack.snapshots ?? [];

  const [selectedId, setSelectedId] = useState("");
  const [sourceSnapshotId, setSourceSnapshotId] = useState("");
  const [branchName, setBranchName] = useState("");

  const branch = branches.find((b) => b.id === selectedId);

  const handleBranch = () => {
    if (!sourceSnapshotId || !branchName) return;
    const snap = snapshots.find((s) => s.id === sourceSnapshotId);
    if (!snap) return;
    const id = `branch-${Date.now()}`;
    const newEntityId = `${snap.entityId}-branch-${Date.now()}`;
    addBranch({
      id,
      name: branchName,
      sourceSnapshotId,
      entityId: newEntityId,
      entityKind: snap.entityKind,
      createdAt: new Date().toISOString(),
    });
    setSelectedId(id);
    setBranchName("");
  };

  return (
    <div>
      <h3>Branches</h3>
      <p style={{ color: "#888", fontSize: "0.85rem" }}>
        Fork from any snapshot to try alternatives without losing the original.
      </p>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
        <select value={sourceSnapshotId} onChange={(e) => setSourceSnapshotId(e.target.value)}>
          <option value="">Select snapshot…</option>
          {snapshots.map((s) => (
            <option key={s.id} value={s.id}>{s.label} ({s.entityKind})</option>
          ))}
        </select>
        <input placeholder="Branch name" value={branchName} onChange={(e) => setBranchName(e.target.value)} style={{ minWidth: 160 }} />
        <button onClick={handleBranch} disabled={!sourceSnapshotId || !branchName}>Branch</button>
      </div>

      <div style={{ display: "flex", gap: "1rem" }}>
        <div style={{ minWidth: 220 }}>
          {branches.map((b) => (
            <div
              key={b.id}
              onClick={() => setSelectedId(b.id)}
              style={{
                padding: "0.3rem 0.5rem",
                cursor: "pointer",
                background: selectedId === b.id ? "#333" : "transparent",
                borderRadius: 4,
                marginBottom: 2,
              }}
            >
              <span style={{ fontSize: "0.7rem", color: "#888" }}>{b.entityKind}</span>
              <br />
              {b.name}
            </div>
          ))}
          {branches.length === 0 && <p style={{ color: "#666" }}>No branches yet.</p>}
        </div>

        {branch && (
          <div style={{ flex: 1 }}>
            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "0.25rem 1rem", maxWidth: 450 }}>
              <label>Name</label>
              <span>{branch.name}</span>
              <label>Entity Kind</label>
              <span>{branch.entityKind}</span>
              <label>New Entity ID</label>
              <span style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>{branch.entityId}</span>
              <label>Source Snapshot</label>
              <span style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>{branch.sourceSnapshotId}</span>
              <label>Created</label>
              <span style={{ color: "#888", fontSize: "0.85rem" }}>{branch.createdAt}</span>
            </div>
            <button onClick={() => { deleteBranch(branch.id); setSelectedId(""); }} style={{ marginTop: "0.5rem", color: "#f66" }}>
              Delete Branch
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Favorites Panel ──

function FavoritesPanel() {
  const pack = useStudioStore((s) => s.pack)!;
  const addFavorite = useStudioStore((s) => s.addFavorite);
  const deleteFavorite = useStudioStore((s) => s.deleteFavorite);
  const favorites = pack.favorites ?? [];
  const scenes = pack.scenes;
  const profiles = pack.scoreProfiles ?? [];
  const cueFamilies = pack.cueFamilies ?? [];
  const kits = pack.sampleKits ?? [];

  const [entityKind, setEntityKind] = useState<LibraryEntityKind>("scene");
  const [entityId, setEntityId] = useState("");
  const [filterKind, setFilterKind] = useState<LibraryEntityKind | "">("");

  const entityOptions: { id: string; name: string }[] =
    entityKind === "scene" ? scenes.map((s) => ({ id: s.id, name: s.name })) :
    entityKind === "score-profile" ? profiles.map((p) => ({ id: p.id, name: p.name })) :
    entityKind === "cue-family" ? cueFamilies.map((f) => ({ id: f.id, name: f.name })) :
    entityKind === "sample-kit" ? kits.map((k) => ({ id: k.id, name: k.name })) :
    [];

  const favIdSet = new Set(favorites.map((f) => f.entityId));

  const handleFavorite = () => {
    if (!entityId || favIdSet.has(entityId)) return;
    const id = `fav-${Date.now()}`;
    addFavorite({
      id,
      entityId,
      entityKind,
      addedAt: new Date().toISOString(),
    });
    setEntityId("");
  };

  // Resolve names for display
  const allEntities = new Map<string, string>();
  for (const s of scenes) allEntities.set(s.id, s.name);
  for (const p of profiles) allEntities.set(p.id, p.name);
  for (const f of cueFamilies) allEntities.set(f.id, f.name);
  for (const k of kits) allEntities.set(k.id, k.name);

  const filtered = filterKind ? favorites.filter((f) => f.entityKind === filterKind) : favorites;

  return (
    <div>
      <h3>Favorites</h3>
      <p style={{ color: "#888", fontSize: "0.85rem" }}>
        Bookmark your best scenes, kits, profiles, and cues for quick access.
      </p>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
        <select value={entityKind} onChange={(e) => { setEntityKind(e.target.value as LibraryEntityKind); setEntityId(""); }}>
          {ENTITY_KINDS.map((k) => <option key={k} value={k}>{k}</option>)}
        </select>
        <select value={entityId} onChange={(e) => setEntityId(e.target.value)}>
          <option value="">Select entity…</option>
          {entityOptions.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
        </select>
        <button onClick={handleFavorite} disabled={!entityId || favIdSet.has(entityId)}>
          {favIdSet.has(entityId) ? "Already favorited" : "Add Favorite"}
        </button>
      </div>

      <div style={{ marginBottom: "0.5rem" }}>
        <select value={filterKind} onChange={(e) => setFilterKind(e.target.value as LibraryEntityKind | "")}>
          <option value="">All kinds</option>
          {ENTITY_KINDS.map((k) => <option key={k} value={k}>{k}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p style={{ color: "#666" }}>No favorites yet.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left" }}>Kind</th>
              <th style={{ textAlign: "left" }}>Entity</th>
              <th style={{ textAlign: "left" }}>Added</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((f) => (
              <tr key={f.id}>
                <td style={{ textTransform: "uppercase", fontSize: "0.75rem", color: "#888" }}>{f.entityKind}</td>
                <td>{allEntities.get(f.entityId) ?? f.entityId}</td>
                <td style={{ color: "#888", fontSize: "0.85rem" }}>{f.addedAt.slice(0, 10)}</td>
                <td><button onClick={() => deleteFavorite(f.id)} style={{ color: "#f66" }}>Remove</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ── Collections Panel ──

function CollectionsPanel() {
  const pack = useStudioStore((s) => s.pack)!;
  const addCollection = useStudioStore((s) => s.addCollection);
  const updateCollection = useStudioStore((s) => s.updateCollection);
  const deleteCollection = useStudioStore((s) => s.deleteCollection);
  const collections = pack.collections ?? [];
  const favorites = pack.favorites ?? [];

  const [selectedId, setSelectedId] = useState("");
  const collection = collections.find((c) => c.id === selectedId);

  // Resolve names
  const scenes = pack.scenes;
  const profiles = pack.scoreProfiles ?? [];
  const cueFamilies = pack.cueFamilies ?? [];
  const kits = pack.sampleKits ?? [];
  const allEntities = new Map<string, string>();
  for (const s of scenes) allEntities.set(s.id, s.name);
  for (const p of profiles) allEntities.set(p.id, p.name);
  for (const f of cueFamilies) allEntities.set(f.id, f.name);
  for (const k of kits) allEntities.set(k.id, k.name);

  const handleCreate = () => {
    const id = `col-${Date.now()}`;
    addCollection({
      id,
      name: "New Collection",
      favoriteIds: [],
      createdAt: new Date().toISOString(),
    });
    setSelectedId(id);
  };

  const collectionFavorites = collection
    ? favorites.filter((f) => collection.favoriteIds.includes(f.id))
    : [];
  const availableFavorites = collection
    ? favorites.filter((f) => !collection.favoriteIds.includes(f.id))
    : [];

  return (
    <div>
      <h3>Collections</h3>
      <p style={{ color: "#888", fontSize: "0.85rem" }}>
        Organize favorites into named collections like &quot;Boss Ideas&quot; or &quot;Frostlands Pack&quot;.
      </p>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
        <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
          <option value="">Select a collection…</option>
          {collections.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.favoriteIds.length})</option>)}
        </select>
        <button onClick={handleCreate}>+ New Collection</button>
      </div>

      {collection && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "0.25rem 1rem", maxWidth: 450, marginBottom: "1rem" }}>
            <label>Name</label>
            <input value={collection.name} onChange={(e) => updateCollection(collection.id, { name: e.target.value })} />
            <label>Tags</label>
            <input
              value={(collection.tags ?? []).join(", ")}
              onChange={(e) => updateCollection(collection.id, { tags: e.target.value ? e.target.value.split(",").map((t) => t.trim()) : undefined })}
              placeholder="tag1, tag2"
            />
            <label>Notes</label>
            <textarea
              value={collection.notes ?? ""}
              onChange={(e) => updateCollection(collection.id, { notes: e.target.value || undefined })}
              rows={2}
              style={{ resize: "vertical" }}
            />
          </div>

          <h4>Items ({collectionFavorites.length})</h4>
          {collectionFavorites.length === 0 ? (
            <p style={{ color: "#666" }}>No items in this collection.</p>
          ) : (
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
              {collectionFavorites.map((f) => (
                <span key={f.id} style={{ background: "#2a5", padding: "0.2rem 0.5rem", borderRadius: 4, fontSize: "0.85rem" }}>
                  {allEntities.get(f.entityId) ?? f.entityId}
                  <button
                    onClick={() => updateCollection(collection.id, { favoriteIds: collection.favoriteIds.filter((id) => id !== f.id) })}
                    style={{ marginLeft: 4, background: "none", border: "none", cursor: "pointer", color: "#f66" }}
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          )}

          {availableFavorites.length > 0 && (
            <div>
              <h4>Add from Favorites</h4>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {availableFavorites.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => updateCollection(collection.id, { favoriteIds: [...collection.favoriteIds, f.id] })}
                    style={{ background: "#333", border: "none", borderRadius: 4, padding: "0.2rem 0.5rem", cursor: "pointer", fontSize: "0.85rem", color: "#fff" }}
                  >
                    + {allEntities.get(f.entityId) ?? f.entityId} ({f.entityKind})
                  </button>
                ))}
              </div>
            </div>
          )}

          <button onClick={() => { deleteCollection(collection.id); setSelectedId(""); }} style={{ marginTop: "1rem", color: "#f66" }}>
            Delete Collection
          </button>
        </div>
      )}
    </div>
  );
}

// ── Compare Panel ──

function ComparePanel() {
  const pack = useStudioStore((s) => s.pack)!;
  const snapshots = pack.snapshots ?? [];

  const [snapA, setSnapA] = useState("");
  const [snapB, setSnapB] = useState("");
  const [result, setResult] = useState<{
    same: string[];
    changed: { field: string; a: unknown; b: unknown }[];
    onlyA: string[];
    onlyB: string[];
  } | null>(null);

  const handleCompare = () => {
    const a = snapshots.find((s) => s.id === snapA);
    const b = snapshots.find((s) => s.id === snapB);
    if (!a || !b) return;

    const allKeys = new Set([...Object.keys(a.data), ...Object.keys(b.data)]);
    const same: string[] = [];
    const changed: { field: string; a: unknown; b: unknown }[] = [];
    const onlyA: string[] = [];
    const onlyB: string[] = [];

    for (const key of allKeys) {
      const inA = key in a.data;
      const inB = key in b.data;
      if (inA && !inB) {
        onlyA.push(key);
      } else if (!inA && inB) {
        onlyB.push(key);
      } else if (JSON.stringify(a.data[key]) === JSON.stringify(b.data[key])) {
        same.push(key);
      } else {
        changed.push({ field: key, a: a.data[key], b: b.data[key] });
      }
    }

    setResult({ same, changed, onlyA, onlyB });
  };

  const snapAObj = snapshots.find((s) => s.id === snapA);
  const snapBObj = snapshots.find((s) => s.id === snapB);

  return (
    <div>
      <h3>Compare</h3>
      <p style={{ color: "#888", fontSize: "0.85rem" }}>
        Side-by-side comparison of two snapshots. See what changed, promote a version.
      </p>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        <div>
          <label style={{ fontSize: "0.8rem", color: "#888" }}>Version A</label>
          <br />
          <select value={snapA} onChange={(e) => { setSnapA(e.target.value); setResult(null); }}>
            <option value="">Select snapshot…</option>
            {snapshots.map((s) => (
              <option key={s.id} value={s.id}>{s.label} ({s.entityKind})</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ fontSize: "0.8rem", color: "#888" }}>Version B</label>
          <br />
          <select value={snapB} onChange={(e) => { setSnapB(e.target.value); setResult(null); }}>
            <option value="">Select snapshot…</option>
            {snapshots.map((s) => (
              <option key={s.id} value={s.id}>{s.label} ({s.entityKind})</option>
            ))}
          </select>
        </div>
        <div style={{ alignSelf: "flex-end" }}>
          <button onClick={handleCompare} disabled={!snapA || !snapB || snapA === snapB}>
            Compare
          </button>
        </div>
      </div>

      {result && (
        <div>
          <div style={{ display: "flex", gap: "2rem", marginBottom: "1rem" }}>
            <span style={{ color: "#2a5" }}>{result.same.length} identical</span>
            <span style={{ color: "#fa5" }}>{result.changed.length} changed</span>
            <span style={{ color: "#888" }}>{result.onlyA.length} only in A</span>
            <span style={{ color: "#888" }}>{result.onlyB.length} only in B</span>
          </div>

          {result.changed.length > 0 && (
            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "1rem" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left" }}>Field</th>
                  <th style={{ textAlign: "left" }}>A: {snapAObj?.label}</th>
                  <th style={{ textAlign: "left" }}>B: {snapBObj?.label}</th>
                </tr>
              </thead>
              <tbody>
                {result.changed.map((c) => (
                  <tr key={c.field}>
                    <td style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>{c.field}</td>
                    <td style={{ fontSize: "0.85rem", color: "#fa5" }}>{JSON.stringify(c.a)}</td>
                    <td style={{ fontSize: "0.85rem", color: "#5af" }}>{JSON.stringify(c.b)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {result.onlyA.length > 0 && (
            <div style={{ marginBottom: "0.5rem" }}>
              <strong>Only in A:</strong> {result.onlyA.join(", ")}
            </div>
          )}
          {result.onlyB.length > 0 && (
            <div style={{ marginBottom: "0.5rem" }}>
              <strong>Only in B:</strong> {result.onlyB.join(", ")}
            </div>
          )}
          {result.same.length > 0 && (
            <details>
              <summary style={{ cursor: "pointer", color: "#888" }}>
                {result.same.length} identical fields
              </summary>
              <p style={{ color: "#666", fontSize: "0.85rem" }}>{result.same.join(", ")}</p>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
