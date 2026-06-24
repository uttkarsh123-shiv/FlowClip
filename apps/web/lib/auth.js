const CONVEX_SITE_URL = process.env.NEXT_PUBLIC_CONVEX_SITE_URL;

let _accessToken = null;
let _accessTokenExpiresAt = 0;

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
  return Date.now() > _accessTokenExpiresAt - 30000;
}

async function persistRefreshToken(refreshToken, refreshTokenExpiresAt) {
  await fetch("/api/auth/set-cookie", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken, refreshTokenExpiresAt }),
  });
}

async function clearRefreshCookie() {
  await fetch("/api/auth/clear-cookie", { method: "POST" });
}

export async function register(email, password, name) {
  const res = await fetch(`${CONVEX_SITE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  setAccessToken(data.accessToken, data.accessTokenExpiresAt);
  await persistRefreshToken(data.refreshToken, data.refreshTokenExpiresAt);
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
  setAccessToken(data.accessToken, data.accessTokenExpiresAt);
  await persistRefreshToken(data.refreshToken, data.refreshTokenExpiresAt);
  return data;
}

export async function logout() {
  const token = getAccessToken();
  if (token) {
    fetch(`${CONVEX_SITE_URL}/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessToken: token }),
    }).catch(() => {});
  }
  clearAccessToken();
  await clearRefreshCookie();
}

export async function refreshAccessToken() {
  const res = await fetch("/api/auth/refresh", { method: "POST" });
  const data = await res.json();
  if (!res.ok) {
    clearAccessToken();
    throw new Error(data.error);
  }
  setAccessToken(data.accessToken, data.accessTokenExpiresAt);
  return data.accessToken;
}

export async function getValidAccessToken() {
  if (!isAccessTokenExpired()) return getAccessToken();
  return await refreshAccessToken();
}
