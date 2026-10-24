import { describe, it, expect, vi, afterEach } from "vitest";
import {
  getCachedClips,
  setCachedClips,
  updateCachedClips,
  clearClipsCache,
  clearAllClipsCache,
} from "../lib/clips-cache.js";

afterEach(() => {
  clearAllClipsCache();
  vi.useRealTimers();
});

describe("clips-cache", () => {
  it("returns null for a user with no cache entry", () => {
    expect(getCachedClips("user-1")).toBeNull();
  });

  it("stores and retrieves clips for a user", () => {
    const clips = [{ id: "1", content: "hello" }];
    setCachedClips("user-1", clips, null, false);

    const result = getCachedClips("user-1");
    expect(result.clips).toEqual(clips);
    expect(result.hasMore).toBe(false);
  });

  it("returns null and evicts entry after TTL expires", () => {
    vi.useFakeTimers();
    setCachedClips("user-1", [{ id: "1" }], null, false);

    vi.advanceTimersByTime(5 * 60 * 1000 + 1); // past 5 min TTL

    expect(getCachedClips("user-1")).toBeNull();
  });

  it("updateCachedClips updates clips without resetting TTL", () => {
    vi.useFakeTimers();
    setCachedClips("user-1", [{ id: "1" }], null, false);
    const originalTs = getCachedClips("user-1").ts;

    vi.advanceTimersByTime(1000); // 1s later
    updateCachedClips("user-1", [{ id: "1" }, { id: "2" }]);

    const entry = getCachedClips("user-1");
    expect(entry.clips).toHaveLength(2);
    expect(entry.ts).toBe(originalTs); // ts preserved — TTL not reset
  });

  it("clearClipsCache removes only the specified user", () => {
    setCachedClips("user-1", [{ id: "1" }], null, false);
    setCachedClips("user-2", [{ id: "2" }], null, false);

    clearClipsCache("user-1");

    expect(getCachedClips("user-1")).toBeNull();
    expect(getCachedClips("user-2")).not.toBeNull();
  });

  it("clearAllClipsCache removes all entries", () => {
    setCachedClips("user-1", [], null, false);
    setCachedClips("user-2", [], null, false);

    clearAllClipsCache();

    expect(getCachedClips("user-1")).toBeNull();
    expect(getCachedClips("user-2")).toBeNull();
  });
});
