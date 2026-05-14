"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthModal from "@/components/AuthModal";
import { useAuth } from "@/hooks/useAuth";
import HowItWorks from "@/components/HowItWorks";

const F = "var(--font-sans), 'Plus Jakarta Sans', sans-serif";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [navHover, setNavHover] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);
  const [authModal, setAuthModel] = useState(null);

  if (loading) return null;

  if (user) {
    router.replace("/dashboard");
    return null;
  }

  if (!user) {
    return (
      <div style={{ minHeight: "100vh", background: "#fff", fontFamily: F, overflowX: "hidden" }}>

        {/* ── NAV ── */}
        <nav style={{
          padding: "0 64px", height: 76,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "#38d091", position: "sticky", top: 0, zIndex: 50,
          backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.12) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, background: "#000", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 17, color: "#fff", fontFamily: F }}>F</div>
            <span style={{ fontWeight: 900, fontSize: 25, color: "#000", letterSpacing: "-0.3px" }}>FlowClip</span>
          </div>

          {/* Center pill nav */}
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
            <button onClick={() => setAuthModel("login")} style={{ background: "none", border: "1px solid #000", borderRadius: 32, color: "#000", fontWeight: 400, fontSize: 18, lineHeight: "26.44px", cursor: "pointer", padding: "8px 22px", fontFamily: F }}>Sign in</button>
            <button onClick={() => setAuthModel("register")} style={{ background: "#000", border: "none", borderRadius: 32, color: "#fff", fontWeight: 600, fontSize: 18, lineHeight: "26.44px", cursor: "pointer", padding: "8px 22px", fontFamily: F }}>Sign up</button>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section style={{
          background: "#38d091", padding: "100px 4px 0", textAlign: "center",
          backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.12) 1px, transparent 1px)",
          backgroundSize: "24px 24px", overflow: "hidden",
        }}>
          <h1 style={{ fontSize: 120, fontWeight: 900, color: "#fff", lineHeight: 1.05, letterSpacing: "-3px", margin: "0 auto 4px", fontFamily: F }}>
          Capture without friction
          </h1>
          {/* Faded second line */}
          <h2 style={{ fontSize: 120, fontWeight: 900, color: "rgba(255,255,255,0.3)", lineHeight: 1.05, letterSpacing: "-3px", maxWidth: 860, margin: "0 auto 56px", fontFamily: F }}>
            stay in flow
          </h2>

          <div style={{ display: "flex", gap: 16, justifyContent: "center", marginBottom: 72 }}>
            <button onClick={() => setAuthModel("register")} style={{ background: "#fff", border: "none", borderRadius: 12, color: "#38d091", fontWeight: 800, fontSize: 16, cursor: "pointer", padding: "16px 44px", fontFamily: F }}>
              Add to Chrome — Free
            </button>
            <button onClick={() => setAuthModel("login")} style={{ background: "rgba(255,255,255,0.15)", border: "2px solid rgba(255,255,255,0.45)", borderRadius: 12, color: "#fff", fontWeight: 800, fontSize: 16, cursor: "pointer", padding: "16px 44px", fontFamily: F }}>
              See how it works
            </button>
          </div>
        </section>

        {/* Split green/white background with extension UI mockup */}
        <ExtensionPreview F={F} />

        {/* ── FEATURES ── */}
        <section id="features" style={{ background: "#fff", padding: "120px 64px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <h2 style={{ fontSize: 72, fontWeight: 900, color: "#000", marginBottom: 64, letterSpacing: "-2px", fontFamily: F }}>Built for focus</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
              {[
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
              ].map((f) => (
                <div key={f.title} style={{ background: "#fff", borderRadius: 18, padding: "40px 36px", border: "1px solid #ebebeb" }}>
                  <div style={{ width: 60, height: 60, background: f.iconBg, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 28, color: f.iconColor }}>{f.svg}</div>
                  <h3 style={{ fontSize: 28, fontWeight: 800, color: "#000", marginBottom: 14, fontFamily: F }}>{f.title}</h3>
                  <p style={{ fontSize: 18, color: "#666", lineHeight: 1.65, fontWeight: 500, fontFamily: F }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div id="how-it-works"><HowItWorks /></div>

        {/* ── WHY FLOWCLIP — Payard "Expert Consulting" layout ── */}
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

            {/* 2-col accordion + CTA card */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {[
                { title: "No context switching", desc: "Capture without ever leaving the page you're on." },
                { title: "Privacy first", desc: "End-to-end encrypted. Your data is never shared or sold." },
                { title: "Works everywhere", desc: "Any website, any content type, any device." },
              ].map((item, i) => (
                <div key={item.title}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{ background: "#f9fafb", borderRadius: 14, padding: "28px 32px", cursor: "pointer", border: "1px solid #ebebeb", transition: "background 0.15s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#f0f0f0"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "#f9fafb"; }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 20, fontWeight: 700, color: "#000", fontFamily: F }}>{item.title}</span>
                    <span style={{ fontSize: 26, color: "#bbb", fontWeight: 300, lineHeight: 1, userSelect: "none" }}>{openFaq === i ? "−" : "+"}</span>
                  </div>
                  {openFaq === i && (
                    <p style={{ fontSize: 17, color: "#666", marginTop: 16, lineHeight: 1.6, fontWeight: 500, fontFamily: F }}>{item.desc}</p>
                  )}
                </div>
              ))}

              {/* Green CTA tile — Payard "Do You Have Any Questions?" */}
              <div style={{ background: "#d1fae5", borderRadius: 14, padding: "28px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #a7f3d0" }}>
                <div>
                  <p style={{ fontSize: 20, fontWeight: 800, color: "#000", margin: "0 0 6px", fontFamily: F }}>Ready to start?</p>
                  <p style={{ fontSize: 16, color: "#065f46", margin: 0, fontWeight: 500, fontFamily: F }}>Free forever. No credit card.</p>
                </div>
                <button onClick={() => setAuthModel("register")} style={{ background: "#38d091", border: "none", borderRadius: 32, color: "#fff", fontWeight: 800, fontSize: 17, cursor: "pointer", padding: "14px 32px", whiteSpace: "nowrap", fontFamily: F }}>
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section id="faq" style={{ background: "#fff", padding: "120px 64px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "start" }}>
            <div>
              <h2 style={{ fontSize: 72, fontWeight: 900, color: "#000", marginBottom: 20, letterSpacing: "-2px", fontFamily: F }}>FAQ</h2>
              <p style={{ fontSize: 20, color: "#666", fontWeight: 500, lineHeight: 1.6, fontFamily: F }}>Everything you need to know about FlowClip.</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {[
                { q: "Is FlowClip free?", a: "Yes. Core features are completely free. No credit card required to get started." },
                { q: "Which browsers are supported?", a: "FlowClip works on Chrome and any Chromium-based browser like Edge or Brave." },
                { q: "How do I capture a screenshot?", a: "Press S twice quickly on any page. A confirmation toast will appear — click Save to store it." },
                { q: "How do I save text or links?", a: "Just copy anything on a page. FlowClip detects the copy and saves it automatically in the background." },
                { q: "Where is my data stored?", a: "Your clips are stored securely in the cloud and synced across devices. We never sell or share your data." },
                { q: "Can I access my clips on mobile?", a: "Yes — log in to the web dashboard from any device to view and search all your clips." },
              ].map((item, i, arr) => (
                <div
                  key={item.q}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{ padding: "24px 0", borderBottom: i < arr.length - 1 ? "1px solid #e5e5e5" : "none", cursor: "pointer" }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.8"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
                    <span style={{ fontSize: 18, fontWeight: 700, color: "#000", fontFamily: F }}>{item.q}</span>
                    <span style={{ fontSize: 22, color: "#aaa", fontWeight: 300, flexShrink: 0, lineHeight: 1, userSelect: "none" }}>{openFaq === i ? "−" : "+"}</span>
                  </div>
                  {openFaq === i && (
                    <p style={{ fontSize: 16, color: "#666", marginTop: 14, lineHeight: 1.65, fontWeight: 500, fontFamily: F }}>{item.a}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section style={{
          background: "#38d091", padding: "120px 64px", textAlign: "center",
          backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.12) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}>
          <h2 style={{ fontSize: 96, fontWeight: 900, color: "#fff", marginBottom: 20, letterSpacing: "-2px", fontFamily: F }}>Stop losing ideas</h2>
          <p style={{ fontSize: 22, color: "rgba(255,255,255,0.85)", marginBottom: 48, fontWeight: 600, fontFamily: F }}>Free forever. No credit card. Add to Chrome in seconds.</p>
          <button onClick={() => setAuthModel("register")} style={{ background: "#fff", border: "none", borderRadius: 12, color: "#38d091", fontWeight: 800, fontSize: 17, cursor: "pointer", padding: "18px 56px", fontFamily: F }}>
            Get Started Free
          </button>
        </section>

        {/* ── FOOTER ── */}
        <footer style={{
          background: "#38d091",
          backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.12) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          padding: "64px 64px 48px",
          fontFamily: F,
        }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            {/* Top row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 48 }}>
              {/* Logo + tagline */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 32, height: 32, background: "#000", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 15, color: "#fff" }}>F</div>
                  <span style={{ fontWeight: 900, fontSize: 18, color: "#000000ff" }}>FlowClip</span>
                </div>
                <p style={{ fontSize: 15, color: "rgba(255,255,255,0.8)", fontWeight: 500, maxWidth: 280, lineHeight: 1.6 }}>
                  Capture ideas without breaking your flow.
                </p>
              </div>

              {/* Contact */}
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

            {/* Bottom row */}
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.2)", paddingTop: 24, display: "flex", justifyContent: "center", alignItems: "center" }}>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", margin: 0, fontWeight: 500 }}>© 2026 FlowClip. Built as a portfolio project.</p>
            </div>
          </div>
        </footer>

        {authModal && <AuthModal mode={authModal} onClose={() => setAuthModel(null)} />}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "#fff" }}>
      <Navbar
        onMenuClick={() => setSidebarOpen((o) => !o)}
        onLogout={handleLogout}
        user={user}
        searchQuery={searchQuery}
        onSearch={setSearchQuery}
        clipCount={clipCount}
      />
      <div style={{ display: "flex", flex: 1 }}>
        <Sidebar active={activeType} onChange={setActiveType} isOpen={sidebarOpen} />
        <main style={{ flex: 1, background: "#fff" }}>
          <ItemCard activeType={activeType} searchQuery={searchQuery} onCountChange={setClipCount} />
        </main>
      </div>
    </div>
  );
}

// ── Slides: each defines the focused clip + left panel content ─────────────
const SLIDES = [
  {
    label: "Save links instantly",
    heading: "Browsing something useful?",
    desc: "Copy any text or link on the page. It's saved with the source URL automatically.",
    clips: [
      { badge: "LINK", text: "https://producthunt.com/", iconBg: "#ecfdf5", iconColor: "#38d091", time: "just now" },
      { badge: "TEXT", text: "Focus is the new superpower.", iconBg: "#f5f5f5", iconColor: "#000", time: "4 min ago" },
      { badge: "IMG", text: "Screenshot captured", iconBg: "#eff6ff", iconColor: "#3b82f6", time: "9 min ago" },
    ],
    activeIndex: 0,
  },
  {
    label: "Capture text",
    heading: "Found a quote worth keeping?",
    desc: "Copy any text or link on the page. It's saved with the source URL automatically.",
    clips: [
      { badge: "LINK", text: "https://producthunt.com/", iconBg: "#ecfdf5", iconColor: "#38d091", time: "4 min ago" },
      { badge: "TEXT", text: "Focus is the new superpower.", iconBg: "#f5f5f5", iconColor: "#000", time: "just now" },
      { badge: "IMG", text: "Screenshot captured", iconBg: "#eff6ff", iconColor: "#3b82f6", time: "9 min ago" },
    ],
    activeIndex: 1,
  },
  {
    label: "Screenshot anything",
    heading: "See something you need to remember?",
    desc: "Press S twice to capture a screenshot of the page. Stored and synced instantly.",
    clips: [
      { badge: "LINK", text: "https://producthunt.com/", iconBg: "#ecfdf5", iconColor: "#38d091", time: "4 min ago" },
      { badge: "TEXT", text: "Focus is the new superpower.", iconBg: "#f5f5f5", iconColor: "#000", time: "9 min ago" },
      { badge: "IMG", text: "Screenshot captured", iconBg: "#eff6ff", iconColor: "#3b82f6", time: "just now" },
    ],
    activeIndex: 2,
  },
];

function ExtensionPreview({ F }) {
  const [slide, setSlide] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setSlide((s) => (s + 1) % SLIDES.length);
        setFading(false);
      }, 300);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const current = SLIDES[slide];

  return (
    <div style={{ position: "relative", background: "linear-gradient(to bottom, #38d091 50%, #fff 50%)", backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.12) 1px, transparent 1px), linear-gradient(to bottom, #38d091 50%, #fff 50%)", backgroundSize: "24px 24px, 100% 100%" }}>
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 64px" }}>
        <div style={{ background: "#fff", borderRadius: 24, padding: "64px 80px 72px", boxShadow: "0 8px 60px rgba(0,0,0,0.14)", display: "flex", gap: 80, alignItems: "center" }}>

          {/* Left — changes per slide */}
          <div style={{ flex: 1, opacity: fading ? 0 : 1, transition: "opacity 0.3s ease" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#38d091", textTransform: "uppercase", letterSpacing: "2px", marginBottom: 14, fontFamily: F }}>{current.label}</p>
            <h3 style={{ fontSize: 36, fontWeight: 900, color: "#000", letterSpacing: "-0.5px", marginBottom: 14, lineHeight: 1.2, fontFamily: F }}>{current.heading}</h3>
            <p style={{ fontSize: 18, color: "#666", lineHeight: 1.7, fontWeight: 500, fontFamily: F }}>{current.desc}</p>

            {/* Dot indicators */}
            <div style={{ display: "flex", gap: 8, marginTop: 28 }}>
              {SLIDES.map((_, i) => (
                <button key={i} onClick={() => setSlide(i)} style={{
                  width: i === slide ? 24 : 8, height: 8,
                  borderRadius: 4, border: "none", cursor: "pointer",
                  background: i === slide ? "#38d091" : "#e5e5e5",
                  transition: "all 0.3s ease", padding: 0,
                }} />
              ))}
            </div>
          </div>

          {/* Right — extension mockup */}
          <div style={{ width: 420, flexShrink: 0 }}>
            <div style={{ background: "#fff", border: "1px solid #e5e5e5", borderRadius: 20, overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.1)" }}>
            {/* Header */}
            <div style={{ padding: "18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #f0f0f0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, background: "#000", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 900, color: "#fff", fontFamily: F }}>F</div>
                <span style={{ fontSize: 18, fontWeight: 900, color: "#000", fontFamily: F }}>FlowClip</span>
              </div>
              <span style={{ fontSize: 14, color: "#999", background: "#f5f5f5", padding: "5px 12px", borderRadius: 20, fontWeight: 600, fontFamily: F }}>3 clips</span>
            </div>

            {/* Label */}
            <div style={{ padding: "14px 20px 8px", fontSize: 13, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "1px", fontFamily: F }}>Recent Captures</div>

            {/* Clips */}
            <div style={{ padding: "0 12px", display: "flex", flexDirection: "column", gap: 8 }}>
              {current.clips.map((clip, i) => {
                const isActive = i === current.activeIndex;
                return (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: isActive ? "18px 16px" : "14px 16px",
                    background: isActive ? "#f0fdf4" : "#f9fafb",
                    border: `1px solid ${isActive ? "#6ee7b7" : "#f0f0f0"}`,
                    borderRadius: 14,
                    boxShadow: isActive ? "0 4px 16px rgba(16,185,129,0.15)" : "none",
                    transition: "all 0.4s ease",
                    animation: isActive ? "fadeSlideIn 0.4s ease" : "none",
                  }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: clip.iconBg, border: "1px solid #e5e5e5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: clip.iconColor, flexShrink: 0, fontFamily: F, letterSpacing: "0.5px" }}>{clip.badge}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: isActive ? 700 : 600, color: "#000", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontFamily: F }}>{clip.text}</div>
                      <div style={{ fontSize: 13, color: isActive ? "#38d091" : "#aaa", marginTop: 4, fontWeight: isActive ? 600 : 400, fontFamily: F }}>{clip.time}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Dashboard button */}
            <div style={{ padding: "14px 12px" }}>
              <div style={{ background: "#38d091", borderRadius: 10, padding: "13px", textAlign: "center", fontSize: 15, fontWeight: 800, color: "#fff", fontFamily: F }}>Open Dashboard</div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
