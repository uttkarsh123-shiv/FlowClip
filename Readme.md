# FlowClip

Capture text, links, and screenshots from any webpage in a single keystroke — without breaking your flow.

---

## What is FlowClip?

FlowClip is a browser extension + web dashboard that lets you save content while browsing without switching tabs or losing focus. Press `Shift+S` to capture, and everything syncs to your dashboard in real time.

---

## Stack

| Layer | Tech |
|---|---|
| Web app | Next.js 16, React 19, Tailwind CSS |
| Backend | Convex (serverless database + HTTP actions) |
| Auth | Custom JWT (access + refresh tokens) |
| Extension | Chrome MV3 (content script + service worker + popup) |
| Animations | GSAP + ScrollTrigger |
| Font | Plus Jakarta Sans |

---

## Project Structure

```
FlowClip/
├── apps/
│   ├── web/                  # Next.js web app
│   │   ├── app/
│   │   │   ├── page.js       # Landing page
│   │   │   └── dashboard/    # Protected dashboard route
│   │   ├── components/
│   │   │   ├── AuthModal.jsx
│   │   │   ├── HowItWorks.jsx
│   │   │   ├── ItemCard.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── hooks/
│   │   │   └── useAuth.jsx
│   │   └── lib/
│   │       └── auth.js       # Token management
│   └── extension/
│       └── src/
│           ├── background/   # Service worker
│           ├── content/      # Content script (Shift+S capture)
│           └── popup/        # Extension popup UI
└── convex/
    ├── schema.ts             # Database schema
    ├── auth.js               # Auth HTTP endpoints
    ├── items.js              # Clips CRUD
    └── http.js               # HTTP router
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Convex](https://convex.dev) account

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Convex

```bash
npx convex dev
```

This starts the Convex backend and generates the `_generated` files.

### 3. Configure environment variables

Create `apps/web/.env.local`:

```env
NEXT_PUBLIC_CONVEX_URL=your_convex_url
NEXT_PUBLIC_CONVEX_SITE_URL=your_convex_site_url
```

### 4. Run the web app

```bash
npm run dev:web
```

App runs at `http://localhost:3000`.

### 5. Load the extension

1. Open Chrome → `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the `apps/extension` folder

---

## How It Works

1. **Install** — Load the extension in Chrome
2. **Capture** — Press `Shift+S` on any page to save text, links, or press `Shift+S` twice for a screenshot
3. **Access** — Open the dashboard at `/dashboard` to view, search, and manage all clips

---

## Auth Flow

- Register/login via the modal on the landing page
- Tokens stored in `localStorage` (web) and `chrome.storage.local` (extension)
- Access token: ~15 min expiry, auto-refreshed via refresh token
- Logout clears all tokens and redirects to `/`

---

## Database Schema

```
users       — email, passwordHash, name, createdAt
sessions    — userId, accessToken, refreshToken, expiry timestamps
items       — type (text|link|image), content, url, imageData, userId, createdAt
```

---

## Routes

| Route | Description |
|---|---|
| `/` | Landing page (redirects to `/dashboard` if logged in) |
| `/dashboard` | Protected clips dashboard (redirects to `/` if not logged in) |

---

## Extension Permissions

| Permission | Reason |
|---|---|
| `clipboardRead` | Read copied text |
| `storage` | Store auth tokens |
| `activeTab` | Get current page URL |
| `tabs` | Open dashboard from popup |
