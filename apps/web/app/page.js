"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import ItemCard from "@/components/ItemCard";
import { useAuth } from "@/hooks/useAuth";
import { logout } from "@/lib/auth";
import AuthModal from "@/components/AuthModal";

const F = "var(--font-sans), 'Plus Jakarta Sans', sans-serif";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [activeType, setActiveType] = useState("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [clipCount, setClipCount] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);

  const [authModal, setAuthModel] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.replace("/");
  };

  if (loading) return null;

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

          {/* Center pill nav — exactly like Payard */}
          <div style={{ display: "flex", alignItems: "center", background: "rgba(255,255,255,0.18)", borderRadius: 40, padding: "6px 8px", gap: 4 }}>
            {["Features", "How it works", "FAQ"].map((item, i) => (
              <button key={item} style={{
                background: i === 2 ? "#38d091" : "transparent",
                border: i === 2 ? "1px solid rgba(255,255,255,0.5)" : "none",
                borderRadius: 32, color: "#fff", fontWeight: 700, fontSize: 15,
                cursor: "pointer", padding: "8px 20px", fontFamily: F,
              }}>{item}</button>
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
        <section style={{ background: "#fff", padding: "120px 64px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <h2 style={{ fontSize: 72, fontWeight: 900, color: "#000", marginBottom: 64, letterSpacing: "-2px", fontFamily: F }}>Built for focus</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
              {[
                {
                  iconBg: "#fff7e6", title: "One keystroke",
                  desc: "Shift+S captures anything on the page. No menus, no friction, no interruption.",
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
                  style={{ background: "#f7f7f7", borderRadius: 14, padding: "28px 32px", cursor: "pointer", border: "1px solid #ebebeb", transition: "background 0.15s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#efefef"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "#f7f7f7"; }}>
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
        <footer style={{ background: "#000", padding: "56px 64px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 30, height: 30, background: "#38d091", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 15, color: "#fff", fontFamily: F }}>F</div>
            <span style={{ fontWeight: 900, fontSize: 17, color: "#fff", fontFamily: F }}>FlowClip</span>
          </div>
          <p style={{ fontSize: 15, color: "#555", margin: 0, fontFamily: F }}>© 2026 FlowClip. All rights reserved.</p>
          <div style={{ display: "flex", gap: 32 }}>
            {["Privacy", "Terms", "FAQ"].map((t) => (
              <button key={t} style={{ background: "none", border: "none", color: "#555", fontSize: 15, cursor: "pointer", fontFamily: F, fontWeight: 600 }}>{t}</button>
            ))}
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
    desc: "Press Shift+S and the link is saved. No copy-paste, no tab switching. Just keep reading.",
    clips: [
      { icon: "↗", text: "https://producthunt.com/", iconBg: "#ecfdf5", iconColor: "#38d091", time: "just now" },
      { icon: "T", text: "Focus is the new superpower.", iconBg: "#fff", iconColor: "#000", time: "4 min ago" },
      { icon: "◻", text: "Screenshot captured", iconBg: "#eff6ff", iconColor: "#3b82f6", time: "9 min ago" },
    ],
    activeIndex: 0,
  },
  {
    label: "Capture text",
    heading: "Found a quote worth keeping?",
    desc: "Select any text on any page and press Shift+S. It's saved with the source URL automatically.",
    clips: [
      { icon: "↗", text: "https://producthunt.com/", iconBg: "#ecfdf5", iconColor: "#38d091", time: "4 min ago" },
      { icon: "T", text: "Focus is the new superpower.", iconBg: "#fff", iconColor: "#000", time: "just now" },
      { icon: "◻", text: "Screenshot captured", iconBg: "#eff6ff", iconColor: "#3b82f6", time: "9 min ago" },
    ],
    activeIndex: 1,
  },
  {
    label: "Screenshot anything",
    heading: "See something you need to remember?",
    desc: "Press Shift+S twice to capture a screenshot of the page. Stored and synced instantly.",
    clips: [
      { icon: "↗", text: "https://producthunt.com/", iconBg: "#ecfdf5", iconColor: "#38d091", time: "4 min ago" },
      { icon: "T", text: "Focus is the new superpower.", iconBg: "#fff", iconColor: "#000", time: "9 min ago" },
      { icon: "◻", text: "Screenshot captured", iconBg: "#eff6ff", iconColor: "#3b82f6", time: "just now" },
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
                <div style={{ width: 36, height: 36, background: "#38d091", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 900, color: "#fff", fontFamily: F }}>F</div>
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
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: clip.iconBg, border: "1px solid #e5e5e5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: clip.iconColor, flexShrink: 0, fontFamily: F }}>{clip.icon}</div>
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
