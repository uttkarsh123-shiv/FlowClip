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
      <div style={{ minHeight: "100vh", background: "#1a1a1a", display: "flex", flexDirection: "column", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
        {/* Header */}
        <header style={{ padding: "20px 48px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #2a2a2a" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "32px", height: "32px", background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: 700, color: "#fff" }}>L</div>
            <h1 style={{ fontSize: "18px", fontWeight: 700, color: "#fff" }}>FlowClip</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button onClick={() => router.push("/login")} style={{ background: "transparent", border: "none", color: "#888", cursor: "pointer", fontSize: "14px", fontWeight: 500, transition: "all 0.2s" }} onMouseEnter={(e) => { e.target.style.color = "#fff"; }} onMouseLeave={(e) => { e.target.style.color = "#888"; }}>Sign In</button>
            <button onClick={() => router.push("/login")} style={{ background: "transparent", border: "none", color: "#888", cursor: "pointer", fontSize: "14px", fontWeight: 500, transition: "all 0.2s" }} onMouseEnter={(e) => { e.target.style.color = "#fff"; }} onMouseLeave={(e) => { e.target.style.color = "#888"; }}>Sign Up</button>
            <button onClick={() => router.push("/login")} style={{ background: "#6366f1", border: "none", borderRadius: "8px", color: "#fff", cursor: "pointer", fontSize: "14px", fontWeight: 600, padding: "10px 20px", transition: "all 0.2s", boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)" }} onMouseEnter={(e) => { e.target.style.background = "#4f46e5"; e.target.style.boxShadow = "0 6px 16px rgba(99, 102, 241, 0.4)"; }} onMouseLeave={(e) => { e.target.style.background = "#6366f1"; e.target.style.boxShadow = "0 4px 12px rgba(99, 102, 241, 0.3)"; }}>Download Extension</button>
          </div>
        </header>

        {/* Main Content */}
        <main style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "100px 48px" }}>
          {/* Hero */}
          <div style={{ textAlign: "center", marginBottom: "140px", maxWidth: "900px" }}>
            <h2 style={{ fontSize: "64px", fontWeight: 700, color: "#fff", marginBottom: "32px", lineHeight: 1.2, letterSpacing: "-1px" }}>
              Capture ideas without breaking your flow
            </h2>
            <p style={{ fontSize: "16px", color: "#999", lineHeight: 1.8, marginBottom: "56px" }}>
              Save links, text, and screenshots instantly while browsing. Everything syncs in real time.
            </p>
            <button onClick={() => router.push("/login")} style={{ background: "#6366f1", border: "none", borderRadius: "12px", color: "#fff", cursor: "pointer", fontSize: "15px", fontWeight: 600, padding: "14px 36px", transition: "all 0.2s", boxShadow: "0 4px 16px rgba(99, 102, 241, 0.3)" }} onMouseEnter={(e) => { e.target.style.background = "#4f46e5"; e.target.style.boxShadow = "0 6px 20px rgba(99, 102, 241, 0.4)"; e.target.style.transform = "translateY(-2px)"; }} onMouseLeave={(e) => { e.target.style.background = "#6366f1"; e.target.style.boxShadow = "0 4px 16px rgba(99, 102, 241, 0.3)"; e.target.style.transform = "translateY(0)"; }}>
              Add to Chrome — It's Free
            </button>
          </div>

          {/* Feature section */}
          <div style={{ width: "100%", maxWidth: "1100px", marginBottom: "160px", textAlign: "center" }}>
            <h3 style={{ fontSize: "40px", fontWeight: 700, color: "#fff", marginBottom: "16px", letterSpacing: "-0.5px" }}>
              Everything organized, automatically
            </h3>
            <p style={{ fontSize: "16px", color: "#888", marginBottom: "80px" }}>
              Color-coded the moment you save
            </p>

            {/* Feature cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
              {/* Text card */}
              <div style={{ padding: "56px 40px", background: "#c7ccfc", borderRadius: "16px", textAlign: "center", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)", transition: "all 0.3s", cursor: "pointer" }} onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 16px rgba(0, 0, 0, 0.15)"; }} onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.1)"; }}>
                <div style={{ fontSize: "44px", marginBottom: "20px", fontWeight: 600, color: "#1E1F1E" }}>T</div>
                <h4 style={{ fontSize: "16px", fontWeight: 700, color: "#1E1F1E", marginBottom: "10px" }}>Text</h4>
                <p style={{ fontSize: "13px", color: "#1E1F1E", lineHeight: 1.6, opacity: 0.8 }}>Quotes, notes, and ideas</p>
              </div>

              {/* Link card */}
              <div style={{ padding: "56px 40px", background: "#e6fab8", borderRadius: "16px", textAlign: "center", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)", transition: "all 0.3s", cursor: "pointer" }} onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 16px rgba(0, 0, 0, 0.15)"; }} onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.1)"; }}>
                <div style={{ fontSize: "44px", marginBottom: "20px", fontWeight: 600, color: "#1E1F1E" }}>↗</div>
                <h4 style={{ fontSize: "16px", fontWeight: 700, color: "#1E1F1E", marginBottom: "10px" }}>Links</h4>
                <p style={{ fontSize: "13px", color: "#1E1F1E", lineHeight: 1.6, opacity: 0.8 }}>URLs and bookmarks</p>
              </div>

              {/* Image card */}
              <div style={{ padding: "56px 40px", background: "#efc7ff", borderRadius: "16px", textAlign: "center", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)", transition: "all 0.3s", cursor: "pointer" }} onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 16px rgba(0, 0, 0, 0.15)"; }} onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.1)"; }}>
                <div style={{ fontSize: "44px", marginBottom: "20px", fontWeight: 600, color: "#1E1F1E" }}>◻</div>
                <h4 style={{ fontSize: "16px", fontWeight: 700, color: "#1E1F1E", marginBottom: "10px" }}>Screenshots</h4>
                <p style={{ fontSize: "13px", color: "#1E1F1E", lineHeight: 1.6, opacity: 0.8 }}>Shift+S twice to capture</p>
              </div>
            </div>
          </div>

          {/* How it works */}
          <div style={{ width: "100%", maxWidth: "1100px", marginBottom: "160px", textAlign: "center" }}>
            <h3 style={{ fontSize: "40px", fontWeight: 700, color: "#fff", marginBottom: "100px", letterSpacing: "-0.5px" }}>
              How it works
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "80px", alignItems: "center" }}>
              {/* Step 1 */}
              <div style={{ textAlign: "center" }}>
                <div style={{ width: "100px", height: "100px", background: "#2a2a2a", border: "2px solid #333", borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "44px", margin: "0 auto 28px", fontWeight: 600, color: "#6366f1" }}>1</div>
                <h4 style={{ fontSize: "18px", fontWeight: 700, color: "#fff", marginBottom: "12px" }}>Install</h4>
                <p style={{ fontSize: "14px", color: "#888", lineHeight: 1.6 }}>Add FlowClip to your browser</p>
              </div>

              {/* Arrow */}
              <div style={{ textAlign: "center", fontSize: "28px", color: "#555" }}>→</div>

              {/* Step 2 */}
              <div style={{ textAlign: "center" }}>
                <div style={{ width: "100px", height: "100px", background: "#2a2a2a", border: "2px solid #333", borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "44px", margin: "0 auto 28px", fontWeight: 600, color: "#6366f1" }}>2</div>
                <h4 style={{ fontSize: "18px", fontWeight: 700, color: "#fff", marginBottom: "12px" }}>Capture</h4>
                <p style={{ fontSize: "14px", color: "#888", lineHeight: 1.6 }}>Copy, paste, or screenshot</p>
              </div>

              {/* Arrow */}
              <div style={{ textAlign: "center", fontSize: "28px", color: "#555" }}>→</div>

              {/* Step 3 */}
              <div style={{ textAlign: "center" }}>
                <div style={{ width: "100px", height: "100px", background: "#2a2a2a", border: "2px solid #333", borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "44px", margin: "0 auto 28px", fontWeight: 600, color: "#6366f1" }}>3</div>
                <h4 style={{ fontSize: "18px", fontWeight: 700, color: "#fff", marginBottom: "12px" }}>Access</h4>
                <p style={{ fontSize: "14px", color: "#888", lineHeight: 1.6 }}>Everything syncs instantly</p>
              </div>
            </div>
          </div>

          {/* Benefits section */}
          <div style={{ width: "100%", maxWidth: "1100px", marginBottom: "160px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
              <div style={{ padding: "40px 32px", background: "#2a2a2a", borderRadius: "16px", border: "1px solid #333", textAlign: "center" }}>
                <div style={{ fontSize: "32px", marginBottom: "16px", fontWeight: 600, color: "#6366f1" }}>⚡</div>
                <h4 style={{ fontSize: "15px", fontWeight: 700, color: "#fff", marginBottom: "10px" }}>Lightning Fast</h4>
                <p style={{ fontSize: "13px", color: "#888", lineHeight: 1.6 }}>Capture and sync instantly. Zero lag.</p>
              </div>
              <div style={{ padding: "40px 32px", background: "#2a2a2a", borderRadius: "16px", border: "1px solid #333", textAlign: "center" }}>
                <div style={{ fontSize: "32px", marginBottom: "16px", fontWeight: 600, color: "#6366f1" }}>🔒</div>
                <h4 style={{ fontSize: "15px", fontWeight: 700, color: "#fff", marginBottom: "10px" }}>Privacy First</h4>
                <p style={{ fontSize: "13px", color: "#888", lineHeight: 1.6 }}>Your data stays yours. No tracking.</p>
              </div>
              <div style={{ padding: "40px 32px", background: "#2a2a2a", borderRadius: "16px", border: "1px solid #333", textAlign: "center" }}>
                <div style={{ fontSize: "32px", marginBottom: "16px", fontWeight: 600, color: "#6366f1" }}>✨</div>
                <h4 style={{ fontSize: "15px", fontWeight: 700, color: "#fff", marginBottom: "10px" }}>Always Synced</h4>
                <p style={{ fontSize: "13px", color: "#888", lineHeight: 1.6 }}>Real-time sync across devices.</p>
              </div>
            </div>
          </div>

          {/* Final CTA */}
          <button onClick={() => router.push("/login")} style={{ background: "#6366f1", border: "none", borderRadius: "12px", color: "#fff", cursor: "pointer", fontSize: "15px", fontWeight: 600, padding: "14px 36px", transition: "all 0.2s", boxShadow: "0 4px 16px rgba(99, 102, 241, 0.3)" }} onMouseEnter={(e) => { e.target.style.background = "#4f46e5"; e.target.style.boxShadow = "0 6px 20px rgba(99, 102, 241, 0.4)"; e.target.style.transform = "translateY(-2px)"; }} onMouseLeave={(e) => { e.target.style.background = "#6366f1"; e.target.style.boxShadow = "0 4px 16px rgba(99, 102, 241, 0.3)"; e.target.style.transform = "translateY(0)"; }}>
            Add to Chrome — It's Free
          </button>
        </main>

        {/* Footer */}
        <footer style={{ padding: "40px 48px", textAlign: "center", color: "#666", fontSize: "12px", borderTop: "1px solid #2a2a2a" }}>
          <p>FlowClip • Capture at the moment of discovery</p>
        </footer>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "#1f1f1f" }}>
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
        <main style={{ flex: 1, background: "#1f1f1f" }}>
          <ItemCard activeType={activeType} searchQuery={searchQuery} onCountChange={setClipCount} />
        </main>
      </div>
    </div>
  );
}
