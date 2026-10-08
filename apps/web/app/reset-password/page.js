"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPassword } from "@/lib/auth";

const F = "var(--font-sans), 'Plus Jakarta Sans', sans-serif";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setError("No reset token found. Please request a new reset link.");
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setStatus("loading");
    try {
      await resetPassword(token, password);
      setStatus("success");
    } catch (err) {
      setStatus("idle");
      setError(err.message || "Something went wrong. Please try again.");
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
    display: "block",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F, padding: "24px 16px" }}>
      <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 420, padding: "48px 40px", boxShadow: "0 8px 40px rgba(0,0,0,0.10)" }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 32 }}>
          <div style={{ width: 32, height: 32, background: "#000", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 15, color: "#fff" }}>F</div>
          <span style={{ fontWeight: 900, fontSize: 16, color: "#000" }}>FlowClip</span>
        </div>

        {status === "success" ? (
          <>
            <div style={{ fontSize: 40, marginBottom: 16 }}>✅</div>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: "#000", marginBottom: 8, letterSpacing: "-0.5px" }}>Password updated</h2>
            <p style={{ fontSize: 14, color: "#888", marginBottom: 28, fontWeight: 500 }}>
              Your password has been reset. All previous sessions have been signed out.
            </p>
            <button
              onClick={() => router.push("/")}
              style={{ width: "100%", padding: "13px", background: "#38d091", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: F }}
            >
              Sign in
            </button>
          </>
        ) : (
          <>
            <h2 style={{ fontSize: 26, fontWeight: 900, color: "#000", marginBottom: 6, letterSpacing: "-0.5px" }}>Set new password</h2>
            <p style={{ fontSize: 14, color: "#888", marginBottom: 28, fontWeight: 500 }}>
              Choose a strong password for your FlowClip account.
            </p>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#000", marginBottom: 6 }}>New password</label>
                <input
                  type="password"
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={status === "loading" || status === "error"}
                  style={inputStyle}
                  onFocus={(e) => { e.target.style.borderColor = "#38d091"; e.target.style.background = "#fff"; }}
                  onBlur={(e) => { e.target.style.borderColor = "#e5e5e5"; e.target.style.background = "#f9fafb"; }}
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#000", marginBottom: 6 }}>Confirm password</label>
                <input
                  type="password"
                  placeholder="Repeat your password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  disabled={status === "loading" || status === "error"}
                  style={inputStyle}
                  onFocus={(e) => { e.target.style.borderColor = "#38d091"; e.target.style.background = "#fff"; }}
                  onBlur={(e) => { e.target.style.borderColor = "#e5e5e5"; e.target.style.background = "#f9fafb"; }}
                />
              </div>

              {error && (
                <p style={{ fontSize: 13, color: "#dc2626", marginBottom: 16, fontWeight: 600 }}>{error}</p>
              )}

              <button
                type="submit"
                disabled={status === "loading" || status === "error"}
                style={{
                  width: "100%",
                  padding: "13px",
                  background: (status === "loading" || status === "error") ? "#6ee7b7" : "#38d091",
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  fontSize: 15,
                  fontWeight: 800,
                  cursor: (status === "loading" || status === "error") ? "not-allowed" : "pointer",
                  fontFamily: F,
                  transition: "background 0.2s",
                }}
              >
                {status === "loading" ? "Updating..." : "Update password"}
              </button>
            </form>

            <p style={{ marginTop: 20, fontSize: 14, color: "#888", textAlign: "center", fontWeight: 500 }}>
              <button
                onClick={() => router.push("/")}
                style={{ background: "none", border: "none", color: "#38d091", cursor: "pointer", fontSize: 14, fontWeight: 800, fontFamily: F }}
              >
                Back to sign in
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif", color: "#888" }}>Loading…</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
