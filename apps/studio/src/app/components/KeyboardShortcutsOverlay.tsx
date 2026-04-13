"use client";

interface KeyboardShortcutsOverlayProps {
  onClose: () => void;
}

const SHORTCUTS: { key: string; action: string }[] = [
  { key: "Ctrl+S", action: "Save project to file" },
  { key: "Ctrl+Z", action: "Undo" },
  { key: "Ctrl+Shift+Z", action: "Redo" },
  { key: "Space", action: "Toggle play/stop" },
  { key: "Escape", action: "Stop playback" },
  { key: "1 - 9", action: "Switch screen by sidebar position" },
  { key: "Delete / Backspace", action: "Remove selected entity" },
  { key: "?", action: "Show/hide this overlay" },
];

export function KeyboardShortcutsOverlay({ onClose }: KeyboardShortcutsOverlayProps) {
  return (
    <div
      className="shortcuts-overlay-backdrop"
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div
        className="shortcuts-overlay-panel"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#1a1a1a",
          border: "1px solid #333",
          borderRadius: 8,
          padding: "24px 32px",
          minWidth: 360,
          maxWidth: 480,
          color: "#e0e0e0",
        }}
      >
        <h3 style={{ margin: "0 0 16px 0", fontSize: 18, color: "#fff" }}>
          Keyboard Shortcuts
        </h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            {SHORTCUTS.map((s) => (
              <tr key={s.key} style={{ borderBottom: "1px solid #2a2a2a" }}>
                <td
                  style={{
                    padding: "8px 12px 8px 0",
                    fontFamily: "monospace",
                    fontSize: 13,
                    color: "#4a9eff",
                    whiteSpace: "nowrap",
                    width: "40%",
                  }}
                >
                  {s.key}
                </td>
                <td style={{ padding: "8px 0", fontSize: 13 }}>{s.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ marginTop: 16, textAlign: "right" }}>
          <button
            className="btn btn-sm"
            onClick={onClose}
            style={{ fontSize: 12 }}
          >
            Close (Esc)
          </button>
        </div>
      </div>
    </div>
  );
}
