import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mock next/server ─────────────────────────────────────────────────────────
// NextResponse is a Next.js server primitive — we simulate it with a minimal
// stand-in that tracks the JSON body and cookies set on the response.

class MockNextResponse {
  constructor(body, init = {}) {
    this._body = body;
    this.status = init.status ?? 200;
    this.cookies = {
      _store: {},
      set(name, value, options = {}) {
        this._store[name] = { value, ...options };
      },
    };
  }
  async json() {
    return this._body;
  }
  static json(body, init) {
    return new MockNextResponse(body, init);
  }
}

vi.mock("next/server", () => ({ NextResponse: MockNextResponse }));

// ── Mock next/headers (used by /refresh) ─────────────────────────────────────
const mockCookieStore = {
  _cookies: {},
  get(name) {
    return this._cookies[name] ? { value: this._cookies[name] } : undefined;
  },
  _set(name, value) {
    this._cookies[name] = value;
  },
  _clear() {
    this._cookies = {};
  },
};

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => Promise.resolve(mockCookieStore)),
}));

// ── Mock global fetch (used by /refresh to call Convex) ──────────────────────
const mockFetch = vi.fn();
global.fetch = mockFetch;

// ── Tests ────────────────────────────────────────────────────────────────────

describe("POST /api/auth/set-cookie", () => {
  beforeEach(() => vi.resetModules());

  it("returns { ok: true } and sets the httpOnly refreshToken cookie", async () => {
    const { POST } = await import("../app/api/auth/set-cookie/route.js");

    const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;
    const req = {
      json: async () => ({ refreshToken: "refresh-abc", refreshTokenExpiresAt: expiresAt }),
    };

    const res = await POST(req);
    const body = await res.json();

    expect(body).toEqual({ ok: true });
    expect(res.cookies._store.refreshToken.value).toBe("refresh-abc");
    expect(res.cookies._store.refreshToken.httpOnly).toBe(true);
    expect(res.cookies._store.refreshToken.path).toBe("/");
    expect(res.cookies._store.refreshToken.sameSite).toBe("strict");
  });

  it("sets the cookie expiry to the provided refreshTokenExpiresAt", async () => {
    const { POST } = await import("../app/api/auth/set-cookie/route.js");

    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
    const req = {
      json: async () => ({ refreshToken: "refresh-xyz", refreshTokenExpiresAt: expiresAt }),
    };

    const res = await POST(req);
    expect(res.cookies._store.refreshToken.expires).toEqual(new Date(expiresAt));
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("POST /api/auth/refresh", () => {
  beforeEach(() => {
    vi.resetModules();
    mockFetch.mockReset();
    mockCookieStore._clear();
  });

  it("returns 401 when no refreshToken cookie is present", async () => {
    const { POST } = await import("../app/api/auth/refresh/route.js");

    const res = await POST();

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("No refresh token");
  });

  it("returns a new accessToken when refresh succeeds", async () => {
    mockCookieStore._set("refreshToken", "valid-refresh-token");
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        accessToken: "new-access-token",
        accessTokenExpiresAt: Date.now() + 15 * 60 * 1000,
      }),
    });

    const { POST } = await import("../app/api/auth/refresh/route.js");
    const res = await POST();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.accessToken).toBe("new-access-token");
  });

  it("forwards the stored refreshToken to Convex", async () => {
    mockCookieStore._set("refreshToken", "my-refresh-token");
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ accessToken: "tok", accessTokenExpiresAt: Date.now() }),
    });

    const { POST } = await import("../app/api/auth/refresh/route.js");
    await POST();

    const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(callBody.refreshToken).toBe("my-refresh-token");
  });

  it("returns 401 and clears the cookie when Convex rejects the refresh token", async () => {
    mockCookieStore._set("refreshToken", "expired-refresh-token");
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Refresh token expired, please login again" }),
    });

    const { POST } = await import("../app/api/auth/refresh/route.js");
    const res = await POST();
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe("Refresh token expired, please login again");
    // Cookie should be expired (cleared)
    expect(res.cookies._store.refreshToken.expires).toEqual(new Date(0));
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("POST /api/auth/clear-cookie", () => {
  beforeEach(() => vi.resetModules());

  it("returns { ok: true }", async () => {
    const { POST } = await import("../app/api/auth/clear-cookie/route.js");

    const res = await POST();
    const body = await res.json();

    expect(body).toEqual({ ok: true });
  });

  it("expires the refreshToken cookie (sets it to epoch 0)", async () => {
    const { POST } = await import("../app/api/auth/clear-cookie/route.js");

    const res = await POST();

    expect(res.cookies._store.refreshToken.value).toBe("");
    expect(res.cookies._store.refreshToken.expires).toEqual(new Date(0));
  });

  it("sets httpOnly and sameSite strict on the cleared cookie", async () => {
    const { POST } = await import("../app/api/auth/clear-cookie/route.js");

    const res = await POST();

    expect(res.cookies._store.refreshToken.httpOnly).toBe(true);
    expect(res.cookies._store.refreshToken.sameSite).toBe("strict");
  });
});
