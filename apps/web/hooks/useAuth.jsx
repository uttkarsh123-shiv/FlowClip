"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken, getRefreshToken, getValidAccessToken, clearTokens } from "@/lib/auth";

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState(null);       // null = loading, false = not authed
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
          // No tokens at all → redirect to login
          router.replace("/login");
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
          router.replace("/login");
          return;
        }

        const userData = await res.json();
        setUser(userData);
      } catch {
        clearTokens();
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [router]);

  return { user, loading };
}
