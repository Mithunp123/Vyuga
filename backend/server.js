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
  sendStatusUpdateEmail,
  transporter,
} = require('./mailer')

const app = express()
app.set('trust proxy', 1)  // trust first proxy (Nginx/Cloudflare)
const PORT = process.env.PORT || 3001
const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads'
const MAX_MB = parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10)

// Ensure uploads folder exists
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true })

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: false }))
app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }))
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true, limit: '1mb' }))
// Serve uploaded files with permissive CORS for cross-origin frontend
app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
  res.setHeader('Access-Control-Allow-Origin', '*')
  next()
}, express.static(UPLOAD_DIR))

// ── Rate limiters ─────────────────────────────────────────────────────────────
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

// ── Multer – prototype images (innovation forms) ──────────────────────────────
// Uses memory storage so we can rename using the phone number from req.body
const protoStorage = multer.memoryStorage()
const ALLOWED_IMAGE_EXT = /\.(png|jpe?g|webp)$/i
const protoUpload = multer({
  storage: protoStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
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

// ── Multer (video uploads for talent nominations) ─────────────────────────────
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

// ── Video compression with ffmpeg ─────────────────────────────────────────────
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

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

// ── Error logging helper ──────────────────────────────────────────────────────
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

// ── Client-side error reporting ───────────────────────────────────────────────
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

// ── 1. Innovation Fest – College Category ─────────────────────────────────────
// POST /api/innovation-college
app.post('/api/innovation-college', registrationLimiter, protoUpload.single('prototypeImage'), async (req, res) => {
  try {
    const {
      teamName, collegeName, theme, ideaTitle, ideaDescription,
      painPoint, solution, usp,
      themeOther, prototypeUrl,
      member1Name, member1Email, member1Phone,
      member2Name, member2Email, member2Phone,
      member3Name, member3Email, member3Phone,
    } = req.body

    // ── Validation ───────────────────────────────────────
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

    // ── Magic byte check for image ───────────────────────
    if (req.file && !isValidImageBuffer(req.file.buffer)) {
      return res.status(400).json({ success: false, message: 'Uploaded file is not a valid image' })
    }

    // ── Sanitize all text fields ─────────────────────────
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

    // Save prototype image locally
    let protoImagePath = null
    if (req.file) {
      const phone = sM1Phone.replace(/\D/g, '').slice(0, 15)
      const ext = path.extname(sanitizeFilename(req.file.originalname))
      const filename = `${phone}_${Date.now()}${ext}`
      fs.writeFileSync(path.join(UPLOAD_DIR, filename), req.file.buffer)
      protoImagePath = filename  // store filename only, not full path
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
        prototype_url: prototypeUrl ? prototypeUrl.trim() : null,
      }])
      .select()
      .single()

    if (error) {
      await logError({ source: 'user', endpoint: '/api/innovation-college', method: 'POST', errorType: 'db_error', message: error.message, req })
      return res.status(500).json({ success: false, message: error.message })
    }
    try {
      sendInnovationCollegeConfirmation({
        teamName, collegeName, theme: sTheme, ideaTitle, ideaDescription,
        member1Name, member1Email, member1Phone,
        member2Name, member2Email, member2Phone,
        member3Name, member3Email, member3Phone,
      })
    } catch (emailErr) {
      await logError({ source: 'user', endpoint: '/api/innovation-college', method: 'POST', errorType: 'email_error', message: emailErr.message, stack: emailErr.stack, req })
    }
    res.status(201).json({ success: true, data })
  } catch (err) {
    await logError({ source: 'user', endpoint: '/api/innovation-college', method: 'POST', errorType: 'server_error', message: err.message, stack: err.stack, req })
    res.status(500).json({ success: false, message: err.message })
  }
})

