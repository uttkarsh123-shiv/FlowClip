export function sanitizeText(input) {
  if (typeof input !== 'string') return '';
  return input
    .trim()
    .slice(0, 10000) 
    .replace(/\0/g, '');
}

export function sanitizeUrl(url) {
  if (typeof url !== 'string') return '';
  
  const urlPattern = /^https?:\/\/.+/i;
  const trimmedUrl = url.trim();
  
  if (!urlPattern.test(trimmedUrl)) return '';
  
  if (trimmedUrl.toLowerCase().startsWith('javascript:') || 
      trimmedUrl.toLowerCase().startsWith('data:')) {
    return '';
  }
  
  return trimmedUrl.slice(0, 2048); // Limit URL length
}

export function validateEmail(email) {
  if (typeof email !== 'string') return false;
  
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email) && email.length <= 254;
}

export function sanitizeName(name) {
  if (typeof name !== 'string') return '';
  
  return name
    .trim()
    .slice(0, 100) // Reasonable name length
    .replace(/\0/g, ''); // Remove null bytes
}

export function validatePassword(password) {
  if (typeof password !== 'string') return false;
  
  // Basic password validation
  return password.length >= 8 && password.length <= 128;
}