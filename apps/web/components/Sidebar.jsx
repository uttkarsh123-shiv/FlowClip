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
      width: 240,
      minHeight: "calc(100vh - 80px)",
      background: "#fff",
      borderRight: "1px solid #f0f0f0",
      padding: "24px 16px",
      fontFamily: "var(--font-sans), 'Plus Jakarta Sans', sans-serif",
    }}>
      {NAV_ITEMS.map((item) => {
        const isActive = active === item.type;
        return (
          <button key={item.type} onClick={() => onChange?.(item.type)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "13px 18px",
              background: isActive ? "#ecfdf5" : "transparent",
              border: "none",
              borderRadius: 10,
              cursor: "pointer",
              textAlign: "left",
              color: isActive ? "#059669" : "#666",
              fontWeight: isActive ? 700 : 500,
              fontSize: 15,
              marginBottom: 4,
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => { if (!isActive) { e.target.style.background = "#f5f5f5"; e.target.style.color = "#000"; } }}
            onMouseLeave={(e) => { if (!isActive) { e.target.style.background = "transparent"; e.target.style.color = "#666"; } }}>
            <span style={{ color: isActive ? "#10b981" : "#ccc", flexShrink: 0 }}>{item.icon}</span>
            {item.label}
          </button>
        );
      })}
    </aside>
  );
}

function GridIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>;
}
function TextIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="16" y2="12"/><line x1="4" y1="17" x2="13" y2="17"/></svg>;
}
function LinkIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>;
}
function ImageIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>;
}