// ── 2. Innovation Fest – PWD Category ────────────────────────────────────────
// POST /api/innovation-pwd
app.post('/api/innovation-pwd', registrationLimiter, protoUpload.single('prototypeImage'), async (req, res) => {
  try {
    const {
      participationType, ideaTitle, ideaDescription,
      painPoint, solution, usp, prototypeUrl,
      member1Name, member1Email, member1Phone, member1DisabilityType, member1DisabilityTypeOther,
      member2Name, member2Email, member2Phone,
      member3Name, member3Email, member3Phone,
    } = req.body

    // ── Validation ───────────────────────────────────────
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

    if (req.file && !isValidImageBuffer(req.file.buffer)) {
      return res.status(400).json({ success: false, message: 'Uploaded file is not a valid image' })
    }

    // ── Sanitize ─────────────────────────────────────────
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
    if (req.file) {
      const phone = sM1Phone.replace(/\D/g, '').slice(0, 15)
      const ext = path.extname(sanitizeFilename(req.file.originalname))
      const filename = `${phone}_${Date.now()}${ext}`
      fs.writeFileSync(path.join(UPLOAD_DIR, filename), req.file.buffer)
      protoImagePath = filename  // store filename only
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
        prototype_url: prototypeUrl ? prototypeUrl.trim() : null,
      }])
      .select()
      .single()

    if (error) {
      await logError({ source: 'user', endpoint: '/api/innovation-pwd', method: 'POST', errorType: 'db_error', message: error.message, req })
      return res.status(500).json({ success: false, message: error.message })
    }
    try {
      sendInnovationPwdConfirmation({
        participationType, ideaTitle, ideaDescription,
        member1Name, member1Email, member1Phone, member1DisabilityType: sDisability,
        member2Name, member2Email, member2Phone,
        member3Name, member3Email, member3Phone,
      })
    } catch (emailErr) {
      await logError({ source: 'user', endpoint: '/api/innovation-pwd', method: 'POST', errorType: 'email_error', message: emailErr.message, stack: emailErr.stack, req })
    }
    res.status(201).json({ success: true, data })
  } catch (err) {
    await logError({ source: 'user', endpoint: '/api/innovation-pwd', method: 'POST', errorType: 'server_error', message: err.message, stack: err.stack, req })
    res.status(500).json({ success: false, message: err.message })
  }
})

// ── 3. Special Talent Utsav– Organization Registration ──────────────────────
// GET /api/talent-org  – list all registered organizations
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

    // ── Validation ───────────────────────────────────────
    const errors = validate([
      { field: 'orgName', check: orgName && sanitizeText(orgName, 200).length > 0, msg: 'required, max 200 chars' },
      { field: 'orgType', check: orgType && sanitizeText(orgType, 100).length > 0, msg: 'required' },
      { field: 'orgFocus', check: orgFocus && ['single', 'multiple'].includes(orgFocus), msg: 'must be single or multiple' },
      { field: 'disabilityTypes', check: Array.isArray(disabilityTypes) && disabilityTypes.length > 0, msg: 'at least one disability type required' },
      { field: 'contactName', check: contactName && sanitizeText(contactName, 100).length > 0, msg: 'required' },
      { field: 'contactEmail', check: isValidEmail(contactEmail), msg: 'invalid email' },
      { field: 'contactPhone', check: isValidPhone(contactPhone), msg: 'must be exactly 10 digits' },
      { field: 'studentCount', check: !studentCount || isValidInt(studentCount, 0, 100000), msg: 'must be a number 0–100000' },
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
    try {
      sendTalentOrgConfirmation({ orgName, orgType: effectiveOrgType, orgFocus, disabilityTypes, address, studentCount, contactName, contactEmail, contactPhone })
    } catch (emailErr) {
      await logError({ source: 'user', endpoint: '/api/talent-org', method: 'POST', errorType: 'email_error', message: emailErr.message, stack: emailErr.stack, req })
    }
    res.status(201).json({ success: true, data })
  } catch (err) {
    await logError({ source: 'user', endpoint: '/api/talent-org', method: 'POST', errorType: 'server_error', message: err.message, stack: err.stack, req })
    res.status(500).json({ success: false, message: err.message })
  }
})

