"use client";
import { useState, useEffect, useRef } from "react";

export default function Navbar({ onMenuClick, onLogout, user }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
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
      gap: 8,
      padding: "0 16px",
      background: "#ffffff",
      borderBottom: "1px solid #e5e7eb",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      height: 56,
    }}>

      {/* Hamburger */}
      <button style={iconBtn} aria-label="Menu" onClick={onMenuClick}>
        <HamburgerIcon />
      </button>

      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{
          width: 30, height: 30, borderRadius: 7,
          background: "#4f46e5", display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontSize: 15 }}>📋</span>
        </div>
        <span style={{ fontSize: 16, fontWeight: 600, color: "#111", letterSpacing: "-0.3px" }}>
          FlowClip
        </span>
      </div>

      <div style={{ flex: 1 }} />

      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>

        {/* User menu */}
        <div ref={menuRef} style={{ position: "relative" }}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "#4f46e5",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 600, color: "#fff",
              cursor: "pointer", border: "none",
            }}
          >
            {initial}
          </button>

          {menuOpen && (
            <div style={{
              position: "absolute",
              right: 0,
              top: "calc(100% + 8px)",
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: 10,
              boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
              minWidth: 200,
              zIndex: 100,
              overflow: "hidden",
            }}>
              {/* User info */}
              <div style={{ padding: "12px 16px", borderBottom: "1px solid #f3f4f6" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#111" }}>
                  {user?.name || "User"}
                </div>
                <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
                  {user?.email}
                </div>
              </div>

              {/* Logout */}
              <button
                onClick={() => { setMenuOpen(false); onLogout?.(); }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 16px",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  fontSize: 13,
                  color: "#dc2626",
                  textAlign: "left",
                }}
              >
                <LogoutIcon />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

const iconBtn = {
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: 7,
  borderRadius: 7,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#6b7280",
};

function HamburgerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <rect y="4" width="24" height="2" rx="1"/>
      <rect y="11" width="24" height="2" rx="1"/>
      <rect y="18" width="24" height="2" rx="1"/>
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  );
}
