import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock fetch globally before importing auth module
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Reset module state between tests by re-importing fresh each time
// We test the exported functions directly

describe("auth token logic", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    vi.resetModules();
  });

  it("getAccessToken returns null initially", async () => {
    const { getAccessToken } = await import("../lib/auth.js");
    expect(getAccessToken()).toBeNull();
  });

  it("login sets access token and persists refresh token cookie", async () => {
    const mockTokenData = {
      accessToken: "access-abc",
      refreshToken: "refresh-xyz",
      accessTokenExpiresAt: Date.now() + 15 * 60 * 1000,
      refreshTokenExpiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
    };

    // First fetch: login to Convex site
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTokenData,
    });

    // Second fetch: set-cookie API route
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true }),
    });

    const { login, getAccessToken } = await import("../lib/auth.js");
    const result = await login("user@example.com", "password123");

    expect(result.accessToken).toBe("access-abc");
    expect(getAccessToken()).toBe("access-abc");

    // Verify cookie persistence was called
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch.mock.calls[1][0]).toBe("/api/auth/set-cookie");
  });

  it("login throws on invalid credentials", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Invalid email or password" }),
    });

    const { login } = await import("../lib/auth.js");
    await expect(login("wrong@example.com", "wrongpass")).rejects.toThrow(
      "Invalid email or password"
    );
  });

  it("logout clears access token and calls clear-cookie", async () => {
    const mockTokenData = {
      accessToken: "access-abc",
      refreshToken: "refresh-xyz",
      accessTokenExpiresAt: Date.now() + 15 * 60 * 1000,
      refreshTokenExpiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
    };

    // login
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => mockTokenData });
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true }) });

    const { login, logout, getAccessToken } = await import("../lib/auth.js");
    await login("user@example.com", "password123");
    expect(getAccessToken()).toBe("access-abc");

    // logout: fires logout to Convex + clear-cookie
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) });
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true }) });

    await logout();
    expect(getAccessToken()).toBeNull();
  });

  it("refreshAccessToken updates the in-memory token", async () => {
    const { refreshAccessToken, getAccessToken } = await import("../lib/auth.js");

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        accessToken: "new-access-token",
        accessTokenExpiresAt: Date.now() + 15 * 60 * 1000,
      }),
    });

    const token = await refreshAccessToken();
    expect(token).toBe("new-access-token");
    expect(getAccessToken()).toBe("new-access-token");
  });

  it("refreshAccessToken throws and clears token on failure", async () => {
    const mockTokenData = {
      accessToken: "old-token",
      refreshToken: "refresh-xyz",
      accessTokenExpiresAt: Date.now() + 15 * 60 * 1000,
      refreshTokenExpiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
    };

    // login first
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => mockTokenData });
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true }) });

    const { login, refreshAccessToken, getAccessToken } = await import("../lib/auth.js");
    await login("user@example.com", "password123");

    // refresh fails
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Refresh token expired, please login again" }),
    });

    await expect(refreshAccessToken()).rejects.toThrow("Refresh token expired");
    expect(getAccessToken()).toBeNull();
  });
});
