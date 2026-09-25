import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// ── Mocks ─────────────────────────────────────────────────────────────────────

// Mock useAuth — supply a fake logged-in user
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: { _id: "user-1" } }),
}));

// Mock getValidAccessToken
vi.mock("@/lib/auth", () => ({
  getValidAccessToken: vi.fn().mockResolvedValue("mock-token"),
}));

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// ── Helpers ───────────────────────────────────────────────────────────────────
import ItemCard from "../components/dashboard/ItemCard.jsx";

function mockClipsResponse(clips = [], extra = {}) {
  mockFetch.mockResolvedValue({
    ok: true,
    json: async () => ({
      clips,
      nextCursor: null,
      hasMore: false,
      ...extra,
    }),
  });
}

function renderItemCard(props = {}) {
  return render(
    <ItemCard activeType="all" searchQuery="" onCountChange={vi.fn()} {...props} />
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("ItemCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Loading state ──────────────────────────────────────────────────────────

  it("shows loading indicator while clips are being fetched", () => {
    // fetch never resolves — stays in loading state
    mockFetch.mockReturnValue(new Promise(() => {}));
    renderItemCard();
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  // ── Empty state ────────────────────────────────────────────────────────────

  it("shows empty-state message when user has no clips", async () => {
    mockClipsResponse([]);
    renderItemCard();
    await waitFor(() =>
      expect(screen.getByText("No clips saved yet")).toBeInTheDocument()
    );
    expect(
      screen.getByText("Copy text or press S twice to capture a screenshot")
    ).toBeInTheDocument();
  });

  // ── Text clip ─────────────────────────────────────────────────────────────

  it("renders a text clip with correct badge and content", async () => {
    mockClipsResponse([
      { id: "1", type: "text", content: "Hello world", created_at: new Date().toISOString() },
    ]);
    renderItemCard();
    await waitFor(() => expect(screen.getByText("Hello world")).toBeInTheDocument());
    expect(screen.getByText("Text")).toBeInTheDocument();
  });

  // ── Link clip ─────────────────────────────────────────────────────────────

  it("renders a link clip as an anchor tag", async () => {
    mockClipsResponse([
      { id: "2", type: "link", content: "https://example.com", created_at: new Date().toISOString() },
    ]);
    renderItemCard();
    await waitFor(() => {
      const link = screen.getByRole("link", { name: "https://example.com" });
      expect(link).toHaveAttribute("href", "https://example.com");
    });
    expect(screen.getByText("Link")).toBeInTheDocument();
  });

  // ── Image clip ────────────────────────────────────────────────────────────

  it("renders an image clip with a screenshot thumbnail", async () => {
    mockClipsResponse([
      {
        id: "3",
        type: "image",
        content: "Screenshot captured",
        image_url: "https://storage.neon.tech/screenshot.png",
        created_at: new Date().toISOString(),
      },
    ]);
    renderItemCard();
    await waitFor(() => {
      const img = screen.getByRole("img", { name: "Screenshot" });
      expect(img).toHaveAttribute("src", "https://storage.neon.tech/screenshot.png");
    });
    expect(screen.getByText("Image")).toBeInTheDocument();
  });

  // ── Type filtering ────────────────────────────────────────────────────────

  it("filters out non-matching clip types when activeType is set", async () => {
    mockClipsResponse([
      { id: "1", type: "text", content: "Text clip", created_at: new Date().toISOString() },
      { id: "2", type: "link", content: "https://example.com", created_at: new Date().toISOString() },
    ]);
    renderItemCard({ activeType: "text" });
    await waitFor(() => expect(screen.getByText("Text clip")).toBeInTheDocument());
    expect(screen.queryByText("https://example.com")).not.toBeInTheDocument();
  });

  // ── Show more ─────────────────────────────────────────────────────────────

  it("shows 'Show more' button for long text clips", async () => {
    mockClipsResponse([
      { id: "1", type: "text", content: "a".repeat(301), created_at: new Date().toISOString() },
    ]);
    renderItemCard();
    await waitFor(() =>
      expect(screen.getByText("Show more ↗")).toBeInTheDocument()
    );
  });

  it("opens the full-content modal when 'Show more' is clicked", async () => {
    mockClipsResponse([
      { id: "1", type: "text", content: "a".repeat(301), created_at: new Date().toISOString() },
    ]);
    renderItemCard();
    await waitFor(() => screen.getByText("Show more ↗"));
    fireEvent.click(screen.getByText("Show more ↗"));
    expect(screen.getByText("Full content")).toBeInTheDocument();
  });

  // ── No-results search ─────────────────────────────────────────────────────

  it("shows no-results message when search returns nothing", async () => {
    mockClipsResponse([
      { id: "1", type: "text", content: "Hello world", created_at: new Date().toISOString() },
    ]);
    renderItemCard({ searchQuery: "xyznotfound" });
    await waitFor(() =>
      expect(screen.getByText("No results found")).toBeInTheDocument()
    );
  });

  // ── Multiple clips ────────────────────────────────────────────────────────

  it("renders multiple clips", async () => {
    mockClipsResponse([
      { id: "1", type: "text", content: "First clip", created_at: new Date().toISOString() },
      { id: "2", type: "text", content: "Second clip", created_at: new Date().toISOString() },
    ]);
    renderItemCard();
    await waitFor(() => expect(screen.getByText("First clip")).toBeInTheDocument());
    expect(screen.getByText("Second clip")).toBeInTheDocument();
  });

  // ── Load more ─────────────────────────────────────────────────────────────

  it("shows load more button when hasMore is true", async () => {
    mockClipsResponse(
      [{ id: "1", type: "text", content: "Clip", created_at: new Date().toISOString() }],
      { hasMore: true, nextCursor: "2024-01-01T00:00:00.000Z" }
    );
    renderItemCard();
    await waitFor(() =>
      expect(screen.getByText("Load more")).toBeInTheDocument()
    );
  });
});
