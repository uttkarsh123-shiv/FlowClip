import { describe, it, expect, vi, beforeEach } from "vitest";
import { LRUCache, normalizeQuery, hashQuery, invalidateUserCache } from "../lib/cache.js";

describe("LRUCache", () => {
  let cache;

  beforeEach(() => {
    cache = new LRUCache(3, 5000); // max 3, 5s TTL
  });

  it("stores and retrieves a value", () => {
    cache.set("a", "hello");
    expect(cache.get("a")).toBe("hello");
  });

  it("returns undefined for a missing key", () => {
    expect(cache.get("nope")).toBeUndefined();
  });

  it("evicts the LRU entry when at max capacity", () => {
    cache.set("a", 1);
    cache.set("b", 2);
    cache.set("c", 3);
    // Access 'a' so 'b' becomes the LRU
    cache.get("a");
    // Adding 'd' should evict 'b' (least recently used)
    cache.set("d", 4);
    expect(cache.get("b")).toBeUndefined();
    expect(cache.get("a")).toBe(1);
    expect(cache.get("d")).toBe(4);
  });

  it("expires entries after TTL", () => {
    vi.useFakeTimers();
    const shortCache = new LRUCache(10, 100); // 100ms TTL
    shortCache.set("x", "value");
    expect(shortCache.get("x")).toBe("value");

    vi.advanceTimersByTime(200); // advance past 100ms TTL
    expect(shortCache.get("x")).toBeUndefined();
    vi.useRealTimers();
  });

  it("invalidatePrefix removes only matching keys", () => {
    cache.set("user1:query1", "r1");
    cache.set("user1:query2", "r2");
    cache.set("user2:query1", "r3");

    cache.invalidatePrefix("user1:");

    expect(cache.get("user1:query1")).toBeUndefined();
    expect(cache.get("user1:query2")).toBeUndefined();
    expect(cache.get("user2:query1")).toBe("r3"); // untouched
  });

  it("delete removes a specific key", () => {
    cache.set("k", "v");
    cache.delete("k");
    expect(cache.get("k")).toBeUndefined();
  });
});

describe("normalizeQuery", () => {
  it("lowercases and collapses whitespace", () => {
    expect(normalizeQuery("  React Hooks  ")).toBe("react hooks");
    expect(normalizeQuery("HELLO   WORLD")).toBe("hello world");
  });
});

describe("hashQuery", () => {
  it("returns same hash for same input", () => {
    expect(hashQuery("react")).toBe(hashQuery("react"));
  });

  it("returns different hashes for different inputs", () => {
    expect(hashQuery("react")).not.toBe(hashQuery("vue"));
  });
});

describe("invalidateUserCache", () => {
  it("clears semantic and result cache entries for a user without throwing", () => {
    expect(() => invalidateUserCache("user-999")).not.toThrow();
  });
});
