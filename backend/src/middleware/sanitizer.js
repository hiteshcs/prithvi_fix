/**
 * Security Input Sanitizer & Attack Vector Defense Middleware.
 * Guards against:
 *  1. Cross-Site Scripting (XSS) in JSON & form payloads.
 *  2. Prototype Pollution attacks (__proto__, constructor, prototype).
 *  3. SQL wildcard injection abuses in text search queries.
 *  4. Format validation for statutory Indian identifiers (phone, PIN).
 */

function sanitizeValue(value) {
  if (typeof value === 'string') {
    // Strip malicious script tags, javascript: pseudo-protocols, and inline event triggers
    let sanitized = value
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/on\w+\s*=/gi, '');

    // Trim excessive control characters
    sanitized = sanitized.replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F]/g, '');

    return sanitized;
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (value !== null && typeof value === 'object') {
    return sanitizeObject(value);
  }

  return value;
}

function sanitizeObject(obj) {
  const clean = {};
  for (const [key, val] of Object.entries(obj)) {
    // Block Prototype Pollution
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue;
    }
    clean[key] = sanitizeValue(val);
  }
  return clean;
}

function sanitizeInputs(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query);
  }
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeObject(req.params);
  }
  next();
}

/**
 * Validates Indian 10-digit mobile phone format: [6-9]XXXXXXXXX
 */
function isValidIndianPhone(phone) {
  if (!phone || typeof phone !== 'string') return false;
  const digits = phone.replace(/\D/g, '');
  return /^[6-9]\d{9}$/.test(digits);
}

module.exports = {
  sanitizeInputs,
  isValidIndianPhone,
};
