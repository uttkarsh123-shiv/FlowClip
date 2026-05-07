"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { login, register } from "@/lib/auth";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/");
  }, [user, loading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      if (mode === "login") await login(email, password);
      else await register(email, password, name);
      router.push("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || user) return null;

  return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      {/* Left — green panel */}
      <div style={{ width: "45%", background: "#10b981", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px", position: "relative", overflow: "hidden" }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, background: "#000", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 16, color: "#fff" }}>F</div>
          <span style={{ fontWeight: 900, fontSize: 18, color: "#fff" }}>FlowClip</span>
        </div>

        {/* Tagline */}
        <div>
          <h2 style={{ fontSize: 48, fontWeight: 900, color: "#fff", lineHeight: 1.1, letterSpacing: "-1px", marginBottom: 20 }}>
            Capture ideas without breaking flow
          </h2>
          <p style={{ fontSize: 17, color: "rgba(255,255,255,0.8)", lineHeight: 1.6, fontWeight: 400 }}>
            One keystroke. Everything saved. Always synced.
          </p>
        </div>

        {/* Decorative clip cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {["Text captured", "Link saved", "Screenshot done"].map((t, i) => (
            <div key={t} style={{ background: "rgba(255,255,255,0.15)", borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />
              <span style={{ fontSize: 14, color: "#fff", fontWeight: 500 }}>{t}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right — form */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "64px", background: "#fff" }}>
        <div style={{ width: "100%", maxWidth: 420 }}>
          <h1 style={{ fontSize: 36, fontWeight: 900, color: "#000", marginBottom: 10, letterSpacing: "-0.5px" }}>
            {mode === "login" ? "Welcome back" : "Create account"}
          </h1>
          <p style={{ fontSize: 16, color: "#666", marginBottom: 40, fontWeight: 400 }}>
            {mode === "login" ? "Sign in to your FlowClip account" : "Start capturing smarter today"}
          </p>

          <form onSubmit={handleSubmit}>
            {mode === "register" && (
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#000", marginBottom: 6 }}>Full name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe"
                  style={{ width: "100%", padding: "11px 14px", border: "1px solid #e5e5e5", borderRadius: 8, fontSize: 14, color: "#000", background: "#fff", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
                  onFocus={(e) => { e.target.style.borderColor = "#10b981"; }}
                  onBlur={(e) => { e.target.style.borderColor = "#e5e5e5"; }} />
              </div>
            )}

            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#000", marginBottom: 6 }}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required
                style={{ width: "100%", padding: "11px 14px", border: "1px solid #e5e5e5", borderRadius: 8, fontSize: 14, color: "#000", background: "#fff", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
                onFocus={(e) => { e.target.style.borderColor = "#10b981"; }}
                onBlur={(e) => { e.target.style.borderColor = "#e5e5e5"; }} />
            </div>

            <div style={{ marginBottom: 28 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#000", marginBottom: 6 }}>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required
                style={{ width: "100%", padding: "11px 14px", border: "1px solid #e5e5e5", borderRadius: 8, fontSize: 14, color: "#000", background: "#fff", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
                onFocus={(e) => { e.target.style.borderColor = "#10b981"; }}
                onBlur={(e) => { e.target.style.borderColor = "#e5e5e5"; }} />
            </div>

            {error && <p style={{ fontSize: 13, color: "#dc2626", marginBottom: 16, fontWeight: 500 }}>{error}</p>}

            <button type="submit" disabled={isLoading}
              style={{ width: "100%", padding: "14px", background: isLoading ? "#ccc" : "#10b981", color: "#fff", border: "none", borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: isLoading ? "not-allowed" : "pointer", transition: "all 0.2s" }}
              onMouseEnter={(e) => { if (!isLoading) e.target.style.background = "#059669"; }}
              onMouseLeave={(e) => { if (!isLoading) e.target.style.background = "#10b981"; }}>
              {isLoading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
            </button>
          </form>

          <p style={{ marginTop: 24, fontSize: 14, color: "#666", textAlign: "center" }}>
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
              style={{ background: "none", border: "none", color: "#10b981", cursor: "pointer", fontSize: 14, fontWeight: 700 }}>
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
