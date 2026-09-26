<div align="center">

# FlowClip

**Your clipboard, finally organized.**

Capture text, links, and screenshots as you browse. Search everything by meaning. See new clips appear on your dashboard the moment you copy them.

<br/>

[![Live App](https://img.shields.io/badge/Live_App-flowclip--web.vercel.app-black?style=for-the-badge)](https://flowclip-web.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js_16-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-00e699?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech)

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
  Session is validated via JWT.               response is not blocked.

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

Embedding generation is fire-and-forget — it happens after the clip is saved, so POST `/api/clips` returns immediately and the embedding is written in the background.

</details>

<details>
<summary><strong>Real-time sync via SSE</strong></summary>
<br/>

The dashboard keeps an open Server-Sent Events connection. The moment the extension saves a clip, the API emits it on a per-user event channel — the dashboard gets it instantly, no polling, no refresh.

A few things worth noting:

- `EventSource` doesn't support custom headers, so the access token is passed as a query param — validated against the DB before the stream opens
- A 30-second keep-alive ping prevents proxies and load balancers from closing idle connections
- `X-Accel-Buffering: no` disables Nginx buffering so events are delivered immediately on EC2
- Client disconnect is detected via `request.signal` (AbortSignal) — the event listener and interval are cleaned up properly

</details>

<details>
<summary><strong>Auth that doesn't cut corners</strong></summary>
<br/>

- Access tokens live in memory only (15 min TTL) — never in `localStorage` or `sessionStorage`
- Refresh token is an HTTP-only, `SameSite=strict` cookie on the web app — inaccessible to JS
- Passwords hashed with bcryptjs at cost factor 12
- Tokens are 32 bytes of `crypto.getRandomValues` — not Math.random, not uuid
- A deduplication guard (`_refreshPromise`) prevents parallel refresh races when multiple components mount simultaneously and all see an expired token — only one `/api/auth/refresh` call fires, and all callers await the same promise
- The Chrome extension can't access HTTP-only cookies, so it uses a separate `/api/auth/refresh-with-token` route that accepts the refresh token in the request body and stores it in `chrome.storage.local`

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
| Web app | Next.js 16, React 19, Tailwind CSS v4, GSAP |
| Database | PostgreSQL on [Neon](https://neon.tech) (serverless) |
| ORM | Drizzle ORM |
| Auth | Custom JWT — jose + bcryptjs |
| Semantic search | Google Gemini `text-embedding-004` + cosine similarity |
| Real-time | Server-Sent Events |
| Extension | Chrome Manifest V3 |
| Testing | Vitest + Testing Library, Playwright |

---

<details>
<summary><strong>API routes</strong></summary>
<br/>

| Method | Route | What it does |
|---|---|---|
| `POST` | `/api/auth/register` | Create account |
| `POST` | `/api/auth/login` | Login, returns access + refresh tokens |
| `POST` | `/api/auth/logout` | Revoke session |
| `POST` | `/api/auth/refresh` | Refresh via HTTP-only cookie (web) |
| `POST` | `/api/auth/refresh-with-token` | Refresh via body (extension) |
| `GET` | `/api/auth/me` | Current user |
| `GET` | `/api/clips` | Cursor-paginated clips |
| `POST` | `/api/clips` | Save a clip |
| `POST` | `/api/clips/search` | Semantic search with meta stats |
| `GET` | `/api/clips/stream` | SSE stream for real-time updates |
| `GET / PATCH / DELETE` | `/api/clips/[id]` | Single clip operations |

</details>

---

## Status

Core capture, search, and real-time sync are working. The web app is live and the extension is loadable in developer mode.

Coming next: tags, collections, and a keyboard-first command palette.

---

<div align="center">
  Built by <a href="https://github.com/uttkarsh123-shiv">Uttkarsh Singh</a>
</div>
