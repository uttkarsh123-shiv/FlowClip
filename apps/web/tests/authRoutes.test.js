import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mock NextResponse ─────────────────────────────────────────────────────────
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
  async json() { return this._body; }
  static json(body, init) { return new MockNextResponse(body, init); }
}

vi.mock("next/server", () => ({ NextResponse: MockNextResponse }));

// ── Mock next/headers ─────────────────────────────────────────────────────────
const mockCookieStore = {
  _cookies: {},
  get(name) {
    return this._cookies[name] ? { value: this._cookies[name] } : undefined;
  },
  _set(name, value) { this._cookies[name] = value; },
  _clear()          { this._cookies = {}; },
};

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => Promise.resolve(mockCookieStore)),
}));

// ── Mock PostgreSQL ───────────────────────────────────────────────────────────
// /api/auth/refresh and /api/auth/logout now query PostgreSQL directly
// We mock the db module to avoid a real DB connection in tests
vi.mock("@/lib/db", () => {
  const mockSql = vi.fn();
  mockSql.mockResolvedValue([]);
  return { sql: mockSql };
});

// ── Mock auth-helpers ─────────────────────────────────────────────────────────
vi.mock("@/lib/auth-helpers", () => ({
  generateToken:          vi.fn(() => "new-access-token"),
  ACCESS_TOKEN_TTL:       15 * 60 * 1000,
  REFRESH_TOKEN_TTL:      30 * 24 * 60 * 60 * 1000,
  clearRefreshTokenCookie: vi.fn((res) => {
    res.cookies.set("refreshToken", "", { httpOnly: true, sameSite: "strict", expires: new Date(0) });
  }),
  setRefreshTokenCookie:  vi.fn((res, token, expiresAt) => {
    res.cookies.set("refreshToken", token, { httpOnly: true, sameSite: "strict", expires: new Date(expiresAt) });
  }),
}));

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("POST /api/auth/refresh", () => {
  beforeEach(() => {
    vi.resetModules();
    mockCookieStore._clear();
  });

  it("returns 401 when no refreshToken cookie is present", async () => {
    const { POST } = await import("../app/api/auth/refresh/route.js");
    const res = await POST();
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("No refresh token");
  });

  it("returns 401 when refresh token is not found in DB", async () => {
    mockCookieStore._set("refreshToken", "invalid-token");

    const { sql } = await import("@/lib/db");
    sql.mockResolvedValueOnce([]); // session not found

    const { POST } = await import("../app/api/auth/refresh/route.js");
    const res = await POST();
    expect(res.status).toBe(401);
  });

  it("returns new accessToken when session is valid and token is expired", async () => {
    mockCookieStore._set("refreshToken", "valid-refresh-token");

    const { sql } = await import("@/lib/db");
    // Return a session with expired access token
    sql.mockResolvedValueOnce([{
      id: "session-1",
      user_id: "user-1",
      access_token: "old-access-token",
      access_token_expires_at: Date.now() - 1000, // expired
      refresh_token_expires_at: Date.now() + 30 * 24 * 60 * 60 * 1000,
    }]);
    // UPDATE returns nothing meaningful
    sql.mockResolvedValueOnce([]);

    const { POST } = await import("../app/api/auth/refresh/route.js");
    const res = await POST();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.accessToken).toBeDefined();
  });

  it("returns existing accessToken when it is still valid", async () => {
    mockCookieStore._set("refreshToken", "valid-refresh-token");

    const { sql } = await import("@/lib/db");
    const futureExpiry = Date.now() + 15 * 60 * 1000;
    sql.mockResolvedValueOnce([{
      id: "session-1",
      user_id: "user-1",
      access_token: "still-valid-token",
      access_token_expires_at: futureExpiry,
      refresh_token_expires_at: Date.now() + 30 * 24 * 60 * 60 * 1000,
    }]);

    const { POST } = await import("../app/api/auth/refresh/route.js");
    const res = await POST();
    const body = await res.json();
    expect(body.accessToken).toBe("still-valid-token");
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("POST /api/auth/logout", () => {
  beforeEach(() => {
    vi.resetModules();
    mockCookieStore._clear();
  });

  it("returns { ok: true }", async () => {
    const { sql } = await import("@/lib/db");
    sql.mockResolvedValue([]);

    const req = { json: async () => ({}) };
    const { POST } = await import("../app/api/auth/logout/route.js");
    const res = await POST(req);
    const body = await res.json();
    expect(body).toEqual({ ok: true });
  });

  it("clears the refreshToken cookie on logout", async () => {
    mockCookieStore._set("refreshToken", "some-token");

    const { sql } = await import("@/lib/db");
    sql.mockResolvedValue([]);

    const req = { json: async () => ({}) };
    const { POST } = await import("../app/api/auth/logout/route.js");
    const res = await POST(req);

    expect(res.cookies._store.refreshToken.value).toBe("");
    expect(res.cookies._store.refreshToken.expires).toEqual(new Date(0));
  });

  it("sets httpOnly and sameSite strict on the cleared cookie", async () => {
    const { sql } = await import("@/lib/db");
    sql.mockResolvedValue([]);

    const req = { json: async () => ({}) };
    const { POST } = await import("../app/api/auth/logout/route.js");
    const res = await POST(req);

    expect(res.cookies._store.refreshToken.httpOnly).toBe(true);
    expect(res.cookies._store.refreshToken.sameSite).toBe("strict");
  });
});
