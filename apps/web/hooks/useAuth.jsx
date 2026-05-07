"use client";
import { useState, useEffect } from "react";
import { getAccessToken, getRefreshToken, getValidAccessToken, clearTokens } from "@/lib/auth";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
          // No tokens → user not authenticated
          setUser(false);
          setLoading(false);
          return;
        }

        // Get a valid access token (refreshes if expired)
        const accessToken = await getValidAccessToken();

        // Fetch current user
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

    checkAuth();
  }, []);

  return { user, loading };
}
