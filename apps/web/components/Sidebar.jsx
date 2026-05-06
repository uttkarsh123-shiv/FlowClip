"use client";

const NAV_ITEMS = [
  { type: "all",   label: "All Clips", icon: <GridIcon /> },
  { type: "text",  label: "Text",      icon: <TextIcon /> },
  { type: "link",  label: "Links",     icon: <LinkIcon /> },
  { type: "image", label: "Images",    icon: <ImageIcon /> },
];

export default function Sidebar({ active = "all", onChange, isOpen = false }) {
  if (!isOpen) return null;
  return (
    <aside style={{
      width: 220,
      minHeight: "calc(100vh - 64px)",
      background: "#fff",
      borderRight: "1px solid #f0f0f0",
      padding: "12px 12px",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>
      {NAV_ITEMS.map((item) => {
        const isActive = active === item.type;
        return (
          <button
            key={item.type}
            onClick={() => onChange?.(item.type)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "9px 14px",
              background: isActive ? "#eef2ff" : "transparent",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              textAlign: "left",
              color: isActive ? "#4f46e5" : "#555",
              fontWeight: isActive ? 600 : 500,
              fontSize: 15,
              marginBottom: 2,
              transition: "background 0.15s, color 0.15s",
              letterSpacing: "-0.1px",
            }}
          >
            <span style={{ color: isActive ? "#4f46e5" : "#999", flexShrink: 0 }}>
              {item.icon}
            </span>
            {item.label}
          </button>
        );
      })}
    </aside>
  );
}

function GridIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/>
      <rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  );
}

function TextIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="4" y1="7" x2="20" y2="7"/>
      <line x1="4" y1="12" x2="16" y2="12"/>
      <line x1="4" y1="17" x2="13" y2="17"/>
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>
  );
}
