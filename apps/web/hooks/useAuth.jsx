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
  const cachedUser = getCachedUser();

  // Initialise from localStorage immediately — no loading flicker on repeat visits
  const [user, setUser] = useState(() => cachedUser);
  const [loading, setLoading] = useState(true);

  async function checkAuth() {
    const pageLoadTime = performance.now(); // time since navigation start

    try {
      const accessToken = await getValidAccessToken();
      if (!accessToken) {
        clearCachedUser();
        setUser(false);
        setLoading(false);
        return;
      }

      const authMeStart = performance.now();
      const res = await fetch(`${process.env.NEXT_PUBLIC_CONVEX_SITE_URL}/auth/me`, {
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
      setCachedUser(freshUser); // keep cache in sync
      setUser(freshUser);

      // Log auth performance metrics
      console.log("[useAuth] metrics:", {
        cacheHit: !!cachedUser,
        authMeLatency:  `${authMeLatency}ms`,   // just the /auth/me call
        totalAuthTime:  `${totalLatency}ms`,     // full chain: refresh token + /auth/me
        dashboardBlockedFor: cachedUser
          ? "0ms (cache hit — rendered immediately)"
          : `${totalLatency}ms (no cache — waited for network)`,
      });
    } catch {
      setUser(false);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    checkAuth();
  }, []);

  return { user, loading, refetch: checkAuth };
}
