/**
 * In-memory clips cache
 * ─────────────────────
 * Module-level singleton that survives React re-renders and navigation
 * within the same browser session. Cleared on logout.
 *
 * Deliberately NOT using localStorage — clipboard data can contain
 * sensitive content (passwords, API keys, personal notes). localStorage
 * is accessible to any JS on the page (XSS risk). Memory is not persisted
 * and is scoped to the current tab session.
 */

const cache = new Map(); // userId → { clips, nextCursor, hasMore, ts }

const TTL = 5 * 60 * 1000; // 5 minutes

export function getCachedClips(userId) {
  const entry = cache.get(userId);
  if (!entry) return null;
  if (Date.now() - entry.ts > TTL) {
    cache.delete(userId);
    return null;
  }
  return entry;
}

export function setCachedClips(userId, clips, nextCursor, hasMore) {
  cache.set(userId, { clips, nextCursor, hasMore, ts: Date.now() });
}

export function updateCachedClips(userId, clips) {
  const entry = cache.get(userId);
  if (!entry) return;
  cache.set(userId, { ...entry, clips, ts: entry.ts }); // preserve ts — don't reset TTL
}

export function clearClipsCache(userId) {
  if (userId) cache.delete(userId);
}

export function clearAllClipsCache() {
  cache.clear();
}
