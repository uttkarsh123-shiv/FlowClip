"use client";
import { useState } from "react";

const F = "var(--font-sans), 'Plus Jakarta Sans', sans-serif";

export default function LandingNav({ onSignIn, onSignUp }) {
  const [navHover, setNavHover] = useState(null);

  return (
    <nav style={{
      padding: "0 64px", height: 76,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      background: "#38d091", position: "sticky", top: 0, zIndex: 50,
      backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.12) 1px, transparent 1px)",
      backgroundSize: "24px 24px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 36, height: 36, background: "#000", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 17, color: "#fff", fontFamily: F }}>F</div>
        <span style={{ fontWeight: 900, fontSize: 25, color: "#000", letterSpacing: "-0.3px", fontFamily: F }}>FlowClip</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", background: "rgba(255,255,255,0.18)", borderRadius: 40, padding: "6px 8px", gap: 4 }}>
        {[
          { label: "Features", id: "features" },
          { label: "How it works", id: "how-it-works" },
          { label: "FAQ", id: "faq" },
        ].map((item, i) => (
          <button key={item.label}
            onClick={() => document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" })}
            onMouseEnter={() => setNavHover(i)}
            onMouseLeave={() => setNavHover(null)}
            style={{
              background: navHover === i ? "rgba(255,255,255,0.25)" : "transparent",
              border: navHover === i ? "1px solid rgba(255,255,255,0.5)" : "1px solid transparent",
              borderRadius: 32, color: "#fff", fontWeight: 700, fontSize: 15,
              cursor: "pointer", padding: "8px 20px", fontFamily: F,
              transition: "all 0.2s ease",
            }}>{item.label}</button>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={onSignIn} style={{ background: "none", border: "1px solid #000", borderRadius: 32, color: "#000", fontWeight: 400, fontSize: 18, lineHeight: "26.44px", cursor: "pointer", padding: "8px 22px", fontFamily: F }}>Sign in</button>
        <button onClick={onSignUp} style={{ background: "#000", border: "none", borderRadius: 32, color: "#fff", fontWeight: 600, fontSize: 18, lineHeight: "26.44px", cursor: "pointer", padding: "8px 22px", fontFamily: F }}>Sign up</button>
      </div>
    </nav>
  );
}
