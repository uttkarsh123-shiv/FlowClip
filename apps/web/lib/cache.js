/**
 * LRU Cache
 * ─────────
 * Module-level singleton — persists across requests within the same
 * serverless instance. Uses a Map which preserves insertion order,
 * letting us implement LRU by deleting + re-inserting on access.
 *
 * Three instances used by the search pipeline:
 *
 *   embeddingCache  — query string → float64[] embedding
 *                     TTL: 24h, max: 500 entries
 *
 *   semanticCache   — userId → Array<{ embedding, results, ts }>
 *                     TTL: 10min, max: 100 entries
 *                     Invalidated on clip add/delete
 *
 *   resultCache     — "userId:queryHash" → results[]
 *                     TTL: 2min, max: 200 entries
 *                     Invalidated on clip add/delete
 */

export class LRUCache {
  /**
   * @param {number} maxSize  max entries before evicting LRU
   * @param {number} ttlMs    time-to-live in milliseconds
   */
  constructor(maxSize, ttlMs) {
    this.maxSize = maxSize;
    this.ttlMs   = ttlMs;
    this.map     = new Map(); // key → { value, expiresAt }
  }

  get(key) {
    const entry = this.map.get(key);
    if (!entry) return undefined;

    // TTL check
    if (Date.now() > entry.expiresAt) {
      this.map.delete(key);
      return undefined;
    }

    // LRU: move to end (most recently used)
    this.map.delete(key);
    this.map.set(key, entry);
    return entry.value;
  }

  set(key, value) {
    // Delete first so re-insert moves it to end
    if (this.map.has(key)) this.map.delete(key);

    // Evict LRU (first entry) if at capacity
    if (this.map.size >= this.maxSize) {
      const lruKey = this.map.keys().next().value;
      this.map.delete(lruKey);
    }

    this.map.set(key, { value, expiresAt: Date.now() + this.ttlMs });
  }

  delete(key) {
    this.map.delete(key);
  }

  // Delete all keys matching a prefix — used to invalidate by userId
  invalidatePrefix(prefix) {
    for (const key of this.map.keys()) {
      if (key.startsWith(prefix)) this.map.delete(key);
    }
  }

  get size() {
    return this.map.size;
  }

  // Stats for debugging / benchmark
  stats() {
    return {
      size:    this.map.size,
      maxSize: this.maxSize,
      ttlMs:   this.ttlMs,
    };
  }
}

// ─── Singletons ───────────────────────────────────────────────────────────────

const ONE_MIN  = 60 * 1000;
const ONE_HOUR = 60 * ONE_MIN;

// Layer 1 — embedding cache: normalized query → float64[]
// Long TTL — meaning of a query never changes
export const embeddingCache = new LRUCache(500, 24 * ONE_HOUR);

// Layer 2 — semantic cache: userId → [{ embedding, results, score }]
// Medium TTL — clips can change, keep results fresh
export const semanticCache = new LRUCache(100, 10 * ONE_MIN);

// Layer 3 — result cache: "userId:queryHash" → results[]
// Short TTL — most aggressive freshness requirement
export const resultCache = new LRUCache(200, 2 * ONE_MIN);

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Normalize query: lowercase, collapse whitespace
// "  React Hooks  " → "react hooks"
export function normalizeQuery(query) {
  return query.toLowerCase().replace(/\s+/g, " ").trim();
}

// FNV-1a 32-bit hash — fast, good distribution, no deps
// Used to key the result cache without storing full query strings
export function hashQuery(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (h * 0x01000193) >>> 0;
  }
  return h.toString(16);
}

// Invalidate both semantic and result caches for a user
// Called on POST /clips and DELETE /clips/:id
export function invalidateUserCache(userId) {
  semanticCache.delete(userId);
  resultCache.invalidatePrefix(`${userId}:`);
}
