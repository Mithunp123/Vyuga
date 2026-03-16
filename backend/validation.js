// ── Input Validation & Sanitization Helpers ──────────────────────────────────
// Prevents XSS, script injection, command injection, and enforces strict types.

// Strip HTML tags and dangerous characters
function stripHtml(str) {
  if (typeof str !== 'string') return ''
  return str
    .replace(/[<>]/g, '')           // remove angle brackets (XSS)
    .replace(/javascript:/gi, '')   // remove JS protocol
    .replace(/on\w+\s*=/gi, '')     // remove inline event handlers
    .replace(/\0/g, '')             // remove null bytes
    .trim()
}

// Sanitize a plain text field (name, title, description, etc.)
function sanitizeText(val, maxLen = 500) {
  if (val == null) return ''
  return stripHtml(String(val)).slice(0, maxLen)
}

// Validate email format
const EMAIL_RE = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/
function isValidEmail(val) {
  return typeof val === 'string' && EMAIL_RE.test(val.trim()) && val.length <= 254
}

// Validate phone: exactly 10 digits
const PHONE_RE = /^\d{10}$/
function isValidPhone(val) {
  return typeof val === 'string' && PHONE_RE.test(val.trim())
}

// Validate UUID v4 format
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
function isValidUUID(val) {
  return typeof val === 'string' && UUID_RE.test(val.trim())
}

// Validate URL (http/https only)
function isValidURL(val) {
  if (typeof val !== 'string' || val.length > 2048) return false
  try {
    const u = new URL(val)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

// Validate integer within range
function isValidInt(val, min = 0, max = 100000) {
  const n = parseInt(val, 10)
  return !isNaN(n) && n >= min && n <= max
}

// Validate enum value
function isValidEnum(val, allowed) {
  return typeof val === 'string' && allowed.includes(val)
}

// Collect validation errors
function validate(rules) {
  const errors = []
  for (const { field, check, msg } of rules) {
    if (!check) errors.push(`${field}: ${msg}`)
  }
  return errors
}

// Sanitize a filename to prevent path traversal and command injection
function sanitizeFilename(name) {
  if (typeof name !== 'string') return 'file'
  // Keep only alphanumerics, dots, hyphens, underscores
  return name.replace(/[^a-zA-Z0-9._\-]/g, '_').slice(0, 200)
}

// Check image magic bytes (PNG, JPEG, WEBP)
const IMAGE_MAGIC = {
  png: Buffer.from([0x89, 0x50, 0x4E, 0x47]),
  jpg: Buffer.from([0xFF, 0xD8, 0xFF]),
  webp_riff: Buffer.from('RIFF'),
  webp_webp: Buffer.from('WEBP'),
}
function isValidImageBuffer(buffer) {
  if (!buffer || buffer.length < 12) return false
  if (buffer.slice(0, 4).equals(IMAGE_MAGIC.png)) return true
  if (buffer.slice(0, 3).equals(IMAGE_MAGIC.jpg)) return true
  if (buffer.slice(0, 4).equals(IMAGE_MAGIC.webp_riff) && buffer.slice(8, 12).equals(IMAGE_MAGIC.webp_webp)) return true
  return false
}

// Check video magic bytes (MP4, MOV, AVI, MKV, WEBM)
const VIDEO_MAGIC = {
  avi: Buffer.from('RIFF'),
  mkv_webm: Buffer.from([0x1A, 0x45, 0xDF, 0xA3]),
}
function isValidVideoFile(buffer) {
  if (!buffer || buffer.length < 12) return false
  // MP4/MOV: ftyp box at offset 4
  if (buffer.slice(4, 8).toString() === 'ftyp') return true
  // AVI: RIFF....AVI
  if (buffer.slice(0, 4).equals(VIDEO_MAGIC.avi) && buffer.slice(8, 11).toString() === 'AVI') return true
  // MKV/WEBM: EBML header
  if (buffer.slice(0, 4).equals(VIDEO_MAGIC.mkv_webm)) return true
  return false
}

module.exports = {
  stripHtml,
  sanitizeText,
  isValidEmail,
  isValidPhone,
  isValidUUID,
  isValidURL,
  isValidInt,
  isValidEnum,
  validate,
  sanitizeFilename,
  isValidImageBuffer,
  isValidVideoFile,
}
