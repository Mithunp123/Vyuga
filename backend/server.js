require('dotenv').config()
const express = require('express')
const cors = require('cors')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { exec } = require('child_process')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const supabase = require('./supabase')
const {
  sanitizeText, isValidEmail, isValidPhone, isValidUUID,
  isValidURL, isValidInt, isValidEnum, validate,
  sanitizeFilename, isValidImageBuffer, isValidVideoFile,
} = require('./validation')
const {
  sendInnovationCollegeConfirmation,
  sendInnovationPwdConfirmation,
  sendTalentOrgConfirmation,
  sendTalentStudentConfirmation,
  sendCricketConfirmation,
  sendChessConfirmation,
  sendShortFilmConfirmation,
  sendStatusUpdateEmail,
  transporter,
} = require('./mailer')

const crypto = require('crypto')
const Razorpay = require('razorpay')

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

function verifyRazorpaySignature(orderId, paymentId, signature) {
  if (!orderId || !paymentId || !signature) return false;
  const generated = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(orderId + '|' + paymentId)
    .digest('hex');
  return generated === signature;
}

function normalizeGradeCategory(raw) {
  const input = String(raw || '').trim()
  if (!input) return null

  // Handle values like 1-5, 1–5 and even mojibake variants by extracting numeric ranges.
  const nums = (input.match(/\d+/g) || []).map(Number)
  if (nums.length >= 2) {
    const range = `${nums[0]}-${nums[1]}`
    if (['1-5', '6-8', '9-12'].includes(range)) return range
  }

  const normalized = input.replace(/[–—−]/g, '-').replace(/\s+/g, '')
  if (['1-5', '6-8', '9-12'].includes(normalized)) return normalized

  return null
}

const app = express()
app.set('trust proxy', 1)  // trust first proxy (Nginx/Cloudflare)
const PORT = process.env.PORT || 3001
const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads'
const MAX_MB = parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10)

// Ensure uploads folder exists
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true })
const ID_DIR = path.join(UPLOAD_DIR, 'ID')
if (!fs.existsSync(ID_DIR)) fs.mkdirSync(ID_DIR, { recursive: true })

// Ã¢â€â‚¬Ã¢â€â‚¬ Middleware Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: false }))
const ALLOWED_ORIGINS = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(',').map(o => o.trim()).filter(Boolean)
  : ['*']

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, Postman)
    if (!origin) return callback(null, true)
    if (ALLOWED_ORIGINS.includes('*') || ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true)
    }
    callback(new Error(`CORS: origin '${origin}' not allowed`))
  },
  credentials: true,
}))
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true, limit: '1mb' }))
// Serve uploaded files with permissive CORS for cross-origin frontend
app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
  res.setHeader('Access-Control-Allow-Origin', '*')
  next()
}, express.static(UPLOAD_DIR))

// Serve assets folder matching uploads pattern
app.use('/assets', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
  res.setHeader('Access-Control-Allow-Origin', '*')
  next()
}, express.static(path.join(__dirname, 'assets')))

// Ã¢â€â‚¬Ã¢â€â‚¬ Rate limiters Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 200,                   // 200 requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
})
app.use('/api/', globalLimiter)

const registrationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,                    // 10 registrations per 15 min per IP
  message: { success: false, message: 'Too many registration attempts. Please wait and try again.' },
})

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,                    // 10 login attempts per 15 min per IP
  message: { success: false, message: 'Too many login attempts. Please wait and try again.' },
})

const errorReportLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 30,                    // 30 error reports per 5 min per IP
  message: { success: false, message: 'Too many error reports.' },
})

// Ã¢â€â‚¬Ã¢â€â‚¬ Multer Ã¢â‚¬â€œ Innovation Forms (Prototype & UDID) Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
// Uses memory storage so we can rename using the phone number from req.body
const memStorage = multer.memoryStorage()
const ALLOWED_IMAGE_EXT = /\.(png|jpe?g|webp)$/i
const ALLOWED_DOC_EXT = /\.(pdf|png|jpe?g|webp)$/i
const ALLOWED_PPT_EXT = /\.(pdf|ppt|pptx)$/i

const innovationUpload = multer({
  storage: memStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // increased to 10MB to accommodate PPTs
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'prototypeImage') {
      if (!ALLOWED_IMAGE_EXT.test(file.originalname)) {
        return cb(new Error('Only image files (PNG, JPG, WEBP) are allowed for prototype'))
      }
      const safeMime = /^image\/(png|jpe?g|webp)$/i
      if (!safeMime.test(file.mimetype)) {
        return cb(new Error('Invalid image MIME type'))
      }
    } else if (file.fieldname === 'udidCard') {
      if (!ALLOWED_DOC_EXT.test(file.originalname)) {
        return cb(new Error('Only PDF or image files are allowed for UDID card'))
      }
      const safeMime = /^(image\/(png|jpe?g|webp)|application\/pdf)$/i
      if (!safeMime.test(file.mimetype)) {
        return cb(new Error('Invalid file type for UDID card'))
      }
    } else if (file.fieldname === 'pptFile') {
      if (!ALLOWED_PPT_EXT.test(file.originalname)) {
        return cb(new Error('Only PPT, PPTX or PDF files are allowed for the presentation'))
      }
      const safeMime = /^(application\/pdf|application\/vnd\.ms-powerpoint|application\/vnd\.openxmlformats-officedocument\.presentationml\.presentation)$/i
      if (!safeMime.test(file.mimetype)) {
        return cb(new Error('Invalid file type for the presentation'))
      }
    }
    cb(null, true)
  },
})

// Ã¢â€â‚¬Ã¢â€â‚¬ Multer (video uploads for talent nominations) Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
const ALLOWED_VIDEO_EXT = /\.(mp4|mov|avi|mkv|webm)$/i
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    // Sanitize phone to digits-only, sanitize extension
    const phone = (req.body.guardianPhone || 'unknown').replace(/\D/g, '').slice(0, 15)
    const ext = path.extname(sanitizeFilename(file.originalname))
    cb(null, `${phone}_${Date.now()}${ext}`)
  },
})
const upload = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200 MB for ~3 min video
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_VIDEO_EXT.test(file.originalname)) {
      return cb(new Error('Only video files (MP4, MOV, AVI, MKV, WEBM) are allowed'))
    }
    const safeMime = /^video\/(mp4|quicktime|x-msvideo|x-matroska|webm)$/i
    if (!safeMime.test(file.mimetype)) {
      return cb(new Error('Invalid video MIME type'))
    }
    cb(null, true)
  },
})

// Ã¢â€â‚¬Ã¢â€â‚¬ Multer (Sponsor Logo) Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
const LOGO_DIR = path.join(UPLOAD_DIR, 'logo')
if (!fs.existsSync(LOGO_DIR)) fs.mkdirSync(LOGO_DIR, { recursive: true })

const sponsorStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, LOGO_DIR),
  filename: (req, file, cb) => {
    const safeName = (req.body.orgName || 'sponsor').replace(/[^a-z0-9]/gi, '_').toLowerCase()
    const ext = path.extname(sanitizeFilename(file.originalname))
    cb(null, `${safeName}_${Date.now()}${ext}`)
  },
})

const sponsorUpload = multer({
  storage: sponsorStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_IMAGE_EXT.test(file.originalname)) {
      return cb(new Error('Only image files (PNG, JPG, WEBP) are allowed'))
    }
    cb(null, true)
  },
})

// Ã¢â€â‚¬Ã¢â€â‚¬ Multer (Gallery Images) Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
const GALLERY_DIR = path.join(UPLOAD_DIR, 'gallery')
if (!fs.existsSync(GALLERY_DIR)) fs.mkdirSync(GALLERY_DIR, { recursive: true })

const galleryStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, GALLERY_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(sanitizeFilename(file.originalname))
    cb(null, `gallery_${Date.now()}${ext}`)
  },
})

const galleryUpload = multer({
  storage: galleryStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_IMAGE_EXT.test(file.originalname)) {
      return cb(new Error('Only image files (PNG, JPG, WEBP) are allowed'))
    }
    const safeMime = /^image\/(png|jpe?g|webp)$/i
    if (!safeMime.test(file.mimetype)) {
      return cb(new Error('Invalid image MIME type'))
    }
    cb(null, true)
  },
})

