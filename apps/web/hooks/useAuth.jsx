"use client";
import { useState, useEffect } from "react";
import { getRefreshToken, getValidAccessToken, clearTokens } from "@/lib/auth";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function checkAuth() {
    try {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        setUser(false);
        setLoading(false);
        return;
      }

      const accessToken = await getValidAccessToken();

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_CONVEX_SITE_URL}/auth/me`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (!res.ok) {
        clearTokens();
        setUser(false);
        setLoading(false);
        return;
      }

      const userData = await res.json();
      setUser(userData);
    } catch {
      clearTokens();
      setUser(false);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    checkAuth();

    // Re-check whenever localStorage changes (login/logout from same tab)
    const handleStorage = () => checkAuth();
    window.addEventListener("storage", handleStorage);

    // Also poll every 500ms briefly after mount to catch same-tab login
    const interval = setInterval(() => {
      const token = getRefreshToken();
      if (token && !user) checkAuth();
    }, 500);

    // Stop polling after 5s
    const timeout = setTimeout(() => clearInterval(interval), 5000);

    return () => {
      window.removeEventListener("storage", handleStorage);
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  return { user, loading };
}
