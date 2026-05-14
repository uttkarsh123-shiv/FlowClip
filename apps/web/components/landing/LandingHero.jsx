"use client";

const F = "var(--font-sans), 'Plus Jakarta Sans', sans-serif";

export default function LandingHero({ onRegister, onLogin }) {
  return (
    <section style={{
      background: "#38d091", padding: "100px 4px 0", textAlign: "center",
      backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.12) 1px, transparent 1px)",
      backgroundSize: "24px 24px", overflow: "hidden",
    }}>
      <h1 style={{ fontSize: 120, fontWeight: 900, color: "#fff", lineHeight: 1.05, letterSpacing: "-3px", margin: "0 auto 4px", fontFamily: F }}>
        Capture without friction
      </h1>
      <h2 style={{ fontSize: 120, fontWeight: 900, color: "rgba(255,255,255,0.3)", lineHeight: 1.05, letterSpacing: "-3px", maxWidth: 860, margin: "0 auto 56px", fontFamily: F }}>
        stay in flow
      </h2>
      <div style={{ display: "flex", gap: 16, justifyContent: "center", marginBottom: 72 }}>
        <button onClick={onRegister} style={{ background: "#fff", border: "none", borderRadius: 12, color: "#38d091", fontWeight: 800, fontSize: 16, cursor: "pointer", padding: "16px 44px", fontFamily: F }}>
          Add to Chrome — Free
        </button>
        <button onClick={onLogin} style={{ background: "rgba(255,255,255,0.15)", border: "2px solid rgba(255,255,255,0.45)", borderRadius: 12, color: "#fff", fontWeight: 800, fontSize: 16, cursor: "pointer", padding: "16px 44px", fontFamily: F }}>
          See how it works
        </button>
      </div>
    </section>
  );
}
