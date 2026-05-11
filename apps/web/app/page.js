"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import ItemCard from "@/components/ItemCard";
import { useAuth } from "@/hooks/useAuth";
import { logout } from "@/lib/auth";

const F = "var(--font-nunito), 'Nunito', sans-serif";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [activeType, setActiveType] = useState("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [clipCount, setClipCount] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  if (loading) return null;

  if (!user) {
    return (
      <div style={{ minHeight: "100vh", background: "#fff", fontFamily: F, overflowX: "hidden" }}>

        {/* ── NAV ── */}
        <nav style={{
          padding: "0 64px", height: 76,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "#10b981", position: "sticky", top: 0, zIndex: 50,
          backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.12) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, background: "#000", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 17, color: "#fff", fontFamily: F }}>F</div>
            <span style={{ fontWeight: 900, fontSize: 19, color: "#fff", letterSpacing: "-0.3px" }}>FlowClip</span>
          </div>

          {/* Center pill nav — exactly like Payard */}
          <div style={{ display: "flex", alignItems: "center", background: "rgba(255,255,255,0.18)", borderRadius: 40, padding: "6px 8px", gap: 4 }}>
            {["Features", "How it works", "FAQ"].map((item, i) => (
              <button key={item} style={{
                background: i === 2 ? "#10b981" : "transparent",
                border: i === 2 ? "1px solid rgba(255,255,255,0.5)" : "none",
                borderRadius: 32, color: "#fff", fontWeight: 700, fontSize: 15,
                cursor: "pointer", padding: "8px 20px", fontFamily: F,
              }}>{item}</button>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => router.push("/login")} style={{ background: "none", border: "2px solid rgba(255,255,255,0.5)", borderRadius: 32, color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer", padding: "9px 26px", fontFamily: F }}>Sign in</button>
            <button onClick={() => router.push("/login")} style={{ background: "#000", border: "none", borderRadius: 32, color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer", padding: "9px 26px", fontFamily: F }}>Sign up</button>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section style={{
          background: "#10b981", padding: "100px 64px 0", textAlign: "center",
          backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.12) 1px, transparent 1px)",
          backgroundSize: "24px 24px", overflow: "hidden",
        }}>
          <h1 style={{ fontSize: 88, fontWeight: 900, color: "#fff", lineHeight: 1.05, letterSpacing: "-3px", maxWidth: 860, margin: "0 auto 24px", fontFamily: F }}>
            Capture without<br />breaking flow
          </h1>
          {/* Faded second line — exactly like Payard's "made simple" */}
          <h2 style={{ fontSize: 88, fontWeight: 900, color: "rgba(255,255,255,0.3)", lineHeight: 1.05, letterSpacing: "-3px", maxWidth: 860, margin: "0 auto 56px", fontFamily: F }}>
            stay in flow
          </h2>

          <div style={{ display: "flex", gap: 16, justifyContent: "center", marginBottom: 72 }}>
            <button onClick={() => router.push("/login")} style={{ background: "#fff", border: "none", borderRadius: 12, color: "#10b981", fontWeight: 800, fontSize: 16, cursor: "pointer", padding: "16px 44px", fontFamily: F }}>
              Add to Chrome — Free
            </button>
            <button onClick={() => router.push("/login")} style={{ background: "rgba(255,255,255,0.15)", border: "2px solid rgba(255,255,255,0.45)", borderRadius: 12, color: "#fff", fontWeight: 800, fontSize: 16, cursor: "pointer", padding: "16px 44px", fontFamily: F }}>
              See how it works
            </button>
          </div>

          {/* White card — seamless bleed */}
          <div style={{ maxWidth: 1100, margin: "0 auto", background: "#fff", borderRadius: "20px 20px 0 0", padding: "48px 56px 72px", boxShadow: "0 -8px 48px rgba(0,0,0,0.1)", position: "relative", zIndex: 2 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "2px", marginBottom: 28, textAlign: "left" }}>Extension Preview</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              <div style={{ background: "#f9fafb", borderRadius: 14, padding: "32px 36px", border: "1px solid #f0f0f0", textAlign: "left" }}>
                <span style={{ fontSize: 11, fontWeight: 800, background: "#000", color: "#fff", borderRadius: 5, padding: "4px 10px", letterSpacing: "0.5px", fontFamily: F }}>TEXT</span>
                <p style={{ fontSize: 16, color: "#111", marginTop: 18, lineHeight: 1.65, fontWeight: 500, fontFamily: F }}>
                  "The best productivity tool is the one that gets out of your way."
                </p>
                <p style={{ fontSize: 13, color: "#aaa", marginTop: 14, fontFamily: F }}>medium.com · just now</p>
              </div>
              <div style={{ background: "#f9fafb", borderRadius: 14, padding: "32px 36px", border: "1px solid #f0f0f0", textAlign: "left" }}>
                <span style={{ fontSize: 11, fontWeight: 800, background: "#10b981", color: "#fff", borderRadius: 5, padding: "4px 10px", letterSpacing: "0.5px", fontFamily: F }}>LINK</span>
                <p style={{ fontSize: 16, color: "#0066cc", marginTop: 18, lineHeight: 1.65, fontWeight: 600, wordBreak: "break-all", fontFamily: F }}>
                  https://github.com/trending
                </p>
                <p style={{ fontSize: 13, color: "#aaa", marginTop: 14, fontFamily: F }}>github.com · 2 min ago</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section style={{ background: "#fff", padding: "120px 64px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <h2 style={{ fontSize: 56, fontWeight: 900, color: "#000", marginBottom: 64, letterSpacing: "-2px", fontFamily: F }}>Built for focus</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
              {[
                {
                  iconBg: "#fff7e6", iconColor: "#f59e0b", title: "One keystroke",
                  desc: "Shift+S captures anything on the page. No menus, no friction, no interruption.",
                  svg: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                },
                {
                  iconBg: "#e8f4fd", iconColor: "#3b82f6", title: "Instant sync",
                  desc: "Your clips appear on every device the moment you save them. Always up to date.",
                  svg: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
                },
                {
                  iconBg: "#fce8f3", iconColor: "#ec4899", title: "Auto-organized",
                  desc: "Text, links, screenshots sorted automatically. Search finds anything in seconds.",
                  svg: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                },
              ].map((f) => (
                <div key={f.title} style={{ background: "#fff", borderRadius: 18, padding: "40px 36px", border: "1px solid #ebebeb" }}>
                  <div style={{ width: 60, height: 60, background: f.iconBg, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 28, color: f.iconColor }}>{f.svg}</div>
                  <h3 style={{ fontSize: 20, fontWeight: 800, color: "#000", marginBottom: 12, fontFamily: F }}>{f.title}</h3>
                  <p style={{ fontSize: 15, color: "#666", lineHeight: 1.65, fontWeight: 500, fontFamily: F }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section style={{ background: "#f7f7f7", padding: "120px 64px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <h2 style={{ fontSize: 56, fontWeight: 900, color: "#000", marginBottom: 64, letterSpacing: "-2px", fontFamily: F }}>Three steps</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 56 }}>
              {[
                {
                  n: "01", title: "Install", desc: "Add FlowClip to Chrome. Takes under 10 seconds.",
                  svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                },
                {
                  n: "02", title: "Capture", desc: "Press Shift+S on any page to save text, links or screenshots.",
                  svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                },
                {
                  n: "03", title: "Access", desc: "Open your dashboard. Everything is there, sorted and searchable.",
                  svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
                },
              ].map((s) => (
                <div key={s.n} style={{ borderTop: "3px solid #10b981", paddingTop: 32 }}>
                  <div style={{ width: 44, height: 44, background: "#ecfdf5", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>{s.svg}</div>
                  <h3 style={{ fontSize: 26, fontWeight: 900, color: "#000", marginBottom: 12, fontFamily: F }}>{s.title}</h3>
                  <p style={{ fontSize: 15, color: "#666", lineHeight: 1.65, fontWeight: 500, fontFamily: F }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── WHY FLOWCLIP — Payard "Expert Consulting" layout ── */}
        <section style={{ background: "#fff", padding: "120px 64px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <h2 style={{ fontSize: 56, fontWeight: 900, color: "#000", marginBottom: 36, letterSpacing: "-2px", fontFamily: F }}>Why FlowClip</h2>
            <p style={{ fontSize: 22, color: "#111", lineHeight: 1.65, fontWeight: 500, maxWidth: 820, marginBottom: 20, fontFamily: F }}>
              Most capture tools interrupt your thinking. FlowClip is built around one idea: save it instantly and keep moving.
            </p>
            <p style={{ fontSize: 22, color: "#111", lineHeight: 1.65, fontWeight: 500, maxWidth: 820, marginBottom: 72, fontFamily: F }}>
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
                  style={{ background: "#f7f7f7", borderRadius: 14, padding: "22px 28px", cursor: "pointer", border: "1px solid #ebebeb", transition: "background 0.15s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#efefef"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "#f7f7f7"; }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: "#000", fontFamily: F }}>{item.title}</span>
                    <span style={{ fontSize: 22, color: "#bbb", fontWeight: 300, lineHeight: 1, userSelect: "none" }}>{openFaq === i ? "−" : "+"}</span>
                  </div>
                  {openFaq === i && (
                    <p style={{ fontSize: 14, color: "#666", marginTop: 14, lineHeight: 1.6, fontWeight: 500, fontFamily: F }}>{item.desc}</p>
                  )}
                </div>
              ))}

              {/* Green CTA tile — Payard "Do You Have Any Questions?" */}
              <div style={{ background: "#d1fae5", borderRadius: 14, padding: "22px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #a7f3d0" }}>
                <div>
                  <p style={{ fontSize: 16, fontWeight: 800, color: "#000", margin: "0 0 4px", fontFamily: F }}>Ready to start?</p>
                  <p style={{ fontSize: 14, color: "#065f46", margin: 0, fontWeight: 500, fontFamily: F }}>Free forever. No credit card.</p>
                </div>
                <button onClick={() => router.push("/login")} style={{ background: "#10b981", border: "none", borderRadius: 32, color: "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer", padding: "11px 26px", whiteSpace: "nowrap", fontFamily: F }}>
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section style={{
          background: "#10b981", padding: "120px 64px", textAlign: "center",
          backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.12) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}>
          <h2 style={{ fontSize: 72, fontWeight: 900, color: "#fff", marginBottom: 20, letterSpacing: "-2px", fontFamily: F }}>Stop losing ideas</h2>
          <p style={{ fontSize: 20, color: "rgba(255,255,255,0.85)", marginBottom: 48, fontWeight: 600, fontFamily: F }}>Free forever. No credit card. Add to Chrome in seconds.</p>
          <button onClick={() => router.push("/login")} style={{ background: "#fff", border: "none", borderRadius: 12, color: "#10b981", fontWeight: 800, fontSize: 17, cursor: "pointer", padding: "18px 56px", fontFamily: F }}>
            Get Started Free
          </button>
        </section>

        {/* ── FOOTER ── */}
        <footer style={{ background: "#000", padding: "56px 64px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 30, height: 30, background: "#10b981", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 15, color: "#fff", fontFamily: F }}>F</div>
            <span style={{ fontWeight: 900, fontSize: 17, color: "#fff", fontFamily: F }}>FlowClip</span>
          </div>
          <p style={{ fontSize: 14, color: "#555", margin: 0, fontFamily: F }}>© 2024 FlowClip. All rights reserved.</p>
          <div style={{ display: "flex", gap: 28 }}>
            {["Privacy", "Terms", "FAQ"].map((t) => (
              <button key={t} style={{ background: "none", border: "none", color: "#555", fontSize: 14, cursor: "pointer", fontFamily: F, fontWeight: 600 }}>{t}</button>
            ))}
          </div>
        </footer>
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
