const APP_URLS = {
  dev:  "http://localhost:3000",
  prod: "https://flowclip-web.vercel.app",
};

const DASHBOARD_URLS = APP_URLS;

let APP_URL   = APP_URLS.prod;
let activeEnv = "prod";

function initEnv() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["activeEnv"], (data) => {
      activeEnv = data.activeEnv ?? "prod";
      APP_URL   = APP_URLS[activeEnv];
      resolve();
    });
  });
}

// ─── Token helpers ────────────────────────────────────────────────────────────
function getTokens() {
  return new Promise((resolve) => {
    chrome.storage.local.get(
      ["accessToken", "refreshToken", "accessTokenExpiresAt"],
      resolve
    );
  });
}

function clearTokens() {
  return chrome.storage.local.remove([
    "accessToken", "refreshToken",
    "accessTokenExpiresAt", "refreshTokenExpiresAt",
  ]);
}

async function getValidAccessToken() {
  const { accessToken, refreshToken, accessTokenExpiresAt } = await getTokens();
  if (!refreshToken) return null;

  if (accessToken && Date.now() < accessTokenExpiresAt - 30000) {
    return accessToken;
  }

  try {
    // Extension stores refresh token in chrome.storage (can't use HTTP-only cookies)
    // Uses dedicated refresh-with-token route that accepts token in body
    const res = await fetch(`${APP_URL}/api/auth/refresh-with-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) { await clearTokens(); return null; }

    const data = await res.json();
    await chrome.storage.local.set({
      accessToken: data.accessToken,
      accessTokenExpiresAt: data.accessTokenExpiresAt,
    });
    return data.accessToken;
  } catch {
    return null;
  }
}

// ─── Error sanitization ───────────────────────────────────────────────────────
function sanitizeError(err) {
  const raw = (err instanceof Error ? err.message : String(err)) || "";
  if (/failed to fetch|networkerror|network request failed/i.test(raw)) {
    return "Connection error. Check your internet and try again.";
  }
  return raw.replace(/^Uncaught Error:\s*/i, "").trim() || "Something went wrong.";
}

// ─── View helpers ─────────────────────────────────────────────────────────────
function showLoginView() {
  document.getElementById("login-view").style.display  = "flex";
  document.getElementById("clips-view").style.display  = "none";
  document.getElementById("logout-btn").style.display  = "none";
  document.getElementById("count").textContent         = "";
}

function showClipsView() {
  document.getElementById("login-view").style.display  = "none";
  document.getElementById("clips-view").style.display  = "block";
  document.getElementById("logout-btn").style.display  = "inline-block";
}

// ─── Login ────────────────────────────────────────────────────────────────────
document.getElementById("login-btn").addEventListener("click", async () => {
  const email    = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const errorEl  = document.getElementById("login-error");
  const btn      = document.getElementById("login-btn");

  if (!email || !password) { errorEl.textContent = "Email and password required"; return; }

  btn.disabled    = true;
  btn.textContent = "Signing in...";
  errorEl.textContent = "";

  try {
    const res = await fetch(`${APP_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    // Guard against HTML error pages (500, 404) before calling .json()
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      throw new Error(`Server error (${res.status}). Check that the app is deployed and env vars are set.`);
    }

    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    // Extension stores both tokens in chrome.storage
    // (HTTP-only cookies aren't accessible to extensions)
    await chrome.storage.local.set({
      accessToken:           data.accessToken,
      refreshToken:          data.refreshToken,
      accessTokenExpiresAt:  data.accessTokenExpiresAt,
      refreshTokenExpiresAt: data.refreshTokenExpiresAt,
    });

    showClipsView();
    loadClips();
  } catch (e) {
    errorEl.textContent = sanitizeError(e);
  } finally {
    btn.disabled    = false;
    btn.textContent = "Sign in";
  }
});

document.getElementById("password").addEventListener("keydown", (e) => {
  if (e.key === "Enter") document.getElementById("login-btn").click();
});

// ─── Logout ───────────────────────────────────────────────────────────────────
document.getElementById("logout-btn").addEventListener("click", async () => {
  const { accessToken } = await getTokens();
  if (accessToken) {
    fetch(`${APP_URL}/api/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessToken }),
    }).catch(() => {});
  }
  await clearTokens();
  showLoginView();
});

// ─── Load clips ───────────────────────────────────────────────────────────────
let allClips = [];

async function loadClips() {
  const accessToken = await getValidAccessToken();
  if (!accessToken) { showLoginView(); return; }

  try {
    const res = await fetch(`${APP_URL}/api/clips?pageSize=5`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) throw new Error("Failed to load clips");

    const data = await res.json();
    allClips = data.clips;
    renderClips(allClips);
  } catch (e) {
    const container = document.getElementById("clips");
    if (container) container.innerHTML = `<div id="empty" style="color:#f87171;">${sanitizeError(e)}</div>`;
  }
}

function renderClips(clips) {
  const container = document.getElementById("clips");
  const count     = document.getElementById("count");
  count.textContent = `${clips.length} clip${clips.length !== 1 ? "s" : ""}`;

  if (clips.length === 0) {
    container.innerHTML = '<div id="empty">No clips yet</div>';
    return;
  }

  container.innerHTML = clips
    .map((clip, i) => {
      const time    = new Date(clip.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const { icon, type } = getClipIcon(clip.content);
      // Use textContent equivalent — escape HTML to prevent XSS
      const preview = escapeHtml(clip.content?.substring(0, 60) ?? "");
      return `
        <div class="clip ${type}" data-index="${i}">
          <div class="clip-icon">${icon}</div>
          <div class="clip-content">
            <div class="clip-text">${preview}</div>
            <div class="clip-time">${time}</div>
          </div>
        </div>`;
    })
    .join("");

  container.querySelectorAll(".clip").forEach((el) => {
    el.addEventListener("click", () => {
      const clip = clips[+el.dataset.index];
      navigator.clipboard.writeText(clip.content);
    });
  });
}

// Escape HTML to prevent XSS — clipboard content is untrusted
function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getClipIcon(content) {
  if (/^https?:\/\//.test(content))       return { icon: "LINK",  type: "link"  };
  if (/^data:image/.test(content))         return { icon: "IMG",   type: "image" };
  if (/^Screenshot|^Image/.test(content)) return { icon: "IMG",   type: "image" };
  return                                          { icon: "TEXT",  type: "text"  };
}

// ─── Init ─────────────────────────────────────────────────────────────────────
document.getElementById("open-dashboard").addEventListener("click", () => {
  chrome.tabs.create({ url: DASHBOARD_URLS[activeEnv] });
});

async function init() {
  await initEnv();
  const accessToken = await getValidAccessToken();
  if (accessToken) { showClipsView(); loadClips(); }
  else              { showLoginView(); }
}

init();