// ── 4. Special Talent Utsav – Student Nomination ─────────────────────────────
// POST /api/talent-student  (multipart/form-data; required performanceVideo field)
app.post('/api/talent-student', registrationLimiter, upload.single('performanceVideo'), async (req, res) => {
  try {
    const {
      orgName, studentName, studentAge, disabilityType, disabilityTypeOther,
      talentCategory, talentCategoryOther, talentDescription, guardianName, guardianPhone, guardianEmail, videoLink, performanceUrl,
    } = req.body

    // ── Validation ───────────────────────────────────────
    const errors = validate([
      { field: 'orgName', check: orgName && sanitizeText(orgName, 200).length > 0, msg: 'required' },
      { field: 'studentName', check: studentName && sanitizeText(studentName, 100).length > 0, msg: 'required' },
      { field: 'studentAge', check: isValidInt(studentAge, 1, 120), msg: 'must be a number 1–120' },
      { field: 'disabilityType', check: disabilityType && sanitizeText(disabilityType, 100).length > 0, msg: 'required' },
      { field: 'talentCategory', check: talentCategory && sanitizeText(talentCategory, 100).length > 0, msg: 'required' },
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

    // ── Validate video magic bytes ───────────────────────
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
        talent_desc: talentDescription ? sanitizeText(talentDescription, 2000) : null,
        guardian_name: sanitizeText(guardianName, 100),
        guardian_phone: guardianPhone.trim(),
        guardian_email: guardianEmail ? guardianEmail.trim().toLowerCase() : null,
        video_link: videoLink ? videoLink.trim() : '',
        video_file_path: videoFileName,
        performance_url: performanceUrl ? performanceUrl.trim() : null,
      }])
      .select()
      .single()

    if (error) {
      await logError({ source: 'user', endpoint: '/api/talent-student', method: 'POST', errorType: 'db_error', message: error.message, req })
      return res.status(500).json({ success: false, message: error.message })
    }
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

// ── Combined Special Talent Utsav (Organization + Student/Team Nomination) ─────────
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
      talentCategory, talentCategoryOther, talentDescription,
      guardianName, guardianPhone, guardianEmail,
      videoLink, performanceUrl
    } = req.body

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

    // ── Validation ───────────────────────────────────────
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
      { field: 'talentDescription', check: !talentDescription || (talentDescription.trim().split(/\s+/).filter(w => w.length > 0).length <= 50), msg: 'must be 50 words or less' },
      { field: 'videoFile', check: req.file || videoLink || performanceUrl, msg: 'video file, video link, or performance URL is required' }
    ])

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
        console.log('🔍 Debug - Raw team members data received:', JSON.stringify(teamMembersData, null, 2))
        
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
      console.log('❌ Validation failed:', errors)
      return res.status(400).json({ success: false, errors })
    }

    console.log('✅ Validation passed')

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

    // ── File handling ────────────────────────────────────
    console.log('🎥 Processing video file...')
    let videoFilePath = null
    if (req.file) {
      try {
        videoFilePath = await compressVideoWithFFmpeg(req.file.path)
        console.log('✅ Video compression completed:', path.basename(videoFilePath))
        // Note: compressVideoWithFFmpeg already handles cleanup of original file
      } catch (e) {
        console.error('❌ Video compression failed:', e.message)
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

    console.log('💾 Inserting into database...')
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
        talent_desc: talentDescription ? sanitizeText(talentDescription, 500) : null,
        guardian_name: nominationType === 'individual' ? sanitizeText(guardianName, 100) : null,
        guardian_phone: nominationType === 'individual' ? guardianPhone : null,
        guardian_email: nominationType === 'individual' && guardianEmail ? guardianEmail.toLowerCase() : null,
        video_link: videoLink ? sanitizeText(videoLink, 500) : null,
        video_file_path: videoFileName,
        performance_url: sanitizedPerformanceUrl
      }])

    if (error) {
      console.log('❌ Database error:', error.message)
      await logError({ source: 'user', endpoint: '/api/talent-combined', method: 'POST', errorType: 'db_error', message: error.message, req })
      return res.status(500).json({ success: false, message: error.message })
    }

    console.log('✅ Database insertion successful')

    // Send confirmation emails
    console.log('📧 Sending confirmation emails...')
    try {
      if (nominationType === 'individual') {
        sendTalentStudentConfirmation({
          orgName, studentName, studentAge, disabilityType: processedDisabilityType,
          talentCategory: processedTalentCategory, talentDescription,
          guardianName, guardianPhone, guardianEmail, videoLink: null,
          orgContactEmail: contactEmail,
          orgContactName: contactName,
        })
      } else {
        // For team nominations, send email to organization contact
        sendTalentStudentConfirmation({
          orgName, studentName: `Team (${teamSize} members)`, studentAge: null, 
          disabilityType: 'Multiple (Team)', talentCategory: processedTalentCategory, 
          talentDescription, guardianName: null, guardianPhone: null, guardianEmail: null,
          videoLink: null, orgContactEmail: contactEmail, orgContactName: contactName,
        })
      }
      console.log('✅ Emails sent successfully')
    } catch (emailErr) {
      console.log('⚠️ Email error (non-critical):', emailErr.message)
      await logError({ source: 'user', endpoint: '/api/talent-combined', method: 'POST', errorType: 'email_error', message: emailErr.message, stack: emailErr.stack, req })
    }

    console.log('✅ Form submission completed successfully')
    res.status(201).json({ success: true, data })
  } catch (err) {
    console.log('❌ Unexpected error:', err.message)
    console.log('Stack trace:', err.stack)
    await logError({ source: 'user', endpoint: '/api/talent-combined', method: 'POST', errorType: 'server_error', message: err.message, stack: err.stack, req })
    res.status(500).json({ success: false, message: err.message })
  }
})