// Ã¢â€â‚¬Ã¢â€â‚¬ Video compression with ffmpeg Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
function compressVideoWithFFmpeg(inputPath) {
  return new Promise((resolve) => {
    // Validate path has no shell metacharacters
    if (/[;&|`$]/.test(inputPath)) {
      console.warn('[ffmpeg] unsafe characters in path, skipping compression')
      resolve(inputPath)
      return
    }

    const ext = path.extname(inputPath)
    const outputPath = inputPath.replace(ext, '_compressed.mp4')

    // Check if ffmpeg is available
    exec('ffmpeg -version', (checkErr) => {
      if (checkErr) {
        console.warn('[ffmpeg] not found, skipping server-side compression')
        resolve(inputPath)
        return
      }

      // Use execFile-style argument quoting to prevent injection
      const safeInput = inputPath.replace(/"/g, '')
      const safeOutput = outputPath.replace(/"/g, '')
      const cmd = [
        'ffmpeg', '-y', '-i', `"${safeInput}"`,
        '-vcodec', 'libx264',
        '-crf', '28',
        '-preset', 'fast',
        '-vf', 'scale=-2:720',
        '-acodec', 'aac',
        '-b:a', '96k',
        '-movflags', '+faststart',
        `"${safeOutput}"`,
      ].join(' ')

      exec(cmd, (err) => {
        if (err) {
          console.error('[ffmpeg] compression failed:', err.message)
          resolve(inputPath)
          return
        }
        try { fs.unlinkSync(inputPath) } catch (_) { /* ignore */ }
        resolve(outputPath)
      })
    })
  })
}

// Ã¢â€â‚¬Ã¢â€â‚¬ Health check Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

// Ã¢â€â‚¬Ã¢â€â‚¬ Error logging helper Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
function sanitizeBody(body) {
  if (!body) return null
  const clean = { ...body }
  // Remove sensitive fields
  delete clean.password
  delete clean.token
  delete clean.adminNote
  return clean
}

async function logError({ source, endpoint, method, errorType, message, stack, req }) {
  try {
    await supabase.from('error_logs').insert([{
      source,
      endpoint,
      method,
      error_type: errorType,
      message: String(message).slice(0, 2000),
      stack: stack ? String(stack).slice(0, 4000) : null,
      request_body: req ? sanitizeBody(req.body) : null,
      user_agent: req?.headers?.['user-agent'] || null,
      ip_address: req?.ip || req?.connection?.remoteAddress || null,
    }])
  } catch (e) {
    console.error('[error-log] Failed to log error:', e.message)
  }
}

// Ã¢â€â‚¬Ã¢â€â‚¬ Client-side error reporting Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
app.post('/api/log-error', errorReportLimiter, async (req, res) => {
  const { endpoint, errorType, message, stack } = req.body
  if (!message || typeof message !== 'string') return res.status(400).json({ success: false, message: 'message is required' })
  await logError({
    source: 'user',
    endpoint: sanitizeText(endpoint, 200) || '/unknown',
    method: 'CLIENT',
    errorType: sanitizeText(errorType, 50) || 'client_error',
    message: sanitizeText(message, 2000),
    stack: stack ? sanitizeText(String(stack), 4000) : null,
    req,
  })
  res.json({ success: true })
})

// Ã¢â€â‚¬Ã¢â€â‚¬ Razorpay Payment Invoice Creation Helper Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
async function createRazorpayInvoice({ eventType, name, email, phone }) {
  let baseFee = parseInt(process.env.REGISTRATION_FEE_PAISE || '9900', 10);
  if (eventType) {
    const { data: setting } = await supabase
      .from('form_settings')
      .select('registration_fee_paise')
      .eq('id', eventType)
      .maybeSingle();
    if (setting && setting.registration_fee_paise != null) {
      baseFee = setting.registration_fee_paise;
    } else if (eventType === 'talent-combined') {
      // Fallback: use 'talent-org' record which holds the correct ₹399 fee
      const { data: fallback } = await supabase
        .from('form_settings')
        .select('registration_fee_paise')
        .eq('id', 'talent-org')
        .maybeSingle();
      if (fallback && fallback.registration_fee_paise != null) {
        baseFee = fallback.registration_fee_paise;
      }
    }
  }

  const gstAmount = Math.round(baseFee * 18 / 100);
  const totalAmount = baseFee + gstAmount;

  const EVENT_NAME_MAP = {
    'innovation-college': 'Inclusive Innovation Fest For Specially Abled (College)',
    'innovation-pwd': 'Inclusive Innovation Fest By Specially Abled',
    'talent-org': 'Special Talent Utsav  Organization Registration',
    'talent-student': 'Special Talent Utsav Student Nomination',
    'talent-combined': 'Special Talent Utsav Nomination',
    'shortfilm': 'Short Film Competition',
    'short-film': 'Short Film Competition',
    'cricket': 'Blind Cricket Tournament',
    'chess': 'Blind Chess Competition',
  };
  const eventLabel = EVENT_NAME_MAP[eventType] || 'Event Registration';
  const receiptId = `rcpt_${eventType || 'event'}_${Date.now()}`.slice(0, 40);

  const expireBy = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60; // 7 days from now

  const options = {
    type: "invoice",
    description: "VYUGA Event Registration",
    receipt: receiptId,
    customer: {
      name: sanitizeText(name, 100) || 'Customer',
      email: email ? email.trim().toLowerCase() : undefined,
      contact: phone ? phone.trim() : undefined,
    },
    line_items: [
      { name: `${eventLabel} - Event Fee`, amount: baseFee, currency: "INR", quantity: 1 },
      { name: `${eventLabel} - GST (18%)`, amount: gstAmount, currency: "INR", quantity: 1 }
    ],
    sms_notify: 0,
    email_notify: 0,
    currency: "INR",
    expire_by: expireBy,
    callback_url: `${process.env.FRONTEND_URL || process.env.CLIENT_ORIGIN || "http://localhost:5173"}/payment-success`,
    callback_method: "get",
  };

  console.log('[Razorpay] Creating invoice for', eventType, '| fee:', baseFee, 'paise | expire_by:', expireBy);
  const invoice = await razorpay.invoices.create(options);
  console.log('[Razorpay] Invoice created:', invoice.id, '| short_url:', invoice.short_url);
  const invoiceNumber = `VYG-${Date.now().toString().slice(-8)}`;
  const invoiceRef = invoice.id || invoice.order_id;

  return { invoice, invoiceRef, receiptId: invoice.receipt || receiptId, totalAmount, baseFee, gstAmount, invoiceNumber };
}

// Create Razorpay order for client-side checkout flow
app.post('/api/payment/create-order', async (req, res) => {
  try {
    const { name, email, phone, eventType } = req.body || {}
    if (!name || !email || !phone || !eventType) {
      return res.status(400).json({ success: false, message: 'name, email, phone and eventType are required' })
    }

    const normalizedEventType = eventType === 'specialtalent' ? 'talent-combined' : eventType
    let baseAmount = parseInt(process.env.REGISTRATION_FEE_PAISE || '9900', 10)

    const { data: setting } = await supabase
      .from('form_settings')
      .select('registration_fee_paise')
      .eq('id', normalizedEventType)
      .maybeSingle()

    if (setting && setting.registration_fee_paise != null) {
      baseAmount = parseInt(setting.registration_fee_paise, 10)
    }

    const gstAmount = Math.round(baseAmount * 18 / 100)
    const totalAmount = baseAmount + gstAmount
    const receiptId = `rcpt_${normalizedEventType}_${Date.now()}`.slice(0, 40)

    const order = await razorpay.orders.create({
      amount: totalAmount,
      currency: 'INR',
      receipt: receiptId,
      notes: {
        event_type: normalizedEventType,
        payer_name: sanitizeText(name, 100),
        payer_email: String(email).trim().toLowerCase(),
        payer_phone: String(phone).trim(),
        base_amount: String(baseAmount),
        gst_amount: String(gstAmount),
      },
    })

    const invoiceNumber = `VYG-${Date.now().toString().slice(-8)}`
    await supabase.from('payments').insert([{
      razorpay_order_id: order.id,
      event_type: normalizedEventType,
      amount: totalAmount,
      base_amount: baseAmount,
      gst_amount: gstAmount,
      payer_name: sanitizeText(name, 100),
      payer_email: String(email).trim().toLowerCase(),
      payer_phone: String(phone).trim(),
      receipt_id: receiptId,
      invoice_number: invoiceNumber,
      status: 'created',
      registration_id: null,
    }])

    return res.json({
      success: true,
      keyId: process.env.RAZORPAY_KEY_ID,
      orderId: order.id,
      amount: totalAmount,
      currency: 'INR',
      baseAmount,
      gstAmount,
      receipt_id: receiptId,
    })
  } catch (err) {
    await logError({ source: 'user', endpoint: '/api/payment/create-order', method: 'POST', errorType: 'server_error', message: err.message, stack: err.stack, req })
    return res.status(500).json({ success: false, message: err.message })
  }
})

async function processSuccessfulPayment({ payment, orderId, paymentId, source }) {
  console.log(`[${source}] processSuccessfulPayment invoked:`, {
    paymentId: payment?.id,
    eventType: payment?.event_type,
    registrationId: payment?.registration_id,
    orderId,
    razorpayPaymentId: paymentId,
    payerEmail: payment?.payer_email,
    status: payment?.status,
  })

  if (!payment || !payment.registration_id) {
    console.log(`[${source}] processSuccessfulPayment skipped - missing payment or registration_id`)
    return
  }

  const tableMap = {
    'innovation-college': 'innovation_college_registrations',
    'innovation-pwd': 'innovation_pwd_registrations',
    'talent-org': 'talent_organizations',
    'talent-student': 'talent_nominations',
    'talent-combined': 'talent_nominations',
    'shortfilm': 'shortfilm_registrations',
    'short-film': 'shortfilm_registrations',
    'cricket': 'cricket_team_registrations',
    'chess': 'blind_chess_registrations'
  }

  const table = tableMap[payment.event_type]
  console.log(`[${source}] resolved registration table:`, table || 'none')
  if (table) {
    await supabase.from(table).update({ payment_status: 'paid' }).eq('id', payment.registration_id)
    console.log(`[${source}] Registration marked paid in`, table)
  }

  try {
    if (!table) return
    const { data: reg } = await supabase.from(table).select('*').eq('id', payment.registration_id).single()
    if (!reg) return

    const et = payment.event_type
    const paymentDetails = {
      paymentStatus: 'Paid',
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
    }

    if (et === 'innovation-college') {
      await sendInnovationCollegeConfirmation({
        teamName: reg.team_name, collegeName: reg.college_name, theme: reg.theme,
        ideaTitle: reg.idea_title, ideaDescription: reg.idea_description,
        member1Name: reg.leader_name || reg.name, member1Email: reg.leader_email || reg.email, member1Phone: reg.leader_phone || reg.phone,
        member2Name: reg.members?.[0]?.name, member2Email: reg.members?.[0]?.email, member2Phone: reg.members?.[0]?.phone,
        member3Name: reg.members?.[1]?.name, member3Email: reg.members?.[1]?.email, member3Phone: reg.members?.[1]?.phone,
        ...paymentDetails,
      })
    } else if (et === 'innovation-pwd') {
      await sendInnovationPwdConfirmation({
        participationType: reg.participation_type,
        ideaTitle: reg.idea_title, ideaDescription: reg.idea_description,
        member1Name: reg.name, member1Email: reg.email, member1Phone: reg.phone,
        member1DisabilityType: reg.disability_type,
        member2Name: reg.members?.[0]?.name, member2Email: reg.members?.[0]?.email, member2Phone: reg.members?.[0]?.phone,
        member3Name: reg.members?.[1]?.name, member3Email: reg.members?.[1]?.email, member3Phone: reg.members?.[1]?.phone,
        ...paymentDetails,
      })
    } else if (et === 'talent-org') {
      await sendTalentOrgConfirmation({
        orgName: reg.org_name, orgType: reg.org_type, orgFocus: reg.org_focus,
        disabilityTypes: reg.disability_types ? JSON.parse(reg.disability_types) : [],
        address: reg.address, studentCount: reg.student_count,
        contactName: reg.contact_name, contactEmail: reg.contact_email, contactPhone: reg.contact_phone,
        ...paymentDetails,
      })
    } else if (et === 'talent-student' || et === 'talent-combined') {
      await sendTalentStudentConfirmation({
        orgName: reg.org_name, studentName: reg.student_name, studentAge: reg.student_age,
        disabilityType: reg.disability_type, talentCategory: reg.talent_category,
        talentDescription: reg.talent_desc,
        guardianName: reg.guardian_name, guardianPhone: reg.guardian_phone,
        guardianEmail: reg.guardian_email, videoLink: reg.video_link || reg.performance_url,
        orgContactEmail: reg.contact_email || null,
        orgContactName: reg.contact_name || null,
        payerEmail: payment.payer_email || null,
        ...paymentDetails,
      })
    } else if (et === 'cricket') {
      await sendCricketConfirmation({
        teamName: reg.team_name, city: reg.city, state: reg.state,
        playerCount: reg.player_count, hasPlayedBefore: reg.has_played_before ? 'yes' : 'no',
        additionalInfo: reg.additional_info,
        contactName: reg.contact_name, contactEmail: reg.contact_email, contactPhone: reg.contact_phone,
        ...paymentDetails,
      })
    } else if (et === 'chess') {
      await sendChessConfirmation({
        participantName: reg.participant_name, email: reg.email, phone: reg.phone,
        age: reg.age, city: reg.city, state: reg.state,
        disabilityType: reg.disability_type, hasPlayedBefore: reg.has_played_before ? 'yes' : 'no',
        experienceLevel: reg.experience_level, additionalInfo: reg.additional_info,
      })
    } else if (et === 'shortfilm' || et === 'short-film') {
      await sendShortFilmConfirmation({
        filmTitle: reg.film_title,
        filmLanguage: reg.film_language,
        duration: reg.duration,
        genre: reg.genre,
        participationType: reg.participation_type,
        directorName: reg.director_name,
        filmUrl: reg.film_url,
        contactName: reg.contact_name,
        contactEmail: reg.contact_email,
        contactPhone: reg.contact_phone,
        ...paymentDetails,
      })
    }

    console.log(`[${source}] Confirmation email sent for ${et}`)
  } catch (confErr) {
    console.error(`[${source}] Failed to send confirmation email:`, confErr.message)
  }
}

async function findPaymentByRazorpayRefs({ invoiceId, orderId, receiptId }) {
  const orderCandidates = [invoiceId, orderId].filter(Boolean)

  for (const candidate of orderCandidates) {
    const { data } = await supabase
      .from('payments')
      .select('*')
      .eq('razorpay_order_id', candidate)
      .maybeSingle()

    if (data) {
      return { payment: data, matchKey: 'razorpay_order_id', matchValue: candidate }
    }
  }

  if (receiptId) {
    const { data } = await supabase
      .from('payments')
      .select('*')
      .eq('receipt_id', receiptId)
      .maybeSingle()

    if (data) {
      return { payment: data, matchKey: 'receipt_id', matchValue: receiptId }
    }
  }

  return { payment: null, matchKey: null, matchValue: null }
}

async function findRegistrationByRazorpayRefs({ invoiceId, orderId }) {
  const candidates = [invoiceId, orderId].filter(Boolean)
  if (!candidates.length) return null

  const sources = [
    {
      eventType: 'innovation-pwd',
      table: 'innovation_pwd_registrations',
      select: 'id, razorpay_order_id, name, email, phone',
      map: (row) => ({ registrationId: row.id, matchedOrderId: row.razorpay_order_id, payerName: row.name, payerEmail: row.email, payerPhone: row.phone })
    },
    {
      eventType: 'innovation-college',
      table: 'innovation_college_registrations',
      select: 'id, razorpay_order_id, leader_name, leader_email, leader_phone',
      map: (row) => ({ registrationId: row.id, matchedOrderId: row.razorpay_order_id, payerName: row.leader_name, payerEmail: row.leader_email, payerPhone: row.leader_phone })
    },
    {
      eventType: 'talent-org',
      table: 'talent_organizations',
      select: 'id, razorpay_order_id, contact_name, contact_email, contact_phone',
      map: (row) => ({ registrationId: row.id, matchedOrderId: row.razorpay_order_id, payerName: row.contact_name, payerEmail: row.contact_email, payerPhone: row.contact_phone })
    },
    {
      eventType: 'talent-combined',
      table: 'talent_nominations',
      select: 'id, razorpay_order_id, contact_name, contact_email, contact_phone, guardian_name, guardian_email, guardian_phone',
      map: (row) => ({ registrationId: row.id, matchedOrderId: row.razorpay_order_id, payerName: row.contact_name || row.guardian_name, payerEmail: row.contact_email || row.guardian_email, payerPhone: row.contact_phone || row.guardian_phone })
    },
    {
      eventType: 'shortfilm',
      table: 'shortfilm_registrations',
      select: 'id, razorpay_order_id, contact_name, contact_email, contact_phone',
      map: (row) => ({ registrationId: row.id, matchedOrderId: row.razorpay_order_id, payerName: row.contact_name, payerEmail: row.contact_email, payerPhone: row.contact_phone })
    },
    {
      eventType: 'short-film',
      table: 'shortfilm_registrations',
      select: 'id, razorpay_order_id, contact_name, contact_email, contact_phone',
      map: (row) => ({ registrationId: row.id, matchedOrderId: row.razorpay_order_id, payerName: row.contact_name, payerEmail: row.contact_email, payerPhone: row.contact_phone })
    },
    {
      eventType: 'cricket',
      table: 'cricket_team_registrations',
      select: 'id, razorpay_order_id, contact_name, contact_email, contact_phone',
      map: (row) => ({ registrationId: row.id, matchedOrderId: row.razorpay_order_id, payerName: row.contact_name, payerEmail: row.contact_email, payerPhone: row.contact_phone })
    },
  ]

  for (const source of sources) {
    const { data } = await supabase
      .from(source.table)
      .select(source.select)
      .in('razorpay_order_id', candidates)
      .maybeSingle()

    if (data) return { eventType: source.eventType, ...source.map(data) }
  }

  return null
}

// Ã¢â€â‚¬Ã¢â€â‚¬ Razorpay Webhook Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
app.post('/api/webhook/razorpay', express.raw({ type: 'application/json' }), async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers['x-razorpay-signature'];

  if (!secret || !signature) return res.status(400).send('Missing signature or secret');

  try {
    const expectedSignature = crypto.createHmac('sha256', secret)
      .update(req.body)
      .digest('hex');

    if (expectedSignature !== signature) {
      return res.status(400).send('Invalid signature');
    }

    const payload = JSON.parse(req.body.toString());
    console.log('[webhook] Event received:', payload.event);

    if (payload.event === 'invoice.paid') {
      const invoice = payload.payload.invoice.entity;
      const invoiceRef = invoice.id || invoice.order_id;
      const orderId = invoice.order_id || null;
      const paymentId = invoice.payment_id || payload?.payload?.payment?.entity?.id || null;
      const receiptId = invoice.receipt || null;

      const { payment: existingPayment, matchKey, matchValue } = await findPaymentByRazorpayRefs({
        invoiceId: invoice.id,
        orderId,
        receiptId,
      })

      if (!existingPayment) {
        console.error('[webhook] Payment record not found for invoice:', {
          invoiceId: invoice.id,
          orderId,
          receiptId,
        })
        return res.json({ status: 'ok' })
      }

      if (existingPayment.status === 'paid') {
        console.log('[webhook] Payment already marked paid, skipping duplicate processing:', {
          paymentId: existingPayment.id,
          invoiceId: invoice.id,
        })
        return res.json({ status: 'ok' })
      }

      // Update payment record to paid (idempotent: only if still in created state)
      const { data: payment, error: paymentUpdateError } = await supabase.from('payments').update({
        status: 'paid',
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
        receipt_id: receiptId,
      }).eq(matchKey, matchValue).eq('status', 'created').select().maybeSingle();

      if (paymentUpdateError) {
        console.error('[webhook] Failed to update payment record:', paymentUpdateError.message, '| invoice_ref:', invoiceRef);
      }
      if (!payment) {
        const { data: latest } = await supabase.from('payments').select('*').eq(matchKey, matchValue).maybeSingle()
        if (latest?.status === 'paid') {
          console.log('[webhook] Payment already updated by another request, skipping duplicate confirmation')
          return res.json({ status: 'ok' })
        }
      }

      console.log('[webhook] Payment record updated:', payment?.id || 'not-found', '| event_type:', payment?.event_type || 'unknown', '| invoice_ref:', invoiceRef, '| matched_by:', `${matchKey}:${matchValue}`);

      const effectiveOrderId = payment?.razorpay_order_id || existingPayment?.razorpay_order_id || orderId || invoiceRef
      await processSuccessfulPayment({ payment: payment || existingPayment, orderId: effectiveOrderId, paymentId, source: 'webhook' })
    }

    res.json({ status: 'ok' });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).send('Error handling webhook');
  }
});

app.post('/api/payment/verify', async (req, res) => {
  const { razorpay_invoice_id: invoiceId, razorpay_payment_id: paymentIdFromClient } = req.body || {}
  console.log('[verify] Incoming request:', {
    invoiceId,
    paymentIdFromClient,
    userAgent: req.headers['user-agent'],
    ip: req.ip,
  })
  if (!invoiceId) return res.status(400).json({ success: false, message: 'razorpay_invoice_id is required' })

  try {
    const invoice = await razorpay.invoices.fetch(invoiceId)
    console.log('[verify] Razorpay invoice fetched:', {
      id: invoice?.id,
      status: invoice?.status,
      orderId: invoice?.order_id,
      paymentId: invoice?.payment_id,
      amountPaid: invoice?.amount_paid,
      receipt: invoice?.receipt,
    })
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' })

    const isPaid = invoice.status === 'paid' || Number(invoice.amount_paid || 0) > 0
    if (!isPaid) {
      return res.status(409).json({ success: false, message: 'Payment not completed yet', invoice_status: invoice.status })
    }

    const invoiceRef = invoice.id || invoice.order_id || invoiceId
    const orderId = invoice.order_id || null
    const paymentId = paymentIdFromClient || invoice.payment_id || null
    const receiptId = invoice.receipt || null

    let { payment: existing, matchKey, matchValue } = await findPaymentByRazorpayRefs({
      invoiceId: invoice.id,
      orderId,
      receiptId,
    })

    console.log('[verify] Payment record lookup result:', {
      found: Boolean(existing),
      paymentId: existing?.id,
      eventType: existing?.event_type,
      registrationId: existing?.registration_id,
      status: existing?.status,
      payerEmail: existing?.payer_email,
      matchKey,
      matchValue,
    })

    let recoveredMissingRegistration = false
    if (existing && !existing.registration_id) {
      const fallbackReg = await findRegistrationByRazorpayRefs({ invoiceId: invoice.id, orderId })
      console.log('[verify] Missing registration_id fallback lookup:', fallbackReg)

      if (fallbackReg?.registrationId) {
        const { data: patchedPayment, error: patchError } = await supabase
          .from('payments')
          .update({
            registration_id: fallbackReg.registrationId,
            event_type: existing.event_type || fallbackReg.eventType,
          })
          .eq('id', existing.id)
          .select()
          .maybeSingle()

        if (patchError) {
          console.error('[verify] Failed to patch missing registration_id:', patchError.message)
        } else if (patchedPayment?.registration_id) {
          existing = patchedPayment
          matchKey = 'id'
          matchValue = existing.id
          recoveredMissingRegistration = true
          console.log('[verify] Patched payment with registration_id:', {
            paymentId: existing.id,
            registrationId: existing.registration_id,
            eventType: existing.event_type,
          })
        }
      }
    }

    if (existing && existing.status === 'paid') {
      if (recoveredMissingRegistration && existing.registration_id) {
        const effectiveOrderId = existing.razorpay_order_id || orderId || invoiceRef
        await processSuccessfulPayment({ payment: existing, orderId: effectiveOrderId, paymentId, source: 'verify' })
        console.log('[verify] Recovered paid payment with registration_id and triggered confirmation flow')
        return res.json({ success: true, message: 'Payment already verified; confirmation triggered' })
      }

      console.log('[verify] Payment already processed, skipping duplicate confirmation:', {
        paymentId: existing.id,
        invoiceId: invoice.id,
      })
      return res.json({ success: true, message: 'Payment already verified' })
    }

    if (!existing) {
      const fallbackReg = await findRegistrationByRazorpayRefs({ invoiceId: invoice.id, orderId })
      console.log('[verify] Registration fallback lookup:', fallbackReg)

      if (!fallbackReg) {
        return res.status(404).json({ success: false, message: 'Payment record not found for this invoice' })
      }

      const totalAmount = Number(invoice.amount || invoice.amount_paid || 0)
      let baseAmount = Math.round(totalAmount * 100 / 118)
      let gstAmount = totalAmount - baseAmount

      if (Array.isArray(invoice.line_items) && invoice.line_items.length) {
        let baseFromItems = 0
        let gstFromItems = 0
        invoice.line_items.forEach((item) => {
          const amt = Number(item?.amount || 0)
          if (/gst/i.test(String(item?.name || ''))) gstFromItems += amt
          else baseFromItems += amt
        })
        if (baseFromItems + gstFromItems > 0) {
          baseAmount = baseFromItems
          gstAmount = gstFromItems
        }
      }

      const paymentRow = {
        razorpay_order_id: fallbackReg.matchedOrderId || orderId || invoiceRef,
        razorpay_payment_id: paymentId,
        event_type: fallbackReg.eventType,
        amount: totalAmount,
        base_amount: baseAmount,
        gst_amount: gstAmount,
        payer_name: fallbackReg.payerName || null,
        payer_email: fallbackReg.payerEmail || null,
        payer_phone: fallbackReg.payerPhone || null,
        receipt_id: receiptId,
        invoice_number: `VYG-${Date.now().toString().slice(-8)}`,
        status: 'paid',
        registration_id: fallbackReg.registrationId,
      }

      const { data: insertedPayment, error: insertedPaymentError } = await supabase
        .from('payments')
        .insert([paymentRow])
        .select()
        .maybeSingle()

      if (insertedPaymentError) {
        console.error('[verify] Failed to backfill payment row:', insertedPaymentError.message)
        return res.status(500).json({ success: false, message: insertedPaymentError.message })
      }

      existing = insertedPayment || paymentRow
      matchKey = 'razorpay_order_id'
      matchValue = existing.razorpay_order_id
      console.log('[verify] Backfilled payment row:', { id: existing?.id, eventType: existing?.event_type, registrationId: existing?.registration_id, orderId: existing?.razorpay_order_id })
    }

    const updatePayload = {
      status: 'paid',
      razorpay_payment_id: paymentId,
      receipt_id: receiptId,
      registration_id: existing?.registration_id || null,
    }

    const { data: payment, error: paymentUpdateError } = await supabase.from('payments').update(updatePayload)
      .eq(matchKey, matchValue)
      .eq('status', 'created')
      .select()
      .maybeSingle()

    console.log('[verify] Payment update result:', {
      error: paymentUpdateError?.message || null,
      paymentId: payment?.id,
      status: payment?.status,
      registrationId: payment?.registration_id,
      payerEmail: payment?.payer_email,
    })

    if (paymentUpdateError) {
      return res.status(500).json({ success: false, message: paymentUpdateError.message })
    }

    if (!payment) {
      const { data: latest } = await supabase.from('payments').select('*').eq(matchKey, matchValue).maybeSingle()
      if (latest?.status === 'paid') {
        console.log('[verify] Payment was already updated by another request, skipping duplicate confirmation')
        return res.json({ success: true, message: 'Payment already verified' })
      }
      return res.status(409).json({ success: false, message: 'Unable to finalize payment update' })
    }

    const effectiveOrderId = payment?.razorpay_order_id || existing?.razorpay_order_id || orderId || invoiceRef
    await processSuccessfulPayment({ payment: payment || existing, orderId: effectiveOrderId, paymentId, source: 'verify' })
    console.log('[verify] Completed verify flow successfully')
    return res.json({ success: true, message: 'Payment verified and emails triggered' })
  } catch (err) {
    console.error('[verify] verify flow failed:', { message: err?.message, stack: err?.stack })
    await logError({ source: 'user', endpoint: '/api/payment/verify', method: 'POST', errorType: 'server_error', message: err.message, stack: err.stack, req })
    return res.status(500).json({ success: false, message: err.message })
  }
})



// Ã¢â€â‚¬Ã¢â€â‚¬ 1. Innovation Fest Ã¢â‚¬â€œ College Category Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
// POST /api/innovation-college
app.post('/api/innovation-college', registrationLimiter, innovationUpload.fields([{ name: 'prototypeImage', maxCount: 1 }, { name: 'pptFile', maxCount: 1 }]), async (req, res) => {
  try {
    const {
      teamName, collegeName, theme, ideaTitle, ideaDescription,
      painPoint, solution, usp,
      themeOther, prototypeUrl,
      member1Name, member1Email, member1Phone,
      member2Name, member2Email, member2Phone,
      member3Name, member3Email, member3Phone,
    } = req.body

    // Ã¢â€â‚¬Ã¢â€â‚¬ Create Invoice Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬


    let invoiceInfo;


    try {


      invoiceInfo = await createRazorpayInvoice({ eventType: 'innovation-college', name: member1Name, email: member1Email, phone: member1Phone });
    } catch (e) {
      console.error('[innovation-college] Razorpay invoice error:', e.message, e.error);
      return res.status(500).json({ success: false, message: `Failed to generate invoice: ${e.error?.description || e.message}` })
    }


    // Ã¢â€â‚¬Ã¢â€â‚¬ Validation Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
    const errors = validate([
      { field: 'teamName', check: teamName && sanitizeText(teamName, 100).length > 0, msg: 'required, max 100 chars' },
      { field: 'collegeName', check: collegeName && sanitizeText(collegeName, 200).length > 0, msg: 'required, max 200 chars' },
      { field: 'theme', check: theme && sanitizeText(theme, 100).length > 0, msg: 'required' },
      { field: 'ideaTitle', check: ideaTitle && sanitizeText(ideaTitle, 200).length > 0, msg: 'required, max 200 chars' },
      { field: 'ideaDescription', check: ideaDescription && sanitizeText(ideaDescription, 500).length > 0, msg: 'required, max 500 chars' },
      { field: 'painPoint', check: painPoint && sanitizeText(painPoint, 1000).length > 0, msg: 'required, max 1000 chars' },
      { field: 'solution', check: solution && sanitizeText(solution, 2000).length > 0, msg: 'required, max 2000 chars' },
      { field: 'usp', check: usp && sanitizeText(usp, 1000).length > 0, msg: 'required, max 1000 chars' },
      { field: 'member1Name', check: member1Name && sanitizeText(member1Name, 100).length > 0, msg: 'required' },
      { field: 'member1Email', check: isValidEmail(member1Email), msg: 'invalid email' },
      { field: 'member1Phone', check: isValidPhone(member1Phone), msg: 'must be exactly 10 digits' },
    ])
    if (member2Email && member2Email.trim()) errors.push(...validate([{ field: 'member2Email', check: isValidEmail(member2Email), msg: 'invalid email' }]))
    if (member2Phone && member2Phone.trim()) errors.push(...validate([{ field: 'member2Phone', check: isValidPhone(member2Phone), msg: 'must be 10 digits' }]))
    if (member3Email && member3Email.trim()) errors.push(...validate([{ field: 'member3Email', check: isValidEmail(member3Email), msg: 'invalid email' }]))
    if (member3Phone && member3Phone.trim()) errors.push(...validate([{ field: 'member3Phone', check: isValidPhone(member3Phone), msg: 'must be 10 digits' }]))
    if (theme && String(theme).toLowerCase() === 'other' && !sanitizeText(themeOther, 100)) {
      errors.push({ field: 'themeOther', msg: 'required when theme is Other' })
    }
    if (prototypeUrl && prototypeUrl.trim() && !isValidURL(prototypeUrl)) {
      errors.push({ field: 'prototypeUrl', msg: 'must be a valid http/https URL' })
    }
    if (errors.length) return res.status(400).json({ success: false, message: 'Validation failed', errors })

    // Ã¢â€â‚¬Ã¢â€â‚¬ Magic byte check for image Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
    if (req.files && req.files['prototypeImage']) {
      if (!isValidImageBuffer(req.files['prototypeImage'][0].buffer)) {
        return res.status(400).json({ success: false, message: 'Uploaded file is not a valid image' })
      }
    }

    // Ã¢â€â‚¬Ã¢â€â‚¬ Sanitize all text fields Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
    const sTeamName = sanitizeText(teamName, 100)
    const sCollegeName = sanitizeText(collegeName, 200)
    const sTheme = String(theme).toLowerCase() === 'other'
      ? sanitizeText(themeOther, 100)
      : sanitizeText(theme, 100)
    const sIdeaTitle = sanitizeText(ideaTitle, 200)
    const sIdeaDesc = sanitizeText(ideaDescription, 500)
    const sPainPoint = sanitizeText(painPoint, 1000)
    const sSolution = sanitizeText(solution, 2000)
    const sUsp = sanitizeText(usp, 1000)
    const sM1Name = sanitizeText(member1Name, 100)
    const sM1Email = member1Email.trim().toLowerCase()
    const sM1Phone = member1Phone.trim()

    const members = []
    if (member2Name) members.push({ name: sanitizeText(member2Name, 100), email: (member2Email || '').trim().toLowerCase(), phone: (member2Phone || '').trim() })
    if (member3Name) members.push({ name: sanitizeText(member3Name, 100), email: (member3Email || '').trim().toLowerCase(), phone: (member3Phone || '').trim() })

    // Save prototype image && ppt
    let protoImagePath = null
    if (req.files && req.files['prototypeImage']) {
      const file = req.files['prototypeImage'][0]
      const phone = sM1Phone.replace(/\D/g, '').slice(0, 15)
      const ext = path.extname(sanitizeFilename(file.originalname))
      const filename = `${phone}_${Date.now()}${ext}`
      fs.writeFileSync(path.join(UPLOAD_DIR, filename), file.buffer)
      protoImagePath = filename
    }

    let pptFilePath = null
    if (req.files && req.files['pptFile']) {
      const file = req.files['pptFile'][0]
      const phone = sM1Phone.replace(/\D/g, '').slice(0, 15)
      const ext = path.extname(sanitizeFilename(file.originalname))
      const filename = `${phone}_ppt_${Date.now()}${ext}`
      fs.writeFileSync(path.join(UPLOAD_DIR, filename), file.buffer)
      pptFilePath = filename
    }

    const { data, error } = await supabase
      .from('innovation_college_registrations')
      .insert([{
        team_name: sTeamName,
        college_name: sCollegeName,
        theme: sTheme,
        idea_title: sIdeaTitle,
        idea_description: sIdeaDesc,
        pain_point: sPainPoint,
        solution: sSolution,
        usp: sUsp,
        leader_name: sM1Name,
        leader_email: sM1Email,
        leader_phone: sM1Phone,
        members,
        prototype_image_path: protoImagePath,
        ppt_file_path: pptFilePath,
        prototype_url: prototypeUrl ? prototypeUrl.trim() : null,
        razorpay_order_id: invoiceInfo.invoiceRef,
        razorpay_payment_id: null,
        payment_status: 'pending'
      }])
      .select()
      .single()

    if (error) {
      await logError({ source: 'user', endpoint: '/api/innovation-college', method: 'POST', errorType: 'db_error', message: error.message, req })
      return res.status(500).json({ success: false, message: error.message })
    }

    // Insert payment record
    const { error: paymentInsertErrorCollege } = await supabase.from('payments').insert([{
      razorpay_order_id: invoiceInfo.invoiceRef,
      event_type: 'innovation-college',
      amount: invoiceInfo.totalAmount,
      base_amount: invoiceInfo.baseFee,
      gst_amount: invoiceInfo.gstAmount,
      payer_name: member1Name,
      payer_email: member1Email,
      payer_phone: member1Phone,
      receipt_id: invoiceInfo.receiptId,
      invoice_number: invoiceInfo.invoiceNumber,
      status: 'created',
      registration_id: data.id
    }])

    if (paymentInsertErrorCollege) {
      console.error('[innovation-college] Payment insert failed:', paymentInsertErrorCollege.message)
      await logError({ source: 'user', endpoint: '/api/innovation-college', method: 'POST', errorType: 'db_error', message: `payment insert failed: ${paymentInsertErrorCollege.message}`, req })
    }

    // Confirmation email will be sent by webhook after payment is completed
    res.status(201).json({ success: true, data, invoice_link: invoiceInfo.invoice.short_url, invoice_id: invoiceInfo.invoice.id, receipt_id: invoiceInfo.receiptId })
  } catch (err) {
    await logError({ source: 'user', endpoint: '/api/innovation-college', method: 'POST', errorType: 'server_error', message: err.message, stack: err.stack, req })
    res.status(500).json({ success: false, message: err.message })
  }
})

// Ã¢â€â‚¬Ã¢â€â‚¬ 2. Innovation Fest Ã¢â‚¬â€œ PWD Category Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
// POST /api/innovation-pwd
app.post('/api/innovation-pwd', registrationLimiter, innovationUpload.fields([{ name: 'prototypeImage', maxCount: 1 }, { name: 'udidCard', maxCount: 1 }, { name: 'pptFile', maxCount: 1 }]), async (req, res) => {
  try {
    const {
      participationType, ideaTitle, ideaDescription,
      painPoint, solution, usp, prototypeUrl,
      member1Name, member1Email, member1Phone, member1DisabilityType, member1DisabilityTypeOther,
      member2Name, member2Email, member2Phone,
      member3Name, member3Email, member3Phone,
    } = req.body

    // Ã¢â€â‚¬Ã¢â€â‚¬ Create Invoice Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬


    let invoiceInfo;


    try {
      invoiceInfo = await createRazorpayInvoice({ eventType: 'innovation-pwd', name: member1Name, email: member1Email, phone: member1Phone });
    } catch (e) {
      console.error('[innovation-pwd] Razorpay invoice error:', e.message, e.error);
      return res.status(500).json({ success: false, message: `Failed to generate invoice: ${e.error?.description || e.message}` })
    }


    // Ã¢â€â‚¬Ã¢â€â‚¬ Validation Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
    const errors = validate([
      { field: 'participationType', check: isValidEnum(participationType, ['individual', 'team']), msg: 'must be individual or team' },
      { field: 'ideaTitle', check: ideaTitle && sanitizeText(ideaTitle, 200).length > 0, msg: 'required, max 200 chars' },
      { field: 'ideaDescription', check: ideaDescription && sanitizeText(ideaDescription, 500).length > 0, msg: 'required, max 500 chars' },
      { field: 'painPoint', check: painPoint && sanitizeText(painPoint, 1000).length > 0, msg: 'required, max 1000 chars' },
      { field: 'solution', check: solution && sanitizeText(solution, 2000).length > 0, msg: 'required, max 2000 chars' },
      { field: 'usp', check: usp && sanitizeText(usp, 1000).length > 0, msg: 'required, max 1000 chars' },
      { field: 'member1Name', check: member1Name && sanitizeText(member1Name, 100).length > 0, msg: 'required' },
      { field: 'member1Email', check: isValidEmail(member1Email), msg: 'invalid email' },
      { field: 'member1Phone', check: isValidPhone(member1Phone), msg: 'must be exactly 10 digits' },
      { field: 'member1DisabilityType', check: member1DisabilityType && sanitizeText(member1DisabilityType, 100).length > 0, msg: 'required' },
    ])
    if (member2Email && member2Email.trim()) errors.push(...validate([{ field: 'member2Email', check: isValidEmail(member2Email), msg: 'invalid email' }]))
    if (member2Phone && member2Phone.trim()) errors.push(...validate([{ field: 'member2Phone', check: isValidPhone(member2Phone), msg: 'must be 10 digits' }]))
    if (member3Email && member3Email.trim()) errors.push(...validate([{ field: 'member3Email', check: isValidEmail(member3Email), msg: 'invalid email' }]))
    if (member3Phone && member3Phone.trim()) errors.push(...validate([{ field: 'member3Phone', check: isValidPhone(member3Phone), msg: 'must be 10 digits' }]))
    if (member1DisabilityType && String(member1DisabilityType).toLowerCase() === 'other' && !sanitizeText(member1DisabilityTypeOther, 100)) {
      errors.push({ field: 'member1DisabilityTypeOther', msg: 'required when disability type is Other' })
    }
    if (prototypeUrl && prototypeUrl.trim() && !isValidURL(prototypeUrl)) {
      errors.push({ field: 'prototypeUrl', msg: 'must be a valid http/https URL' })
    }
    if (errors.length) return res.status(400).json({ success: false, message: 'Validation failed', errors })

    if (req.files && req.files['prototypeImage']) {
      const file = req.files['prototypeImage'][0]
      if (!isValidImageBuffer(file.buffer)) {
        return res.status(400).json({ success: false, message: 'Uploaded prototype file is not a valid image' })
      }
    }
    // (Optional: Add buffer validation for UDID if strict check needed, skipping for PDF complexity)

    // Ã¢â€â‚¬Ã¢â€â‚¬ Sanitize Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
    const sPartType = participationType.trim()
    const sIdeaTitle = sanitizeText(ideaTitle, 200)
    const sIdeaDesc = sanitizeText(ideaDescription, 500)
    const sPainPoint = sanitizeText(painPoint, 1000)
    const sSolution = sanitizeText(solution, 2000)
    const sUsp = sanitizeText(usp, 1000)
    const sM1Name = sanitizeText(member1Name, 100)
    const sM1Email = member1Email.trim().toLowerCase()
    const sM1Phone = member1Phone.trim()

    // Handle disability types as array
    let disabilityTypes = []
    if (Array.isArray(member1DisabilityType)) {
      disabilityTypes = member1DisabilityType
    } else if (typeof member1DisabilityType === 'string' && member1DisabilityType) {
      disabilityTypes = [member1DisabilityType]
    }

    const processedDisabilities = disabilityTypes.map(type =>
      String(type).toLowerCase() === 'other'
        ? sanitizeText(member1DisabilityTypeOther, 100)
        : sanitizeText(type, 100)
    ).filter(Boolean)

    const sDisability = processedDisabilities.join(', ')

    const members = []
    if (sPartType === 'team') {
      if (member2Name) members.push({ name: sanitizeText(member2Name, 100), email: (member2Email || '').trim().toLowerCase(), phone: (member2Phone || '').trim() })
      if (member3Name) members.push({ name: sanitizeText(member3Name, 100), email: (member3Email || '').trim().toLowerCase(), phone: (member3Phone || '').trim() })
    }

    let protoImagePath = null
    if (req.files && req.files['prototypeImage']) {
      const file = req.files['prototypeImage'][0]
      const phone = sM1Phone.replace(/\D/g, '').slice(0, 15)
      const ext = path.extname(sanitizeFilename(file.originalname))
      const filename = `${phone}_proto_${Date.now()}${ext}`
      fs.writeFileSync(path.join(UPLOAD_DIR, filename), file.buffer)
      protoImagePath = filename
    }

    let udidCardPath = null
    if (req.files && req.files['udidCard']) {
      const file = req.files['udidCard'][0]
      const phone = sM1Phone.replace(/\D/g, '').slice(0, 15)
      const ext = path.extname(sanitizeFilename(file.originalname))
      const filename = `${phone}_udid_${Date.now()}${ext}`
      fs.writeFileSync(path.join(ID_DIR, filename), file.buffer)
      udidCardPath = `ID/${filename}`
    }

    let pptFilePath = null
    if (req.files && req.files['pptFile']) {
      const file = req.files['pptFile'][0]
      const phone = sM1Phone.replace(/\D/g, '').slice(0, 15)
      const ext = path.extname(sanitizeFilename(file.originalname))
      const filename = `${phone}_ppt_${Date.now()}${ext}`
      fs.writeFileSync(path.join(UPLOAD_DIR, filename), file.buffer)
      pptFilePath = filename
    }

    const { data, error } = await supabase
      .from('innovation_pwd_registrations')
      .insert([{
        participation_type: sPartType,
        idea_title: sIdeaTitle,
        idea_description: sIdeaDesc,
        pain_point: sPainPoint,
        solution: sSolution,
        usp: sUsp,
        name: sM1Name,
        email: sM1Email,
        phone: sM1Phone,
        disability_type: sDisability,
        members,
        prototype_image_path: protoImagePath,
        ppt_file_path: pptFilePath,
        udid_card_path: udidCardPath,
        prototype_url: prototypeUrl ? prototypeUrl.trim() : null,
        razorpay_order_id: invoiceInfo.invoiceRef,
        razorpay_payment_id: null,
        payment_status: 'pending'
      }])
      .select()
      .single()

    if (error) {
      await logError({ source: 'user', endpoint: '/api/innovation-pwd', method: 'POST', errorType: 'db_error', message: error.message, req })
      return res.status(500).json({ success: false, message: error.message })
    }

    // Insert payment record
    const { error: paymentInsertErrorPwd } = await supabase.from('payments').insert([{
      razorpay_order_id: invoiceInfo.invoiceRef,
      event_type: 'innovation-pwd',
      amount: invoiceInfo.totalAmount,
      base_amount: invoiceInfo.baseFee,
      gst_amount: invoiceInfo.gstAmount,
      payer_name: member1Name,
      payer_email: member1Email,
      payer_phone: member1Phone,
      receipt_id: invoiceInfo.receiptId,
      invoice_number: invoiceInfo.invoiceNumber,
      status: 'created',
      registration_id: data.id
    }])

    if (paymentInsertErrorPwd) {
      console.error('[innovation-pwd] Payment insert failed:', paymentInsertErrorPwd.message)
      await logError({ source: 'user', endpoint: '/api/innovation-pwd', method: 'POST', errorType: 'db_error', message: `payment insert failed: ${paymentInsertErrorPwd.message}`, req })
    }

    // Confirmation email will be sent by webhook after payment is completed
    res.status(201).json({ success: true, data, invoice_link: invoiceInfo.invoice.short_url, invoice_id: invoiceInfo.invoice.id, receipt_id: invoiceInfo.receiptId })
  } catch (err) {
    await logError({ source: 'user', endpoint: '/api/innovation-pwd', method: 'POST', errorType: 'server_error', message: err.message, stack: err.stack, req })
    res.status(500).json({ success: false, message: err.message })
  }
})

// Ã¢â€â‚¬Ã¢â€â‚¬ 3. Special Talent UtsavÃ¢â‚¬â€œ Organization Registration Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
// GET /api/talent-org  Ã¢â‚¬â€œ list all registered organizations
app.get('/api/talent-org', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('talent_organizations')
      .select('id, org_name, org_type, contact_name, contact_email')
      .order('registered_at', { ascending: false })

    if (error) {
      await logError({ source: 'user', endpoint: '/api/talent-org', method: 'GET', errorType: 'db_error', message: error.message, req })
      return res.status(500).json({ success: false, message: error.message })
    }
    res.json({ success: true, data })
  } catch (err) {
    await logError({ source: 'user', endpoint: '/api/talent-org', method: 'GET', errorType: 'server_error', message: err.message, stack: err.stack, req })
    res.status(500).json({ success: false, message: err.message })
  }
})

// POST /api/talent-org
app.post('/api/talent-org', registrationLimiter, async (req, res) => {
  try {
    const { orgName, orgType, orgTypeOther, orgFocus, disabilityTypes, address, studentCount, contactName, contactEmail, contactPhone } = req.body

    // Ã¢â€â‚¬Ã¢â€â‚¬ Create Invoice Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
    let invoiceInfo;
    try {
      invoiceInfo = await createRazorpayInvoice({ eventType: 'talent-org', name: contactName, email: contactEmail, phone: contactPhone });
    } catch (e) {
      console.error('[talent-org] Razorpay invoice error:', e.message, e.error);
      return res.status(500).json({ success: false, message: `Failed to generate invoice: ${e.error?.description || e.message}` })
    }

    // Ã¢â€â‚¬Ã¢â€â‚¬ Validation Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
    const errors = validate([
      { field: 'orgName', check: orgName && sanitizeText(orgName, 200).length > 0, msg: 'required, max 200 chars' },
      { field: 'orgType', check: orgType && sanitizeText(orgType, 100).length > 0, msg: 'required' },
      { field: 'orgFocus', check: orgFocus && ['single', 'multiple'].includes(orgFocus), msg: 'must be single or multiple' },
      { field: 'disabilityTypes', check: Array.isArray(disabilityTypes) && disabilityTypes.length > 0, msg: 'at least one disability type required' },
      { field: 'contactName', check: contactName && sanitizeText(contactName, 100).length > 0, msg: 'required' },
      { field: 'contactEmail', check: isValidEmail(contactEmail), msg: 'invalid email' },
      { field: 'contactPhone', check: isValidPhone(contactPhone), msg: 'must be exactly 10 digits' },
      { field: 'studentCount', check: !studentCount || isValidInt(studentCount, 0, 100000), msg: 'must be a number 0Ã¢â‚¬â€œ100000' },
    ])

    // Validate focus-specific constraints
    if (orgFocus === 'single' && Array.isArray(disabilityTypes) && disabilityTypes.length > 1) {
      errors.push({ field: 'disabilityTypes', msg: 'single focus organizations can only select one disability type' })
    }

    if (errors.length) return res.status(400).json({ success: false, message: 'Validation failed', errors })

    const effectiveOrgType = String(orgType).toLowerCase() === 'other'
      ? sanitizeText(orgTypeOther, 100)
      : sanitizeText(orgType, 100)
    if (!effectiveOrgType) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: [{ field: 'orgTypeOther', msg: 'required when organization type is Other' }] })
    }

    const { data, error } = await supabase
      .from('talent_organizations')
      .insert([{
        org_name: sanitizeText(orgName, 200),
        org_type: effectiveOrgType,
        org_focus: orgFocus,
        disability_types: JSON.stringify(disabilityTypes),
        address: address ? sanitizeText(address, 500) : null,
        student_count: parseInt(studentCount, 10) || 0,
        contact_name: sanitizeText(contactName, 100),
        contact_email: contactEmail.trim().toLowerCase(),
        contact_phone: contactPhone.trim(),
        razorpay_order_id: invoiceInfo.invoiceRef,
        payment_status: 'pending',
      }])
      .select()
      .single()

    if (error) {
      await logError({ source: 'user', endpoint: '/api/talent-org', method: 'POST', errorType: 'db_error', message: error.message, req })
      if (error.code === '23505') {
        return res.status(409).json({ success: false, message: 'This email is already registered.' })
      }
      return res.status(500).json({ success: false, message: error.message })
    }

    // Insert payment record
    const { error: paymentInsertErrorTalentOrg } = await supabase.from('payments').insert([{
      razorpay_order_id: invoiceInfo.invoiceRef,
      event_type: 'talent-org',
      amount: invoiceInfo.totalAmount,
      base_amount: invoiceInfo.baseFee,
      gst_amount: invoiceInfo.gstAmount,
      payer_name: contactName,
      payer_email: contactEmail,
      payer_phone: contactPhone,
      receipt_id: invoiceInfo.receiptId,
      invoice_number: invoiceInfo.invoiceNumber,
      status: 'created',
      registration_id: data.id
    }])

    if (paymentInsertErrorTalentOrg) {
      console.error('[talent-org] Payment insert failed:', paymentInsertErrorTalentOrg.message)
      await logError({ source: 'user', endpoint: '/api/talent-org', method: 'POST', errorType: 'db_error', message: `payment insert failed: ${paymentInsertErrorTalentOrg.message}`, req })
    }

    // Confirmation email will be sent by webhook after payment is completed
    res.status(201).json({ success: true, data, invoice_link: invoiceInfo.invoice.short_url, invoice_id: invoiceInfo.invoice.id, receipt_id: invoiceInfo.receiptId })
  } catch (err) {
    await logError({ source: 'user', endpoint: '/api/talent-org', method: 'POST', errorType: 'server_error', message: err.message, stack: err.stack, req })
    res.status(500).json({ success: false, message: err.message })
  }
})

// POST /api/talent-student  (multipart/form-data; required performanceVideo field)
app.post('/api/talent-student', registrationLimiter, upload.single('performanceVideo'), async (req, res) => {
  try {
    const {
      orgName, studentName, studentAge, disabilityType, disabilityTypeOther,
      talentCategory, talentCategoryOther, talentDescription, gradeCategory, guardianName, guardianPhone, guardianEmail, videoLink, performanceUrl, social
    } = req.body

    const normalizedGradeCategory = normalizeGradeCategory(gradeCategory) || '1-5'

    // Î“Ã¶Ã‡Î“Ã¶Ã‡ Validation Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡
    const errors = validate([
      { field: 'orgName', check: orgName && sanitizeText(orgName, 200).length > 0, msg: 'required' },
      { field: 'studentName', check: studentName && sanitizeText(studentName, 100).length > 0, msg: 'required' },
      { field: 'studentAge', check: isValidInt(studentAge, 1, 120), msg: 'must be a number 1Î“Ã‡Ã´120' },
      { field: 'disabilityType', check: disabilityType && sanitizeText(disabilityType, 100).length > 0, msg: 'required' },
      { field: 'talentCategory', check: talentCategory && sanitizeText(talentCategory, 100).length > 0, msg: 'required' },
      { field: 'gradeCategory', check: Boolean(normalizedGradeCategory), msg: 'must be 1-5, 6-8, or 9-12' },
      { field: 'talentDescription', check: !talentDescription || (talentDescription.trim().split(/\s+/).filter(w => w.length > 0).length <= 50), msg: 'must be 50 words or less' },
      { field: 'guardianName', check: guardianName && sanitizeText(guardianName, 100).length > 0, msg: 'required' },
      { field: 'guardianPhone', check: isValidPhone(guardianPhone), msg: 'must be exactly 10 digits' },
    ])
    if (guardianEmail && guardianEmail.trim()) errors.push(...validate([{ field: 'guardianEmail', check: isValidEmail(guardianEmail), msg: 'invalid email' }]))
    if (videoLink && videoLink.trim()) errors.push(...validate([{ field: 'videoLink', check: isValidURL(videoLink), msg: 'must be a valid http/https URL' }]))
    if (disabilityType && Array.isArray(disabilityType) && disabilityType.includes('Other') && !sanitizeText(disabilityTypeOther, 100)) {
      errors.push({ field: 'disabilityTypeOther', msg: 'required when disability type is Other' })
    } else if (disabilityType && String(disabilityType).toLowerCase() === 'other' && !sanitizeText(disabilityTypeOther, 100)) {
      errors.push({ field: 'disabilityTypeOther', msg: 'required when disability type is Other' })
    }
    if (talentCategory && String(talentCategory).toLowerCase() === 'other' && !sanitizeText(talentCategoryOther, 100)) {
      errors.push({ field: 'talentCategoryOther', msg: 'required when talent category is Other' })
    }
    if (performanceUrl && performanceUrl.trim() && !isValidURL(performanceUrl)) {
      errors.push({ field: 'performanceUrl', msg: 'must be a valid http/https URL' })
    }
    if (errors.length) return res.status(400).json({ success: false, message: 'Validation failed', errors })

    const effectiveDisability = (() => {
      let disabilityTypes = []
      if (Array.isArray(disabilityType)) {
        disabilityTypes = disabilityType
      } else if (typeof disabilityType === 'string' && disabilityType) {
        disabilityTypes = [disabilityType]
      }

      const processedDisabilities = disabilityTypes.map(type =>
        String(type).toLowerCase() === 'other'
          ? sanitizeText(disabilityTypeOther, 100)
          : sanitizeText(type, 100)
      ).filter(Boolean)

      return processedDisabilities.join(', ')
    })()
    const effectiveTalentCategory = String(talentCategory).toLowerCase() === 'other'
      ? sanitizeText(talentCategoryOther, 100)
      : sanitizeText(talentCategory, 100)

    // Î“Ã¶Ã‡Î“Ã¶Ã‡ Validate video magic bytes Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡
    if (req.file) {
      const headBuf = Buffer.alloc(12)
      const fd = fs.openSync(req.file.path, 'r')
      fs.readSync(fd, headBuf, 0, 12, 0)
      fs.closeSync(fd)
      if (!isValidVideoFile(headBuf)) {
        fs.unlinkSync(req.file.path)
        return res.status(400).json({ success: false, message: 'Uploaded file is not a valid video' })
      }
    }

    // Compress uploaded video with ffmpeg
    let videoFilePath = req.file ? req.file.path : null
    if (videoFilePath) {
      try {
        videoFilePath = await compressVideoWithFFmpeg(videoFilePath)
      } catch (e) {
        await logError({ source: 'user', endpoint: '/api/talent-student', method: 'POST', errorType: 'upload_error', message: `ffmpeg compression error: ${e.message}`, req })
      }
    }
    // Store only the filename (not the full path) so frontend can construct URL
    const videoFileName = videoFilePath ? path.basename(videoFilePath) : null

    const { data, error } = await supabase
      .from('talent_nominations')
      .insert([{
        org_name: sanitizeText(orgName, 200),
        student_name: sanitizeText(studentName, 100),
        student_age: parseInt(studentAge, 10),
        disability_type: effectiveDisability,
        talent_category: effectiveTalentCategory,
        grade_category: normalizedGradeCategory,
        talent_desc: talentDescription ? sanitizeText(talentDescription, 2000) : null,
        guardian_name: sanitizeText(guardianName, 100),
        guardian_phone: guardianPhone.trim(),
        guardian_email: guardianEmail ? guardianEmail.trim().toLowerCase() : null,
        video_file_path: videoFileName,
        performance_url: performanceUrl ? performanceUrl.trim() : null,
        social_media_link: social ? social.trim() : null,
        razorpay_order_id: req.body.razorpay_order_id,
        razorpay_payment_id: req.body.razorpay_payment_id,
        payment_status: 'paid'
      }])
      .select()
      .single()

    if (error) {
      await logError({ source: 'user', endpoint: '/api/talent-student', method: 'POST', errorType: 'db_error', message: error.message, req })
      return res.status(500).json({ success: false, message: error.message })
    }

    // Update payment record
    supabase.from('payments').update({
      status: 'paid',
      razorpay_payment_id: req.body.razorpay_payment_id,
      razorpay_signature: req.body.razorpay_signature,
      registration_id: data.id
    }).eq('razorpay_order_id', req.body.razorpay_order_id).then();

    // Fetch org contact email so we can notify the organisation too
    const { data: orgData } = await supabase
      .from('talent_organizations')
      .select('contact_email, contact_name')
      .eq('org_name', orgName)
      .maybeSingle()

    try {
      sendTalentStudentConfirmation({
        orgName, studentName, studentAge, disabilityType: effectiveDisability,
        talentCategory: effectiveTalentCategory, talentDescription,
        guardianName, guardianPhone, guardianEmail, videoLink,
        orgContactEmail: orgData?.contact_email || null,
        orgContactName: orgData?.contact_name || null,
      })
    } catch (emailErr) {
      await logError({ source: 'user', endpoint: '/api/talent-student', method: 'POST', errorType: 'email_error', message: emailErr.message, stack: emailErr.stack, req })
    }
    res.status(201).json({ success: true, data })
  } catch (err) {
    await logError({ source: 'user', endpoint: '/api/talent-student', method: 'POST', errorType: 'server_error', message: err.message, stack: err.stack, req })
    res.status(500).json({ success: false, message: err.message })
  }
})

// Î“Ã¶Ã‡Î“Ã¶Ã‡ Combined Special Talent Utsav (Organization + Student/Team Nomination) Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡
// POST /api/talent-combined  (multipart/form-data; required performanceVideo field)
app.post('/api/talent-combined', registrationLimiter, upload.single('performanceVideo'), async (req, res) => {
  try {
    console.log('=== Talent Combined Submission ===')
    console.log('File received:', req.file ? 'Yes' : 'No')
    console.log('Nomination type:', req.body.nominationType)
    console.log('orgDisabilityTypes received:', req.body.orgDisabilityTypes, 'Type:', typeof req.body.orgDisabilityTypes)
    console.log('orgDisabilityFocus received:', req.body.orgDisabilityFocus)

    const {
      // Organization details
      orgName, orgAddress, orgCity, orgState, orgZip, orgSize, orgDisabilityFocus, orgDisabilityTypes,
      contactName, contactDesignation, contactPhone, contactEmail,

      // Nomination details
      nominationType, teamSize, teamMembers,

      // Student/team details
      studentName, studentAge, disabilityType, disabilityTypeOther,
      talentCategory, talentCategoryOther, talentDescription, gradeCategory,
      guardianName, guardianPhone, guardianEmail,
      videoLink, performanceUrl, social
    } = req.body

    const normalizedGradeCategory = normalizeGradeCategory(gradeCategory) || '1-5'

    // Parse orgDisabilityTypes if it's a JSON string
    let parsedOrgDisabilityTypes = orgDisabilityTypes
    if (typeof orgDisabilityTypes === 'string' && orgDisabilityTypes.trim()) {
      try {
        parsedOrgDisabilityTypes = JSON.parse(orgDisabilityTypes)
      } catch (e) {
        console.warn('Failed to parse orgDisabilityTypes:', orgDisabilityTypes)
        parsedOrgDisabilityTypes = []
      }
    } else if (!orgDisabilityTypes) {
      parsedOrgDisabilityTypes = []
    }
    console.log('Parsed orgDisabilityTypes:', parsedOrgDisabilityTypes)

    // Î“Ã¶Ã‡Î“Ã¶Ã‡ Validation Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡
    const errors = validate([
      // Organization validation
      { field: 'orgName', check: orgName && sanitizeText(orgName, 200).length > 0, msg: 'required' },
      { field: 'orgCity', check: orgCity && sanitizeText(orgCity, 100).length > 0, msg: 'required' },
      { field: 'orgState', check: orgState && sanitizeText(orgState, 50).length > 0, msg: 'required' },
      { field: 'orgSize', check: orgSize && ['<10', '10-30', '30-50', '50-100', '100+'].includes(orgSize), msg: 'invalid organization size' },
      { field: 'orgDisabilityFocus', check: orgDisabilityFocus && ['single', 'multiple'].includes(orgDisabilityFocus), msg: 'must be single or multiple' },
      { field: 'orgDisabilityTypes', check: Array.isArray(parsedOrgDisabilityTypes) && parsedOrgDisabilityTypes.length > 0, msg: 'at least one disability type required' },
      { field: 'contactName', check: contactName && sanitizeText(contactName, 100).length > 0, msg: 'required' },
      { field: 'contactPhone', check: contactPhone && /^\d{10}$/.test(contactPhone), msg: 'must be exactly 10 digits' },
      { field: 'contactEmail', check: contactEmail && isValidEmail(contactEmail), msg: 'invalid email' },

      // Nomination validation
      { field: 'nominationType', check: nominationType && ['individual', 'team'].includes(nominationType), msg: 'must be individual or team' },

      // Talent details (common)
      { field: 'talentCategory', check: talentCategory && sanitizeText(talentCategory, 100).length > 0, msg: 'required' },
      { field: 'gradeCategory', check: Boolean(normalizedGradeCategory), msg: 'must be 1-5, 6-8, or 9-12' },
      { field: 'talentDescription', check: !talentDescription || (talentDescription.trim().split(/\s+/).filter(w => w.length > 0).length <= 50), msg: 'must be 50 words or less' },
      { field: 'performanceUrl', check: performanceUrl && isValidURL(performanceUrl), msg: 'public Google Drive link is required' }
    ])
    if (performanceUrl && !String(performanceUrl).includes('drive.google.com')) {
      errors.push({ field: 'performanceUrl', msg: 'must be a Google Drive link' })
    }

    // Individual nomination validation
    if (nominationType === 'individual') {
      errors.push(...validate([
        { field: 'studentName', check: studentName && sanitizeText(studentName, 100).length > 0, msg: 'required' },
        { field: 'studentAge', check: studentAge && Number.isInteger(+studentAge) && +studentAge >= 5 && +studentAge <= 25, msg: 'must be 5-25 years' },
        { field: 'disabilityType', check: disabilityType && (Array.isArray(disabilityType) ? disabilityType.length > 0 : disabilityType.length > 0), msg: 'required' },
        { field: 'guardianName', check: guardianName && sanitizeText(guardianName, 100).length > 0, msg: 'required' },
        { field: 'guardianPhone', check: guardianPhone && /^\d{10}$/.test(guardianPhone), msg: 'must be exactly 10 digits' },
        { field: 'guardianEmail', check: guardianEmail && isValidEmail(guardianEmail), msg: 'invalid email' }
      ]))
    }

    // Team-specific validation
    if (nominationType === 'team') {
      try {
        const teamMembersData = typeof teamMembers === 'string' ? JSON.parse(teamMembers) : teamMembers
        console.log('â‰¡Æ’Ã¶Ã¬ Debug - Raw team members data received:', JSON.stringify(teamMembersData, null, 2))

        errors.push(...validate([
          { field: 'teamSize', check: teamSize && Number.isInteger(+teamSize) && +teamSize >= 2 && +teamSize <= 10, msg: 'team size must be 2-10 members' },
          { field: 'teamMembers', check: teamMembersData && Array.isArray(teamMembersData) && teamMembersData.length == +teamSize, msg: 'team members count must match team size' }
        ]))

        // Validate each team member
        if (teamMembersData && Array.isArray(teamMembersData)) {
          teamMembersData.forEach((member, index) => {
            errors.push(...validate([
              { field: `teamMembers[${index}].name`, check: member.name && sanitizeText(member.name, 100).length > 0, msg: 'required' },
              { field: `teamMembers[${index}].age`, check: member.age && Number.isInteger(+member.age) && +member.age >= 5 && +member.age <= 25, msg: 'must be 5-25 years' },
              { field: `teamMembers[${index}].disabilityType`, check: member.disabilityType && (Array.isArray(member.disabilityType) ? member.disabilityType.length > 0 : member.disabilityType.length > 0), msg: 'required' },
              { field: `teamMembers[${index}].guardianName`, check: member.guardianName && sanitizeText(member.guardianName, 100).length > 0, msg: 'required' },
              { field: `teamMembers[${index}].guardianPhone`, check: member.guardianPhone && isValidPhone(member.guardianPhone), msg: 'invalid phone' }
            ]))
          })
        }
      } catch (e) {
        errors.push({ field: 'teamMembers', msg: 'invalid JSON format' })
      }
    }

    // Additional validation for organization disability focus
    if (orgDisabilityFocus === 'single' && Array.isArray(parsedOrgDisabilityTypes) && parsedOrgDisabilityTypes.length > 1) {
      errors.push({ field: 'orgDisabilityTypes', msg: 'single focus organizations can only select one disability type' })
    }

    if (errors.length > 0) {
      console.log('Î“Â¥Ã® Validation failed:', errors)
      return res.status(400).json({ success: false, errors })
    }

    console.log('Validation passed')

    const invoiceInfo = await createRazorpayInvoice({
      eventType: 'talent-combined',
      name: contactName,
      email: contactEmail,
      phone: contactPhone,
    })

    // Validate and sanitize URLs if provided
    const sanitizedPerformanceUrl = performanceUrl && performanceUrl.trim() ?
      (isValidURL(performanceUrl.trim()) ? performanceUrl.trim() : null) : null

    // Process disability types (handle both arrays and single values)
    let processedDisabilityType = disabilityType
    if (Array.isArray(disabilityType)) {
      processedDisabilityType = disabilityType.join(', ')
    }

    // Add "Other" specification if needed
    if (disabilityType?.includes('Other') && disabilityTypeOther) {
      processedDisabilityType = processedDisabilityType.replace('Other', `Other: ${sanitizeText(disabilityTypeOther, 100)}`)
    }

    // Process talent category
    let processedTalentCategory = sanitizeText(talentCategory, 100)
    if (talentCategory === 'Other' && talentCategoryOther) {
      processedTalentCategory = `Other: ${sanitizeText(talentCategoryOther, 100)}`
    }

    // Î“Ã¶Ã‡Î“Ã¶Ã‡ File handling Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡
    console.log('â‰¡Æ’Ã„Ã‘ Processing video file...')
    let videoFilePath = null
    if (req.file) {
      try {
        videoFilePath = await compressVideoWithFFmpeg(req.file.path)
        console.log('Video compression completed:', path.basename(videoFilePath))
        // Note: compressVideoWithFFmpeg already handles cleanup of original file
      } catch (e) {
        console.error('Î“Â¥Ã® Video compression failed:', e.message)
        videoFilePath = req.file.path // Use original file if compression fails
        await logError({ source: 'user', endpoint: '/api/talent-combined', method: 'POST', errorType: 'upload_error', message: `ffmpeg compression error: ${e.message}`, req })
      }
    }

    // Store only the filename (not the full path)
    const videoFileName = videoFilePath ? path.basename(videoFilePath) : null

    // Process team members for database storage
    let processedTeamMembers = null
    if (nominationType === 'team' && teamMembers) {
      try {
        const teamMembersData = typeof teamMembers === 'string' ? JSON.parse(teamMembers) : teamMembers
        processedTeamMembers = teamMembersData.map(member => ({
          name: sanitizeText(member.name, 100),
          age: parseInt(member.age),
          disabilityType: Array.isArray(member.disabilityType) ?
            member.disabilityType.join(', ') :
            sanitizeText(member.disabilityType, 200),
          disabilityTypeOther: member.disabilityTypeOther ? sanitizeText(member.disabilityTypeOther, 100) : null,
          guardianName: member.guardianName ? sanitizeText(member.guardianName, 100) : null,
          guardianPhone: member.guardianPhone || null
        }))
      } catch (e) {
        return res.status(400).json({ success: false, message: 'Invalid team members data' })
      }
    }

    console.log('â‰¡Æ’Ã†â•› Inserting into database...')
    const { data, error } = await supabase
      .from('talent_nominations')
      .insert([{
        // Organization details
        org_name: sanitizeText(orgName, 200),
        org_address: orgAddress ? sanitizeText(orgAddress, 300) : null,
        org_city: sanitizeText(orgCity, 100),
        org_state: sanitizeText(orgState, 50),
        org_zip: orgZip ? sanitizeText(orgZip, 10) : null,
        org_size: orgSize,
        org_disability_focus: orgDisabilityFocus,
        org_disability_types: JSON.stringify(parsedOrgDisabilityTypes),
        contact_name: sanitizeText(contactName, 100),
        contact_designation: contactDesignation ? sanitizeText(contactDesignation, 100) : null,
        contact_phone: contactPhone,
        contact_email: contactEmail.toLowerCase(),

        // Nomination details
        nomination_type: nominationType,
        team_size: nominationType === 'team' ? parseInt(teamSize) : 1,
        team_members: processedTeamMembers,

        // Student/team leader details (for individual nominations)
        student_name: nominationType === 'individual' ? sanitizeText(studentName, 100) : 'Team Nomination',
        student_age: nominationType === 'individual' ? parseInt(studentAge) : null,
        disability_type: nominationType === 'individual' ? processedDisabilityType : 'Multiple (Team)',
        talent_category: processedTalentCategory,
        grade_category: normalizedGradeCategory,
        talent_desc: talentDescription ? sanitizeText(talentDescription, 500) : null,
        guardian_name: nominationType === 'individual' ? sanitizeText(guardianName, 100) : null,
        guardian_phone: nominationType === 'individual' ? guardianPhone : null,
        guardian_email: nominationType === 'individual' && guardianEmail ? guardianEmail.toLowerCase() : null,
        video_file_path: videoFileName,
        performance_url: sanitizedPerformanceUrl,
        social_media_link: social ? social.trim() : null,
        razorpay_order_id: invoiceInfo.invoiceRef,
        razorpay_payment_id: null,
        payment_status: 'pending'
      }])
      .select()
      .single()

    if (error) {
      console.log('Î“Â¥Ã® Database error:', error.message)
      await logError({ source: 'user', endpoint: '/api/talent-combined', method: 'POST', errorType: 'db_error', message: error.message, req })
      return res.status(500).json({ success: false, message: error.message })
    }

    const { error: combinedPaymentInsertError } = await supabase.from('payments').insert([{
      razorpay_order_id: invoiceInfo.invoiceRef,
      event_type: 'talent-combined',
      amount: invoiceInfo.totalAmount,
      base_amount: invoiceInfo.baseFee,
      gst_amount: invoiceInfo.gstAmount,
      payer_name: contactName,
      payer_email: contactEmail,
      payer_phone: contactPhone,
      receipt_id: invoiceInfo.receiptId,
      invoice_number: invoiceInfo.invoiceNumber,
      status: 'created',
      registration_id: data?.id || null
    }])

    if (combinedPaymentInsertError) {
      console.error('[talent-combined] Payment insert failed:', combinedPaymentInsertError.message)
      await logError({ source: 'user', endpoint: '/api/talent-combined', method: 'POST', errorType: 'db_error', message: `payment insert failed: ${combinedPaymentInsertError.message}`, req })
    }

    console.log('Database insertion successful')
    res.status(201).json({
      success: true,
      data,
      invoice_link: invoiceInfo.invoice.short_url,
      invoice_id: invoiceInfo.invoice.id,
      receipt_id: invoiceInfo.receiptId,
    })
  } catch (err) {
    console.log('Î“Â¥Ã® Unexpected error:', err.message)
    console.log('Stack trace:', err.stack)
    await logError({ source: 'user', endpoint: '/api/talent-combined', method: 'POST', errorType: 'server_error', message: err.message, stack: err.stack, req })
    res.status(500).json({ success: false, message: err.message })
  }
})

// Î“Ã¶Ã‡Î“Ã¶Ã‡ Short Film Contest Registration Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡
// POST /api/shortfilm
app.post('/api/shortfilm', registrationLimiter, async (req, res) => {
  try {
    const {
      filmTitle, genre, duration, synopsis, filmUrl, filmLanguage,
      participationType, teamMembers,
      hasSubtitles, hasAudioDescription,
      directorName, teamName, collegeName,
      contactName, contactEmail, contactPhone, additionalInfo,
    } = req.body

    // Î“Ã¶Ã‡Î“Ã¶Ã‡ Payment Verification Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡
    // Î“Ã¶Ã‡Î“Ã¶Ã‡ Validation Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡
    const errors = validate([
      { field: 'filmTitle', check: filmTitle && sanitizeText(filmTitle, 200).length > 0, msg: 'required, max 200 chars' },
      { field: 'genre', check: genre && sanitizeText(genre, 100).length > 0, msg: 'required' },
      { field: 'duration', check: isValidInt(duration, 1, 3), msg: 'must be 1Î“Ã‡Ã´3 minutes (strict event rule)' },
      { field: 'synopsis', check: synopsis && sanitizeText(synopsis, 2000).length > 0, msg: 'required, max 2000 chars' },
      { field: 'filmUrl', check: filmUrl && isValidURL(filmUrl), msg: 'must be a valid http/https URL' },
      { field: 'participationType', check: isValidEnum(participationType, ['individual', 'team']), msg: 'must be individual or team' },
      { field: 'hasSubtitles', check: hasSubtitles === true || hasSubtitles === 'true', msg: 'subtitles/captions are mandatory for this event' },
      { field: 'hasAudioDescription', check: hasAudioDescription === true || hasAudioDescription === 'true', msg: 'audio description is mandatory for this event' },
      { field: 'directorName', check: directorName && sanitizeText(directorName, 100).length > 0, msg: 'required' },
      { field: 'contactName', check: contactName && sanitizeText(contactName, 100).length > 0, msg: 'required' },
      { field: 'contactEmail', check: isValidEmail(contactEmail), msg: 'invalid email' },
      { field: 'contactPhone', check: isValidPhone(contactPhone), msg: 'must be exactly 10 digits' },
    ])
    if (errors.length) return res.status(400).json({ success: false, message: 'Validation failed', errors })

    const invoiceInfo = await createRazorpayInvoice({
      eventType: 'shortfilm',
      name: contactName,
      email: contactEmail,
      phone: contactPhone,
    })

    // Parse and validate team members (only for team participation)
    let parsedTeamMembers = null
    if (participationType === 'team') {
      try {
        parsedTeamMembers = typeof teamMembers === 'string' ? JSON.parse(teamMembers) : (teamMembers || [])
      } catch (_) { parsedTeamMembers = [] }
      parsedTeamMembers = parsedTeamMembers
        .map(n => sanitizeText(String(n), 100))
        .filter(Boolean)
        .slice(0, 3) // enforce max 3
      if (parsedTeamMembers.length === 0) {
        return res.status(400).json({ success: false, message: 'Validation failed', errors: [{ field: 'teamMembers', msg: 'at least one team member name is required' }] })
      }
    }

    const { data, error } = await supabase
      .from('shortfilm_registrations')
      .insert([{
        film_title: sanitizeText(filmTitle, 200),
        genre: sanitizeText(genre, 100),
        duration: parseInt(duration, 10),
        synopsis: sanitizeText(synopsis, 2000),
        film_url: filmUrl.trim(),
        film_language: filmLanguage ? sanitizeText(filmLanguage, 100) : null,
        participation_type: participationType.trim(),
        team_members: parsedTeamMembers,
        has_subtitles: hasSubtitles === true || hasSubtitles === 'true',
        has_audio_description: hasAudioDescription === true || hasAudioDescription === 'true',
        director_name: sanitizeText(directorName, 100),
        team_name: teamName ? sanitizeText(teamName, 200) : null,
        college_name: collegeName ? sanitizeText(collegeName, 200) : null,
        contact_name: sanitizeText(contactName, 100),
        contact_email: contactEmail.trim().toLowerCase(),
        contact_phone: contactPhone.trim(),
        additional_info: additionalInfo ? sanitizeText(additionalInfo, 1000) : null,
        razorpay_order_id: invoiceInfo.invoiceRef,
        razorpay_payment_id: null,
        payment_status: 'pending'
      }])
      .select()
      .single()

    if (error) {
      await logError({ source: 'user', endpoint: '/api/shortfilm', method: 'POST', errorType: 'db_error', message: error.message, req })
      return res.status(500).json({ success: false, message: error.message })
    }

    const { error: shortfilmPaymentInsertError } = await supabase.from('payments').insert([{
      razorpay_order_id: invoiceInfo.invoiceRef,
      event_type: 'shortfilm',
      amount: invoiceInfo.totalAmount,
      base_amount: invoiceInfo.baseFee,
      gst_amount: invoiceInfo.gstAmount,
      payer_name: contactName,
      payer_email: contactEmail,
      payer_phone: contactPhone,
      receipt_id: invoiceInfo.receiptId,
      invoice_number: invoiceInfo.invoiceNumber,
      status: 'created',
      registration_id: data.id
    }])

    if (shortfilmPaymentInsertError) {
      console.error('[shortfilm] Payment insert failed:', shortfilmPaymentInsertError.message)
      await logError({ source: 'user', endpoint: '/api/shortfilm', method: 'POST', errorType: 'db_error', message: `payment insert failed: ${shortfilmPaymentInsertError.message}`, req })
    }

    res.status(201).json({
      success: true,
      data,
      invoice_link: invoiceInfo.invoice.short_url,
      invoice_id: invoiceInfo.invoice.id,
      receipt_id: invoiceInfo.receiptId,
    })
  } catch (err) {
    await logError({ source: 'user', endpoint: '/api/shortfilm', method: 'POST', errorType: 'server_error', message: err.message, stack: err.stack, req })
    res.status(500).json({ success: false, message: err.message })
  }
})

// Î“Ã¶Ã‡Î“Ã¶Ã‡ 5. Blind Cricket Tournament Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡
// POST /api/cricket
app.post('/api/cricket', registrationLimiter, async (req, res) => {
  try {
    const {
      teamName, city, state, playerCount,
      hasPlayedBefore, additionalInfo,
      teamType, teamTypeOther,
      contactName, contactEmail, contactPhone,
      tournamentExperience,
    } = req.body

    // Î“Ã¶Ã‡Î“Ã¶Ã‡ Payment Verification Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡
    // Î“Ã¶Ã‡Î“Ã¶Ã‡ Validation Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡
    const errors = validate([
      { field: 'teamName', check: teamName && sanitizeText(teamName, 100).length > 0, msg: 'required, max 100 chars' },
      { field: 'city', check: city && sanitizeText(city, 100).length > 0, msg: 'required' },
      { field: 'state', check: state && sanitizeText(state, 100).length > 0, msg: 'required' },
      { field: 'playerCount', check: isValidInt(playerCount, 1, 50), msg: 'must be 1Î“Ã‡Ã´50' },
      { field: 'hasPlayedBefore', check: isValidEnum(hasPlayedBefore, ['yes', 'no']), msg: 'must be yes or no' },
      { field: 'contactName', check: contactName && sanitizeText(contactName, 100).length > 0, msg: 'required' },
      { field: 'contactEmail', check: isValidEmail(contactEmail), msg: 'invalid email' },
      { field: 'contactPhone', check: isValidPhone(contactPhone), msg: 'must be exactly 10 digits' },
      { field: 'teamType', check: teamType && sanitizeText(teamType, 100).length > 0, msg: 'required' },
    ])
    if (teamType && String(teamType).toLowerCase() === 'other' && !sanitizeText(teamTypeOther, 100)) {
      errors.push({ field: 'teamTypeOther', msg: 'required when team type is Other' })
    }
    // Validate tournament experience JSON
    if (tournamentExperience) {
      try {
        const experience = JSON.parse(tournamentExperience)
        if (experience.hasPlayedBefore === true) {
          if (!experience.tournamentCount || !isValidInt(experience.tournamentCount, 1, 1000)) {
            errors.push({ field: 'tournamentExperience', msg: 'tournament count must be a positive number between 1-1000' })
          }
          if (!experience.eventNames || !sanitizeText(experience.eventNames, 2000)) {
            errors.push({ field: 'tournamentExperience', msg: 'event names are required when team has played before' })
          }
        }
      } catch (jsonError) {
        errors.push({ field: 'tournamentExperience', msg: 'invalid JSON format' })
      }
    }
    if (errors.length) return res.status(400).json({ success: false, message: 'Validation failed', errors })

    const invoiceInfo = await createRazorpayInvoice({
      eventType: 'cricket',
      name: contactName,
      email: contactEmail,
      phone: contactPhone,
    })

    const { data, error } = await supabase
      .from('cricket_team_registrations')
      .insert([{
        team_name: sanitizeText(teamName, 100),
        city: sanitizeText(city, 100),
        state: sanitizeText(state, 100),
        player_count: parseInt(playerCount, 10),
        has_played_before: hasPlayedBefore === 'yes',
        tournament_experience: tournamentExperience ? tournamentExperience : null,
        additional_info: additionalInfo ? sanitizeText(additionalInfo, 1000) : null,
        contact_name: sanitizeText(contactName, 100),
        contact_email: contactEmail.trim().toLowerCase(),
        contact_phone: contactPhone.trim(),
        razorpay_order_id: invoiceInfo.invoiceRef,
        razorpay_payment_id: null,
        payment_status: 'pending'
      }])
      .select()
      .single()

    if (error) {
      await logError({ source: 'user', endpoint: '/api/cricket', method: 'POST', errorType: 'db_error', message: error.message, req })
      return res.status(500).json({ success: false, message: error.message })
    }

    const { error: cricketPaymentInsertError } = await supabase.from('payments').insert([{
      razorpay_order_id: invoiceInfo.invoiceRef,
      event_type: 'cricket',
      amount: invoiceInfo.totalAmount,
      base_amount: invoiceInfo.baseFee,
      gst_amount: invoiceInfo.gstAmount,
      payer_name: contactName,
      payer_email: contactEmail,
      payer_phone: contactPhone,
      receipt_id: invoiceInfo.receiptId,
      invoice_number: invoiceInfo.invoiceNumber,
      status: 'created',
      registration_id: data.id
    }])

    if (cricketPaymentInsertError) {
      console.error('[cricket] Payment insert failed:', cricketPaymentInsertError.message)
      await logError({ source: 'user', endpoint: '/api/cricket', method: 'POST', errorType: 'db_error', message: `payment insert failed: ${cricketPaymentInsertError.message}`, req })
    }

    res.status(201).json({
      success: true,
      data,
      invoice_link: invoiceInfo.invoice.short_url,
      invoice_id: invoiceInfo.invoice.id,
      receipt_id: invoiceInfo.receiptId,
    })
  } catch (err) {
    await logError({ source: 'user', endpoint: '/api/cricket', method: 'POST', errorType: 'server_error', message: err.message, stack: err.stack, req })
    res.status(500).json({ success: false, message: err.message })
  }
})

// Î“Ã¶Ã‡Î“Ã¶Ã‡ 6. Blind Chess Competition Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡
// POST /api/chess
app.post('/api/chess', registrationLimiter, async (req, res) => {
  try {
    const {
      participantName, email, phone, age,
      city, state, disabilityType, disabilityTypeOther,
      hasPlayedBefore, experienceLevel, experienceLevelOther, additionalInfo,
    } = req.body

    // Î“Ã¶Ã‡Î“Ã¶Ã‡ Validation Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡
    const errors = validate([
      { field: 'participantName', check: participantName && sanitizeText(participantName, 100).length > 0, msg: 'required, max 100 chars' },
      { field: 'email', check: isValidEmail(email), msg: 'invalid email' },
      { field: 'phone', check: isValidPhone(phone), msg: 'must be exactly 10 digits' },
      { field: 'age', check: isValidInt(age, 5, 100), msg: 'must be 5Î“Ã‡Ã´100' },
      { field: 'city', check: city && sanitizeText(city, 100).length > 0, msg: 'required' },
      { field: 'state', check: state && sanitizeText(state, 100).length > 0, msg: 'required' },
      { field: 'disabilityType', check: disabilityType && sanitizeText(disabilityType, 100).length > 0, msg: 'required' },
      { field: 'hasPlayedBefore', check: isValidEnum(hasPlayedBefore, ['yes', 'no']), msg: 'must be yes or no' },
      { field: 'experienceLevel', check: isValidEnum(experienceLevel, ['beginner', 'intermediate', 'advanced', 'other']), msg: 'must be beginner, intermediate, advanced, or other' },
    ])
    if (disabilityType && Array.isArray(disabilityType) && disabilityType.includes('Other') && !sanitizeText(disabilityTypeOther, 100)) {
      errors.push({ field: 'disabilityTypeOther', msg: 'required when disability type is Other' })
    } else if (disabilityType && String(disabilityType).toLowerCase() === 'other' && !sanitizeText(disabilityTypeOther, 100)) {
      errors.push({ field: 'disabilityTypeOther', msg: 'required when disability type is Other' })
    }
    if (experienceLevel && String(experienceLevel).toLowerCase() === 'other' && !sanitizeText(experienceLevelOther, 100)) {
      errors.push({ field: 'experienceLevelOther', msg: 'required when experience level is Other' })
    }
    if (errors.length) return res.status(400).json({ success: false, message: 'Validation failed', errors })

    const invoiceInfo = await createRazorpayInvoice({
      eventType: 'chess',
      name: participantName,
      email,
      phone,
    })

    const effectiveDisability = (() => {
      let disabilityTypes = []
      if (Array.isArray(disabilityType)) {
        disabilityTypes = disabilityType
      } else if (typeof disabilityType === 'string' && disabilityType) {
        disabilityTypes = [disabilityType]
      }

      const processedDisabilities = disabilityTypes.map(type =>
        String(type).toLowerCase() === 'other'
          ? sanitizeText(disabilityTypeOther, 100)
          : sanitizeText(type, 100)
      ).filter(Boolean)

      return processedDisabilities.join(', ')
    })()
    const effectiveExperience = String(experienceLevel).toLowerCase() === 'other'
      ? sanitizeText(experienceLevelOther, 100)
      : experienceLevel

    const { data, error } = await supabase
      .from('blind_chess_registrations')
      .insert([{
        participant_name: sanitizeText(participantName, 100),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        age: parseInt(age, 10),
        city: sanitizeText(city, 100),
        state: sanitizeText(state, 100),
        disability_type: effectiveDisability,
        has_played_before: hasPlayedBefore === 'yes',
        experience_level: effectiveExperience,
        additional_info: additionalInfo ? sanitizeText(additionalInfo, 1000) : null,
        razorpay_order_id: invoiceInfo.invoiceRef,
        razorpay_payment_id: null,
        payment_status: 'pending',
      }])
      .select()
      .single()

    if (error) {
      await logError({ source: 'user', endpoint: '/api/chess', method: 'POST', errorType: 'db_error', message: error.message, req })
      return res.status(500).json({ success: false, message: error.message })
    }

    const { error: chessPaymentInsertError } = await supabase.from('payments').insert([{
      razorpay_order_id: invoiceInfo.invoiceRef,
      event_type: 'chess',
      amount: invoiceInfo.totalAmount,
      base_amount: invoiceInfo.baseFee,
      gst_amount: invoiceInfo.gstAmount,
      payer_name: participantName,
      payer_email: email,
      payer_phone: phone,
      receipt_id: invoiceInfo.receiptId,
      invoice_number: invoiceInfo.invoiceNumber,
      status: 'created',
      registration_id: data.id
    }])

    if (chessPaymentInsertError) {
      console.error('[chess] Payment insert failed:', chessPaymentInsertError.message)
      await logError({ source: 'user', endpoint: '/api/chess', method: 'POST', errorType: 'db_error', message: `payment insert failed: ${chessPaymentInsertError.message}`, req })
    }
    res.status(201).json({
      success: true,
      data,
      invoice_link: invoiceInfo.invoice.short_url,
      invoice_id: invoiceInfo.invoice.id,
      receipt_id: invoiceInfo.receiptId,
    })
  } catch (err) {
    await logError({ source: 'user', endpoint: '/api/chess', method: 'POST', errorType: 'server_error', message: err.message, stack: err.stack, req })
    res.status(500).json({ success: false, message: err.message })
  }
})

// Î“Ã¶Ã‡Î“Ã¶Ã‡ 6. Accommodation Request Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡
// POST /api/accommodation-request
app.post('/api/accommodation-request', registrationLimiter, async (req, res) => {
  try {
    console.log('â‰¡Æ’Ã…Â¿ Accommodation Request Received:', req.body)

    const {
      fullName,
      email,
      phone,
      organization,
      arrivalDate,
      departureDate,
      roomType,
      accessibilityNeeds,
      specialRequests,
      dietaryRequirements,
      emergencyContactName,
      emergencyContactPhone
    } = req.body

    // Validation
    if (!fullName?.trim()) {
      return res.status(400).json({ success: false, message: 'Full name is required' })
    }
    if (!email?.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Valid email is required' })
    }
    if (!phone?.trim() || !/^\d{10}$/.test(phone.replace(/\D/g, ''))) {
      return res.status(400).json({ success: false, message: 'Valid 10-digit phone number is required' })
    }
    if (!arrivalDate || !departureDate) {
      return res.status(400).json({ success: false, message: 'Arrival and departure dates are required' })
    }
    if (!roomType) {
      return res.status(400).json({ success: false, message: 'Room type selection is required' })
    }

    // Date validation
    const arrival = new Date(arrivalDate)
    const departure = new Date(departureDate)
    if (departure <= arrival) {
      return res.status(400).json({ success: false, message: 'Departure date must be after arrival date' })
    }

    // Insert into database
    const { data, error } = await supabase
      .from('accommodation_requests')
      .insert([{
        full_name: sanitizeText(fullName, 100),
        email: email.trim().toLowerCase(),
        phone: phone.replace(/\D/g, ''),
        organization: organization?.trim() || null,
        arrival_date: arrivalDate,
        departure_date: departureDate,
        room_type: roomType,
        accessibility_needs: accessibilityNeeds?.trim() || null,
        special_requests: specialRequests?.trim() || null,
        dietary_requirements: dietaryRequirements?.trim() || null,
        emergency_contact_name: emergencyContactName?.trim() || null,
        emergency_contact_phone: emergencyContactPhone?.replace(/\D/g, '') || null
      }])
      .select()
      .single()

    if (error) {
      await logError({ source: 'user', endpoint: '/api/accommodation-request', method: 'POST', errorType: 'db_error', message: error.message, req })
      return res.status(500).json({ success: false, message: error.message })
    }

    const requestId = data.id

    // Send notification email to admin
    try {
      const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })

      const adminEmailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #0ea5e9 0%, #84cc16 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">â‰¡Æ’Ã…Â¿ New Accommodation Request</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">VYUGA Event Portal</p>
          </div>
          
          <div style="padding: 30px; background: #f8fafc;">
            <h2 style="color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 20px;">
              Request Details
            </h2>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #0ea5e9; margin: 0 0 15px 0;">Personal Information</h3>
              <p><strong>Name:</strong> ${fullName}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Phone:</strong> ${phone}</p>
              ${organization ? `<p><strong>Organization:</strong> ${organization}</p>` : ''}
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #0ea5e9; margin: 0 0 15px 0;">Stay Details</h3>
              <p><strong>Arrival:</strong> ${formatDate(arrivalDate)}</p>
              <p><strong>Departure:</strong> ${formatDate(departureDate)}</p>
              <p><strong>Room Type:</strong> ${roomType.replace(/^\w/, c => c.toUpperCase())}</p>
            </div>
            
            ${accessibilityNeeds || specialRequests || dietaryRequirements ? `
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #0ea5e9; margin: 0 0 15px 0;">Special Requirements</h3>
              ${accessibilityNeeds ? `<p><strong>Accessibility Needs:</strong><br>${accessibilityNeeds}</p>` : ''}
              ${dietaryRequirements ? `<p><strong>Dietary Requirements:</strong><br>${dietaryRequirements}</p>` : ''}
              ${specialRequests ? `<p><strong>Special Requests:</strong><br>${specialRequests}</p>` : ''}
            </div>
            ` : ''}
            
            ${emergencyContactName || emergencyContactPhone ? `
            <div style="background: white; padding: 20px; border-radius: 8px;">
              <h3 style="color: #0ea5e9; margin: 0 0 15px 0;">Emergency Contact</h3>
              ${emergencyContactName ? `<p><strong>Name:</strong> ${emergencyContactName}</p>` : ''}
              ${emergencyContactPhone ? `<p><strong>Phone:</strong> ${emergencyContactPhone}</p>` : ''}
            </div>
            ` : ''}
            
            <div style="margin-top: 30px; padding: 20px; background: #e0f2fe; border-radius: 8px; text-align: center;">
              <p style="margin: 0; color: #0369a1; font-size: 14px;">
                <strong>Request ID:</strong> ${requestId}
              </p>
              <p style="margin: 5px 0 0 0; color: #64748b; font-size: 12px;">
                Please contact the guest within 24-48 hours with availability and pricing details.
              </p>
            </div>
          </div>
        </div>
      `

      await transporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@vyuga.org',
        to: 'vikasthangavel@gmail.com',
        subject: `â‰¡Æ’Ã…Â¿ New Accommodation Request - ${fullName}`,
        html: adminEmailHtml
      })

      console.log('Admin notification email sent successfully')
    } catch (emailError) {
      console.error('Î“Â¥Ã® Failed to send admin notification:', emailError)
      // Don't fail the request if email fails
    }

    // Send confirmation email to user
    try {
      const confirmationEmailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #0ea5e9 0%, #84cc16 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">â‰¡Æ’Ã…Â¿ Accommodation Request Received</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">VYUGA Event Portal</p>
          </div>
          
          <div style="padding: 30px; background: #f8fafc;">
            <p style="font-size: 16px; color: #1e293b; margin-bottom: 25px;">
              Dear ${fullName},
            </p>
            
            <p style="color: #475569; line-height: 1.6; margin-bottom: 20px;">
              Thank you for submitting your accommodation request for the VYUGA event. We have received your request and our team will review it shortly.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #0ea5e9; margin: 0 0 15px 0;">Your Request Summary</h3>
              <p><strong>Arrival:</strong> ${formatDate(arrivalDate)}</p>
              <p><strong>Departure:</strong> ${formatDate(departureDate)}</p>
              <p><strong>Room Type:</strong> ${roomType.replace(/^\w/, c => c.toUpperCase())}</p>
              <p style="margin: 0;"><strong>Request ID:</strong> ${requestId}</p>
            </div>
            
            <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; border-left: 4px solid #0ea5e9; margin-bottom: 25px;">
              <h3 style="color: #0369a1; margin: 0 0 10px 0;">What Happens Next?</h3>
              <ul style="color: #475569; margin: 0; padding-left: 20px;">
                <li>Our team will review your accommodation needs</li>
                <li>We'll check availability with our partner hotels and campus facilities</li>
                <li>You'll receive a detailed response within 24-48 hours with:</li>
                <ul style="margin-top: 5px;">
                  <li>Available accommodation options</li>
                  <li>Pricing details</li>
                  <li>Booking confirmation process</li>
                </ul>
              </ul>
            </div>
            
            <p style="color: #475569; line-height: 1.6; margin-bottom: 25px;">
              If you have any urgent questions, please don't hesitate to contact us at 
              <a href="mailto:accommodation@vyuga.org" style="color: #0ea5e9;">accommodation@vyuga.org</a>.
            </p>
            
            <p style="color: #64748b; font-size: 14px; margin: 0;">
              Best regards,<br>
              <strong>VYUGA Accommodation Team</strong>
            </p>
          </div>
        </div>
      `

      await transporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@vyuga.org',
        to: email,
        subject: 'â‰¡Æ’Ã…Â¿ Accommodation Request Confirmed - VYUGA',
        html: confirmationEmailHtml
      })

      console.log('User confirmation email sent successfully')
    } catch (emailError) {
      console.error('Î“Â¥Ã® Failed to send user confirmation:', emailError)
      // Don't fail the request if email fails
    }

    console.log('Accommodation request processed successfully')
    res.status(201).json({
      success: true,
      message: 'Accommodation request submitted successfully',
      requestId
    })

  } catch (error) {
    console.error('Î“Â¥Ã® Accommodation Request Error:', error)
    await logError({ source: 'user', endpoint: '/api/accommodation-request', method: 'POST', errorType: 'server_error', message: error.message, stack: error.stack, req })
    res.status(500).json({
      success: false,
      message: 'Failed to submit accommodation request'
    })
  }
})

// Î“Ã¶Ã‡Î“Ã¶Ã‡ Sponsor Message Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡
// POST /api/sponsors
app.post('/api/sponsors', registrationLimiter, sponsorUpload.single('logo'), async (req, res) => {
  const { name, phone, email, message, orgName, sponsorType, amount, website } = req.body
  const logoPath = req.file ? `logo/${req.file.filename}` : null

  if (!name || !phone || !email || !orgName || !sponsorType || !amount || !logoPath) {
    if (req.file) fs.unlinkSync(req.file.path) // Cleanup if validation fails
    return res.status(400).json({ success: false, message: 'Missing required fields or logo' })
  }

  try {
    const { data, error } = await supabase
      .from('sponsor_messages')
      .insert([{
        name,
        phone,
        email,
        message,
        org_name: orgName,
        sponsor_type: sponsorType,
        amount: parseFloat(amount),
        website_url: website || null,
        logo_path: logoPath
      }])
      .select()
      .single()

    if (error) {
      if (req.file) fs.unlinkSync(req.file.path) // Cleanup on DB error
      await logError({ source: 'user', endpoint: '/api/sponsors', method: 'POST', errorType: 'db_error', message: error.message, req })
      return res.status(500).json({ success: false, message: error.message })
    }

    res.json({ success: true, message: 'Sponsor interest submitted successfully', data })
  } catch (err) {
    if (req.file) fs.unlinkSync(req.file.path) // Cleanup on error
    console.error('Î“Â¥Ã® Sponsor Message Error:', err)
    await logError({ source: 'user', endpoint: '/api/sponsors', method: 'POST', errorType: 'server_error', message: err.message, stack: err.stack, req })
    res.status(500).json({ success: false, message: 'Internal Server Error' })
  }
})

// Î“Ã¶Ã‡Î“Ã¶Ã‡ Gallery (Public) Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡
app.get('/api/gallery', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('gallery_images')
      .select('id, title, image_url, created_at')
      .order('created_at', { ascending: false })
    if (error) throw error
    res.json({ success: true, data })
  } catch (err) {
    console.error('Î“Â¥Ã® Gallery fetch error:', err)
    await logError({ source: 'user', endpoint: '/api/gallery', method: 'GET', errorType: 'server_error', message: err.message, stack: err.stack, req })
    res.status(500).json({ success: false, message: 'Failed to fetch gallery' })
  }
})

// Î“Ã¶Ã‡Î“Ã¶Ã‡ Global Form Settings (Public) Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡
app.get('/api/form-settings', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('form_settings')
      .select('id, name, is_open, registration_fee_paise')

    if (error) throw error
    res.json({ success: true, data })
  } catch (err) {
    console.error('Fetch form settings error:', err)
    await logError({ source: 'user', endpoint: '/api/form-settings', method: 'GET', errorType: 'server_error', message: err.message, stack: err.stack, req })
    res.status(500).json({ success: false, message: 'Failed to fetch form settings' })
  }
})

// Î“Ã¶Ã‡Î“Ã¶Ã‡ Admin middleware Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡
function requireAdmin(req, res, next) {
  const token = req.headers['x-admin-token'] || req.query.token
  if (!token || token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ success: false, message: 'Unauthorized' })
  }
  next()
}

// Î“Ã¶Ã‡Î“Ã¶Ã‡ Admin: verify token Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡
app.post('/api/admin/login', loginLimiter, (req, res) => {
  try {
    const { password } = req.body
    if (!password || typeof password !== 'string' || password.length > 200) {
      return res.status(400).json({ success: false, message: 'Invalid password format' })
    }
    if (password === process.env.ADMIN_TOKEN) {
      res.json({ success: true, token: process.env.ADMIN_TOKEN })
    } else {
      logError({ source: 'admin', endpoint: '/api/admin/login', method: 'POST', errorType: 'auth_error', message: 'Invalid password attempt', req })
      res.status(401).json({ success: false, message: 'Invalid password' })
    }
  } catch (err) {
    logError({ source: 'admin', endpoint: '/api/admin/login', method: 'POST', errorType: 'server_error', message: err.message, stack: err.stack, req })
    res.status(500).json({ success: false, message: err.message })
  }
})

// Î“Ã¶Ã‡Î“Ã¶Ã‡ Admin: Gallery Upload Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡
app.post('/api/admin/gallery', requireAdmin, galleryUpload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Image file is required' })
    const title = (req.body.title || '').trim().slice(0, 200)
    const imageUrl = `/uploads/gallery/${req.file.filename}`
    const { data, error } = await supabase
      .from('gallery_images')
      .insert([{ title, image_url: imageUrl }])
      .select()
      .single()
    if (error) {
      fs.unlinkSync(req.file.path)
      await logError({ source: 'admin', endpoint: '/api/admin/gallery', method: 'POST', errorType: 'db_error', message: error.message, req })
      return res.status(500).json({ success: false, message: error.message })
    }
    res.json({ success: true, data })
  } catch (err) {
    if (req.file) fs.unlinkSync(req.file.path)
    console.error('Î“Â¥Ã® Gallery upload error:', err)
    await logError({ source: 'admin', endpoint: '/api/admin/gallery', method: 'POST', errorType: 'server_error', message: err.message, stack: err.stack, req })
    res.status(500).json({ success: false, message: 'Upload failed' })
  }
})

app.delete('/api/admin/gallery/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    if (!id) return res.status(400).json({ success: false, message: 'ID required' })
    const { data: row, error: fetchErr } = await supabase
      .from('gallery_images')
      .select('image_url')
      .eq('id', id)
      .single()
    if (fetchErr) {
      await logError({ source: 'admin', endpoint: `/api/admin/gallery/${id}`, method: 'DELETE', errorType: 'db_error', message: fetchErr.message, req })
      return res.status(404).json({ success: false, message: 'Image not found' })
    }
    const { error } = await supabase.from('gallery_images').delete().eq('id', id)
    if (error) {
      await logError({ source: 'admin', endpoint: `/api/admin/gallery/${id}`, method: 'DELETE', errorType: 'db_error', message: error.message, req })
      return res.status(500).json({ success: false, message: error.message })
    }
    // Also delete physical file
    if (row && row.image_url) {
      const filePath = path.join(__dirname, row.image_url.replace(/^\//, ''))
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
    }
    res.json({ success: true, message: 'Image deleted' })
  } catch (err) {
    console.error('Î“Â¥Ã® Gallery delete error:', err)
    await logError({ source: 'admin', endpoint: `/api/admin/gallery/${req.params?.id}`, method: 'DELETE', errorType: 'server_error', message: err.message, stack: err.stack, req })
    res.status(500).json({ success: false, message: 'Delete failed' })
  }
})

// Î“Ã¶Ã‡Î“Ã¶Ã‡ Admin: all innovation-college registrations Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡
app.get('/api/admin/innovation-college', requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('innovation_college_registrations')
      .select('*')
      .order('submitted_at', { ascending: false })
    if (error) {
      await logError({ source: 'admin', endpoint: '/api/admin/innovation-college', method: 'GET', errorType: 'db_error', message: error.message, req })
      return res.status(500).json({ success: false, message: error.message })
    }
    res.json({ success: true, data })
  } catch (err) {
    await logError({ source: 'admin', endpoint: '/api/admin/innovation-college', method: 'GET', errorType: 'server_error', message: err.message, stack: err.stack, req })
    res.status(500).json({ success: false, message: err.message })
  }
})

// Î“Ã¶Ã‡Î“Ã¶Ã‡ Admin: all innovation-pwd registrations Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡
app.get('/api/admin/innovation-pwd', requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('innovation_pwd_registrations')
      .select('*')
      .order('submitted_at', { ascending: false })
    if (error) {
      await logError({ source: 'admin', endpoint: '/api/admin/innovation-pwd', method: 'GET', errorType: 'db_error', message: error.message, req })
      return res.status(500).json({ success: false, message: error.message })
    }
    res.json({ success: true, data })
  } catch (err) {
    await logError({ source: 'admin', endpoint: '/api/admin/innovation-pwd', method: 'GET', errorType: 'server_error', message: err.message, stack: err.stack, req })
    res.status(500).json({ success: false, message: err.message })
  }
})

// Î“Ã¶Ã‡Î“Ã¶Ã‡ Admin: all talent organisations Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡
app.get('/api/admin/talent-org', requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('talent_organizations')
      .select('*')
      .order('registered_at', { ascending: false })
    if (error) {
      await logError({ source: 'admin', endpoint: '/api/admin/talent-org', method: 'GET', errorType: 'db_error', message: error.message, req })
      return res.status(500).json({ success: false, message: error.message })
    }
    res.json({ success: true, data })
  } catch (err) {
    await logError({ source: 'admin', endpoint: '/api/admin/talent-org', method: 'GET', errorType: 'server_error', message: err.message, stack: err.stack, req })
    res.status(500).json({ success: false, message: err.message })
  }
})

// Î“Ã¶Ã‡Î“Ã¶Ã‡ Admin: all talent nominations Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡
app.get('/api/admin/talent-student', requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('talent_nominations')
      .select('*')
      .order('submitted_at', { ascending: false })
    if (error) {
      await logError({ source: 'admin', endpoint: '/api/admin/talent-student', method: 'GET', errorType: 'db_error', message: error.message, req })
      return res.status(500).json({ success: false, message: error.message })
    }
    res.json({ success: true, data })
  } catch (err) {
    await logError({ source: 'admin', endpoint: '/api/admin/talent-student', method: 'GET', errorType: 'server_error', message: err.message, stack: err.stack, req })
    res.status(500).json({ success: false, message: err.message })
  }
})

// Î“Ã¶Ã‡Î“Ã¶Ã‡ Admin: all cricket registrations Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡
app.get('/api/admin/cricket', requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('cricket_team_registrations')
      .select('*')
      .order('submitted_at', { ascending: false })
    if (error) {
      await logError({ source: 'admin', endpoint: '/api/admin/cricket', method: 'GET', errorType: 'db_error', message: error.message, req })
      return res.status(500).json({ success: false, message: error.message })
    }
    res.json({ success: true, data })
  } catch (err) {
    await logError({ source: 'admin', endpoint: '/api/admin/cricket', method: 'GET', errorType: 'server_error', message: err.message, stack: err.stack, req })
    res.status(500).json({ success: false, message: err.message })
  }
})

// Î“Ã¶Ã‡Î“Ã¶Ã‡ Admin: all chess registrations Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡
app.get('/api/admin/chess', requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('blind_chess_registrations')
      .select('*')
      .order('submitted_at', { ascending: false })
    if (error) {
      await logError({ source: 'admin', endpoint: '/api/admin/chess', method: 'GET', errorType: 'db_error', message: error.message, req })
      return res.status(500).json({ success: false, message: error.message })
    }
    res.json({ success: true, data })
  } catch (err) {
    await logError({ source: 'admin', endpoint: '/api/admin/chess', method: 'GET', errorType: 'server_error', message: err.message, stack: err.stack, req })
    res.status(500).json({ success: false, message: err.message })
  }
})

// Î“Ã¶Ã‡Î“Ã¶Ã‡ Admin: all short film registrations Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡
app.get('/api/admin/shortfilm', requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('shortfilm_registrations')
      .select('*')
      .order('submitted_at', { ascending: false })
    if (error) {
      await logError({ source: 'admin', endpoint: '/api/admin/shortfilm', method: 'GET', errorType: 'db_error', message: error.message, req })
      return res.status(500).json({ success: false, message: error.message })
    }
    res.json({ success: true, data })
  } catch (err) {
    await logError({ source: 'admin', endpoint: '/api/admin/shortfilm', method: 'GET', errorType: 'server_error', message: err.message, stack: err.stack, req })
    res.status(500).json({ success: false, message: err.message })
  }
})

// Î“Ã¶Ã‡Î“Ã¶Ã‡ Admin: all accommodation requests Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡
app.get('/api/admin/accommodation', requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('accommodation_requests')
      .select('*')
      .order('submitted_at', { ascending: false })
    if (error) {
      await logError({ source: 'admin', endpoint: '/api/admin/accommodation', method: 'GET', errorType: 'db_error', message: error.message, req })
      return res.status(500).json({ success: false, message: error.message })
    }
    res.json({ success: true, data })
  } catch (err) {
    await logError({ source: 'admin', endpoint: '/api/admin/accommodation', method: 'GET', errorType: 'server_error', message: err.message, stack: err.stack, req })
    res.status(500).json({ success: false, message: err.message })
  }
})

// Î“Ã¶Ã‡Î“Ã¶Ã‡ Admin: all sponsor messages Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡
app.get('/api/admin/sponsors', requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('sponsor_messages')
      .select('*')
      .order('submitted_at', { ascending: false })
    if (error) {
      await logError({ source: 'admin', endpoint: '/api/admin/sponsors', method: 'GET', errorType: 'db_error', message: error.message, req })
      return res.status(500).json({ success: false, message: error.message })
    }
    res.json({ success: true, data })
  } catch (err) {
    await logError({ source: 'admin', endpoint: '/api/admin/sponsors', method: 'GET', errorType: 'server_error', message: err.message, stack: err.stack, req })
    res.status(500).json({ success: false, message: err.message })
  }
})

// Î“Ã¶Ã‡Î“Ã¶Ã‡ Admin: all payments Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡
app.get('/api/admin/payments', requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('id, event_type, amount, base_amount, gst_amount, payer_name, payer_email, payer_phone, status, created_at, razorpay_payment_id')
      .order('created_at', { ascending: false })
    if (error) {
      await logError({ source: 'admin', endpoint: '/api/admin/payments', method: 'GET', errorType: 'db_error', message: error.message, req })
      return res.status(500).json({ success: false, message: error.message })
    }
    res.json({ success: true, data })
  } catch (err) {
    await logError({ source: 'admin', endpoint: '/api/admin/payments', method: 'GET', errorType: 'server_error', message: err.message, stack: err.stack, req })
    res.status(500).json({ success: false, message: err.message })
  }
})

// Î“Ã¶Ã‡Î“Ã¶Ã‡ Admin: update registration status Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡
// PATCH /api/admin/status/:table/:id
// body: { status: 'approved'|'rejected'|'pending', adminNote? }
const TABLE_MAP = {
  'innovation-college': {
    table: 'innovation_college_registrations',
    emailField: 'leader_email',
    nameField: 'leader_name',
    event: 'Inclusive Innovation Fest (For Specially Abled)',
  },
  'innovation-pwd': {
    table: 'innovation_pwd_registrations',
    emailField: 'email',
    nameField: 'name',
    event: 'Inclusive Innovation Fest (By Specially Abled)',
  },
  'talent-student': {
    table: 'talent_nominations',
    emailField: 'contact_email',
    nameField: 'contact_name',
    event: 'Special Talent Utsav Î“Ã‡Ã´ Student Nomination',
  },
  cricket: {
    table: 'cricket_team_registrations',
    emailField: 'contact_email',
    nameField: 'contact_name',
    event: 'Blind Cricket Tournament',
  },
  chess: {
    table: 'blind_chess_registrations',
    emailField: 'email',
    nameField: 'participant_name',
    event: 'Blind Chess Competition',
  },
  shortfilm: {
    table: 'shortfilm_registrations',
    emailField: 'contact_email',
    nameField: 'contact_name',
    event: 'Short Film Contest',
  },
  accommodation: {
    table: 'accommodation_requests',
    emailField: 'email',
    nameField: 'full_name',
    event: 'Accommodation Request',
  },
}

app.patch('/api/admin/status/:type/:id', requireAdmin, async (req, res) => {
  try {
    const { type, id } = req.params
    const { status, adminNote } = req.body
    const meta = TABLE_MAP[type]
    if (!meta) return res.status(400).json({ success: false, message: 'Unknown type' })
    if (!isValidUUID(id)) return res.status(400).json({ success: false, message: 'Invalid record ID format' })
    if (!['selected', 'rejected', 'pending', 'waitlist'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' })
    }
    const safeNote = adminNote ? sanitizeText(adminNote, 1000) : null

    const { data, error } = await supabase
      .from(meta.table)
      .update({ status, admin_note: safeNote })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      await logError({ source: 'admin', endpoint: `/api/admin/status/${type}/${id}`, method: 'PATCH', errorType: 'db_error', message: error.message, req })
      return res.status(500).json({ success: false, message: error.message })
    }

    // Email notification has been moved to manual trigger route
    res.json({ success: true, data })
  } catch (err) {
    await logError({ source: 'admin', endpoint: `/api/admin/status/${req.params.type}/${req.params.id}`, method: 'PATCH', errorType: 'server_error', message: err.message, stack: err.stack, req })
    res.status(500).json({ success: false, message: err.message })
  }
})

// Î“Ã¶Ã‡Î“Ã¶Ã‡ Admin: trigger status email manually Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡
app.post('/api/admin/trigger-email/:type/:id', requireAdmin, async (req, res) => {
  try {
    const { type, id } = req.params
    const meta = TABLE_MAP[type]
    if (!meta) return res.status(400).json({ success: false, message: 'Unknown type' })
    if (!isValidUUID(id)) return res.status(400).json({ success: false, message: 'Invalid record ID format' })

    // Fetch the registration
    const { data: reg, error } = await supabase
      .from(meta.table)
      .select('*')
      .eq('id', id)
      .single()

    if (error || !reg) {
      await logError({ source: 'admin', endpoint: `/api/admin/trigger-email/${type}/${id}`, method: 'POST', errorType: 'db_error', message: error?.message || 'Record not found', req })
      return res.status(error ? 500 : 404).json({ success: false, message: error?.message || 'Record not found' })
    }

    if (!reg.status || reg.status === 'pending') {
      return res.status(400).json({ success: false, message: 'Cannot send email for pending status' })
    }

    const email = reg[meta.emailField]
    const name = reg[meta.nameField]

    if (!email) {
      return res.status(400).json({ success: false, message: 'No email found for this registration' })
    }

    // Send email
    try {
      await sendStatusUpdateEmail({ to: email, name, event: meta.event, status: reg.status, adminNote: reg.admin_note })
      console.log(`[manual-status-update] Email sent to ${email}`)

      // Update email_sent flag
      await supabase
        .from(meta.table)
        .update({ email_sent: true })
        .eq('id', id)

    } catch (err) {
      await logError({ source: 'admin', endpoint: `/api/admin/trigger-email/${type}/${id}`, method: 'POST', errorType: 'email_error', message: err.message, stack: err.stack, req })
      return res.status(500).json({ success: false, message: 'Failed to send email' })
    }

    res.json({ success: true, message: 'Email sent successfully' })
  } catch (err) {
    await logError({ source: 'admin', endpoint: `/api/admin/trigger-email/${req.params.type}/${req.params.id}`, method: 'POST', errorType: 'server_error', message: err.message, stack: err.stack, req })
    res.status(500).json({ success: false, message: err.message })
  }
})

// Î“Ã¶Ã‡Î“Ã¶Ã‡ Admin: trigger ALL status emails manually Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡
app.post('/api/admin/trigger-email-all/:type', requireAdmin, async (req, res) => {
  try {
    const { type } = req.params
    const meta = TABLE_MAP[type]
    if (!meta) return res.status(400).json({ success: false, message: 'Unknown type' })

    const { data: records, error } = await supabase
      .from(meta.table)
      .select('*')
      .neq('status', 'pending')
      .neq('status', null)
      .eq('email_sent', false)

    if (error) throw error
    if (!records || records.length === 0) {
      return res.json({ success: true, message: 'No eligible distinct emails found (all are pending or already sent)' })
    }

    let sentCount = 0
    let failedCount = 0

    for (const reg of records) {
      const email = reg[meta.emailField]
      const name = reg[meta.nameField]

      if (!email) {
        failedCount++
        continue
      }

      try {
        await sendStatusUpdateEmail({ to: email, name, event: meta.event, status: reg.status, adminNote: reg.admin_note })
        await supabase
          .from(meta.table)
          .update({ email_sent: true })
          .eq('id', reg.id)

        sentCount++
      } catch (err) {
        console.error(`Failed to send bulk email to ${email}:`, err.message)
        failedCount++
      }
    }

    const failedStr = failedCount > 0 ? ' (' + failedCount + ' failed)' : '';
    res.json({ success: true, message: `Successfully sent ${sentCount} emails.${failedStr}` })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// Î“Ã¶Ã‡Î“Ã¶Ã‡ Admin: Jury Management Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡

// Get Jury allocation stats across all events
app.get('/api/admin/jury/stats', requireAdmin, async (req, res) => {
  try {
    const stats = {}

    // Get ALL existing assignments to count "allocated" easily
    const { data: assignments, error: existErr } = await supabase
      .from('jury_assignments')
      .select('event_type')

    if (existErr) return res.status(500).json({ success: false, message: existErr.message })

    // Group allocated counts
    const allocatedCounts = {}
    assignments.forEach(a => {
      allocatedCounts[a.event_type] = (allocatedCounts[a.event_type] || 0) + 1
    })

    // Fetch total registration count per table
    for (const [evt, meta] of Object.entries(TABLE_MAP)) {
      const { count, error } = await supabase
        .from(meta.table)
        .select('*', { count: 'exact', head: true })

      if (!error) {
        const allocated = allocatedCounts[evt] || 0
        const total = count || 0
        stats[evt] = {
          total,
          allocated,
          unassigned: Math.max(0, total - allocated)
        }
      }
    }

    res.json({ success: true, data: stats })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})


// Get all Juries
app.get('/api/admin/jury', requireAdmin, async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from('jury_users')
      .select('id, username, name, phone, organization, designation, created_at')
      .order('created_at', { ascending: false })

    if (error) return res.status(500).json({ success: false, message: error.message })

    const { data: assignments, error: assignmentsErr } = await supabase
      .from('jury_assignments')
      .select('jury_id, event_type')

    if (assignmentsErr) return res.status(500).json({ success: false, message: assignmentsErr.message })

    // Build allocation counts
    const allocationMap = {}
    assignments.forEach(a => {
      if (!allocationMap[a.jury_id]) allocationMap[a.jury_id] = {}
      if (!allocationMap[a.jury_id][a.event_type]) allocationMap[a.jury_id][a.event_type] = 0
      allocationMap[a.jury_id][a.event_type]++
    })

    const data = users.map(u => ({
      ...u,
      allocations: allocationMap[u.id] || {}
    }))

    res.json({ success: true, data })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// Create new Jury
app.post('/api/admin/jury', requireAdmin, async (req, res) => {
  try {
    const { username, password, name, phone, organization, designation } = req.body
    if (!username || !password) return res.status(400).json({ success: false, message: 'Username and password required' })

    const { data, error } = await supabase
      .from('jury_users')
      .insert([{
        username: username.trim(),
        password,
        name: name ? name.trim() : null,
        phone: phone ? phone.trim() : null,
        organization: organization ? organization.trim() : null,
        designation: designation ? designation.trim() : null
      }])
      .select('id, username, name, phone, organization, designation, created_at')
      .single()

    if (error) return res.status(500).json({ success: false, message: error.message })
    res.json({ success: true, data })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// Update Jury
app.put('/api/admin/jury/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { username, password, name, phone, organization, designation } = req.body
    if (!username) return res.status(400).json({ success: false, message: 'Username is required' })

    // Prepare update payload
    let payload = {
      username: username.trim(),
      name: name ? name.trim() : null,
      phone: phone ? phone.trim() : null,
      organization: organization ? organization.trim() : null,
      designation: designation ? designation.trim() : null
    }

    // Only update password if provided
    if (password && password.trim() !== '') {
      payload.password = password
    }

    const { data, error } = await supabase
      .from('jury_users')
      .update(payload)
      .eq('id', id)
      .select('id, username, name, phone, organization, designation, created_at')
      .single()

    if (error) return res.status(500).json({ success: false, message: error.message })
    res.json({ success: true, data })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// Delete Jury
app.delete('/api/admin/jury/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { error } = await supabase
      .from('jury_users')
      .delete()
      .eq('id', id)

    if (error) return res.status(500).json({ success: false, message: error.message })
    res.json({ success: true, message: 'Jury deleted' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// Allocate Registrations to Jury
app.post('/api/admin/jury/allocate', requireAdmin, async (req, res) => {
  try {
    const { juryId, eventType, count } = req.body
    if (!juryId || !eventType || !count) return res.status(400).json({ success: false, message: 'Missing parameters' })

    const meta = TABLE_MAP[eventType]
    if (!meta) return res.status(400).json({ success: false, message: 'Unknown event type' })

    // Find registrations of this event type that are NOT in jury_assignments for this event
    const { data: unassigned, error: unassignedErr } = await supabase
      .from(meta.table)
      .select('id')
      .order('submitted_at', { ascending: true }) // Oldest first

    if (unassignedErr) return res.status(500).json({ success: false, message: unassignedErr.message })

    // Get ALL existing assignments for this event type across all juries to filter them out
    const { data: existingAssignments, error: existErr } = await supabase
      .from('jury_assignments')
      .select('registration_id')
      .eq('event_type', eventType)

    if (existErr) return res.status(500).json({ success: false, message: existErr.message })

    const assignedIds = new Set(existingAssignments.map(a => a.registration_id))

    // Filter unassigned
    const availableToAssign = unassigned.filter(r => !assignedIds.has(r.id)).slice(0, parseInt(count, 10))

    if (availableToAssign.length === 0) {
      return res.status(400).json({ success: false, message: 'No more unassigned registrations available for this event.' })
    }

    // Insert into jury_assignments
    const inserts = availableToAssign.map(r => ({
      jury_id: juryId,
      event_type: eventType,
      registration_id: r.id
    }))

    const { error: insertErr } = await supabase
      .from('jury_assignments')
      .insert(inserts)

    if (insertErr) return res.status(500).json({ success: false, message: insertErr.message })

    res.json({ success: true, message: `Successfully allocated ${inserts.length} registrations.`, count: inserts.length })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// Î“Ã¶Ã‡Î“Ã¶Ã‡ Jury Routes Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡

// Jury Login
app.post('/api/jury/login', loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body

    const { data, error } = await supabase
      .from('jury_users')
      .select('id, username, password, name, phone, organization, designation')
      .eq('username', username)
      .single()

    if (error || !data) return res.status(401).json({ success: false, message: 'Invalid credentials' })
    if (data.password !== password) return res.status(401).json({ success: false, message: 'Invalid credentials' })

    res.json({
      success: true,
      token: data.id,
      username: data.username,
      name: data.name,
      phone: data.phone,
      organization: data.organization,
      designation: data.designation
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// Middleware for Jury
function requireJury(req, res, next) {
  const token = req.headers['x-jury-token']
  if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' })
  // In a real app we'd verify a JWT, but here token is just jury ID
  req.juryId = token
  next()
}

// Get Allocated Registrations for a Jury
app.get('/api/jury/registrations', requireJury, async (req, res) => {
  try {
    const juryId = req.juryId

    const { data: assignments, error } = await supabase
      .from('jury_assignments')
      .select('registration_id, event_type')
      .eq('jury_id', juryId)

    if (error) return res.status(500).json({ success: false, message: error.message })

    // Fetch the actual registration data for these IDs
    const results = []

    // Group by event type to minimize queries
    const grouped = assignments.reduce((acc, curr) => {
      if (!acc[curr.event_type]) acc[curr.event_type] = []
      acc[curr.event_type].push(curr.registration_id)
      return acc
    }, {})

    // Also fetch evaluations by this jury so we know which ones are evaluated
    const { data: evaluations, error: evalErr } = await supabase
      .from('jury_evaluations')
      .select('registration_id, score, comments')
      .eq('jury_id', juryId)

    if (evalErr) return res.status(500).json({ success: false, message: evalErr.message })

    const evaluationMap = {}
    evaluations.forEach(e => {
      evaluationMap[e.registration_id] = { score: e.score, comments: e.comments }
    })

    for (const [eventType, ids] of Object.entries(grouped)) {
      const meta = TABLE_MAP[eventType]
      if (!meta) continue

      const { data: recs, error: fetchErr } = await supabase
        .from(meta.table)
        .select('*')
        .in('id', ids)

      if (!fetchErr && recs) {
        recs.forEach(r => {
          results.push({
            event_type: eventType,
            event_label: meta.event,
            registration: r,
            evaluation: evaluationMap[r.id] || null
          })
        })
      }
    }

    res.json({ success: true, data: results })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// Jury update status
app.patch('/api/jury/status/:type/:id', requireJury, async (req, res) => {
  try {
    const { type, id } = req.params
    const { status } = req.body
    const juryId = req.juryId

    const meta = TABLE_MAP[type]
    if (!meta) return res.status(400).json({ success: false, message: 'Unknown event type' })

    if (!['selected', 'rejected', 'pending', 'waitlist'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' })
    }

    // Check if jury is assigned to this reg
    const { data: assignment, error: assignErr } = await supabase
      .from('jury_assignments')
      .select('id')
      .eq('jury_id', juryId)
      .eq('registration_id', id)
      .eq('event_type', type)
      .single()

    if (assignErr || !assignment) {
      return res.status(403).json({ success: false, message: 'Not authorized for this registration' })
    }

    // Update the registration status
    const { error: updateErr } = await supabase
      .from(meta.table)
      .update({ status })
      .eq('id', id)

    if (updateErr) return res.status(500).json({ success: false, message: updateErr.message })

    res.json({ success: true, status })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// Submit Evaluation
app.post('/api/jury/evaluate', requireJury, async (req, res) => {
  try {
    const juryId = req.juryId
    const { eventType, registrationId, score, comments } = req.body

    if (!eventType || !registrationId || score === undefined) {
      return res.status(400).json({ success: false, message: 'Missing parameters' })
    }

    // Upsert the evaluation
    const { data, error } = await supabase
      .from('jury_evaluations')
      .upsert({
        jury_id: juryId,
        event_type: eventType,
        registration_id: registrationId,
        score: parseInt(score, 10),
        comments: comments || null
      }, { onConflict: 'jury_id, event_type, registration_id' })
      .select()
      .single()

    if (error) return res.status(500).json({ success: false, message: error.message })

    res.json({ success: true, message: 'Evaluation saved successfully', data })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})


app.patch('/api/admin/form-settings/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { is_open, registration_fee_paise } = req.body

    if (is_open !== undefined && typeof is_open !== 'boolean') {
      return res.status(400).json({ success: false, message: 'is_open must be a boolean' })
    }
    if (registration_fee_paise !== undefined) {
      const fee = parseInt(registration_fee_paise, 10)
      if (isNaN(fee) || fee < 0) {
        return res.status(400).json({ success: false, message: 'registration_fee_paise must be a non-negative integer (in paise)' })
      }
    }

    const updatePayload = { updated_at: new Date() }
    if (is_open !== undefined) updatePayload.is_open = is_open
    if (registration_fee_paise !== undefined) updatePayload.registration_fee_paise = parseInt(registration_fee_paise, 10)

    if (Object.keys(updatePayload).length === 1) {
      return res.status(400).json({ success: false, message: 'No valid fields to update' })
    }

    const { data, error } = await supabase
      .from('form_settings')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      await logError({ source: 'admin', endpoint: `/api/admin/form-settings/${id}`, method: 'PATCH', errorType: 'db_error', message: error.message, req })
      return res.status(500).json({ success: false, message: error.message })
    }

    res.json({ success: true, data })
  } catch (err) {
    await logError({ source: 'admin', endpoint: `/api/admin/form-settings/${req.params.id}`, method: 'PATCH', errorType: 'server_error', message: err.message, stack: err.stack, req })
    res.status(500).json({ success: false, message: err.message })
  }
})

// Î“Ã¶Ã‡Î“Ã¶Ã‡ Admin: view error logs Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡
app.get('/api/admin/error-logs', requireAdmin, async (req, res) => {
  try {
    const { source, errorType, limit = 100 } = req.query
    const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 100, 1), 500)
    const validSources = ['user', 'admin', 'server']
    const validTypes = ['db_error', 'validation_error', 'upload_error', 'email_error', 'auth_error', 'client_error', 'server_error']

    let query = supabase.from('error_logs').select('*').order('created_at', { ascending: false }).limit(safeLimit)
    if (source && validSources.includes(source)) query = query.eq('source', source)
    if (errorType && validTypes.includes(errorType)) query = query.eq('error_type', errorType)
    const { data, error } = await query
    if (error) return res.status(500).json({ success: false, message: error.message })
    res.json({ success: true, data })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// Î“Ã¶Ã‡Î“Ã¶Ã‡ Dev: Error Logs Middleware (Date-based Auth) Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡
const requireDevAuth = (req, res, next) => {
  const authHeader = req.headers['x-dev-auth']

  // Get current date in IST (Indian Standard Time)
  const now = new Date()
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000)
  const ist = new Date(utc + (3600000 * 5.5))

  const day = String(ist.getDate()).padStart(2, '0')
  const month = String(ist.getMonth() + 1).padStart(2, '0')
  const expectedPassword = `${day}${month}` // DDMM

  if (authHeader === expectedPassword) {
    next()
  } else {
    // Also allow if it matches the main admin token for convenience
    if (authHeader === process.env.ADMIN_TOKEN) {
      return next()
    }
    return res.status(401).json({ success: false, message: 'Invalid dev password' })
  }
}

// Î“Ã¶Ã‡Î“Ã¶Ã‡ Dev: Login (Check Date Password) Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡
app.post('/api/dev/login', (req, res) => {
  const { password } = req.body

  const now = new Date()
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000)
  const ist = new Date(utc + (3600000 * 5.5))

  const day = String(ist.getDate()).padStart(2, '0')
  const month = String(ist.getMonth() + 1).padStart(2, '0')
  const expectedPassword = `${day}${month}`

  if (password === expectedPassword || password === process.env.ADMIN_TOKEN) {
    res.json({ success: true, token: password })
  } else {
    res.status(401).json({ success: false, message: 'Invalid password' })
  }
})

// Î“Ã¶Ã‡Î“Ã¶Ã‡ Dev: View Error Logs Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡
app.get('/api/dev/error-logs', requireDevAuth, async (req, res) => {
  try {
    const { limit = 100, status } = req.query
    const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 100, 1), 500)

    let query = supabase
      .from('error_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(safeLimit)

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) throw error
    res.json({ success: true, data })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// Î“Ã¶Ã‡Î“Ã¶Ã‡ Dev: Update Error Log Status Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡
app.put('/api/dev/error-logs/:id', requireDevAuth, async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const { data, error } = await supabase
      .from('error_logs')
      .update({ status })
      .eq('id', id)
      .select()

    if (error) throw error
    res.json({ success: true, data })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// Î“Ã¶Ã‡Î“Ã¶Ã‡ Dev: Delete Error Log Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡
app.delete('/api/dev/error-logs/:id', requireDevAuth, async (req, res) => {
  try {
    const { id } = req.params

    const { error } = await supabase
      .from('error_logs')
      .delete()
      .eq('id', id)

    if (error) throw error
    res.json({ success: true, message: 'Deleted successfully' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// Î“Ã¶Ã‡Î“Ã¶Ã‡ Global error handler Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡
app.use(async (err, req, res, next) => {
  await logError({
    source: 'server',
    endpoint: req.originalUrl || req.url,
    method: req.method,
    errorType: 'server_error',
    message: err.message,
    stack: err.stack,
    req,
  })
  console.error(err.stack)
  res.status(500).json({ success: false, message: err.message || 'Internal server error' })
})

app.listen(PORT, () => console.log(`VYUGA API running on http://localhost:${PORT}`))
