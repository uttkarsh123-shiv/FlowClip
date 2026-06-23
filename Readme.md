# FlowClip

**Next.js, React.js, Convex, Gemini AI, Chrome Extension API, GSAP, Tailwind CSS**

A browser extension and web dashboard for capturing text, links, and screenshots from any webpage with a double keypress — no tab switching, no friction.

---

## What It Does

- Press `S` twice on any page to capture a screenshot
- Copy text or a link — a toast appears to save it to your dashboard
- All clips sync in real time to your dashboard at `/dashboard`
- **Semantic search** — search clips by meaning, not just exact keywords (powered by Gemini embeddings)
- Blocked on banking and payment sites (Chase, PayPal, Stripe, Coinbase, etc.)

---

## Stack

| Layer | Tech |
|---|---|
| Web app | Next.js 16, React 19, Tailwind CSS, GSAP |
| Backend | Convex (serverless database + HTTP actions + file storage) |
| Auth | Custom opaque tokens (access + refresh, database-backed sessions) |
| Extension | Chrome MV3 — content script, service worker, popup |
| Semantic search | Gemini `gemini-embedding-2` + cosine similarity |

---

## Project Structure

```
FlowClip/
├── apps/
│   ├── web/
│   │   ├── app/
│   │   │   ├── page.js           # Landing page
│   │   │   └── dashboard/        # Protected dashboard
│   │   ├── components/
│   │   │   ├── landing/          # Hero, Features, HowItWorks, FAQ, etc.
│   │   │   └── dashboard/        # Navbar, Sidebar, ItemCard, modals
│   │   ├── hooks/useAuth.jsx      # Auth state
│   │   └── lib/
│   │       ├── auth.js           # Token management + API calls
│   │       └── sanitize.js       # Input validation utilities
│   └── extension/src/
│       ├── background/index.js   # Service worker — saves clips to Convex
│       ├── content/index.js      # Keypress detection, toast UI, blocked domains
│       └── popup/                # Extension popup with login + recent clips
└── convex/
    ├── schema.ts                 # DB schema (users, sessions, items + embeddings)
    ├── auth.js                   # Register, login, logout, refresh, getMe
    ├── items.js                  # Create, read, delete, paginate clips
    ├── actions.js                # createItemWithEmbedding, backfillEmbeddings
    ├── embeddings.js             # Gemini embedding generation
    ├── semanticSearch.js         # Cosine similarity search action
    ├── http.js                   # HTTP router with rate limiting
    └── lib/
        ├── sanitize.js           # Server-side input validation
        ├── rateLimit.js          # IP + UserID hybrid rate limiting
        └── cosineSimilarity.js   # Vector similarity utility
```

---

## Auth

Custom session-based auth — no third-party library.

- Passwords hashed with PBKDF2 (Web Crypto API, 100k iterations)
- Access token: 15-minute expiry, auto-refreshed via refresh token
- Refresh token: 30-day expiry, stored in `chrome.storage.local` (extension) and `localStorage` (web)
- Sessions stored in Convex DB — can be invalidated server-side

---

## Security

- Input validation and sanitization on both frontend and backend
- XSS protection — dangerous URL schemes (`javascript:`, `data:`) blocked
- Hybrid rate limiting (IP + UserID) — shared networks like college WiFi won't block other users
- Blocked domain list — extension disabled on banking/payment/crypto sites
- Auth errors sanitized before showing to users
- `externally_connectable` locked to exact domain — no wildcard origins

---

## Semantic Search

Text and link clips are embedded using Gemini `gemini-embedding-2` on save. When you search, the query is also embedded and ranked by cosine similarity against all stored embeddings — no Qdrant or vector DB needed.

- Searches by meaning, not just exact words
- 500ms debounce before firing the search request
- Falls back to substring search if semantic search fails
- Shows "SEMANTIC" badge in the dashboard when active
- Run `npx convex run actions:backfillEmbeddings` to embed existing clips

---

## Database Schema

```
users    — email, passwordHash, name, createdAt
sessions — userId, accessToken, refreshToken, accessTokenExpiresAt, refreshTokenExpiresAt, createdAt
items    — type (text | link | image), content, embedding, url, imageStorageID, userId, createdAt
```

---

## Getting Started

**Prerequisites:** Node.js 18+, a [Convex](https://convex.dev) account, a [Gemini API key](https://aistudio.google.com/app/apikey)

```bash
# Install dependencies
npm install

# Set Gemini API key
npx convex env set GEMINI_API_KEY your_key_here

# Start Convex backend
npx convex dev

# Start web app
npm run dev:web
```

Create `apps/web/.env.local`:

```env
NEXT_PUBLIC_CONVEX_URL=your_convex_url
NEXT_PUBLIC_CONVEX_SITE_URL=your_convex_site_url
NEXT_PUBLIC_EXTENSION_ID=your_chrome_extension_id
```

**Load the extension:**
1. Go to `chrome://extensions`
2. Enable Developer mode
3. Load unpacked → select `apps/extension`

**Backfill embeddings for existing clips:**
```bash
npx convex run actions:backfillEmbeddings
```

---

## Extension Permissions

| Permission | Why |
|---|---|
| `clipboardRead` | Read copied text on `Ctrl+C` |
| `storage` | Store auth tokens |
| `activeTab` | Get current page URL |
| `tabs` | Capture screenshot, open dashboard |
