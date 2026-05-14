"use client";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

export default function KebabMenu({ anchorRef, onDelete, onClose }) {
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPos({
        top: rect.bottom + window.scrollY + 6,
        left: rect.right + window.scrollX - 120,
      });
    }
  }, [anchorRef]);

  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest(".kebab-portal")) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return createPortal(
    <div className="kebab-portal" style={{
      position: "absolute",
      top: pos.top,
      left: pos.left,
      background: "#fff",
      border: "1px solid #f0f0f0",
      borderRadius: 12,
      boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
      zIndex: 9999,
      minWidth: 140,
      overflow: "hidden",
      fontFamily: "var(--font-sans), 'Plus Jakarta Sans', sans-serif",
    }}>
      <button
        onClick={onDelete}
        style={{
          display: "flex", alignItems: "center", gap: 10,
          width: "100%", padding: "12px 16px",
          border: "none", background: "none", textAlign: "left",
          cursor: "pointer", fontSize: 14, color: "#dc2626", fontWeight: 600,
          transition: "background 0.15s",
        }}
        onMouseEnter={(e) => { e.target.style.background = "#fef2f2"; }}
        onMouseLeave={(e) => { e.target.style.background = "none"; }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
          <path d="M10 11v6M14 11v6"/>
          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
        </svg>
        Delete
      </button>
    </div>,
    document.body
  );
}
