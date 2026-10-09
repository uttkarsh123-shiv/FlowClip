<div align="center">

# FlowClip

**Your clipboard, finally organized.**

Capture text, links, and screenshots as you browse. Search everything by meaning. See new clips appear on your dashboard the moment you copy them.

<br/>

[![Live App](https://img.shields.io/badge/Live_App-flowclip.duckdns.org-black?style=for-the-badge)](https://flowclip.duckdns.org)
[![Next.js](https://img.shields.io/badge/Next.js_16-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-00e699?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://hub.docker.com/r/utkarsh904/flowclip-web)
[![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)](https://github.com/uttkarsh123-shiv/FlowClip/actions)

</div>

---

## The problem

Your clipboard holds one thing. You copy a link, copy some code, and the link is gone. You spend more time hunting for things you already had than actually using them.

FlowClip keeps everything.

---

## How it works

```
  Chrome Extension
  ─────────────────
  You highlight text, copy a link,        →   Clip is sent to the API silently,
  or take a screenshot on any page.           no interruption to what you're doing.

  FlowClip API
  ─────────────────
  Clip is stored in PostgreSQL.           →   Gemini embedding generated async —
  Session is validated via token.             response is not blocked.

  Dashboard
  ─────────────────
  New clip arrives instantly via SSE.     →   Search by meaning, filter by type,
  No refresh, no polling.                     manage everything in one place.
```

---

## Features

<details>
<summary><strong>Semantic search</strong></summary>
<br/>

Every clip gets a vector embedding via Google Gemini's `text-embedding-004` model. Search queries go through the same pipeline, and results are ranked by cosine similarity — so you can find "that React performance article" without remembering a single word from it.

The search response includes a `meta` object that exposes what's happening under the hood:

```json
{
  "meta": {
    "embeddingLatency": 210,
    "searchLatency": 248,
    "topScore": 0.847,
    "avgScore": 0.623,
    "similarityThreshold": 0.6,
    "aboveThresholdCount": 4,
    "semanticLiftPct": 75,
    "keywordMatchCount": 1,
    "semanticOnlyCount": 3
  }
}
```

`semanticLiftPct: 75` means 75% of the relevant results would have been missed by a keyword search. That's the point.

Embedding generation is fire-and-forget — it happens after the clip is saved, so `POST /api/clips` returns immediately and the embedding is written in the background.

</details>

<details>
<summary><strong>Real-time sync via SSE</strong></summary>
<br/>

The dashboard keeps an open Server-Sent Events connection. The moment the extension saves a clip, the API emits it on a per-user event channel — the dashboard gets it instantly, no polling, no refresh.

A few things worth noting:

- `EventSource` doesn't support custom headers, so the access token is passed as a query param — validated against the DB before the stream opens
- A 30-second keep-alive ping prevents proxies and load balancers from closing idle connections
- `X-Accel-Buffering: no` disables Nginx buffering so events are delivered immediately
- Client disconnect is detected via `request.signal` (AbortSignal) — the event listener and interval are cleaned up properly

</details>

<details>
<summary><strong>Auth that doesn't cut corners</strong></summary>
<br/>

- Access tokens live in memory only (15 min TTL) — never in `localStorage` or `sessionStorage`
- Refresh token is an HTTP-only, `SameSite=strict` cookie on the web app — inaccessible to JS
- Passwords hashed with bcryptjs at cost factor 10 (OWASP minimum)
- Tokens are 32 bytes of `crypto.getRandomValues` — not Math.random, not uuid
- A deduplication guard (`_refreshPromise`) prevents parallel refresh races when multiple components mount simultaneously — only one `/api/auth/refresh` call fires, all callers await the same promise
- The Chrome extension can't access HTTP-only cookies, so it uses a separate `/api/auth/refresh-with-token` route that accepts the refresh token in the request body and stores it in `chrome.storage.local`
- User profile is returned directly in the login response — eliminates a separate `/api/auth/me` round-trip on every login
- Session tokens are cached in-process (LRU, 14 min TTL) — subsequent API calls skip the DB lookup entirely
- Forgot password flow generates a short-lived token (1 hour), logged to server console for manual delivery

</details>

<details>
<summary><strong>Performance</strong></summary>
<br/>

- **In-memory clips cache** — module-level `Map` keyed by userId. Dashboard renders cached clips instantly on navigation within the same session; fresh data revalidates silently in the background. Deliberately not `localStorage` — clipboard data can contain passwords, API keys, and personal notes. Memory is tab-scoped and clears on logout.
- **Stale-while-revalidate** — cache hit renders immediately, background fetch updates state when it resolves
- **Skeleton loading** — 6 animated shimmer cards replace the blank screen while the first clips fetch completes
- **HTTP/2** — enabled on Nginx, allows multiplexed asset delivery (estimated 1.2s saving on LCP)
- **No N+1 queries** — every API route runs a fixed number of queries regardless of result set size. `/api/clips` is always 2 queries: session lookup + items SELECT
- **Lighthouse score: 98 / 89 / 100 / 100** (Performance / Accessibility / Best Practices / SEO) on the dashboard

</details>

<details>
<summary><strong>Cursor-based pagination</strong></summary>
<br/>

Clips are paginated using `created_at` as the cursor rather than `OFFSET`. Offset pagination degrades as the table grows — the DB still has to scan and skip all previous rows. Cursor pagination stays O(log n) regardless of how many clips exist, backed by a compound index on `(user_id, created_at)`.

```
GET /api/clips?cursor=2025-09-24T10:00:00.000Z&pageSize=20
```

The response includes `nextCursor` and `hasMore` so the client can keep loading without ever touching an offset.

</details>

<details>
<summary><strong>Chrome extension (Manifest V3)</strong></summary>
<br/>

Runs as a background service worker. Listens for text selection, copy events, and screenshot triggers from the content script, then saves clips to the API using the stored access token. Token refresh is handled silently — the popup and content script never deal with it directly.

</details>

---

## Stack

| Layer | Technology |
|---|---|
| Web app | Next.js 16, React 19, Tailwind CSS v4 |
| Database | PostgreSQL on [Neon](https://neon.tech) (serverless, ap-southeast-1) |
| ORM | Drizzle ORM |
| Auth | Custom token auth — bcryptjs (cost 10) |
| Semantic search | Google Gemini `text-embedding-004` + cosine similarity |
| Real-time | Server-Sent Events |
| Extension | Chrome Manifest V3 |
| Storage | S3-compatible object storage (Neon) for screenshots |
| Deployment | Docker + Nginx (HTTP/2) + Let's Encrypt on AWS EC2 |
| CI/CD | GitHub Actions → Docker Hub → EC2 (auto-deploy on push to main) |
| Testing | Vitest + Testing Library, Playwright |

---

## CI/CD

Every push to `main` automatically builds and deploys:

```
git push origin main
       ↓
GitHub Actions
       ↓
Build Docker image → Push to Docker Hub (utkarsh904/flowclip-web:latest)
       ↓
SSH into EC2 → docker pull → docker stop → docker run
       ↓
Live in ~5-8 minutes
```

No manual SSH, no manual docker commands. The deploy workflow is at `.github/workflows/deploy.yml`.

---

## Deployment

The app runs in a Docker container on AWS EC2 behind Nginx with a Let's Encrypt SSL certificate and HTTP/2 enabled.

```
Browser → https://flowclip.duckdns.org → Nginx (HTTP/2, port 443) → Docker container (port 3000)
```

**Environment variables** — copy `.env.docker.example` and fill in real values. Never commit secrets.

---

<details>
<summary><strong>API routes</strong></summary>
<br/>

| Method | Route | What it does |
|---|---|---|
| `POST` | `/api/auth/register` | Create account, returns user + tokens |
| `POST` | `/api/auth/login` | Login, returns user + access + refresh tokens |
| `POST` | `/api/auth/logout` | Revoke session |
| `POST` | `/api/auth/refresh` | Refresh via HTTP-only cookie (web) |
| `POST` | `/api/auth/refresh-with-token` | Refresh via body (extension) |
| `GET` | `/api/auth/me` | Current user |
| `POST` | `/api/auth/forgot-password` | Generate reset token, log link to server console |
| `POST` | `/api/auth/reset-password` | Validate token, update password, revoke sessions |
| `POST` | `/api/auth/admin/reset-password` | Admin override — requires `ADMIN_SECRET` header |
| `GET` | `/api/clips` | Cursor-paginated clips |
| `POST` | `/api/clips` | Save a clip |
| `POST` | `/api/clips/search` | Semantic search with meta stats |
| `GET` | `/api/clips/stream` | SSE stream for real-time updates |
| `GET / DELETE` | `/api/clips/[id]` | Single clip operations |

</details>

---

## Database schema

```
users
  id, email, password_hash, name, created_at

sessions
  id, user_id → users, access_token, refresh_token,
  access_token_expires_at, refresh_token_expires_at, created_at

password_reset_tokens
  id, user_id → users, token, expires_at, used_at, created_at

items (clips)
  id, user_id → users, type (text|link|image),
  content, url, image_url, embedding (jsonb), created_at
```

All foreign keys cascade on delete. Indexes on every lookup column.

---

## Status

Core capture, search, and real-time sync are working. The web app is live, the extension is loadable in developer mode, and CI/CD auto-deploys on every push.

Coming next: tags, collections, and a keyboard-first command palette.

---

<div align="center">
  Built by <a href="https://github.com/uttkarsh123-shiv">Uttkarsh Singh</a>
</div>
