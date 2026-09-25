let _accessToken = null;
let _accessTokenExpiresAt = 0;

// In-flight refresh promise — prevents duplicate refresh calls
// when multiple components call getValidAccessToken simultaneously
let _refreshPromise = null;

export function getAccessToken() {
  return _accessToken;
}

function setAccessToken(token, expiresAt) {
  _accessToken = token;
  _accessTokenExpiresAt = expiresAt;
}

function clearAccessToken() {
  _accessToken = null;
  _accessTokenExpiresAt = 0;
}

function isAccessTokenExpired() {
  return Date.now() > _accessTokenExpiresAt - 30000; // 30s buffer
}

// ─── Register ─────────────────────────────────────────────────────────────────
export async function register(email, password, name) {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error);

  setAccessToken(data.accessToken, data.accessTokenExpiresAt);
  return data;
}

// ─── Login ────────────────────────────────────────────────────────────────────
export async function login(email, password) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error);

  setAccessToken(data.accessToken, data.accessTokenExpiresAt);
  return data;
}

// ─── Logout ───────────────────────────────────────────────────────────────────
export async function logout() {
  const token = getAccessToken();

  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessToken: token }),
    });
  } catch (e) {
    console.error("[logout] session revocation failed:", e);
  }

  clearAccessToken();
}

// ─── Refresh ──────────────────────────────────────────────────────────────────
export async function refreshAccessToken() {
  // /api/auth/refresh reads the HTTP-only cookie automatically
  const res = await fetch("/api/auth/refresh", { method: "POST" });
  const data = await res.json();

  if (!res.ok) {
    clearAccessToken();
    throw new Error(data.error ?? "Token refresh failed");
  }

  setAccessToken(data.accessToken, data.accessTokenExpiresAt);
  return data.accessToken;
}

// ─── Get valid token (deduped) ────────────────────────────────────────────────
// Deduplication prevents race condition where two components mount simultaneously,
// both see an expired token, and both fire /api/auth/refresh
export async function getValidAccessToken() {
  if (!isAccessTokenExpired()) return getAccessToken();

  if (!_refreshPromise) {
    _refreshPromise = refreshAccessToken().finally(() => {
      _refreshPromise = null;
    });
  }

  return _refreshPromise;
}
