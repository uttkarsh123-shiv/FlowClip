import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("auth token logic", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    vi.resetModules();
  });

  it("getAccessToken returns null initially", async () => {
    const { getAccessToken } = await import("../lib/auth.js");
    expect(getAccessToken()).toBeNull();
  });

  it("login sets access token in memory", async () => {
    const mockTokenData = {
      accessToken: "access-abc",
      refreshToken: "refresh-xyz",
      accessTokenExpiresAt: Date.now() + 15 * 60 * 1000,
      refreshTokenExpiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
    };

    // Single fetch to /api/auth/login — server sets cookie directly
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTokenData,
    });

    const { login, getAccessToken } = await import("../lib/auth.js");
    const result = await login("user@example.com", "password123");

    expect(result.accessToken).toBe("access-abc");
    expect(getAccessToken()).toBe("access-abc");

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch.mock.calls[0][0]).toBe("/api/auth/login");
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

  it("logout clears access token and calls /api/auth/logout", async () => {
    const mockTokenData = {
      accessToken: "access-abc",
      refreshToken: "refresh-xyz",
      accessTokenExpiresAt: Date.now() + 15 * 60 * 1000,
      refreshTokenExpiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
    };

    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => mockTokenData });

    const { login, logout, getAccessToken } = await import("../lib/auth.js");
    await login("user@example.com", "password123");
    expect(getAccessToken()).toBe("access-abc");

    // logout fires one request to /api/auth/logout
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true }) });

    await logout();
    expect(getAccessToken()).toBeNull();
    expect(mockFetch.mock.calls[1][0]).toBe("/api/auth/logout");
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
    expect(mockFetch.mock.calls[0][0]).toBe("/api/auth/refresh");
  });

  it("refreshAccessToken throws and clears token on failure", async () => {
    const mockTokenData = {
      accessToken: "old-token",
      refreshToken: "refresh-xyz",
      accessTokenExpiresAt: Date.now() + 15 * 60 * 1000,
      refreshTokenExpiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
    };

    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => mockTokenData });

    const { login, refreshAccessToken, getAccessToken } = await import("../lib/auth.js");
    await login("user@example.com", "password123");

    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Refresh token expired, please login again" }),
    });

    await expect(refreshAccessToken()).rejects.toThrow("Refresh token expired");
    expect(getAccessToken()).toBeNull();
  });

  it("getValidAccessToken deduplicates concurrent refresh calls", async () => {
    const { getValidAccessToken } = await import("../lib/auth.js");

    // Token is expired (default state — expiresAt = 0)
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        accessToken: "refreshed-token",
        accessTokenExpiresAt: Date.now() + 15 * 60 * 1000,
      }),
    });

    // Fire two concurrent calls
    const [token1, token2] = await Promise.all([
      getValidAccessToken(),
      getValidAccessToken(),
    ]);

    // Both should get the same token
    expect(token1).toBe("refreshed-token");
    expect(token2).toBe("refreshed-token");

    // Only ONE fetch should have fired despite two concurrent calls
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});
