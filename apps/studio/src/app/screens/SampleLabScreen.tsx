"use client";

import { useState } from "react";
import { useStudioStore } from "../store";

type Tab = "import" | "trim" | "slicing" | "kit" | "instrument";

export function SampleLabScreen() {
  const [tab, setTab] = useState<Tab>("import");

  const tabs: { key: Tab; label: string }[] = [
    { key: "import", label: "Import" },
    { key: "trim", label: "Trim & Loop" },
    { key: "slicing", label: "Slicing" },
    { key: "kit", label: "Kit Builder" },
    { key: "instrument", label: "Sample Instrument" },
  ];

  return (
    <section>
      <h2>Sample Lab</h2>

      {/* Tab bar */}
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
              borderTop: "none",
              borderLeft: "none",
              borderRight: "none",
              cursor: "pointer",
              padding: "0.5rem 1rem",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      {tab === "import" && <ImportPanel />}
      {tab === "trim" && <TrimPanel />}
      {tab === "slicing" && <SlicingPanel />}
      {tab === "kit" && <KitBuilderPanel />}
      {tab === "instrument" && <InstrumentPanel />}
    </section>
  );
}

// ── Import Panel ──

function ImportPanel() {
  const pack = useStudioStore((s) => s.pack);
  const importedAssets = (pack?.assets ?? []).filter((a) => a.imported);

  return (
    <div>
      <h3>Import Audio Files</h3>
      <div
        style={{
          border: "2px dashed #555",
          borderRadius: 8,
          padding: "2rem",
          textAlign: "center",
          marginBottom: "1rem",
        }}
      >
        <p>Drag &amp; drop audio files here, or click to browse.</p>
        <input type="file" accept="audio/*" multiple disabled title="Coming soon" style={{ marginTop: "0.5rem" }} />
      </div>

      {importedAssets.length > 0 && (
        <>
          <h4>Imported ({importedAssets.length})</h4>
          <ul>
            {importedAssets.map((a) => (
              <li key={a.id}>
                {a.name} — {a.sourceType ?? "unknown"} — {(a.durationMs / 1000).toFixed(2)}s
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

// ── Trim Panel ──

function TrimPanel() {
  const pack = useStudioStore((s) => s.pack);
  const assets = pack?.assets ?? [];
  const [selectedAssetId, setSelectedAssetId] = useState(assets[0]?.id ?? "");
  const asset = assets.find((a) => a.id === selectedAssetId);

  return (
    <div>
      <h3>Trim &amp; Loop</h3>

      <label htmlFor="trim-asset">Asset: </label>
      <select
        id="trim-asset"
        value={selectedAssetId}
        onChange={(e) => setSelectedAssetId(e.target.value)}
      >
        {assets.map((a) => (
          <option key={a.id} value={a.id}>{a.name}</option>
        ))}
      </select>

      {asset && (
        <div style={{ marginTop: "1rem" }}>
          <div
            style={{
              background: "#222",
              height: 80,
              borderRadius: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#666",
              marginBottom: "0.5rem",
            }}
          >
            Waveform display placeholder
          </div>
          <p>Duration: {(asset.durationMs / 1000).toFixed(2)}s</p>
          <p>Trim: {asset.trimStartMs ?? 0}ms → {asset.trimEndMs ?? asset.durationMs}ms</p>
          <p>Loop: {asset.loopStartMs ?? 0}ms → {asset.loopEndMs ?? asset.durationMs}ms</p>
          <p>Source type: {asset.sourceType ?? "—"}</p>
          <p>Root note: {asset.rootNote ?? "—"}</p>
        </div>
      )}
    </div>
  );
}

// ── Slicing Panel ──

function SlicingPanel() {
  const pack = useStudioStore((s) => s.pack);
  const addSlice = useStudioStore((s) => s.addSampleSlice);
  const deleteSlice = useStudioStore((s) => s.deleteSampleSlice);
  const slices = pack?.sampleSlices ?? [];
  const assets = pack?.assets ?? [];
  const [selectedAssetId, setSelectedAssetId] = useState(assets[0]?.id ?? "");
  const asset = assets.find((a) => a.id === selectedAssetId);

  const handleEvenSlice = (count: number) => {
    if (!asset) return;
    const start = asset.trimStartMs ?? 0;
    const end = asset.trimEndMs ?? asset.durationMs;
    const step = (end - start) / count;
    for (let i = 0; i < count; i++) {
      addSlice({
        id: `${asset.id}-slice-${Date.now()}-${i}`,
        assetId: asset.id,
        name: `Slice ${i + 1}`,
        startMs: start + i * step,
        endMs: start + (i + 1) * step,
      });
    }
  };

  return (
    <div>
      <h3>Slicing</h3>

      <label htmlFor="slice-asset">Asset: </label>
      <select
        id="slice-asset"
        value={selectedAssetId}
        onChange={(e) => setSelectedAssetId(e.target.value)}
      >
        {assets.map((a) => (
          <option key={a.id} value={a.id}>{a.name}</option>
        ))}
      </select>

      <div style={{ display: "flex", gap: "0.5rem", margin: "0.5rem 0" }}>
        {[4, 8, 16].map((n) => (
          <button key={n} onClick={() => handleEvenSlice(n)}>÷{n}</button>
        ))}
      </div>

      {slices.length > 0 && (
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "0.5rem" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left" }}>Name</th>
              <th>Start</th>
              <th>End</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {slices
              .filter((s) => s.assetId === selectedAssetId)
              .map((s) => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td style={{ textAlign: "center" }}>{s.startMs.toFixed(1)}ms</td>
                  <td style={{ textAlign: "center" }}>{s.endMs.toFixed(1)}ms</td>
                  <td>
                    <button onClick={() => deleteSlice(s.id)}>✕</button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ── Kit Builder Panel ──

function KitBuilderPanel() {
  const pack = useStudioStore((s) => s.pack);
  const addKit = useStudioStore((s) => s.addSampleKit);
  const deleteKit = useStudioStore((s) => s.deleteSampleKit);
  const addSlot = useStudioStore((s) => s.addSampleKitSlot);
  const removeSlot = useStudioStore((s) => s.removeSampleKitSlot);
  const kits = pack?.sampleKits ?? [];
  const [selectedKitId, setSelectedKitId] = useState("");

  const kit = kits.find((k) => k.id === selectedKitId);

  const handleCreateKit = () => {
    const id = `kit-${Date.now()}`;
    addKit({ id, name: "New Kit", slots: [] });
    setSelectedKitId(id);
  };

  return (
    <div>
      <h3>Kit Builder</h3>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
        <select value={selectedKitId} onChange={(e) => setSelectedKitId(e.target.value)}>
          <option value="">Select a kit…</option>
          {kits.map((k) => (
            <option key={k.id} value={k.id}>{k.name}</option>
          ))}
        </select>
        <button onClick={handleCreateKit}>+ New Kit</button>
        {kit && <button onClick={() => { deleteKit(kit.id); setSelectedKitId(""); }}>Delete Kit</button>}
      </div>

      {kit && (
        <div>
          <h4>{kit.name} — {kit.slots.length} slots</h4>
          <button
            onClick={() =>
              addSlot(kit.id, {
                pitch: kit.slots.length > 0 ? Math.max(...kit.slots.map((s) => s.pitch)) + 1 : 36,
                assetId: pack?.assets[0]?.id ?? "",
                label: `Pad ${kit.slots.length + 1}`,
              })
            }
          >
            + Add Slot
          </button>

          {kit.slots.length > 0 && (
            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "0.5rem" }}>
              <thead>
                <tr>
                  <th>Pitch</th>
                  <th>Label</th>
                  <th>Asset</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {kit.slots.map((slot) => (
                  <tr key={slot.pitch}>
                    <td style={{ textAlign: "center" }}>{slot.pitch}</td>
                    <td>{slot.label ?? "—"}</td>
                    <td>{slot.assetId}</td>
                    <td>
                      <button onClick={() => removeSlot(kit.id, slot.pitch)}>✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

// ── Sample Instrument Panel ──

function InstrumentPanel() {
  const pack = useStudioStore((s) => s.pack);
  const addInstrument = useStudioStore((s) => s.addSampleInstrument);
  const deleteInstrument = useStudioStore((s) => s.deleteSampleInstrument);
  const updateInstrument = useStudioStore((s) => s.updateSampleInstrument);
  const instruments = pack?.sampleInstruments ?? [];
  const [selectedId, setSelectedId] = useState("");

  const inst = instruments.find((i) => i.id === selectedId);

  const handleCreate = () => {
    const id = `inst-${Date.now()}`;
    addInstrument({
      id,
      name: "New Instrument",
      assetId: pack?.assets[0]?.id ?? "",
      rootNote: 60,
      pitchMin: 0,
      pitchMax: 127,
      attackMs: 5,
      decayMs: 100,
      sustainLevel: 0.8,
      releaseMs: 200,
    });
    setSelectedId(id);
  };

  return (
    <div>
      <h3>Sample Instrument</h3>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
        <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
          <option value="">Select an instrument…</option>
          {instruments.map((i) => (
            <option key={i.id} value={i.id}>{i.name}</option>
          ))}
        </select>
        <button onClick={handleCreate}>+ New Instrument</button>
        {inst && (
          <button onClick={() => { deleteInstrument(inst.id); setSelectedId(""); }}>
            Delete
          </button>
        )}
      </div>

      {inst && (
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "0.25rem 1rem", maxWidth: 400 }}>
          <label>Name</label>
          <input
            value={inst.name}
            onChange={(e) => updateInstrument(inst.id, { name: e.target.value })}
          />
          <label>Root Note</label>
          <input
            type="number"
            min={0}
            max={127}
            value={inst.rootNote}
            onChange={(e) => updateInstrument(inst.id, { rootNote: Number(e.target.value) })}
          />
          <label>Pitch Min</label>
          <input
            type="number"
            min={0}
            max={127}
            value={inst.pitchMin}
            onChange={(e) => updateInstrument(inst.id, { pitchMin: Number(e.target.value) })}
          />
          <label>Pitch Max</label>
          <input
            type="number"
            min={0}
            max={127}
            value={inst.pitchMax}
            onChange={(e) => updateInstrument(inst.id, { pitchMax: Number(e.target.value) })}
          />
          <label>Attack (ms)</label>
          <input
            type="number"
            min={0}
            value={inst.attackMs ?? 5}
            onChange={(e) => updateInstrument(inst.id, { attackMs: Number(e.target.value) })}
          />
          <label>Decay (ms)</label>
          <input
            type="number"
            min={0}
            value={inst.decayMs ?? 100}
            onChange={(e) => updateInstrument(inst.id, { decayMs: Number(e.target.value) })}
          />
          <label>Sustain</label>
          <input
            type="number"
            min={0}
            max={1}
            step={0.05}
            value={inst.sustainLevel ?? 0.8}
            onChange={(e) => updateInstrument(inst.id, { sustainLevel: Number(e.target.value) })}
          />
          <label>Release (ms)</label>
          <input
            type="number"
            min={0}
            value={inst.releaseMs ?? 200}
            onChange={(e) => updateInstrument(inst.id, { releaseMs: Number(e.target.value) })}
          />
          <label>Filter Cutoff (Hz)</label>
          <input
            type="number"
            min={20}
            value={inst.filterCutoffHz ?? ""}
            onChange={(e) =>
              updateInstrument(inst.id, {
                filterCutoffHz: e.target.value ? Number(e.target.value) : undefined,
              })
            }
          />
          <label>Filter Q</label>
          <input
            type="number"
            min={0.1}
            step={0.1}
            value={inst.filterQ ?? ""}
            onChange={(e) =>
              updateInstrument(inst.id, {
                filterQ: e.target.value ? Number(e.target.value) : undefined,
              })
            }
          />
        </div>
      )}
    </div>
  );
}