// ── 5. Blind Cricket Tournament ───────────────────────────────────────────────
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

    // ── Validation ───────────────────────────────────────
    const errors = validate([
      { field: 'teamName', check: teamName && sanitizeText(teamName, 100).length > 0, msg: 'required, max 100 chars' },
      { field: 'city', check: city && sanitizeText(city, 100).length > 0, msg: 'required' },
      { field: 'state', check: state && sanitizeText(state, 100).length > 0, msg: 'required' },
      { field: 'playerCount', check: isValidInt(playerCount, 1, 50), msg: 'must be 1–50' },
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
      }])
      .select()
      .single()

    if (error) {
      await logError({ source: 'user', endpoint: '/api/cricket', method: 'POST', errorType: 'db_error', message: error.message, req })
      return res.status(500).json({ success: false, message: error.message })
    }
    try {
      sendCricketConfirmation({ teamName, city, state, playerCount, hasPlayedBefore, additionalInfo, contactName, contactEmail, contactPhone })
    } catch (emailErr) {
      await logError({ source: 'user', endpoint: '/api/cricket', method: 'POST', errorType: 'email_error', message: emailErr.message, stack: emailErr.stack, req })
    }
    res.status(201).json({ success: true, data })
  } catch (err) {
    await logError({ source: 'user', endpoint: '/api/cricket', method: 'POST', errorType: 'server_error', message: err.message, stack: err.stack, req })
    res.status(500).json({ success: false, message: err.message })
  }
})

// ── 6. Blind Chess Competition ────────────────────────────────────────────────
// POST /api/chess
app.post('/api/chess', registrationLimiter, async (req, res) => {
  try {
    const {
      participantName, email, phone, age,
      city, state, disabilityType, disabilityTypeOther,
      hasPlayedBefore, experienceLevel, experienceLevelOther, additionalInfo,
    } = req.body

    // ── Validation ───────────────────────────────────────
    const errors = validate([
      { field: 'participantName', check: participantName && sanitizeText(participantName, 100).length > 0, msg: 'required, max 100 chars' },
      { field: 'email', check: isValidEmail(email), msg: 'invalid email' },
      { field: 'phone', check: isValidPhone(phone), msg: 'must be exactly 10 digits' },
      { field: 'age', check: isValidInt(age, 5, 100), msg: 'must be 5–100' },
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
      }])
      .select()
      .single()

    if (error) {
      await logError({ source: 'user', endpoint: '/api/chess', method: 'POST', errorType: 'db_error', message: error.message, req })
      return res.status(500).json({ success: false, message: error.message })
    }
    try {
      sendChessConfirmation({ participantName, email, phone, age, city, state, disabilityType: effectiveDisability, hasPlayedBefore, experienceLevel: effectiveExperience, additionalInfo })
    } catch (emailErr) {
      await logError({ source: 'user', endpoint: '/api/chess', method: 'POST', errorType: 'email_error', message: emailErr.message, stack: emailErr.stack, req })
    }
    res.status(201).json({ success: true, data })
  } catch (err) {
    await logError({ source: 'user', endpoint: '/api/chess', method: 'POST', errorType: 'server_error', message: err.message, stack: err.stack, req })
    res.status(500).json({ success: false, message: err.message })
  }
})

