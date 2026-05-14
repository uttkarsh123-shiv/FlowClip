"use client";

const F = "var(--font-sans), 'Plus Jakarta Sans', sans-serif";
const DOTS = { backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.12) 1px, transparent 1px)", backgroundSize: "24px 24px" };

export default function LandingCTAFooter({ onRegister }) {
  return (
    <>
      {/* CTA */}
      <section style={{ background: "#38d091", padding: "120px 64px", textAlign: "center", ...DOTS }}>
        <h2 style={{ fontSize: 96, fontWeight: 900, color: "#fff", marginBottom: 20, letterSpacing: "-2px", fontFamily: F }}>Stop losing ideas</h2>
        <p style={{ fontSize: 22, color: "rgba(255,255,255,0.85)", marginBottom: 48, fontWeight: 600, fontFamily: F }}>Free forever. No credit card. Add to Chrome in seconds.</p>
        <button onClick={onRegister} style={{ background: "#fff", border: "none", borderRadius: 12, color: "#38d091", fontWeight: 800, fontSize: 17, cursor: "pointer", padding: "18px 56px", fontFamily: F }}>
          Get Started Free
        </button>
      </section>

      {/* Footer */}
      <footer style={{ background: "#38d091", ...DOTS, padding: "64px 64px 48px", fontFamily: F }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 48 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ width: 32, height: 32, background: "#000", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 15, color: "#fff" }}>F</div>
                <span style={{ fontWeight: 900, fontSize: 18, color: "#000", fontFamily: F }}>FlowClip</span>
              </div>
              <p style={{ fontSize: 15, color: "rgba(255,255,255,0.8)", fontWeight: 500, maxWidth: 280, lineHeight: 1.6 }}>
                Capture ideas without breaking your flow.
              </p>
            </div>

            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 16 }}>Built by</p>
              <a href="mailto:uttkarshsingh450@gmail.com" style={{ display: "flex", alignItems: "center", gap: 8, color: "#fff", textDecoration: "none", fontSize: 15, fontWeight: 600, marginBottom: 12 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                uttkarshsingh450@gmail.com
              </a>
              <a href="https://github.com/uttkarsh123-shiv" target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 8, color: "#fff", textDecoration: "none", fontSize: 15, fontWeight: 600 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                github.com/uttkarsh123-shiv
              </a>
            </div>
          </div>

          <div style={{ borderTop: "1px solid rgba(255,255,255,0.2)", paddingTop: 24, display: "flex", justifyContent: "center" }}>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", margin: 0, fontWeight: 500 }}>© 2026 FlowClip. Built as a portfolio project.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
