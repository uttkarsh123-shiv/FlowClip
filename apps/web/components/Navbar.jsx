export default function Navbar() {

  return (
    <nav style={{
      width: "100%",
      boxSizing: "border-box",
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: "6px 16px",
      background: "#ffffff",
      borderBottom: "1px solid #e0e0e0",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      height: 64,
    }}>

      {/* Hamburger */}
      <button style={iconBtn} aria-label="Menu">
        <HamburgerIcon />
      </button>

      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 140 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 6,
          background: "#4f46e5", display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontSize: 16 }}>📋</span>
        </div>
        <span style={{ fontSize: 18, fontWeight: 500, color: "#3c3c3c", letterSpacing: "-0.2px" }}>
          FlowClip
        </span>
      </div>

      {/* Search bar — coming soon */}
      <div style={{ flex: 1 }} />

      {/* Right icons */}
      <div style={{ display: "flex", alignItems: "center", gap: 4, minWidth: 140, justifyContent: "flex-end" }}>
        <button style={iconBtn} title="Refresh"><RefreshIcon /></button>
        <button style={iconBtn} title="Settings"><SettingsIcon /></button>
        <div style={{
          width: 32, height: 32, borderRadius: "50%",
          background: "#4f46e5", display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, fontWeight: 600, color: "#fff", cursor: "pointer",
        }}>
          FC
        </div>
      </div>
    </nav>
  );
}

const iconBtn = {
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: 8,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#5f5f5f",
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

function RefreshIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23 4 23 10 17 10"/>
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  );
}
