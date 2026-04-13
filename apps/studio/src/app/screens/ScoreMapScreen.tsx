"use client";

import { useState } from "react";
import { useStudioStore } from "../store";
import type {
  CueFamilyRole,
  ScoreMapContextType,
  DerivationTransform,
} from "@motif/schema";

type Tab = "profiles" | "motifs" | "cue-families" | "world-map" | "derive";

const CUE_FAMILY_ROLES: CueFamilyRole[] = [
  "exploration", "combat", "boss", "recovery", "stealth", "tension", "victory", "mystery",
];
const CONTEXT_TYPES: ScoreMapContextType[] = [
  "region", "faction", "biome", "encounter", "safe-zone",
];
const TRANSFORMS: DerivationTransform[] = [
  "intensify", "resolve", "darken", "brighten", "simplify", "elaborate", "reharmonize",
];

export function ScoreMapScreen() {
  const [tab, setTab] = useState<Tab>("profiles");

  const tabs: { key: Tab; label: string }[] = [
    { key: "profiles", label: "Score Profiles" },
    { key: "motifs", label: "Motif Families" },
    { key: "cue-families", label: "Cue Families" },
    { key: "world-map", label: "World Map" },
    { key: "derive", label: "Derive" },
  ];

  return (
    <section>
      <h2>Score Map</h2>

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

      {tab === "profiles" && <ProfilesPanel />}
      {tab === "motifs" && <MotifsPanel />}
      {tab === "cue-families" && <CueFamiliesPanel />}
      {tab === "world-map" && <WorldMapPanel />}
      {tab === "derive" && <DerivePanel />}
    </section>
  );
}

// ── Score Profiles Panel ──

