# FlowClip

A smart clipboard manager that automatically captures what you copy and screenshot across the web, syncs it to a personal dashboard, and lets you search through it semantically.

**Live:** [flow-clip-web.vercel.app](https://flow-clip-web.vercel.app)

---

## How it works

Install the Chrome extension (load unpacked). Every time you copy text or press `S` twice to take a screenshot, FlowClip shows a save/ignore toast. If you save, the clip is stored in your Convex database and instantly appears on the dashboard. Search works semantically — not just keyword matching.

---

## Stack

| Layer | Tech |
|---|---|
| Web dashboard | Next.js 15, React, Tailwind CSS |
| Backend + database | Convex (serverless, real-time) |
| Auth | Custom — PBKDF2 hashing, session tokens |
| Semantic search | Vector embeddings + cosine similarity |
| File storage | Convex Storage |
| Chrome extension | Manifest V3, vanilla JS |
| Deployment | Vercel (Next.js), Convex Cloud (backend) |

---

## Project structure

```
FlowClip/
├── apps/
│   ├── web/                  # Next.js web app
│   │   ├── app/
│   │   │   ├── dashboard/    # Dashboard page
│   │   │   ├── api/auth/     # Cookie management routes
│   │   │   ├── layout.js
│   │   │   └── page.js       # Landing page
│   │   ├── components/
│   │   │   ├── dashboard/    # Navbar, Sidebar, ItemCard, ImageModal, KebabMenu
│   │   │   └── landing/      # Hero, Features, HowItWorks, FAQ, CTA, Nav
│   │   ├── hooks/useAuth.jsx
│   │   └── lib/
│   │       ├── auth.js       # Token management
│   │       └── convex.js     # Convex client
│   └── extension/            # Chrome extension
│       ├── manifest.json
│       └── src/
│           ├── background/   # Service worker
│           ├── content/      # Content script injected into every page
│           └── popup/        # Extension popup UI
└── convex/                   # Convex backend
    ├── schema.ts             # DB schema
    ├── auth.js               # Auth mutations + queries
    ├── items.js              # Clips CRUD
    ├── actions.js            # Embedding generation on save
    ├── semanticSearch.js     # Vector search
    ├── http.js               # HTTP API router
    └── lib/
        ├── sanitize.js
        └── cosineSimilarity.js
```

---

## Features

### Chrome extension

- **Auto-capture on copy** — intercepts `copy` events and `Ctrl+C`, shows a save/ignore toast (auto-dismisses in 6s)
- **Screenshot capture** — press `S` twice on any page to capture the visible tab, shows a preview modal (auto-dismisses in 10s)
- **Domain blocklist** — silently skips capture on 20+ financial/crypto sites (Chase, PayPal, Coinbase, Binance, etc.)
- **Popup** — shows your last 5 clips, click to copy to clipboard, open dashboard button
- **Token auto-refresh** — silently renews access token using stored refresh token
- **Dual-env routing** — automatically talks to the dev Convex deployment when you open `localhost:3000`, and the prod deployment when you open the deployed URL

### Web dashboard

- **Real-time clip feed** — updates live across tabs/devices via Convex subscriptions, no refresh needed
- **Semantic search** — debounced 500ms, embeds your query and ranks results by cosine similarity, shows SEMANTIC badge
- **Type filtering** — filter by All / Text / Link / Image
- **Image lightbox** — click any screenshot to open full-screen
- **Full text expand** — long clips show "Show more" → modal with copy button
- **Delete clips** — kebab menu on every card
- **Extension status indicator** — navbar dot polls extension every 10s: green (logged in), amber (installed but not logged in), grey (not detected)

### Backend (Convex)

- **Custom auth** — PBKDF2 password hashing (100k iterations, SHA-256, random salt), no third-party auth provider
- **Sessions** — 15-minute access tokens + 30-day refresh tokens stored in DB
- **Vector embeddings** — every saved text/link clip gets an embedding generated automatically
- **Semantic search** — query is embedded, cosine similarity scored against all user clips, returns top 10
- **Convex Storage** — screenshots uploaded as blobs, stored with storage IDs (not base64 in DB)
- **Input sanitization** — all content sanitized before DB insert

---

## Auth flow

```
Login/Register
  → Convex returns { accessToken, refreshToken }
  → accessToken stored in JS memory (module variable, wiped on page refresh)
  → refreshToken sent to Next.js /api/auth/set-cookie
  → Next.js sets httpOnly cookie (not accessible by JS, XSS-proof)

Page refresh (accessToken gone)
  → getValidAccessToken() detects expiry
  → calls Next.js /api/auth/refresh (server reads httpOnly cookie)
  → Convex issues new accessToken
  → back in memory

Logout
  → memory cleared
  → Next.js /api/auth/clear-cookie expires the cookie
```

The extension stores both tokens in `chrome.storage.local` — isolated to the extension context, not accessible by web pages.

---

## Local development

### Prerequisites

- Node.js 20+
- A Convex account ([convex.dev](https://convex.dev))

### 1. Clone and install

```bash
git clone https://github.com/uttkarsh124-shiv/FlowClip.git
cd FlowClip/apps/web
npm install
```

### 2. Set up Convex

```bash
cd ../../convex
npx convex dev
```

This starts the Convex dev server and gives you your deployment URL.

### 3. Environment variables

Create `apps/web/.env.local`:

```env
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
NEXT_PUBLIC_CONVEX_SITE_URL=https://your-deployment.convex.site
NEXT_PUBLIC_EXTENSION_ID=your-extension-id
```

### 4. Run the web app

```bash
cd apps/web
npm run dev
```

### 5. Load the extension

1. Go to `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** → select `apps/extension`
4. Note the extension ID and put it in `.env.local`

---

## Deployment

### Next.js → Vercel

1. Connect `uttkarsh124-shiv/FlowClip` to Vercel
2. Set **Root Directory** to `apps/web`
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_CONVEX_URL`
   - `NEXT_PUBLIC_CONVEX_SITE_URL`
   - `NEXT_PUBLIC_EXTENSION_ID`

### Convex backend

```bash
cd convex
npx convex deploy
```

This deploys to Convex Cloud. The backend URL never changes.

### Chrome extension

Load unpacked via `chrome://extensions`. Publishing to the Chrome Web Store requires a one-time $5 developer registration fee.

---

## Environment map

| Dashboard origin | Convex deployment |
|---|---|
| `http://localhost:3000` | Dev (`fantastic-condor-84`) |
| `https://flow-clip-web.vercel.app` | Prod (`polished-peccary-13`) |

The extension automatically detects which dashboard you're using and routes to the correct Convex deployment.
