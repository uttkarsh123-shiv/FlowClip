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
      gap: 24,
      padding: "0 48px",
      background: "#fff",
      borderBottom: "1px solid #f0f0f0",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      height: 80,
      position: "sticky",
      top: 0,
      zIndex: 50,
    }}>
      {/* Hamburger */}
      <button onClick={onMenuClick} style={{ background: "none", border: "none", cursor: "pointer", padding: 10, borderRadius: 8, display: "flex", color: "#000" }}
        onMouseEnter={(e) => { e.target.style.background = "#f5f5f5"; }}
        onMouseLeave={(e) => { e.target.style.background = "none"; }}>
        <HamburgerIcon />
      </button>

      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 900, color: "#fff" }}>F</div>
        <span style={{ fontSize: 18, fontWeight: 900, color: "#000" }}>FlowClip</span>
      </div>

      {/* Search */}
      <div style={{ flex: 1, maxWidth: 420, marginLeft: 16 }}>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#ccc", display: "flex", pointerEvents: "none" }}>
            <SearchIcon />
          </span>
          <input type="text" placeholder="Search clips..." value={searchQuery} onChange={(e) => onSearch?.(e.target.value)}
            style={{ width: "100%", padding: "11px 40px 11px 42px", background: "#f5f5f5", border: "1px solid #e5e5e5", borderRadius: 10, fontSize: 15, color: "#000", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
            onFocus={(e) => { e.target.style.background = "#fff"; e.target.style.borderColor = "#10b981"; }}
            onBlur={(e) => { e.target.style.background = "#f5f5f5"; e.target.style.borderColor = "#e5e5e5"; }} />
          {searchQuery && (
            <button onClick={() => onSearch?.("")} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#ccc", display: "flex", padding: 4 }}>
              <ClearIcon />
            </button>
          )}
        </div>
      </div>

      <div style={{ flex: 1 }} />

      <span style={{ fontSize: 14, color: "#999", fontWeight: 600 }}>{clipCount ?? 0} clips</span>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
        <span style={{ fontSize: 13, color: "#999" }}>live</span>
      </div>

      {/* Avatar */}
      <div ref={menuRef} style={{ position: "relative" }}>
        <button onClick={() => setMenuOpen((o) => !o)}
          style={{ width: 44, height: 44, borderRadius: "50%", background: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, color: "#fff", cursor: "pointer", border: "none" }}>
          {initial}
        </button>

        {menuOpen && (
          <div style={{ position: "absolute", right: 0, top: "calc(100% + 12px)", background: "#fff", border: "1px solid #e5e5e5", borderRadius: 12, boxShadow: "0 4px 24px rgba(0,0,0,0.1)", minWidth: 220, zIndex: 100, overflow: "hidden" }}>
            <div style={{ padding: "20px 20px", borderBottom: "1px solid #f0f0f0" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#000" }}>{user?.name || "User"}</div>
              <div style={{ fontSize: 13, color: "#999", marginTop: 4 }}>{user?.email}</div>
            </div>
    
            <button onClick={() => { setMenuOpen(false); onLogout?.(); }}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", border: "none", background: "none", cursor: "pointer", fontSize: 14, color: "#dc2626", textAlign: "left", fontWeight: 600 }}
              onMouseEnter={(e) => { e.target.style.background = "#fef2f2"; }}
              onMouseLeave={(e) => { e.target.style.background = "none"; }}>
              <LogoutIcon /> Sign out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

function HamburgerIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><rect y="4" width="24" height="2" rx="1"/><rect y="11" width="24" height="2" rx="1"/><rect y="18" width="24" height="2" rx="1"/></svg>;
}
function SearchIcon() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
}
function ClearIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}
function LogoutIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
}