// ── 6. Accommodation Request ─────────────────────────────────────────────────────
// POST /api/accommodation-request
app.post('/api/accommodation-request', registrationLimiter, async (req, res) => {
  try {
    console.log('🏨 Accommodation Request Received:', req.body)

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
            <h1 style="color: white; margin: 0; font-size: 24px;">🏨 New Accommodation Request</h1>
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
        subject: `🏨 New Accommodation Request - ${fullName}`,
        html: adminEmailHtml
      })

      console.log('✅ Admin notification email sent successfully')
    } catch (emailError) {
      console.error('❌ Failed to send admin notification:', emailError)
      // Don't fail the request if email fails
    }

    // Send confirmation email to user
    try {
      const confirmationEmailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #0ea5e9 0%, #84cc16 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🏨 Accommodation Request Received</h1>
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
        subject: '🏨 Accommodation Request Confirmed - VYUGA',
        html: confirmationEmailHtml
      })

      console.log('✅ User confirmation email sent successfully')
    } catch (emailError) {
      console.error('❌ Failed to send user confirmation:', emailError)
      // Don't fail the request if email fails
    }

    console.log('✅ Accommodation request processed successfully')
    res.status(201).json({
      success: true,
      message: 'Accommodation request submitted successfully',
      requestId
    })

  } catch (error) {
    console.error('❌ Accommodation Request Error:', error)
    await logError({ source: 'user', endpoint: '/api/accommodation-request', method: 'POST', errorType: 'server_error', message: error.message, stack: error.stack, req })
    res.status(500).json({
      success: false,
      message: 'Failed to submit accommodation request'
    })
  }
})

// ── Admin middleware ──────────────────────────────────────────────────────────
function requireAdmin(req, res, next) {
  const token = req.headers['x-admin-token'] || req.query.token
  if (!token || token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ success: false, message: 'Unauthorized' })
  }
  next()
}

// ── Admin: verify token ───────────────────────────────────────────────────────
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

// ── Admin: all innovation-college registrations ───────────────────────────────
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

// ── Admin: all innovation-pwd registrations ───────────────────────────────────
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

// ── Admin: all talent organisations ──────────────────────────────────────────
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

// ── Admin: all talent nominations ────────────────────────────────────────────
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

// ── Admin: all cricket registrations ─────────────────────────────────────────
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

// ── Admin: all chess registrations ───────────────────────────────────────────
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

// ── Admin: all accommodation requests ─────────────────────────────────────────
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

// ── Admin: update registration status ────────────────────────────────────────
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
    emailField: 'guardian_email',
    nameField: 'guardian_name',
    event: 'Special Talent Utsav – Student Nomination',
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
}

app.patch('/api/admin/status/:type/:id', requireAdmin, async (req, res) => {
  try {
    const { type, id } = req.params
    const { status, adminNote } = req.body
    const meta = TABLE_MAP[type]
    if (!meta) return res.status(400).json({ success: false, message: 'Unknown type' })
    if (!isValidUUID(id)) return res.status(400).json({ success: false, message: 'Invalid record ID format' })
    if (!['selected', 'rejected', 'pending'].includes(status)) {
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

    // Send email notification
    const email = data[meta.emailField]
    const name = data[meta.nameField]
    if (email) {
      try {
        await sendStatusUpdateEmail({ to: email, name, event: meta.event, status, adminNote: safeNote })
        console.log(`[status-update] Email sent to ${email}`)
      } catch (err) {
        await logError({ source: 'admin', endpoint: `/api/admin/status/${type}/${id}`, method: 'PATCH', errorType: 'email_error', message: err.message, stack: err.stack, req })
      }
    }
    res.json({ success: true, data })
  } catch (err) {
    await logError({ source: 'admin', endpoint: `/api/admin/status/${req.params.type}/${req.params.id}`, method: 'PATCH', errorType: 'server_error', message: err.message, stack: err.stack, req })
    res.status(500).json({ success: false, message: err.message })
  }
})

// ── Admin: view error logs ───────────────────────────────────────────────────
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

// ── Global error handler ──────────────────────────────────────────────────────
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