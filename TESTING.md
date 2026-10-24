# FlowClip — Testing Documentation

## Stack
- **Unit & Integration:** Vitest
- **Component:** React Testing Library
- **E2E:** Playwright (Chromium)
- **CI:** GitHub Actions

---

## Unit Tests
**File:** `apps/web/tests/`

### `cache.test.js`
Tests the LRU cache used by the semantic search pipeline.

| Test | What it checks |
|---|---|
| stores and retrieves a value | basic get/set |
| returns undefined for a missing key | cache miss |
| evicts the LRU entry when at max capacity | eviction order |
| expires entries after TTL | time-based expiry |
| invalidatePrefix removes only matching keys | prefix-based invalidation |
| delete removes a specific key | manual deletion |
| normalizeQuery lowercases and collapses whitespace | query normalisation |
| hashQuery returns same hash for same input | determinism |
| hashQuery returns different hashes for different inputs | collision resistance |

**Run:** `npx vitest --run tests/cache.test.js`

---

### `clips-cache.test.js`
Tests the in-memory per-user clips cache (TTL, updates, clear).

| Test | What it checks |
|---|---|
| returns null for a user with no cache entry | empty state |
| stores and retrieves clips for a user | basic set/get |
| returns null and evicts entry after TTL expires | 5-minute TTL |
| updateCachedClips updates clips without resetting TTL | preserves original ts |
| clearClipsCache removes only the specified user | per-user isolation |
| clearAllClipsCache removes all entries | full wipe |

**Run:** `npx vitest --run tests/clips-cache.test.js`

---

### `cosine-similarity.test.js`
Tests the vector similarity function used by semantic search.

| Test | What it checks |
|---|---|
| returns 1 for identical vectors | perfect similarity |
| returns -1 for opposite vectors | perfect dissimilarity |
| returns 0 for orthogonal vectors | no similarity |
| returns 0 when one vector is all zeros | zero vector guard |
| throws when vectors have different lengths | dimension mismatch error |

**Run:** `npx vitest --run tests/cosine-similarity.test.js`

---

### `auth-helpers.test.js`
Tests password hashing, token generation, and input validation.

| Test | What it checks |
|---|---|
| produces a hash that verifies correctly | bcrypt hash/verify roundtrip |
| rejects a wrong password | wrong password returns false |
| returns a 64-char hex string | token format |
| generates unique tokens on each call | token uniqueness |
| accepts valid email | email validation pass |
| rejects email without @ | email validation fail |
| rejects null / undefined | non-string input |
| accepts passwords 8–128 chars | password length bounds |
| rejects passwords shorter than 8 chars | too short |
| rejects passwords over 128 chars | too long |
| access token TTL is 15 minutes | constant correctness |
| refresh token TTL is 30 days | constant correctness |

**Run:** `npx vitest --run tests/auth-helpers.test.js`

---

## Integration Tests
**File:** `apps/web/tests/`

### `clipsApi.test.js`
Tests the three clips API route handlers with mocked Prisma and auth middleware.

**GET /api/clips**
| Test | Expected |
|---|---|
| no token | 401 |
| valid token | 200 with clips array |
| 21 items returned for pageSize 20 | hasMore=true, nextCursor set |

**POST /api/clips**
| Test | Expected |
|---|---|
| no token | 401 |
| valid text clip | 201, id in response |
| invalid type (video) | 400 |
| empty content | 400 |

**DELETE /api/clips/:id**
| Test | Expected |
|---|---|
| no token | 401 |
| clip not found / wrong user | 404 |
| valid delete | 200, ok=true |

**Run:** `npx vitest --run tests/clipsApi.test.js`

---

### `authRoutes.test.js` *(pre-existing)*
Tests `POST /api/auth/refresh` and `POST /api/auth/logout` with mocked DB and cookies.

### `auth.test.js` *(pre-existing)*
Tests in-memory token lifecycle: login, logout, refresh, deduplication.

### `sanitize.test.js` *(pre-existing)*
Tests all sanitize/validate functions in `lib/sanitize.js`.

---

## E2E Tests
**Directory:** `apps/web/e2e/`
**Requires:** `npm run dev` running on `http://localhost:3000`

### `auth.spec.js` *(pre-existing)*
| Test | What it checks |
|---|---|
| Landing page renders | title, Sign in / Sign up buttons |
| Login modal opens | form fields visible |
| Invalid credentials | error message shown |
| Backdrop click closes modal | modal dismissed |
| Switch to register form | Create account heading |
| Login happy path | redirects to /dashboard |
| Already logged-in redirect | / → /dashboard |

### `dashboard.spec.js`
| Test | What it checks |
|---|---|
| Navbar and sidebar visible after login | FlowClip logo, all sidebar buttons |
| Search input accepts typing | fill and value match |
| Clear search input | value resets to empty |
| Sidebar filter switches active type | font-weight 700 on active item |
| Logout returns to landing page | URL back to /, Sign in button visible |

**Run:** `npm run test:e2e`

---

## CI — GitHub Actions
**File:** `.github/workflows/test.yml`

Runs on every push and PR to `main`.

```
push / PR → install deps → vitest --run → pass/fail
```

- Runs all unit and integration tests automatically
- E2E excluded from CI (requires live dev server + DB)
- Status badge visible on every commit in GitHub

---

## Running Everything Locally

```bash
cd apps/web

# All unit + integration tests
npm test

# Specific file
npx vitest --run tests/cache.test.js

# E2E (dev server must be running)
npm run dev        # in a separate terminal
npm run test:e2e
```