function ProfilesPanel() {
  const pack = useStudioStore((s) => s.pack)!;
  const addProfile = useStudioStore((s) => s.addScoreProfile);
  const updateProfile = useStudioStore((s) => s.updateScoreProfile);
  const deleteProfile = useStudioStore((s) => s.deleteScoreProfile);
  const addTemplate = useStudioStore((s) => s.addTemplate);
  const addSnapshot = useStudioStore((s) => s.addSnapshot);
  const addFavorite = useStudioStore((s) => s.addFavorite);
  const profiles = pack.scoreProfiles ?? [];
  const [selectedId, setSelectedId] = useState("");

  const profile = profiles.find((p) => p.id === selectedId);

  const handleCreate = () => {
    const id = `profile-${Date.now()}`;
    addProfile({ id, name: "New Score Profile" });
    setSelectedId(id);
  };

  return (
    <div>
      <h3>Score Profiles</h3>
      <p style={{ color: "#888", fontSize: "0.85rem" }}>
        Define musical defaults for a world context — key, tempo, intensity, preferred instruments.
      </p>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
        <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
          <option value="">Select a profile…</option>
          {profiles.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <button onClick={handleCreate}>+ New Profile</button>
        {profile && (
          <button onClick={() => { deleteProfile(profile.id); setSelectedId(""); }}>
            Delete
          </button>
        )}
        {profile && (
          <>
            <button onClick={() => addSnapshot({ id: `snap-${Date.now()}`, label: `${profile.name} snapshot`, entityId: profile.id, entityKind: "score-profile", data: { ...profile } as unknown as Record<string, unknown>, createdAt: new Date().toISOString() })}>
              Snapshot
            </button>
            <button onClick={() => addTemplate({ id: `tpl-${Date.now()}`, name: `${profile.name} template`, kind: "score-profile", data: { ...profile } as unknown as Record<string, unknown>, createdAt: new Date().toISOString() })}>
              Save Template
            </button>
            <button onClick={() => addFavorite({ id: `fav-${Date.now()}`, entityId: profile.id, entityKind: "score-profile", addedAt: new Date().toISOString() })}>
              Favorite
            </button>
          </>
        )}
      </div>

      {profile && (
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "0.25rem 1rem", maxWidth: 450 }}>
          <label>Name</label>
          <input value={profile.name} onChange={(e) => updateProfile(profile.id, { name: e.target.value })} />
          <label>Key</label>
          <input value={profile.key ?? ""} onChange={(e) => updateProfile(profile.id, { key: e.target.value || undefined })} placeholder="e.g. Cm" />
          <label>Scale</label>
          <input value={profile.scale ?? ""} onChange={(e) => updateProfile(profile.id, { scale: e.target.value || undefined })} placeholder="e.g. aeolian" />
          <label>Tempo Min</label>
          <input type="number" min={1} value={profile.tempoMin ?? ""} onChange={(e) => updateProfile(profile.id, { tempoMin: e.target.value ? Number(e.target.value) : undefined })} />
          <label>Tempo Max</label>
          <input type="number" min={1} value={profile.tempoMax ?? ""} onChange={(e) => updateProfile(profile.id, { tempoMax: e.target.value ? Number(e.target.value) : undefined })} />
          <label>Intensity Min</label>
          <input type="number" min={0} max={1} step={0.05} value={profile.intensityMin ?? ""} onChange={(e) => updateProfile(profile.id, { intensityMin: e.target.value ? Number(e.target.value) : undefined })} />
          <label>Intensity Max</label>
          <input type="number" min={0} max={1} step={0.05} value={profile.intensityMax ?? ""} onChange={(e) => updateProfile(profile.id, { intensityMax: e.target.value ? Number(e.target.value) : undefined })} />
          <label>Palette Tags</label>
          <input value={(profile.samplePaletteTags ?? []).join(", ")} onChange={(e) => updateProfile(profile.id, { samplePaletteTags: e.target.value ? e.target.value.split(",").map((t) => t.trim()) : undefined })} placeholder="tag1, tag2" />
          <label>Notes</label>
          <textarea value={profile.notes ?? ""} onChange={(e) => updateProfile(profile.id, { notes: e.target.value || undefined })} rows={2} style={{ resize: "vertical" }} />

          {/* ── Automation defaults ── */}
          <label style={{ gridColumn: "1 / -1", fontWeight: "bold", marginTop: "0.5rem" }}>Automation Defaults</label>
          <label>Default Intensity</label>
          <input type="number" min={0} max={1} step={0.05} value={profile.defaultIntensity ?? ""} onChange={(e) => updateProfile(profile.id, { defaultIntensity: e.target.value ? Number(e.target.value) : undefined })} />
          <label>Default Brightness</label>
          <input type="number" min={0} max={1} step={0.05} value={profile.defaultBrightness ?? ""} onChange={(e) => updateProfile(profile.id, { defaultBrightness: e.target.value ? Number(e.target.value) : undefined })} />
          <label>Default Space</label>
          <input type="number" min={0} max={1} step={0.05} value={profile.defaultSpace ?? ""} onChange={(e) => updateProfile(profile.id, { defaultSpace: e.target.value ? Number(e.target.value) : undefined })} />
          <label>Transition Energy</label>
          <input type="number" min={0} max={1} step={0.05} value={profile.defaultTransitionEnergy ?? ""} onChange={(e) => updateProfile(profile.id, { defaultTransitionEnergy: e.target.value ? Number(e.target.value) : undefined })} />
        </div>
      )}
    </div>
  );
}

// ── Motif Families Panel ──

