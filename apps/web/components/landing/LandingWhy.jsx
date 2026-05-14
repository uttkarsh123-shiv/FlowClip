"use client";
import { useState } from "react";

const F = "var(--font-sans), 'Plus Jakarta Sans', sans-serif";

const ITEMS = [
  { title: "No context switching", desc: "Capture without ever leaving the page you're on." },
  { title: "Privacy first", desc: "End-to-end encrypted. Your data is never shared or sold." },
  { title: "Works everywhere", desc: "Any website, any content type, any device." },
];

export default function LandingWhy({ onRegister }) {
  const [open, setOpen] = useState(null);

  return (
    <section style={{ background: "#fff", padding: "120px 64px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h2 style={{ fontSize: 72, fontWeight: 900, color: "#000", marginBottom: 36, letterSpacing: "-2px", fontFamily: F }}>Why FlowClip</h2>
        <p style={{ fontSize: 24, color: "#111", lineHeight: 1.65, fontWeight: 500, maxWidth: 820, marginBottom: 20, fontFamily: F }}>
          Most capture tools interrupt your thinking. FlowClip is built around one idea: save it instantly and keep moving.
        </p>
        <p style={{ fontSize: 24, color: "#111", lineHeight: 1.65, fontWeight: 500, maxWidth: 820, marginBottom: 72, fontFamily: F }}>
          No tabs to open, no apps to switch to. Just press a key and{" "}
          <span style={{ color: "#aaa" }}>stay in flow.</span>
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {ITEMS.map((item, i) => (
            <div key={item.title}
              onClick={() => setOpen(open === i ? null : i)}
              style={{ background: "#f9fafb", borderRadius: 14, padding: "28px 32px", cursor: "pointer", border: "1px solid #ebebeb", transition: "background 0.15s" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#f0f0f0"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#f9fafb"; }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 20, fontWeight: 700, color: "#000", fontFamily: F }}>{item.title}</span>
                <span style={{ fontSize: 26, color: "#bbb", fontWeight: 300, lineHeight: 1, userSelect: "none" }}>{open === i ? "−" : "+"}</span>
              </div>
              {open === i && (
                <p style={{ fontSize: 17, color: "#666", marginTop: 16, lineHeight: 1.6, fontWeight: 500, fontFamily: F }}>{item.desc}</p>
              )}
            </div>
          ))}

          <div style={{ background: "#d1fae5", borderRadius: 14, padding: "28px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #a7f3d0" }}>
            <div>
              <p style={{ fontSize: 20, fontWeight: 800, color: "#000", margin: "0 0 6px", fontFamily: F }}>Ready to start?</p>
              <p style={{ fontSize: 16, color: "#065f46", margin: 0, fontWeight: 500, fontFamily: F }}>Free forever. No credit card.</p>
            </div>
            <button onClick={onRegister} style={{ background: "#38d091", border: "none", borderRadius: 32, color: "#fff", fontWeight: 800, fontSize: 17, cursor: "pointer", padding: "14px 32px", whiteSpace: "nowrap", fontFamily: F }}>
              Get Started
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
