"use client";
import { useState } from "react";

const F = "var(--font-sans), 'Plus Jakarta Sans', sans-serif";

const FAQS = [
  { q: "Is FlowClip free?", a: "Yes. Core features are completely free. No credit card required to get started." },
  { q: "Which browsers are supported?", a: "FlowClip works on Chrome and any Chromium-based browser like Edge or Brave." },
  { q: "How do I capture a screenshot?", a: "Press S twice quickly on any page. A confirmation toast will appear — click Save to store it." },
  { q: "How do I save text or links?", a: "Just copy anything on a page. FlowClip detects the copy and saves it automatically in the background." },
  { q: "Where is my data stored?", a: "Your clips are stored securely in the cloud and synced across devices. We never sell or share your data." },
  { q: "Can I access my clips on mobile?", a: "Yes — log in to the web dashboard from any device to view and search all your clips." },
];

export default function LandingFAQ() {
  const [open, setOpen] = useState(null);

  return (
    <section id="faq" style={{ background: "#fff", padding: "120px 64px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "start" }}>
        <div>
          <h2 style={{ fontSize: 72, fontWeight: 900, color: "#000", marginBottom: 20, letterSpacing: "-2px", fontFamily: F }}>FAQ</h2>
          <p style={{ fontSize: 20, color: "#666", fontWeight: 500, lineHeight: 1.6, fontFamily: F }}>Everything you need to know about FlowClip.</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {FAQS.map((item, i) => (
            <div key={item.q}
              onClick={() => setOpen(open === i ? null : i)}
              style={{ padding: "24px 0", borderBottom: i < FAQS.length - 1 ? "1px solid #e5e5e5" : "none", cursor: "pointer" }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.8"; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: "#000", fontFamily: F }}>{item.q}</span>
                <span style={{ fontSize: 22, color: "#aaa", fontWeight: 300, flexShrink: 0, lineHeight: 1, userSelect: "none" }}>{open === i ? "−" : "+"}</span>
              </div>
              {open === i && (
                <p style={{ fontSize: 16, color: "#666", marginTop: 14, lineHeight: 1.65, fontWeight: 500, fontFamily: F }}>{item.a}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
