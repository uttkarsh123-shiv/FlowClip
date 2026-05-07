"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import ItemCard from "@/components/ItemCard";
import { useAuth } from "@/hooks/useAuth";
import { logout } from "@/lib/auth";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [activeType, setActiveType] = useState("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [clipCount, setClipCount] = useState(0);

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  if (loading) return null;

  if (!user) {
    return (
      <div style={{ minHeight: "100vh", background: "#fff", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", overflowX: "hidden" }}>

        {/* ── NAV ── */}
        <nav style={{ padding: "0 48px", height: 68, display: "flex", alignItems: "center", justifyContent: "space-between", background: "#10b981", position: "sticky", top: 0, zIndex: 50 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, background: "#000", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 16, color: "#fff" }}>F</div>
            <span style={{ fontWeight: 900, fontSize: 18, color: "#fff" }}>FlowClip</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
            <button style={{ background: "none", border: "none", color: "#fff", fontWeight: 600, fontSize: 15, cursor: "pointer" }}>Features</button>
            <button style={{ background: "none", border: "none", color: "#fff", fontWeight: 600, fontSize: 15, cursor: "pointer" }}>How it works</button>
            <button style={{ background: "none", border: "none", color: "#fff", fontWeight: 600, fontSize: 15, cursor: "pointer" }}>Pricing</button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => router.push("/login")} style={{ background: "none", border: "2px solid rgba(255,255,255,0.5)", borderRadius: 24, color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer", padding: "8px 20px" }}>Sign in</button>
            <button onClick={() => router.push("/login")} style={{ background: "#000", border: "none", borderRadius: 24, color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", padding: "8px 20px" }}>Sign up</button>
          </div>
        </nav>

        {/* ── HERO (green bg) ── */}
        <section style={{ background: "#10b981", padding: "80px 48px 0", textAlign: "center" }}>
          <h1 style={{ fontSize: 80, fontWeight: 900, color: "#fff", lineHeight: 1.05, letterSpacing: "-2px", marginBottom: 16 }}>
            Capture without<br />breaking flow
          </h1>
          <p style={{ fontSize: 20, color: "rgba(255,255,255,0.85)", fontWeight: 400, marginBottom: 48, maxWidth: 560, margin: "0 auto 48px" }}>
            Save text, links and screenshots from any page in one keystroke. Everything syncs instantly.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", marginBottom: 64 }}>
            <button onClick={() => router.push("/login")} style={{ background: "#fff", border: "none", borderRadius: 10, color: "#10b981", fontWeight: 700, fontSize: 16, cursor: "pointer", padding: "14px 36px" }}>Add to Chrome — Free</button>
            <button onClick={() => router.push("/login")} style={{ background: "rgba(255,255,255,0.15)", border: "2px solid rgba(255,255,255,0.4)", borderRadius: 10, color: "#fff", fontWeight: 700, fontSize: 16, cursor: "pointer", padding: "14px 36px" }}>See how it works</button>
          </div>

          {/* White card with extension preview placeholder */}
          <div style={{ maxWidth: 1100, margin: "0 auto", background: "#fff", borderRadius: "20px 20px 0 0", padding: "40px 48px 0", boxShadow: "0 -8px 40px rgba(0,0,0,0.1)" }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 24 }}>Extension Preview</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, paddingBottom: 40 }}>
              {/* Text clip */}
              <div style={{ background: "#f9fafb", borderRadius: 14, padding: "28px 32px", border: "1px solid #f0f0f0", textAlign: "left" }}>
                <span style={{ fontSize: 11, fontWeight: 700, background: "#000", color: "#fff", borderRadius: 4, padding: "4px 8px", letterSpacing: "0.5px" }}>TEXT</span>
                <p style={{ fontSize: 15, color: "#000", marginTop: 16, lineHeight: 1.6, fontWeight: 400 }}>
                  "The best productivity tool is the one that gets out of your way."
                </p>
                <p style={{ fontSize: 12, color: "#999", marginTop: 12 }}>medium.com · just now</p>
              </div>
              {/* Link clip */}
              <div style={{ background: "#f9fafb", borderRadius: 14, padding: "28px 32px", border: "1px solid #f0f0f0", textAlign: "left" }}>
                <span style={{ fontSize: 11, fontWeight: 700, background: "#10b981", color: "#fff", borderRadius: 4, padding: "4px 8px", letterSpacing: "0.5px" }}>LINK</span>
                <p style={{ fontSize: 15, color: "#0066cc", marginTop: 16, lineHeight: 1.6, fontWeight: 500, wordBreak: "break-all" }}>
                  https://github.com/trending
                </p>
                <p style={{ fontSize: 12, color: "#999", marginTop: 12 }}>github.com · 2 min ago</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section style={{ background: "#f9fafb", padding: "100px 48px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <h2 style={{ fontSize: 52, fontWeight: 900, color: "#000", marginBottom: 64, letterSpacing: "-1px" }}>Built for focus</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32 }}>
              {[
                { icon: "⚡", title: "One keystroke", desc: "Shift+S captures anything on the page. No menus, no friction, no interruption." },
                { icon: "🔄", title: "Instant sync", desc: "Your clips appear on every device the moment you save them. Always up to date." },
                { icon: "🎯", title: "Auto-organized", desc: "Text, links, screenshots sorted automatically. Search finds anything in seconds." },
              ].map((f) => (
                <div key={f.title} style={{ background: "#fff", borderRadius: 16, padding: "36px 32px", border: "1px solid #f0f0f0" }}>
                  <div style={{ fontSize: 36, marginBottom: 20 }}>{f.icon}</div>
                  <h3 style={{ fontSize: 20, fontWeight: 800, color: "#000", marginBottom: 10 }}>{f.title}</h3>
                  <p style={{ fontSize: 15, color: "#666", lineHeight: 1.6, fontWeight: 400 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section style={{ background: "#fff", padding: "100px 48px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <h2 style={{ fontSize: 52, fontWeight: 900, color: "#000", marginBottom: 64, letterSpacing: "-1px" }}>Three steps</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 48 }}>
              {[
                { n: "01", title: "Install", desc: "Add FlowClip to Chrome. Takes under 10 seconds." },
                { n: "02", title: "Capture", desc: "Press Shift+S on any page to save text, links or screenshots." },
                { n: "03", title: "Access", desc: "Open your dashboard. Everything is there, sorted and searchable." },
              ].map((s) => (
                <div key={s.n} style={{ borderTop: "3px solid #10b981", paddingTop: 28 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#10b981", marginBottom: 12, letterSpacing: "1px" }}>{s.n}</div>
                  <h3 style={{ fontSize: 24, fontWeight: 900, color: "#000", marginBottom: 10 }}>{s.title}</h3>
                  <p style={{ fontSize: 15, color: "#666", lineHeight: 1.6, fontWeight: 400 }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── WHY FLOWCLIP (list style like Payard) ── */}
        <section style={{ background: "#f9fafb", padding: "100px 48px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "start" }}>
            <div>
              <h2 style={{ fontSize: 52, fontWeight: 900, color: "#000", marginBottom: 24, letterSpacing: "-1px" }}>Why FlowClip</h2>
              <p style={{ fontSize: 18, color: "#666", lineHeight: 1.7, fontWeight: 400 }}>
                Most capture tools slow you down. FlowClip is designed around one principle: get out of the way and let you think.
              </p>
            </div>
            <div>
              {[
                { title: "No context switching", desc: "Capture without leaving the page you're on." },
                { title: "Privacy first", desc: "End-to-end encrypted. Your data is never shared." },
                { title: "Works everywhere", desc: "Any website, any content type, any device." },
                { title: "Free forever", desc: "Core features are free. No credit card required." },
              ].map((item, i) => (
                <div key={item.title} style={{ display: "flex", gap: 20, padding: "24px 0", borderBottom: i < 3 ? "1px solid #e5e5e5" : "none" }}>
                  <div style={{ width: 36, height: 36, background: "#ecfdf5", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <div>
                    <p style={{ fontSize: 16, fontWeight: 700, color: "#000", margin: "0 0 4px" }}>{item.title}</p>
                    <p style={{ fontSize: 14, color: "#666", margin: 0, fontWeight: 400 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section style={{ background: "#10b981", padding: "100px 48px", textAlign: "center" }}>
          <h2 style={{ fontSize: 56, fontWeight: 900, color: "#fff", marginBottom: 20, letterSpacing: "-1px" }}>Stop losing ideas</h2>
          <p style={{ fontSize: 20, color: "rgba(255,255,255,0.85)", marginBottom: 48, fontWeight: 400 }}>Free forever. No credit card. Add to Chrome in seconds.</p>
          <button onClick={() => router.push("/login")} style={{ background: "#fff", border: "none", borderRadius: 10, color: "#10b981", fontWeight: 700, fontSize: 16, cursor: "pointer", padding: "16px 48px" }}>
            Get Started Free
          </button>
        </section>

        {/* ── FOOTER ── */}
        <footer style={{ background: "#000", padding: "48px 48px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, background: "#10b981", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 14, color: "#fff" }}>F</div>
            <span style={{ fontWeight: 900, fontSize: 16, color: "#fff" }}>FlowClip</span>
          </div>
          <p style={{ fontSize: 13, color: "#666", margin: 0 }}>© 2024 FlowClip. All rights reserved.</p>
          <div style={{ display: "flex", gap: 24 }}>
            <button onClick={() => router.push("/login")} style={{ background: "none", border: "none", color: "#666", fontSize: 13, cursor: "pointer" }}>Privacy</button>
            <button onClick={() => router.push("/login")} style={{ background: "none", border: "none", color: "#666", fontSize: 13, cursor: "pointer" }}>Terms</button>
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
