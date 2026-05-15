# FlowClip

**Next.js, React.js, Convex, Chrome Extension API, GSAP, JWT**

A high-performance browser extension and web platform for seamless content capture workflows with enterprise-grade authentication and real-time synchronization.

• **Architected** a high-performance browser extension and web platform serving seamless content capture workflows through optimized Chrome MV3 service workers and real-time data synchronization across distributed user sessions.

• **Designed and implemented** enterprise-grade authentication infrastructure with JWT-based token rotation, secure cross-origin communication protocols, and fault-tolerant session management through automated refresh token workflows.

• **Built** scalable full-stack architecture leveraging serverless Convex backend with optimized database indexing, modular React component library with 15+ reusable UI components, and performance-optimized frontend through code-splitting and lazy loading strategies.

---

## Overview

FlowClip transforms productivity workflows by enabling instant content capture from any webpage without context switching. Built with modern web technologies and enterprise-grade security for reliable performance across devices.

**Key Features:**
- **Instant Capture**: Single keystroke (`Shift+S`) content extraction
- **Multi-format Support**: Text, links, and screenshot capture
- **Real-time Sync**: Cross-device synchronization with conflict resolution
- **Enterprise Security**: JWT-based authentication with automatic token rotation
- **Performance Optimized**: Code-splitting and lazy loading for fast load times

---

## Architecture

**High-Performance Stack**

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | Next.js 16, React 19, Tailwind CSS | Server-side rendering, component architecture |
| **Backend** | Convex (serverless) | Real-time database, HTTP actions, auto-scaling |
| **Authentication** | Custom JWT | Access/refresh tokens, secure session management |
| **Extension** | Chrome MV3 | Content scripts, service workers, popup UI |
| **Animations** | GSAP + ScrollTrigger | Performance-optimized UI interactions |
| **Typography** | Plus Jakarta Sans | Consistent design system |

**Performance Optimizations:**
- Optimized event handling for responsive keystroke capture
- Lazy loading and code-splitting for improved load times
- IndexedDB caching for offline functionality
- WebSocket connections for real-time synchronization

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
2. **Capture** — Press `S twice` on any page to save text or links. Press `S` twice quickly to capture a screenshot
3. **Access** — Open the dashboard at `/dashboard` to view, search, and manage all clips

---

## Enterprise-Grade Security

**Security Features:**
- JWT-based access/refresh token rotation
- PBKDF2 password hashing with salt
- Input validation and sanitization
- XSS protection through content filtering
- Hybrid rate limiting (IP + UserID) for shared networks
- Automatic token expiration and cleanup
- Chrome storage for extension token persistence

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
