"use client";
import { useState, useEffect } from "react";
import { getValidAccessToken, logout } from "@/lib/auth";

const USER_CACHE_KEY = "flowclip_user";

function getCachedUser() {
  try {
    const raw = localStorage.getItem(USER_CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function setCachedUser(user) {
  try {
    localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
  } catch {}
}

function clearCachedUser() {
  try {
    localStorage.removeItem(USER_CACHE_KEY);
  } catch {}
}

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function checkAuth() {
    const pageLoadTime = performance.now();

    try {
      const accessToken = await getValidAccessToken();
      if (!accessToken) {
        clearCachedUser();
        setUser(false);
        setLoading(false);
        return;
      }

      // If we have a cached user AND a valid (non-expired) access token,
      // skip the /api/auth/me round-trip — the token itself is proof of auth
      const cached = getCachedUser();
      if (cached) {
        setUser(cached);
        setLoading(false);
        console.log("[useAuth] metrics:", {
          cacheHit: true,
          dashboardBlockedFor: "0ms (token valid + cache hit — skipped /api/auth/me)",
        });
        return;
      }

      // No cached user — need to fetch from DB (first login or cache cleared)
      const authMeStart = performance.now();
      const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const authMeLatency = Math.round(performance.now() - authMeStart);
      const totalLatency  = Math.round(performance.now() - pageLoadTime);

      if (!res.ok) {
        clearCachedUser();
        await logout();
        setUser(false);
        setLoading(false);
        return;
      }

      const freshUser = await res.json();
      setCachedUser(freshUser);
      setUser(freshUser);

      console.log("[useAuth] metrics:", {
        cacheHit: false,
        authMeLatency:  `${authMeLatency}ms`,
        totalAuthTime:  `${totalLatency}ms`,
        dashboardBlockedFor: `${totalLatency}ms`,
      });
    } catch {
      setUser(false);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Read localStorage only on client after mount — avoids SSR/hydration mismatch
    const cached = getCachedUser();
    if (cached) {
      setUser(cached);
      console.log("[useAuth] metrics:", {
        cacheHit: true,
        dashboardBlockedFor: "0ms (cache hit — rendered immediately)",
      });
    }
    checkAuth();
  }, []);

  return { user, loading, refetch: checkAuth };
}
