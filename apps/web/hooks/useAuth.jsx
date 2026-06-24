"use client";
import { useState, useEffect } from "react";
import { getValidAccessToken, logout } from "@/lib/auth";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function checkAuth() {
    try {
      const accessToken = await getValidAccessToken();
      if (!accessToken) {
        setUser(false);
        setLoading(false);
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_CONVEX_SITE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!res.ok) {
        await logout();
        setUser(false);
        setLoading(false);
        return;
      }

      setUser(await res.json());
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
