export function sanitizeText(input) {
  if (typeof input !== "string") return "";
  return input.trim().slice(0, 10000).replace(/\0/g, "");
}

export function sanitizeUrl(url) {
  if (typeof url !== "string") return "";
  const trimmed = url.trim();
  if (!/^https?:\/\/.+/i.test(trimmed)) return "";
  return trimmed.slice(0, 2048);
}

export function validateEmail(email) {
  if (typeof email !== "string") return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

export function sanitizeName(name) {
  if (typeof name !== "string") return "";
  return name.trim().slice(0, 100).replace(/\0/g, "");
}

export function validatePassword(password) {
  if (typeof password !== "string") return false;
  return password.length >= 8 && password.length <= 128;
}
