"use client";
import { useState, useEffect, useRef } from "react";

export default function Navbar({ onMenuClick, onLogout, user, searchQuery, onSearch, clipCount }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initial = user?.name?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? "?";

  return (
    <nav style={{
      width: "100%",
      boxSizing: "border-box",
      display: "flex",
      alignItems: "center",
      gap: 20,
      padding: "14px 28px",
      background: "#fff",
      borderBottom: "1px solid #e5e7eb",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      height: 80,
      position: "sticky",
      top: 0,
      zIndex: 50,
    }}>

      {/* Hamburger */}
      <button style={iconBtn} aria-label="Menu" onClick={onMenuClick}>
        <HamburgerIcon />
      </button>

      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 6,
          background: "#4f46e5",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontSize: 16 }}>📋</span>
        </div>
        <span style={{ fontSize: 16, fontWeight: 600, color: "#1f2937", letterSpacing: "-0.2px" }}>
          FlowClip
        </span>
      </div>

      {/* Search */}
      <div style={{ flex: 1, maxWidth: 380, marginLeft: 12 }}>
        <div style={{ position: "relative" }}>
          <span style={{
            position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)",
            color: "#aaa", display: "flex", pointerEvents: "none",
          }}>
            <SearchIcon />
          </span>
          <input
            type="text"
            placeholder="Search clips..."
            value={searchQuery}
            onChange={(e) => onSearch?.(e.target.value)}
            style={{
              width: "100%",
              padding: "9px 34px 9px 36px",
              background: "#f3f4f6",
              border: "1px solid #e5e7eb",
              borderRadius: 6,
              fontSize: 13,
              color: "#1f2937",
              outline: "none",
              boxSizing: "border-box",
              fontFamily: "inherit",
              transition: "all 0.15s",
            }}
            onFocus={(e) => { e.target.style.background = "#fff"; e.target.style.borderColor = "#4f46e5"; e.target.style.boxShadow = "0 0 0 2px rgba(79, 70, 229, 0.08)"; }}
            onBlur={(e) => { e.target.style.background = "#f3f4f6"; e.target.style.borderColor = "#e5e7eb"; e.target.style.boxShadow = "none"; }}
          />
          {searchQuery && (
            <button onClick={() => onSearch?.("")} style={{
              position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)",
              background: "none", border: "none", cursor: "pointer", color: "#aaa",
              display: "flex", padding: 2,
            }}>
              <ClearIcon />
            </button>
          )}
        </div>
      </div>

      <div style={{ flex: 1 }} />

      {/* Clip count — plain text, no badge */}
      <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 500 }}>
        {clipCount ?? 0} clips
      </span>

      {/* Live dot — just a dot, no pill */}
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <span style={{
          width: 6, height: 6, borderRadius: "50%",
          background: "#22c55e", display: "inline-block",
        }} />
        <span style={{ fontSize: 11, color: "#6b7280" }}>live</span>
      </div>

      {/* User avatar */}
      <div ref={menuRef} style={{ position: "relative" }}>
        <button
          onClick={() => setMenuOpen((o) => !o)}
          style={{
            width: 34, height: 34, borderRadius: "50%",
            background: "#4f46e5",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 600, color: "#fff",
            cursor: "pointer", border: "none",
          }}
        >
          {initial}
        </button>

        {menuOpen && (
          <div style={{
            position: "absolute", right: 0, top: "calc(100% + 8px)",
            background: "#fff", border: "1px solid #e5e7eb",
            borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            minWidth: 200, zIndex: 100, overflow: "hidden",
          }}>
            <div style={{ padding: "12px 14px", borderBottom: "1px solid #f3f4f6" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#1f2937" }}>
                {user?.name || "User"}
              </div>
              <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>
                {user?.email}
              </div>
            </div>

            <div style={{ padding: "8px 14px", borderBottom: "1px solid #f3f4f6" }}>
              <span style={{ fontSize: 11, color: "#6b7280" }}>
                {clipCount ?? 0} clips captured
              </span>
            </div>

            <button
              onClick={() => { setMenuOpen(false); onLogout?.(); }}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 8,
                padding: "10px 14px", border: "none", background: "none",
                cursor: "pointer", fontSize: 12, color: "#dc2626", textAlign: "left",
              }}
            >
              <LogoutIcon />
              Sign out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

const iconBtn = {
  background: "none", border: "none", cursor: "pointer",
  padding: 6, borderRadius: 5,
  display: "flex", alignItems: "center", justifyContent: "center",
  color: "#6b7280",
  transition: "all 0.15s",
};

function HamburgerIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor">
      <rect y="4" width="24" height="2" rx="1"/>
      <rect y="11" width="24" height="2" rx="1"/>
      <rect y="18" width="24" height="2" rx="1"/>
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  );
}
