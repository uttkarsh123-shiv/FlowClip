# FlowClip

A smart clipboard manager — capture text, links, and screenshots as you browse, then search and manage everything from a central dashboard.

## What it does

- **Capture anything** — highlight text, copy a link, or take a screenshot on any webpage via the Chrome extension
- **Auto-classify** — clips are tagged as `text`, `link`, or `image` automatically
- **Semantic search** — find clips by meaning, not just keywords, using Google Gemini embeddings
- **Real-time sync** — new clips appear on the dashboard instantly via Server-Sent Events
- **Secure auth** — JWT access tokens (15 min) + HTTP-only refresh token cookies (30 days), bcrypt-hashed passwords

---

## Project structure

```
FlowClip/
├── apps/
│   ├── web/          # Next.js 16 web app (dashboard + API)
│   └── extension/    # Chrome extension (Manifest V3)
```

### Web app (`apps/web`)

| Path | Purpose |
|---|---|
| `app/` | Next.js App Router pages and API routes |
| `app/api/auth/` | Register, login, logout, token refresh |
| `app/api/clips/` | CRUD, cursor-based pagination, SSE stream |
| `app/api/clips/search/` | Semantic search via cosine similarity |
| `app/dashboard/` | Main dashboard page |
| `components/dashboard/` | Navbar, Sidebar, ItemCard, KebabMenu, ImageModal |
| `components/landing/` | Landing page sections |
| `lib/db/` | Drizzle ORM schema + Neon PostgreSQL client |
| `lib/auth.js` | Client-side token management (in-memory access token, deduped refresh) |
| `lib/auth-helpers.js` | Server-side: bcrypt, token generation, cookie helpers |
| `lib/api-middleware.js` | Bearer token validation for API routes |
| `lib/embeddings.js` | Google Gemini embedding calls |
| `lib/cosine-similarity.js` | Cosine similarity for semantic ranking |
| `lib/event-bus.js` | In-process SSE event bus for real-time clip delivery |
| `lib/sanitize.js` | Input sanitization for text and URLs |

### Chrome extension (`apps/extension`)

| File | Purpose |
|---|---|
| `src/background/index.js` | Service worker — token refresh, clip/screenshot saving |
| `src/content/index.js` | Content script — text selection listener, screenshot confirmation UI |
| `src/popup/popup.js` | Extension popup — login, recent clips list |

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, Tailwind CSS v4, GSAP |
| Backend | Next.js API Routes (App Router) |
| Database | PostgreSQL via [Neon](https://neon.tech) (serverless) |
| ORM | Drizzle ORM + drizzle-kit |
| Auth | Custom JWT — bcryptjs, crypto.getRandomValues |
| Embeddings | Google Gemini (`text-embedding-004`) |
| Real-time | Server-Sent Events (SSE) |
| Extension | Chrome Manifest V3 |
| Testing | Vitest + Testing Library, Playwright (e2e) |

---

## Getting started

### Prerequisites

- Node.js 20+
- A [Neon](https://neon.tech) PostgreSQL database
- A Google Gemini API key (for embeddings + semantic search)

### 1. Clone and install

```bash
git clone https://github.com/your-org/flowclip.git
cd flowclip
npm install
```

### 2. Configure environment variables

Create `.env.local` at the repo root:

```env
DATABASE_URL=postgresql://<user>:<password>@<host>/neondb?sslmode=require
DATABASE_URL_UNPOOLED=postgresql://<user>:<password>@<host>/neondb?sslmode=require

GEMINI_API_KEY=your_gemini_api_key
```

Create `apps/web/.env.local`:

```env
NEXT_PUBLIC_EXTENSION_ID=your_chrome_extension_id
```

### 3. Run database migrations

```bash
cd apps/web
npm run db:generate   # generate migration files from schema
npm run db:migrate    # apply migrations to Neon
```

### 4. Start the dev server

```bash
npm run dev:web
```

The app runs at `http://localhost:3000`.

### 5. Load the extension

1. Open Chrome → `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** → select `apps/extension/`

---

## Database schema

Three tables managed by Drizzle ORM:

**`users`** — email, bcrypt password hash, name  
**`sessions`** — access token, refresh token, expiry timestamps (indexed for fast validation)  
**`items`** — clip type (`text` | `link` | `image`), content, URL, image URL, Gemini embedding vector (JSONB)

---

## API routes

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Create account |
| `POST` | `/api/auth/login` | Login, returns access + refresh tokens |
| `POST` | `/api/auth/logout` | Revoke session |
| `POST` | `/api/auth/refresh` | Refresh via HTTP-only cookie |
| `POST` | `/api/auth/refresh-with-token` | Refresh via body (extension only) |
| `GET` | `/api/auth/me` | Current user info |
| `GET` | `/api/clips` | Paginated clips (cursor-based) |
| `POST` | `/api/clips` | Create clip |
| `GET` | `/api/clips/search?q=` | Semantic search |
| `GET` | `/api/clips/stream` | SSE stream for real-time updates |
| `GET/PATCH/DELETE` | `/api/clips/[id]` | Single clip operations |

---

## Auth flow

**Web app:** access token stored in memory (15 min TTL), refresh token in an HTTP-only `SameSite=Strict` cookie. A deduplication guard prevents parallel refresh races.

**Extension:** both tokens stored in `chrome.storage.local` (cookies are inaccessible to extensions). Token refresh uses the `/api/auth/refresh-with-token` route which accepts the refresh token in the request body.

---

## Running tests

```bash
cd apps/web
npm run test          # unit tests (vitest)
npm run test:e2e      # e2e tests (playwright)
```

---

## Deployment

The web app deploys to [Vercel](https://vercel.com). Set the environment variables listed above in the Vercel project settings. The production URL is `https://flow-clip-web.vercel.app`.
