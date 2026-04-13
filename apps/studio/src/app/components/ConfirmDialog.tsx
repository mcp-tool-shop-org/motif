"use client";

import { useEffect, useRef } from "react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Focus the cancel button when dialog opens + trap Escape
  useEffect(() => {
    if (!open) return;

    // Focus cancel (safe default) after paint
    const raf = requestAnimationFrame(() => cancelRef.current?.focus());

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onCancel();
      }
    }

    window.addEventListener("keydown", handleKey, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", handleKey, true);
    };
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      onClick={onCancel}
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
        zIndex: 10000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#1e1e1e",
          border: "1px solid #333",
          borderRadius: 8,
          padding: "24px 32px",
          minWidth: 320,
          maxWidth: 420,
          color: "#e0e0e0",
        }}
      >
        <h3 style={{ margin: "0 0 8px 0", fontSize: 16, color: "#fff" }}>
          {title}
        </h3>
        <p style={{ margin: "0 0 24px 0", fontSize: 14, color: "#aaa", lineHeight: 1.5 }}>
          {message}
        </p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button
            ref={cancelRef}
            className="btn btn-sm"
            onClick={onCancel}
            style={{ fontSize: 13 }}
          >
            Cancel
          </button>
          <button
            className="btn btn-sm"
            onClick={onConfirm}
            style={{
              fontSize: 13,
              background: "#c33",
              color: "#fff",
              border: "1px solid #f66",
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
