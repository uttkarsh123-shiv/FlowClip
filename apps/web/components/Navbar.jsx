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
      gap: 22,
      padding: "16px 32px",
      background: "#1f1f1f",
      borderBottom: "1px solid #333",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      height: 88,
      position: "sticky",
      top: 0,
      zIndex: 50,
    }}>

      {/* Hamburger */}
      <button style={iconBtn} aria-label="Menu" onClick={onMenuClick}>
        <HamburgerIcon />
      </button>

      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: "#4f46e5",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, fontWeight: 600, color: "#fff",
        }}>
          L
        </div>
        <span style={{ fontSize: 17, fontWeight: 600, color: "#fff", letterSpacing: "-0.3px" }}>
          FlowClip
        </span>
      </div>

      {/* Search */}
      <div style={{ flex: 1, maxWidth: 420, marginLeft: 14 }}>
        <div style={{ position: "relative" }}>
          <span style={{
            position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)",
            color: "#666", display: "flex", pointerEvents: "none",
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
              padding: "10px 36px 10px 38px",
              background: "#333",
              border: "none",
              borderRadius: 10,
              fontSize: 14,
              color: "#fff",
              outline: "none",
              boxSizing: "border-box",
              fontFamily: "inherit",
              transition: "all 0.2s",
            }}
            onFocus={(e) => { e.target.style.background = "#444"; e.target.style.boxShadow = "0 0 0 1px #555"; }}
            onBlur={(e) => { e.target.style.background = "#333"; e.target.style.boxShadow = "none"; }}
          />
          {searchQuery && (
            <button onClick={() => onSearch?.("")} style={{
              position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)",
              background: "none", border: "none", cursor: "pointer", color: "#666",
              display: "flex", padding: 2,
            }}>
              <ClearIcon />
            </button>
          )}
        </div>
      </div>

      <div style={{ flex: 1 }} />

      {/* Clip count — plain text, no badge */}
      <span style={{ fontSize: 13, color: "#aaa", fontWeight: 500 }}>
        {clipCount ?? 0} clips
      </span>

      {/* Live dot — just a dot, no pill */}
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <span style={{
          width: 6, height: 6, borderRadius: "50%",
          background: "#34c759", display: "inline-block",
        }} />
        <span style={{ fontSize: 12, color: "#aaa" }}>live</span>
      </div>

      {/* User avatar */}
      <div ref={menuRef} style={{ position: "relative" }}>
        <button
          onClick={() => setMenuOpen((o) => !o)}
          style={{
            width: 40, height: 40, borderRadius: "50%",
            background: "#6366f1",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 600, color: "#fff",
            cursor: "pointer", border: "none",
            transition: "all 0.2s",
          }}
        >
          {initial}
        </button>

        {menuOpen && (
          <div style={{
            position: "absolute", right: 0, top: "calc(100% + 10px)",
            background: "#2a2a2a", border: "1px solid #444",
            borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            minWidth: 200, zIndex: 100, overflow: "hidden",
          }}>
            <div style={{ padding: "14px 16px", borderBottom: "1px solid #333" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>
                {user?.name || "User"}
              </div>
              <div style={{ fontSize: 12, color: "#aaa", marginTop: 3 }}>
                {user?.email}
              </div>
            </div>

            <div style={{ padding: "10px 16px", borderBottom: "1px solid #333" }}>
              <span style={{ fontSize: 12, color: "#aaa" }}>
                {clipCount ?? 0} clips captured
              </span>
            </div>

            <button
              onClick={() => { setMenuOpen(false); onLogout?.(); }}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 10,
                padding: "12px 16px", border: "none", background: "none",
                cursor: "pointer", fontSize: 13, color: "#ff4444", textAlign: "left",
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
  padding: 7, borderRadius: 8,
  display: "flex", alignItems: "center", justifyContent: "center",
  color: "#aaa",
  transition: "all 0.2s",
};

function HamburgerIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <rect y="4" width="24" height="2" rx="1"/>
      <rect y="11" width="24" height="2" rx="1"/>
      <rect y="18" width="24" height="2" rx="1"/>
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  );
}