function MotifsPanel() {
  const pack = useStudioStore((s) => s.pack)!;
  const addMotif = useStudioStore((s) => s.addMotifFamily);
  const updateMotif = useStudioStore((s) => s.updateMotifFamily);
  const deleteMotif = useStudioStore((s) => s.deleteMotifFamily);
  const families = pack.motifFamilies ?? [];
  const scenes = pack.scenes;
  const [selectedId, setSelectedId] = useState("");

  const family = families.find((f) => f.id === selectedId);

  const handleCreate = () => {
    const id = `motif-${Date.now()}`;
    addMotif({ id, name: "New Motif Family", sourceIds: [] });
    setSelectedId(id);
  };

  return (
    <div>
      <h3>Motif Families</h3>
      <p style={{ color: "#888", fontSize: "0.85rem" }}>
        Group clips, variants, and cues into reusable motif families for soundtrack coherence.
      </p>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
        <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
          <option value="">Select a motif family…</option>
          {families.map((f) => (
            <option key={f.id} value={f.id}>{f.name}</option>
          ))}
        </select>
        <button onClick={handleCreate}>+ New Motif Family</button>
        {family && (
          <button onClick={() => { deleteMotif(family.id); setSelectedId(""); }}>
            Delete
          </button>
        )}
      </div>

      {family && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "0.25rem 1rem", maxWidth: 450, marginBottom: "1rem" }}>
            <label>Name</label>
            <input value={family.name} onChange={(e) => updateMotif(family.id, { name: e.target.value })} />
            <label>Tags</label>
            <input value={(family.tags ?? []).join(", ")} onChange={(e) => updateMotif(family.id, { tags: e.target.value ? e.target.value.split(",").map((t) => t.trim()) : undefined })} placeholder="tag1, tag2" />
            <label>Notes</label>
            <textarea value={family.notes ?? ""} onChange={(e) => updateMotif(family.id, { notes: e.target.value || undefined })} rows={2} style={{ resize: "vertical" }} />
          </div>

          <h4>Source IDs ({family.sourceIds.length})</h4>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
            {family.sourceIds.map((sid) => (
              <span key={sid} style={{ background: "#333", padding: "0.2rem 0.5rem", borderRadius: 4, fontSize: "0.85rem" }}>
                {sid}
                <button onClick={() => updateMotif(family.id, { sourceIds: family.sourceIds.filter((s) => s !== sid) })} style={{ marginLeft: 4, background: "none", border: "none", cursor: "pointer", color: "#f66" }}>✕</button>
              </span>
            ))}
          </div>

          <h4>Related Scenes</h4>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {scenes.map((scene) => {
              const linked = (family.relatedSceneIds ?? []).includes(scene.id);
              return (
                <button
                  key={scene.id}
                  onClick={() =>
                    updateMotif(family.id, {
                      relatedSceneIds: linked
                        ? (family.relatedSceneIds ?? []).filter((s) => s !== scene.id)
                        : [...(family.relatedSceneIds ?? []), scene.id],
                    })
                  }
                  style={{
                    background: linked ? "#2a5" : "#333",
                    color: "#fff",
                    border: "none",
                    borderRadius: 4,
                    padding: "0.2rem 0.5rem",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                  }}
                >
                  {scene.name}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Cue Families Panel ──

function CueFamiliesPanel() {
  const pack = useStudioStore((s) => s.pack)!;
  const addFamily = useStudioStore((s) => s.addCueFamily);
  const updateFamily = useStudioStore((s) => s.updateCueFamily);
  const deleteFamily = useStudioStore((s) => s.deleteCueFamily);
  const addTemplate = useStudioStore((s) => s.addTemplate);
  const addSnapshot = useStudioStore((s) => s.addSnapshot);
  const addFavorite = useStudioStore((s) => s.addFavorite);
  const families = pack.cueFamilies ?? [];
  const scenes = pack.scenes;
  const motifs = pack.motifFamilies ?? [];
  const profiles = pack.scoreProfiles ?? [];
  const [selectedId, setSelectedId] = useState("");

  const family = families.find((f) => f.id === selectedId);

  const handleCreate = () => {
    const id = `cuefam-${Date.now()}`;
    addFamily({ id, name: "New Cue Family", role: "exploration", sceneIds: [] });
    setSelectedId(id);
  };

  return (
    <div>
      <h3>Cue Families</h3>
      <p style={{ color: "#888", fontSize: "0.85rem" }}>
        Link cues into families (exploration, combat, boss…) to build score systems, not disconnected songs.
      </p>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
        <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
          <option value="">Select a cue family…</option>
          {families.map((f) => (
            <option key={f.id} value={f.id}>{f.name} ({f.role})</option>
          ))}
        </select>
        <button onClick={handleCreate}>+ New Cue Family</button>
        {family && (
          <button onClick={() => { deleteFamily(family.id); setSelectedId(""); }}>
            Delete
          </button>
        )}
        {family && (<>
          <button onClick={() => addSnapshot({ id: `snap-${Date.now()}`, label: family.name, entityId: family.id, entityKind: "cue-family", data: { ...family } as unknown as Record<string, unknown>, createdAt: new Date().toISOString() })} style={{ fontSize: "0.75rem" }}>Snapshot</button>
          <button onClick={() => addTemplate({ id: `tmpl-${Date.now()}`, name: `${family.name} Template`, kind: "cue-family", data: { ...family } as unknown as Record<string, unknown>, createdAt: new Date().toISOString() })} style={{ fontSize: "0.75rem" }}>Save Template</button>
          <button onClick={() => addFavorite({ id: `fav-${Date.now()}`, entityId: family.id, entityKind: "cue-family", addedAt: new Date().toISOString() })} style={{ fontSize: "0.75rem" }}>Favorite</button>
        </>)}
      </div>

      {family && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "0.25rem 1rem", maxWidth: 450, marginBottom: "1rem" }}>
            <label>Name</label>
            <input value={family.name} onChange={(e) => updateFamily(family.id, { name: e.target.value })} />
            <label>Role</label>
            <select value={family.role} onChange={(e) => updateFamily(family.id, { role: e.target.value as CueFamilyRole })}>
              {CUE_FAMILY_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <label>Score Profile</label>
            <select value={family.scoreProfileId ?? ""} onChange={(e) => updateFamily(family.id, { scoreProfileId: e.target.value || undefined })}>
              <option value="">None</option>
              {profiles.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <label>Notes</label>
            <textarea value={family.notes ?? ""} onChange={(e) => updateFamily(family.id, { notes: e.target.value || undefined })} rows={2} style={{ resize: "vertical" }} />
          </div>

          <h4>Scenes in Family</h4>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
            {scenes.map((scene) => {
              const linked = family.sceneIds.includes(scene.id);
              return (
                <button
                  key={scene.id}
                  onClick={() =>
                    updateFamily(family.id, {
                      sceneIds: linked
                        ? family.sceneIds.filter((s) => s !== scene.id)
                        : [...family.sceneIds, scene.id],
                    })
                  }
                  style={{
                    background: linked ? "#2a5" : "#333",
                    color: "#fff",
                    border: "none",
                    borderRadius: 4,
                    padding: "0.2rem 0.5rem",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                  }}
                >
                  {scene.name}
                </button>
              );
            })}
          </div>

          <h4>Motif Families</h4>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {motifs.map((m) => {
              const linked = (family.motifFamilyIds ?? []).includes(m.id);
              return (
                <button
                  key={m.id}
                  onClick={() =>
                    updateFamily(family.id, {
                      motifFamilyIds: linked
                        ? (family.motifFamilyIds ?? []).filter((id) => id !== m.id)
                        : [...(family.motifFamilyIds ?? []), m.id],
                    })
                  }
                  style={{
                    background: linked ? "#25a" : "#333",
                    color: "#fff",
                    border: "none",
                    borderRadius: 4,
                    padding: "0.2rem 0.5rem",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                  }}
                >
                  🎵 {m.name}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── World Map Panel ──

function WorldMapPanel() {
  const pack = useStudioStore((s) => s.pack)!;
  const addEntry = useStudioStore((s) => s.addScoreMapEntry);
  const updateEntry = useStudioStore((s) => s.updateScoreMapEntry);
  const deleteEntry = useStudioStore((s) => s.deleteScoreMapEntry);
  const addTemplate = useStudioStore((s) => s.addTemplate);
  const addSnapshot = useStudioStore((s) => s.addSnapshot);
  const addFavorite = useStudioStore((s) => s.addFavorite);
  const entries = pack.scoreMap ?? [];
  const profiles = pack.scoreProfiles ?? [];
  const cueFamilies = pack.cueFamilies ?? [];
  const motifs = pack.motifFamilies ?? [];
  const [selectedId, setSelectedId] = useState("");
  const [filterContext, setFilterContext] = useState<ScoreMapContextType | "">("");

  const entry = entries.find((e) => e.id === selectedId);
  const filtered = filterContext ? entries.filter((e) => e.contextType === filterContext) : entries;

  const handleCreate = (contextType: ScoreMapContextType) => {
    const id = `sme-${Date.now()}`;
    addEntry({ id, name: `New ${contextType}`, contextType });
    setSelectedId(id);
  };

  return (
    <div>
      <h3>World Map</h3>
      <p style={{ color: "#888", fontSize: "0.85rem" }}>
        Map musical identities to regions, factions, biomes, encounters, and safe zones.
      </p>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
        <select value={filterContext} onChange={(e) => setFilterContext(e.target.value as ScoreMapContextType | "")}>
          <option value="">All contexts</option>
          {CONTEXT_TYPES.map((ct) => <option key={ct} value={ct}>{ct}</option>)}
        </select>
        {CONTEXT_TYPES.map((ct) => (
          <button key={ct} onClick={() => handleCreate(ct)} style={{ fontSize: "0.8rem" }}>
            + {ct}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: "1rem" }}>
        {/* Entry list */}
        <div style={{ minWidth: 200 }}>
          {filtered.map((e) => (
            <div
              key={e.id}
              onClick={() => setSelectedId(e.id)}
              style={{
                padding: "0.3rem 0.5rem",
                cursor: "pointer",
                background: selectedId === e.id ? "#333" : "transparent",
                borderRadius: 4,
                marginBottom: 2,
              }}
            >
              <span style={{ fontSize: "0.7rem", color: "#888", textTransform: "uppercase" }}>
                {e.contextType}
              </span>
              <br />
              {e.name}
            </div>
          ))}
        </div>

        {/* Entry detail */}
        {entry && (
          <div style={{ flex: 1 }}>
            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "0.25rem 1rem", maxWidth: 450, marginBottom: "1rem" }}>
              <label>Name</label>
              <input value={entry.name} onChange={(e) => updateEntry(entry.id, { name: e.target.value })} />
              <label>Context Type</label>
              <select value={entry.contextType} onChange={(e) => updateEntry(entry.id, { contextType: e.target.value as ScoreMapContextType })}>
                {CONTEXT_TYPES.map((ct) => <option key={ct} value={ct}>{ct}</option>)}
              </select>
              <label>Score Profile</label>
              <select value={entry.scoreProfileId ?? ""} onChange={(e) => updateEntry(entry.id, { scoreProfileId: e.target.value || undefined })}>
                <option value="">None</option>
                {profiles.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <label>Notes</label>
              <textarea value={entry.notes ?? ""} onChange={(e) => updateEntry(entry.id, { notes: e.target.value || undefined })} rows={2} style={{ resize: "vertical" }} />
            </div>

            <h4>Cue Families</h4>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
              {cueFamilies.map((cf) => {
                const linked = (entry.cueFamilyIds ?? []).includes(cf.id);
                return (
                  <button
                    key={cf.id}
                    onClick={() =>
                      updateEntry(entry.id, {
                        cueFamilyIds: linked
                          ? (entry.cueFamilyIds ?? []).filter((id) => id !== cf.id)
                          : [...(entry.cueFamilyIds ?? []), cf.id],
                      })
                    }
                    style={{
                      background: linked ? "#2a5" : "#333",
                      color: "#fff",
                      border: "none",
                      borderRadius: 4,
                      padding: "0.2rem 0.5rem",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                    }}
                  >
                    {cf.name} ({cf.role})
                  </button>
                );
              })}
            </div>

            <h4>Motif Families</h4>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
              {motifs.map((m) => {
                const linked = (entry.motifFamilyIds ?? []).includes(m.id);
                return (
                  <button
                    key={m.id}
                    onClick={() =>
                      updateEntry(entry.id, {
                        motifFamilyIds: linked
                          ? (entry.motifFamilyIds ?? []).filter((id) => id !== m.id)
                          : [...(entry.motifFamilyIds ?? []), m.id],
                      })
                    }
                    style={{
                      background: linked ? "#25a" : "#333",
                      color: "#fff",
                      border: "none",
                      borderRadius: 4,
                      padding: "0.2rem 0.5rem",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                    }}
                  >
                    🎵 {m.name}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => { deleteEntry(entry.id); setSelectedId(""); }}
              style={{ marginTop: "1rem", color: "#f66" }}
            >
              Delete Entry
            </button>
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
              <button onClick={() => addSnapshot({ id: `snap-${Date.now()}`, label: entry.name, entityId: entry.id, entityKind: "score-profile", data: { ...entry } as unknown as Record<string, unknown>, createdAt: new Date().toISOString() })} style={{ fontSize: "0.75rem" }}>Snapshot</button>
              <button onClick={() => addTemplate({ id: `tmpl-${Date.now()}`, name: `${entry.name} Template`, kind: "score-profile", data: { ...entry } as unknown as Record<string, unknown>, createdAt: new Date().toISOString() })} style={{ fontSize: "0.75rem" }}>Save Template</button>
              <button onClick={() => addFavorite({ id: `fav-${Date.now()}`, entityId: entry.id, entityKind: "score-profile", addedAt: new Date().toISOString() })} style={{ fontSize: "0.75rem" }}>Favorite</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Derive Panel ──

function DerivePanel() {
  const pack = useStudioStore((s) => s.pack)!;
  const addDerivation = useStudioStore((s) => s.addDerivation);
  const deleteDerivation = useStudioStore((s) => s.deleteDerivation);
  const derivations = pack.derivations ?? [];
  const scenes = pack.scenes;
  const motifs = pack.motifFamilies ?? [];
  const entries = pack.scoreMap ?? [];

  const [sourceId, setSourceId] = useState("");
  const [transform, setTransform] = useState<DerivationTransform>("intensify");

  // All derivable sources: scenes + score map entries
  const sources = [
    ...scenes.map((s) => ({ id: s.id, label: `🎬 ${s.name}`, kind: "scene" })),
    ...motifs.map((m) => ({ id: m.id, label: `🎵 ${m.name}`, kind: "motif" })),
    ...entries.map((e) => ({ id: e.id, label: `🗺️ ${e.name} (${e.contextType})`, kind: "entry" })),
  ];

  const handleDerive = () => {
    if (!sourceId) return;
    const id = `deriv-${Date.now()}`;
    const targetId = `derived-${sourceId}-${transform}-${Date.now()}`;
    addDerivation({ id, sourceId, targetId, transform });
  };

  // Group derivations by source for the preview
  const derivationsBySource = new Map<string, typeof derivations>();
  for (const d of derivations) {
    const list = derivationsBySource.get(d.sourceId) ?? [];
    list.push(d);
    derivationsBySource.set(d.sourceId, list);
  }

  return (
    <div>
      <h3>Derive From</h3>
      <p style={{ color: "#888", fontSize: "0.85rem" }}>
        Create new cues or clips by deriving from existing world material. Build coherence across your soundtrack.
      </p>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        <select value={sourceId} onChange={(e) => setSourceId(e.target.value)} style={{ minWidth: 200 }}>
          <option value="">Select source…</option>
          {sources.map((s) => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>
        <select value={transform} onChange={(e) => setTransform(e.target.value as DerivationTransform)}>
          {TRANSFORMS.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <button onClick={handleDerive} disabled={!sourceId}>
          Derive →
        </button>
      </div>

      {/* Derivation chain preview */}
      <h4>Derivation Records ({derivations.length})</h4>
      {derivations.length === 0 ? (
        <p style={{ color: "#666" }}>No derivations yet. Select a source and transform to create one.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left" }}>Source</th>
              <th>Transform</th>
              <th style={{ textAlign: "left" }}>Target</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {derivations.map((d) => {
              const sourceLabel = sources.find((s) => s.id === d.sourceId)?.label ?? d.sourceId;
              return (
                <tr key={d.id}>
                  <td>{sourceLabel}</td>
                  <td style={{ textAlign: "center" }}>→ {d.transform} →</td>
                  <td>{d.targetId}</td>
                  <td>
                    <button onClick={() => deleteDerivation(d.id)}>✕</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {/* World-level preview: continuity chains */}
      {derivationsBySource.size > 0 && (
        <>
          <h4 style={{ marginTop: "1.5rem" }}>Continuity Preview</h4>
          <p style={{ color: "#888", fontSize: "0.85rem" }}>
            How derived material flows through your world scoring:
          </p>
          {[...derivationsBySource.entries()].map(([srcId, derivs]) => {
            const srcLabel = sources.find((s) => s.id === srcId)?.label ?? srcId;
            return (
              <div key={srcId} style={{ marginBottom: "0.75rem", padding: "0.5rem", background: "#1a1a1a", borderRadius: 4 }}>
                <strong>{srcLabel}</strong>
                {derivs.map((d) => (
                  <div key={d.id} style={{ marginLeft: "1rem", color: "#aaa", fontSize: "0.85rem" }}>
                    ↳ {d.transform} → {d.targetId}
                  </div>
                ))}
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
