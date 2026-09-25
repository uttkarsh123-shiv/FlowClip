<div align="center">

# FlowClip

**Your clipboard, finally organized.**

Capture text, links, and screenshots as you browse. Search everything by meaning. See new clips appear on your dashboard the moment you copy them.

<br/>

[![Live App](https://img.shields.io/badge/Live_App-flow--clip--web.vercel.app-black?style=for-the-badge)](https://flow-clip-web.vercel.app)
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
  Clip is stored in PostgreSQL.           →   A Gemini embedding is generated
  Session is validated via JWT.               and saved alongside the content.

  Dashboard
  ─────────────────
  New clip appears instantly via SSE.     →   Search by meaning, filter by type,
  No refresh, no polling.                     manage everything in one place.
```

---

## Features

<details>
<summary><strong>Semantic search</strong></summary>
<br/>

Search by what you meant, not what you typed. FlowClip generates a vector embedding for every clip using Google Gemini's `text-embedding-004` model. When you search, your query gets the same treatment and clips are ranked by cosine similarity.

You can find "that React performance article" without remembering a single word from the URL.

</details>

<details>
<summary><strong>Real-time sync via SSE</strong></summary>
<br/>

The dashboard holds an open Server-Sent Events connection to the API. The moment the extension saves a clip, the API broadcasts it over that connection. No WebSockets, no polling — just a persistent HTTP stream that pushes updates as they happen.

</details>

<details>
<summary><strong>Auth that doesn't cut corners</strong></summary>
<br/>

- Access tokens live in memory only (15 min TTL) — never in localStorage
- Refresh token is an HTTP-only, `SameSite=Strict` cookie on the web app
- The Chrome extension can't access HTTP-only cookies, so it uses a separate `/api/auth/refresh-with-token` route that accepts the token in the request body and stores it in `chrome.storage.local`
- Passwords are hashed with bcryptjs
- A deduplication guard prevents parallel refresh races when multiple requests fire at the same time

</details>

<details>
<summary><strong>Chrome extension (Manifest V3)</strong></summary>
<br/>

The extension runs as a background service worker. It listens for text selection, copy events, and screenshot triggers from the content script, then saves clips to the API using the stored access token. Token refresh happens silently in the background — the popup and content script never need to think about it.

</details>

---

## Stack

| Layer | Technology |
|---|---|
| Web app | Next.js 16, React 19, Tailwind CSS v4, GSAP |
| Database | PostgreSQL on [Neon](https://neon.tech) (serverless) |
| ORM | Drizzle ORM |
| Auth | Custom JWT via jose + bcryptjs |
| Semantic search | Google Gemini `text-embedding-004` + cosine similarity |
| Real-time | Server-Sent Events |
| Extension | Chrome Manifest V3 |
| Testing | Vitest + Testing Library, Playwright |

---

## API surface

<details>
<summary>Show all routes</summary>
<br/>

| Method | Route | What it does |
|---|---|---|
| `POST` | `/api/auth/register` | Create account |
| `POST` | `/api/auth/login` | Login, returns access + refresh tokens |
| `POST` | `/api/auth/logout` | Revoke session |
| `POST` | `/api/auth/refresh` | Refresh via HTTP-only cookie (web) |
| `POST` | `/api/auth/refresh-with-token` | Refresh via body (extension) |
| `GET` | `/api/auth/me` | Current user |
| `GET` | `/api/clips` | Paginated clips (cursor-based) |
| `POST` | `/api/clips` | Save a clip |
| `GET` | `/api/clips/search?q=` | Semantic search |
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
