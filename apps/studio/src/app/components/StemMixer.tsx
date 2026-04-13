"use client";

import { usePlaybackStore } from "../playback-store";
import { useStudioStore } from "../store";

export function StemMixer() {
  const pack = useStudioStore((s) => s.pack);
  const stemStates = usePlaybackStore((s) => s.stemStates);
  const setMuted = usePlaybackStore((s) => s.setMuted);
  const setSolo = usePlaybackStore((s) => s.setSolo);
  const setGain = usePlaybackStore((s) => s.setGain);

  const stemsById = new Map(pack.stems.map((s) => [s.id, s]));
  const entries = Array.from(stemStates.entries());

  if (entries.length === 0) {
    return null;
  }

  return (
    <div className="stem-mixer">
      <h4>Stem Mixer</h4>
      <div className="stem-mixer-list">
        {entries.map(([stemId, handle]) => {
          const stem = stemsById.get(stemId);
          return (
            <div key={stemId} className="stem-mixer-row">
              <span className="stem-mixer-name" title={stemId}>
                {stem?.name ?? stemId}
              </span>
              <button
                className={`btn btn-xs ${handle.muted ? "btn-active" : ""}`}
                onClick={() => setMuted(stemId, !handle.muted)}
                title={handle.muted ? "Unmute" : "Mute"}
              >
                M
              </button>
              <button
                className={`btn btn-xs ${handle.solo ? "btn-active" : ""}`}
                onClick={() => setSolo(stemId, !handle.solo)}
                title={handle.solo ? "Unsolo" : "Solo"}
              >
                S
              </button>
              <input
                type="range"
                className="stem-mixer-gain"
                min="-24"
                max="6"
                step="0.5"
                value={handle.userGainDb}
                onChange={(e) => setGain(stemId, parseFloat(e.target.value))}
                title={`Gain: ${handle.userGainDb.toFixed(1)} dB`}
              />
              <span className="stem-mixer-db">
                {handle.userGainDb.toFixed(1)} dB
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
