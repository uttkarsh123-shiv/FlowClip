import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

// ── External dependency mocks ────────────────────────────────────────────────

// Mock Convex hooks — we're testing UI behaviour, not DB calls
vi.mock("convex/react", () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(() => vi.fn()),
}));

// Mock the generated Convex API object
vi.mock("../../../../convex/_generated/api", () => ({
  api: { items: { getItems: "items:getItems", deleteItem: "items:deleteItem" } },
}));

// Mock useAuth — supply a fake logged-in user
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: { _id: "user-1" } }),
}));

// Mock getValidAccessToken — not needed for component render tests
vi.mock("@/lib/auth", () => ({
  getValidAccessToken: vi.fn().mockResolvedValue("mock-token"),
}));

// ── Helpers ──────────────────────────────────────────────────────────────────

import { useQuery } from "convex/react";
import ItemCard from "../components/dashboard/ItemCard.jsx";

/** Renders ItemCard with sane defaults */
function renderItemCard(props = {}) {
  return render(
    <ItemCard activeType="all" searchQuery="" onCountChange={vi.fn()} {...props} />
  );
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe("ItemCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Loading state ──────────────────────────────────────────────────────────

  it("shows loading indicator while clips are being fetched", () => {
    useQuery.mockReturnValue(undefined); // undefined = still loading in Convex
    renderItemCard();
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  // ── Empty state ────────────────────────────────────────────────────────────

  it("shows empty-state message when user has no clips", () => {
    useQuery.mockReturnValue([]);
    renderItemCard();
    expect(screen.getByText("No clips saved yet")).toBeInTheDocument();
    expect(
      screen.getByText("Copy text or press S twice to capture a screenshot")
    ).toBeInTheDocument();
  });

  // ── Text clip ─────────────────────────────────────────────────────────────

  it("renders a text clip with the correct badge and content", () => {
    useQuery.mockReturnValue([
      { _id: "1", type: "text", content: "Hello world", createdAt: Date.now() },
    ]);
    renderItemCard();
    expect(screen.getByText("Text")).toBeInTheDocument();
    expect(screen.getByText("Hello world")).toBeInTheDocument();
  });

  // ── Link clip ─────────────────────────────────────────────────────────────

  it("renders a link clip as an anchor tag", () => {
    useQuery.mockReturnValue([
      { _id: "2", type: "link", content: "https://example.com", createdAt: Date.now() },
    ]);
    renderItemCard();
    const link = screen.getByRole("link", { name: "https://example.com" });
    expect(link).toHaveAttribute("href", "https://example.com");
    expect(screen.getByText("Link")).toBeInTheDocument();
  });

  // ── Image clip ────────────────────────────────────────────────────────────

  it("renders an image clip with a screenshot thumbnail", () => {
    useQuery.mockReturnValue([
      {
        _id: "3",
        type: "image",
        imageUrl: "https://cdn.convex.cloud/screenshot.png",
        createdAt: Date.now(),
      },
    ]);
    renderItemCard();
    const img = screen.getByRole("img", { name: "Screenshot" });
    expect(img).toHaveAttribute("src", "https://cdn.convex.cloud/screenshot.png");
    expect(screen.getByText("Image")).toBeInTheDocument();
  });

  // ── Type filtering ────────────────────────────────────────────────────────

  it("filters out non-matching clip types when activeType is set", () => {
    useQuery.mockReturnValue([
      { _id: "1", type: "text", content: "Text clip", createdAt: Date.now() },
      { _id: "2", type: "link", content: "https://example.com", createdAt: Date.now() },
    ]);
    renderItemCard({ activeType: "text" });
    expect(screen.getByText("Text clip")).toBeInTheDocument();
    expect(screen.queryByText("https://example.com")).not.toBeInTheDocument();
  });

  // ── "Show more" for long text ─────────────────────────────────────────────

  it("shows 'Show more' button for long text clips", () => {
    const longText = "a".repeat(301);
    useQuery.mockReturnValue([
      { _id: "1", type: "text", content: longText, createdAt: Date.now() },
    ]);
    renderItemCard();
    expect(screen.getByText("Show more ↗")).toBeInTheDocument();
  });

  // ── "Show more" modal ─────────────────────────────────────────────────────

  it("opens the full-content modal when 'Show more' is clicked", () => {
    const longText = "a".repeat(301);
    useQuery.mockReturnValue([
      { _id: "1", type: "text", content: longText, createdAt: Date.now() },
    ]);
    renderItemCard();
    fireEvent.click(screen.getByText("Show more ↗"));
    expect(screen.getByText("Full content")).toBeInTheDocument();
  });

  // ── No-results search state ───────────────────────────────────────────────

  it("shows no-results message when search returns nothing", () => {
    useQuery.mockReturnValue([
      { _id: "1", type: "text", content: "Hello world", createdAt: Date.now() },
    ]);
    renderItemCard({ searchQuery: "xyznotfound" });
    expect(screen.getByText("No results found")).toBeInTheDocument();
  });

  // ── Multiple clips ────────────────────────────────────────────────────────

  it("renders multiple clips", () => {
    useQuery.mockReturnValue([
      { _id: "1", type: "text", content: "First clip", createdAt: Date.now() },
      { _id: "2", type: "text", content: "Second clip", createdAt: Date.now() },
    ]);
    renderItemCard();
    expect(screen.getByText("First clip")).toBeInTheDocument();
    expect(screen.getByText("Second clip")).toBeInTheDocument();
  });
});
