"use client";

const F = "var(--font-sans), 'Plus Jakarta Sans', sans-serif";

const FEATURES = [
  {
    iconBg: "#fff7e6", title: "One keystroke",
    desc: "Press S twice to capture anything on the page. No menus, no friction, no interruption.",
    svg: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
  },
  {
    iconBg: "#e8f4fd", title: "Instant sync",
    desc: "Your clips appear on every device the moment you save them. Always up to date.",
    svg: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
  },
  {
    iconBg: "#fce8f3", title: "Auto-organized",
    desc: "Text, links, screenshots sorted automatically. Search finds anything in seconds.",
    svg: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
  },
];

export default function LandingFeatures() {
  return (
    <section id="features" style={{ background: "#fff", padding: "120px 64px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h2 style={{ fontSize: 72, fontWeight: 900, color: "#000", marginBottom: 64, letterSpacing: "-2px", fontFamily: F }}>Built for focus</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {FEATURES.map((f) => (
            <div key={f.title} style={{ background: "#fff", borderRadius: 18, padding: "40px 36px", border: "1px solid #ebebeb" }}>
              <div style={{ width: 60, height: 60, background: f.iconBg, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 28 }}>{f.svg}</div>
              <h3 style={{ fontSize: 28, fontWeight: 800, color: "#000", marginBottom: 14, fontFamily: F }}>{f.title}</h3>
              <p style={{ fontSize: 18, color: "#666", lineHeight: 1.65, fontWeight: 500, fontFamily: F }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
