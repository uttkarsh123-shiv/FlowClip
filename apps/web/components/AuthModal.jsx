"use client";
import { useState } from "react";
import { login, register } from "@/lib/auth";

const F = "var(--font-sans), 'Plus Jakarta Sans', sans-serif";

export default function AuthModal({ onClose, mode = "login" }) {
  const [currentMode, setCurrentMode] = useState(mode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (currentMode === "login") {
        await login(email, password);
      } else {
        await register(email, password, name);
      }
      onClose();
    } catch (err) {
      setError(err.message); // was setCurrentMode — bug fixed
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "11px 14px",
    border: "1px solid #e5e5e5",
    borderRadius: 8,
    fontSize: 14,
    color: "#000",
    background: "#f9fafb",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: F,
    marginBottom: 14,
    display: "block",
  };

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 20,
          width: 420,
          padding: "48px 40px",
          boxShadow: "0 8px 40px rgba(0,0,0,0.15)",
          fontFamily: F,
          position: "relative",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{ position: "absolute", top: 16, right: 20, background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#aaa", lineHeight: 1 }}
        >
          ×
        </button>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 32 }}>
          <div style={{ width: 32, height: 32, background: "#10b981", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 15, color: "#fff" }}>F</div>
          <span style={{ fontWeight: 900, fontSize: 16, color: "#000" }}>FlowClip</span>
        </div>

        <h2 style={{ fontSize: 26, fontWeight: 900, color: "#000", marginBottom: 6, letterSpacing: "-0.5px" }}>
          {currentMode === "login" ? "Welcome back" : "Create account"}
        </h2>
        <p style={{ fontSize: 14, color: "#888", marginBottom: 28, fontWeight: 500 }}>
          {currentMode === "login" ? "Sign in to your FlowClip account" : "Start capturing smarter today"}
        </p>

        <form onSubmit={handleSubmit}>
          {currentMode === "register" && (
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#000", marginBottom: 6 }}>Name</label>
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = "#10b981"; e.target.style.background = "#fff"; }}
                onBlur={(e) => { e.target.style.borderColor = "#e5e5e5"; e.target.style.background = "#f9fafb"; }}
              />
            </div>
          )}

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#000", marginBottom: 6 }}>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
              onFocus={(e) => { e.target.style.borderColor = "#10b981"; e.target.style.background = "#fff"; }}
              onBlur={(e) => { e.target.style.borderColor = "#e5e5e5"; e.target.style.background = "#f9fafb"; }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#000", marginBottom: 6 }}>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={inputStyle}
              onFocus={(e) => { e.target.style.borderColor = "#10b981"; e.target.style.background = "#fff"; }}
              onBlur={(e) => { e.target.style.borderColor = "#e5e5e5"; e.target.style.background = "#f9fafb"; }}
            />
          </div>

          {error && (
            <p style={{ fontSize: 13, color: "#dc2626", marginBottom: 16, fontWeight: 600 }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "13px",
              background: loading ? "#6ee7b7" : "#10b981",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 800,
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: F,
              transition: "background 0.2s",
            }}
          >
            {loading ? "Please wait..." : currentMode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>

        <p style={{ marginTop: 20, fontSize: 14, color: "#888", textAlign: "center", fontWeight: 500 }}>
          {currentMode === "login" ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => { setCurrentMode(currentMode === "login" ? "register" : "login"); setError(""); }}
            style={{ background: "none", border: "none", color: "#10b981", cursor: "pointer", fontSize: 14, fontWeight: 800, fontFamily: F }}
          >
            {currentMode === "login" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
