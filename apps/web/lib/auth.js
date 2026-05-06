const CONVEX_SITE_URL = process.env.NEXT_PUBLIC_CONVEX_SITE_URL;

// ─── Token storage ────────────────────────────────────────────────────────────

export function getAccessToken() {
  return localStorage.getItem("accessToken");
}

export function getRefreshToken() {
  return localStorage.getItem("refreshToken");
}

export function saveTokens({ accessToken, refreshToken, accessTokenExpiresAt, refreshTokenExpiresAt }) {
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", refreshToken);
  localStorage.setItem("accessTokenExpiresAt", accessTokenExpiresAt);
  localStorage.setItem("refreshTokenExpiresAt", refreshTokenExpiresAt);
}

export function clearTokens() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("accessTokenExpiresAt");
  localStorage.removeItem("refreshTokenExpiresAt");
}

export function isAccessTokenExpired() {
  const expiresAt = localStorage.getItem("accessTokenExpiresAt");
  if (!expiresAt) return true;
  return Date.now() > parseInt(expiresAt) - 30000; // 30s buffer
}

// ─── API calls ────────────────────────────────────────────────────────────────

export async function register(email, password, name) {
  const res = await fetch(`${CONVEX_SITE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  saveTokens(data);
  return data;
}

export async function login(email, password) {
  const res = await fetch(`${CONVEX_SITE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  saveTokens(data);
  return data;
}

export async function logout() {
  const accessToken = getAccessToken();
  if (accessToken) {
    await fetch(`${CONVEX_SITE_URL}/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessToken }),
    }).catch(() => {}); // best effort
  }
  clearTokens();
}

export async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error("No refresh token");

  const res = await fetch(`${CONVEX_SITE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  const data = await res.json();
  if (!res.ok) {
    clearTokens();
    throw new Error(data.error);
  }
  localStorage.setItem("accessToken", data.accessToken);
  localStorage.setItem("accessTokenExpiresAt", data.accessTokenExpiresAt);
  return data.accessToken;
}

// Returns a valid access token, refreshing if needed
export async function getValidAccessToken() {
  if (isAccessTokenExpired()) {
    return await refreshAccessToken();
  }
  return getAccessToken();
}
