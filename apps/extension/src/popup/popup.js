const CONVEX_SITE_URL = "https://fantastic-condor-84.eu-west-1.convex.site";

// ─── Token helpers (chrome.storage) ──────────────────────────────────────────

function getTokens() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["accessToken", "refreshToken", "accessTokenExpiresAt"], resolve);
  });
}

function saveTokens(data) {
  return chrome.storage.local.set({
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    accessTokenExpiresAt: data.accessTokenExpiresAt,
    refreshTokenExpiresAt: data.refreshTokenExpiresAt,
  });
}

function clearTokens() {
  return chrome.storage.local.remove(["accessToken", "refreshToken", "accessTokenExpiresAt", "refreshTokenExpiresAt"]);
}

async function getValidAccessToken() {
  const { accessToken, refreshToken, accessTokenExpiresAt } = await getTokens();
  if (!refreshToken) return null;

  // Check if access token is still valid (with 30s buffer)
  if (accessToken && Date.now() < accessTokenExpiresAt - 30000) {
    return accessToken;
  }

  // Refresh it
  try {
    const res = await fetch(`${CONVEX_SITE_URL}/auth/refresh`, {
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

// ─── UI helpers ───────────────────────────────────────────────────────────────

function showLoginView() {
  document.getElementById("login-view").style.display = "flex";
  document.getElementById("clips-view").style.display = "none";
  document.getElementById("logout-btn").style.display = "none";
  document.getElementById("count").textContent = "";
}

function showClipsView() {
  document.getElementById("login-view").style.display = "none";
  document.getElementById("clips-view").style.display = "block";
  document.getElementById("logout-btn").style.display = "inline-block";
}

// ─── Login ────────────────────────────────────────────────────────────────────

document.getElementById("login-btn").addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const errorEl = document.getElementById("login-error");
  const btn = document.getElementById("login-btn");

  if (!email || !password) {
    errorEl.textContent = "Email and password required";
    return;
  }

  btn.disabled = true;
  btn.textContent = "Signing in...";
  errorEl.textContent = "";

  try {
    const res = await fetch(`${CONVEX_SITE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    await saveTokens(data);
    showClipsView();
    loadClips();
  } catch (e) {
    errorEl.textContent = e.message;
  } finally {
    btn.disabled = false;
    btn.textContent = "Sign in";
  }
});

// Allow Enter key to submit login
document.getElementById("password").addEventListener("keydown", (e) => {
  if (e.key === "Enter") document.getElementById("login-btn").click();
});

// ─── Logout ───────────────────────────────────────────────────────────────────

document.getElementById("logout-btn").addEventListener("click", async () => {
  const { accessToken } = await getTokens();
  if (accessToken) {
    fetch(`${CONVEX_SITE_URL}/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessToken }),
    }).catch(() => {});
  }
  await clearTokens();
  showLoginView();
});

// ─── Clips ────────────────────────────────────────────────────────────────────

let allClips = [];

async function loadClips() {
  const accessToken = await getValidAccessToken();
  if (!accessToken) { showLoginView(); return; }

  try {
    const res = await fetch(`${CONVEX_SITE_URL}/clips`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    allClips = await res.json();
    renderClips(allClips);
  } catch (e) {
    console.error("Failed to load clips", e);
  }
}

function renderClips(clips) {
  const container = document.getElementById("clips");
  const count = document.getElementById("count");
  count.textContent = `${clips.length} clip${clips.length !== 1 ? "s" : ""}`;

  if (clips.length === 0) {
    container.innerHTML = '<div id="empty">No clips yet</div>';
    return;
  }

  // Show only top 5 clips
  const topClips = clips.slice(0, 5);

  container.innerHTML = topClips
    .map((clip, i) => {
      const time = new Date(clip.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const { icon, type } = getClipIcon(clip.content);
      const preview = getClipPreview(clip.content);
      return `
        <div class="clip" data-index="${i}">
          <div class="clip-icon ${type}">${icon}</div>
          <div class="clip-content">
            <div class="clip-text">${preview}</div>
            <div class="clip-time">${time}</div>
          </div>
        </div>`;
    })
    .join("");

  container.querySelectorAll(".clip").forEach((el) => {
    el.addEventListener("click", () => {
      const clip = topClips[+el.dataset.index];
      navigator.clipboard.writeText(clip.content);
    });
  });
}

function getClipIcon(content) {
  if (/^https?:\/\//.test(content)) return { icon: "↗", type: "link" };
  if (/^data:image/.test(content)) return { icon: "◻", type: "image" };
  if (/^```|^function|^const|^let|^var|^class|^import|^export/.test(content)) return { icon: "<>", type: "code" };
  if (/^{|^\[/.test(content.trim())) return { icon: "<>", type: "code" };
  if (/^Screenshot|^Image|^Photo/.test(content)) return { icon: "◻", type: "screenshot" };
  return { icon: "T", type: "text" };
}

function getClipPreview(content) {
  if (content.length > 60) {
    return content.substring(0, 60) + "...";
  }
  return content;
}

// ─── Init ─────────────────────────────────────────────────────────────────────

async function init() {
  const accessToken = await getValidAccessToken();
  if (accessToken) {
    showClipsView();
    loadClips();
  } else {
    showLoginView();
  }
}

init();
