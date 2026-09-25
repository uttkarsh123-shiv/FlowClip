# FlowClip

**Your clipboard, finally organized.**

FlowClip captures everything you copy while browsing — text, links, screenshots — and makes it all searchable from one place. No more losing that snippet you copied three tabs ago.

---

## The problem

Your clipboard holds one thing at a time. You copy a link, then copy some code, and the link is gone. You spend more time hunting for things you already had than actually working.

FlowClip fixes that.

---

## What you get

**Capture without thinking**  
Install the Chrome extension and forget about it. Every time you highlight text, copy a link, or take a screenshot, FlowClip saves it automatically in the background.

**Find anything, instantly**  
Search by meaning — not just exact words. Ask for "that article about React performance" and FlowClip finds it even if you don't remember the exact phrasing. Powered by Google Gemini embeddings.

**See it all in one dashboard**  
Every clip lives in your personal dashboard at [flow-clip-web.vercel.app](https://flow-clip-web.vercel.app). Filter by type, scroll through your history, or jump straight to what you need.

**Real-time, no refresh needed**  
Clip something in Chrome, and it appears on your dashboard instantly. No polling, no refresh button — it just shows up.

**Your data stays yours**  
Everything is tied to your account. JWT auth with short-lived access tokens and HTTP-only refresh cookies. Passwords are bcrypt-hashed. Nobody else sees your clips.

---

## How it works

```
Chrome Extension  →  captures text, links, screenshots as you browse
        ↓
  FlowClip API    →  stores clips in PostgreSQL, generates embeddings
        ↓
   Dashboard      →  browse, search, manage all your clips in real time
```

The extension runs silently as a Chrome service worker. When you copy or highlight something, it sends the clip to the API. The dashboard receives it instantly via a live SSE connection — no page refresh needed.

---

## Tech

Built on Next.js with a PostgreSQL backend on [Neon](https://neon.tech). Semantic search uses Google Gemini embeddings with cosine similarity ranking. Real-time updates are delivered via Server-Sent Events. The Chrome extension uses Manifest V3.

| Layer | Stack |
|---|---|
| Web app | Next.js 16, React 19, Tailwind CSS v4 |
| Database | PostgreSQL (Neon serverless) + Drizzle ORM |
| Auth | Custom JWT — jose, bcryptjs |
| Search | Google Gemini `text-embedding-004` + cosine similarity |
| Real-time | Server-Sent Events |
| Extension | Chrome Manifest V3 |

---

## Status

FlowClip is in active development. Core capture, search, and sync are working. Coming next: tags, collections, and a keyboard-first command palette.

---

*Built by [Uttkarsh Singh](https://github.com/uttkarsh123-shiv)*
