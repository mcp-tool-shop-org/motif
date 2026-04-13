"use client";

import { useStudioStore } from "../store";
import { usePlaybackStore } from "../playback-store";
import type { BusId, FxType } from "@motif/playback-engine";

const BUS_OPTIONS: BusId[] = ["drums", "music", "master"];
const FX_OPTIONS: FxType[] = ["eq", "delay", "reverb", "compressor"];

export function MixerScreen() {
  const pack = useStudioStore((s) => s.pack);
  const stems = pack.stems;
  const scenes = pack.scenes;

  const {
    transportState,
    currentSceneId,
    stemStates,
    mixerSnapshot,
    playScene,
    stop,
    setMuted,
    setSolo,
    setGain,
    setPan,
    setStemBus,
    setMasterGain,
    setBusGain,
    setBusMuted,
    addFxSlot,
    removeFxSlot,
    setFxBypassed,
  } = usePlaybackStore();

  const isPlaying = transportState === "playing";

  return (
    <>
      <div className="screen-header">
        <h2>Mixer</h2>
        <p>Mix controls, FX rack, and bus routing</p>
      </div>
      <div className="screen-body">
        {/* Quick play controls */}
        <div className="field-row" style={{ marginBottom: 16 }}>
          {!isPlaying && scenes.length > 0 && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => playScene(pack, scenes[0].id)}
            >
              ▶ Play {scenes[0].name}
            </button>
          )}
          {isPlaying && (
            <button className="btn btn-danger btn-sm" onClick={stop}>
              ■ Stop
            </button>
          )}
          {currentSceneId && (
            <span className="text-dim" style={{ marginLeft: 8 }}>
              Scene: {scenes.find((s) => s.id === currentSceneId)?.name ?? currentSceneId}
            </span>
          )}
        </div>

        {/* Channel strips */}
        <div className="sub-list">
          <div className="sub-list-header">
            <h4>Channel Strips ({stems.length})</h4>
          </div>
          {stems.length === 0 && (
            <div className="empty-state">
              <p>No stems — add stems first</p>
            </div>
          )}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(auto-fill, minmax(140px, 1fr))`,
              gap: 8,
              padding: "8px 0",
            }}
          >
            {stems.map((stem) => {
              const handle = stemStates.get(stem.id);
              const mixState = mixerSnapshot?.stems.find(
                (s) => s.stemId === stem.id,
              );
              const isMuted = handle?.muted ?? false;
              const isSolo = handle?.solo ?? false;
              const gainDb = handle?.userGainDb ?? 0;
              const pan = mixState?.pan ?? 0;
              const bus = mixState?.bus ?? "music";

              return (
                <div
                  key={stem.id}
                  className="stat-card"
                  style={{
                    padding: 12,
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    opacity: isMuted ? 0.5 : 1,
                  }}
                >
                  <span
                    style={{
                      fontWeight: 600,
                      fontSize: 12,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {stem.name}
                  </span>
                  <span className="text-dim" style={{ fontSize: 10 }}>
                    {stem.role}
                  </span>

                  {/* Gain fader */}
                  <label style={{ fontSize: 10 }}>Gain: {gainDb}dB</label>
                  <input
                    type="range"
                    min={-30}
                    max={12}
                    step={0.5}
                    value={gainDb}
                    onChange={(e) => setGain(stem.id, Number(e.target.value))}
                    style={{ width: "100%" }}
                  />

                  {/* Pan knob */}
                  <label style={{ fontSize: 10 }}>
                    Pan: {pan === 0 ? "C" : pan < 0 ? `L${Math.round(-pan * 100)}` : `R${Math.round(pan * 100)}`}
                  </label>
                  <input
                    type="range"
                    min={-1}
                    max={1}
                    step={0.05}
                    value={pan}
                    onChange={(e) => setPan(stem.id, Number(e.target.value))}
                    style={{ width: "100%" }}
                  />

                  {/* Bus assignment */}
                  <select
                    value={bus}
                    onChange={(e) =>
                      setStemBus(stem.id, e.target.value as BusId)
                    }
                    style={{ fontSize: 11, padding: 2 }}
                  >
                    {BUS_OPTIONS.filter((b) => b !== "master").map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>

                  {/* Mute / Solo */}
                  <div style={{ display: "flex", gap: 4 }}>
                    <button
                      className={`btn btn-sm ${isMuted ? "btn-danger" : ""}`}
                      onClick={() => setMuted(stem.id, !isMuted)}
                      style={{ flex: 1, fontSize: 10 }}
                    >
                      M
                    </button>
                    <button
                      className={`btn btn-sm ${isSolo ? "btn-primary" : ""}`}
                      onClick={() => setSolo(stem.id, !isSolo)}
                      style={{ flex: 1, fontSize: 10 }}
                    >
                      S
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bus section */}
        <div className="sub-list" style={{ marginTop: 16 }}>
          <div className="sub-list-header">
            <h4>Buses</h4>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 12,
              padding: "8px 0",
            }}
          >
            {BUS_OPTIONS.map((busId) => {
              const busState = mixerSnapshot?.buses.find(
                (b) => b.id === busId,
              );
              const gainDb = busState?.gainDb ?? 0;
              const isMuted = busState?.muted ?? false;
              const fxSlots = busState?.fxSlots ?? [];

              return (
                <div
                  key={busId}
                  className="stat-card"
                  style={{
                    padding: 12,
                    opacity: isMuted ? 0.5 : 1,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <span style={{ fontWeight: 600, textTransform: "uppercase" }}>
                      {busId}
                    </span>
                    <button
                      className={`btn btn-sm ${isMuted ? "btn-danger" : ""}`}
                      onClick={() => setBusMuted(busId, !isMuted)}
                      style={{ fontSize: 10 }}
                    >
                      {isMuted ? "Muted" : "Mute"}
                    </button>
                  </div>

                  <label style={{ fontSize: 10 }}>Gain: {gainDb}dB</label>
                  <input
                    type="range"
                    min={-30}
                    max={12}
                    step={0.5}
                    value={gainDb}
                    onChange={(e) =>
                      setBusGain(busId, Number(e.target.value))
                    }
                    style={{ width: "100%" }}
                  />

                  {/* FX slots */}
                  <div style={{ marginTop: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 600 }}>FX</span>
                    {fxSlots.map((slot, i) => (
                      <div
                        key={i}
                        className="sub-list-item"
                        style={{ padding: "4px 0", gap: 4 }}
                      >
                        <span style={{ fontSize: 11, flex: 1 }}>
                          {slot.type}
                        </span>
                        <button
                          className={`btn btn-sm ${slot.bypassed ? "" : "btn-primary"}`}
                          onClick={() =>
                            setFxBypassed(busId, i, !slot.bypassed)
                          }
                          style={{ fontSize: 9, padding: "1px 4px" }}
                        >
                          {slot.bypassed ? "Off" : "On"}
                        </button>
                        <button
                          className="btn btn-sm"
                          onClick={() => removeFxSlot(busId, i)}
                          style={{ fontSize: 9, padding: "1px 4px" }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <select
                      value=""
                      onChange={(e) => {
                        if (e.target.value)
                          addFxSlot(busId, e.target.value as FxType);
                      }}
                      style={{ fontSize: 11, padding: 2, marginTop: 4 }}
                    >
                      <option value="">+ Add FX…</option>
                      {FX_OPTIONS.map((fx) => (
                        <option key={fx} value={fx}>
                          {fx}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Master output */}
        <div className="sub-list" style={{ marginTop: 16 }}>
          <div className="sub-list-header">
            <h4>Master Output</h4>
          </div>
          <div style={{ padding: "8px 0", maxWidth: 300 }}>
            <label style={{ fontSize: 11 }}>
              Master Gain: {mixerSnapshot?.masterGainDb ?? 0}dB
            </label>
            <input
              type="range"
              min={-30}
              max={6}
              step={0.5}
              value={mixerSnapshot?.masterGainDb ?? 0}
              onChange={(e) => setMasterGain(Number(e.target.value))}
              style={{ width: "100%" }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
