import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks ──────────────────────────────────────────────────────────────────────

class MockNextResponse {
  constructor(body, init = {}) {
    this._body = body;
    this.status = init.status ?? 200;
    this.headers = new Map();
  }
  async json() { return this._body; }
  static json(body, init) { return new MockNextResponse(body, init); }
}
vi.mock("next/server", () => ({ NextResponse: MockNextResponse }));

const mockPrisma = {
  item: {
    findMany:   vi.fn(),
    create:     vi.fn(),
    deleteMany: vi.fn(),
  },
  session: { findFirst: vi.fn() },
};
vi.mock("@/lib/db", () => ({ prisma: mockPrisma }));

// Auth: always returns "user-1" for Bearer valid-token, null otherwise
vi.mock("@/lib/api-middleware", () => ({
  getUserIdFromRequest: vi.fn(async (req) => {
    const h = req.headers.get("Authorization");
    return h === "Bearer valid-token" ? "user-1" : null;
  }),
}));

vi.mock("@/lib/embeddings", () => ({ getEmbedding: vi.fn().mockResolvedValue([]) }));
vi.mock("@/lib/event-bus",  () => ({ emitNewClip: vi.fn() }));
vi.mock("@/lib/cache",      () => ({ invalidateUserCache: vi.fn(), LRUCache: class { get(){} set(){} } }));

// ── Helpers ────────────────────────────────────────────────────────────────────

function makeReq({ method = "GET", headers = {}, body = null, url = "http://localhost/api/clips" } = {}) {
  return {
    method,
    url,
    headers: { get: (k) => ({ Authorization: "Bearer valid-token", "Content-Type": "application/json", ...headers }[k] ?? null) },
    json: async () => body,
  };
}

// ── GET /api/clips ─────────────────────────────────────────────────────────────

describe("GET /api/clips", () => {
  beforeEach(() => { vi.resetModules(); mockPrisma.item.findMany.mockReset(); });

  it("returns 401 with no token", async () => {
    const { GET } = await import("../app/api/clips/route.js");
    const req = makeReq({ headers: { Authorization: null } });
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("returns clips array for valid token", async () => {
    const clips = [
      { id: "1", type: "text", content: "hello", url: null, imageUrl: null, createdAt: new Date() },
    ];
    mockPrisma.item.findMany.mockResolvedValue(clips);

    const { GET } = await import("../app/api/clips/route.js");
    const res = await GET(makeReq());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.clips).toHaveLength(1);
    expect(body.hasMore).toBe(false);
  });

  it("sets hasMore true when more pages exist", async () => {
    // Return 21 items for a pageSize=20 request — signals another page
    const clips = Array.from({ length: 21 }, (_, i) => ({
      id: String(i), type: "text", content: `clip ${i}`, url: null, imageUrl: null, createdAt: new Date(),
    }));
    mockPrisma.item.findMany.mockResolvedValue(clips);

    const { GET } = await import("../app/api/clips/route.js");
    const res = await GET(makeReq());
    const body = await res.json();

    expect(body.hasMore).toBe(true);
    expect(body.clips).toHaveLength(20);
    expect(body.nextCursor).toBeDefined();
  });
});

// ── POST /api/clips ────────────────────────────────────────────────────────────

describe("POST /api/clips", () => {
  beforeEach(() => { vi.resetModules(); mockPrisma.item.create.mockReset(); });

  it("returns 401 with no token", async () => {
    const { POST } = await import("../app/api/clips/route.js");
    const req = makeReq({ headers: { Authorization: null }, body: { type: "text", content: "hi" } });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("creates a text clip and returns 201", async () => {
    const created = { id: "abc", type: "text", content: "hello", url: null, imageUrl: null, createdAt: new Date() };
    mockPrisma.item.create.mockResolvedValue(created);

    const { POST } = await import("../app/api/clips/route.js");
    const res = await POST(makeReq({ body: { type: "text", content: "hello" } }));
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.id).toBe("abc");
  });

  it("returns 400 for invalid type", async () => {
    const { POST } = await import("../app/api/clips/route.js");
    const res = await POST(makeReq({ body: { type: "video", content: "hello" } }));
    expect(res.status).toBe(400);
  });

  it("returns 400 for empty content", async () => {
    const { POST } = await import("../app/api/clips/route.js");
    const res = await POST(makeReq({ body: { type: "text", content: "   " } }));
    expect(res.status).toBe(400);
  });
});

// ── DELETE /api/clips/:id ──────────────────────────────────────────────────────

describe("DELETE /api/clips/:id", () => {
  beforeEach(() => { vi.resetModules(); mockPrisma.item.deleteMany.mockReset(); });

  it("returns 401 with no token", async () => {
    const { DELETE } = await import("../app/api/clips/[id]/route.js");
    const req = makeReq({ headers: { Authorization: null } });
    const res = await DELETE(req, { params: Promise.resolve({ id: "1" }) });
    expect(res.status).toBe(401);
  });

  it("returns 404 when clip not found or belongs to another user", async () => {
    mockPrisma.item.deleteMany.mockResolvedValue({ count: 0 });

    const { DELETE } = await import("../app/api/clips/[id]/route.js");
    const res = await DELETE(makeReq(), { params: Promise.resolve({ id: "ghost-id" }) });
    expect(res.status).toBe(404);
  });

  it("deletes clip and returns ok", async () => {
    mockPrisma.item.deleteMany.mockResolvedValue({ count: 1 });

    const { DELETE } = await import("../app/api/clips/[id]/route.js");
    const res = await DELETE(makeReq(), { params: Promise.resolve({ id: "1" }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
  });
});
