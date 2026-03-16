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
  sendStatusUpdateEmail,
} = require('./mailer')

const app = express()
const PORT = process.env.PORT || 3001
const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads'
const MAX_MB = parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10)

// Ensure uploads folder exists
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true })

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }))  // security headers
app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }))
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true, limit: '1mb' }))
app.use('/uploads', express.static(UPLOAD_DIR))

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
      { field: 'ideaDescription', check: ideaDescription && sanitizeText(ideaDescription, 2000).length > 0, msg: 'required, max 2000 chars' },
      { field: 'member1Name', check: member1Name && sanitizeText(member1Name, 100).length > 0, msg: 'required' },
      { field: 'member1Email', check: isValidEmail(member1Email), msg: 'invalid email' },
      { field: 'member1Phone', check: isValidPhone(member1Phone), msg: 'must be exactly 10 digits' },
    ])
    if (member2Email && member2Email.trim()) errors.push(...validate([{ field: 'member2Email', check: isValidEmail(member2Email), msg: 'invalid email' }]))
    if (member2Phone && member2Phone.trim()) errors.push(...validate([{ field: 'member2Phone', check: isValidPhone(member2Phone), msg: 'must be 10 digits' }]))
    if (member3Email && member3Email.trim()) errors.push(...validate([{ field: 'member3Email', check: isValidEmail(member3Email), msg: 'invalid email' }]))
    if (member3Phone && member3Phone.trim()) errors.push(...validate([{ field: 'member3Phone', check: isValidPhone(member3Phone), msg: 'must be 10 digits' }]))
    if (errors.length) return res.status(400).json({ success: false, message: 'Validation failed', errors })

    // ── Magic byte check for image ───────────────────────
    if (req.file && !isValidImageBuffer(req.file.buffer)) {
      return res.status(400).json({ success: false, message: 'Uploaded file is not a valid image' })
    }

    // ── Sanitize all text fields ─────────────────────────
    const sTeamName = sanitizeText(teamName, 100)
    const sCollegeName = sanitizeText(collegeName, 200)
    const sTheme = sanitizeText(theme, 100)
    const sIdeaTitle = sanitizeText(ideaTitle, 200)
    const sIdeaDesc = sanitizeText(ideaDescription, 2000)
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
      protoImagePath = path.join(UPLOAD_DIR, filename)
      fs.writeFileSync(protoImagePath, req.file.buffer)
    }

    const { data, error } = await supabase
      .from('innovation_college_registrations')
      .insert([{
        team_name: sTeamName,
        college_name: sCollegeName,
        theme: sTheme,
        idea_title: sIdeaTitle,
        idea_description: sIdeaDesc,
        leader_name: sM1Name,
        leader_email: sM1Email,
        leader_phone: sM1Phone,
        members,
        prototype_image_path: protoImagePath,
      }])
      .select()
      .single()

    if (error) {
      await logError({ source: 'user', endpoint: '/api/innovation-college', method: 'POST', errorType: 'db_error', message: error.message, req })
      return res.status(500).json({ success: false, message: error.message })
    }
    try {
      sendInnovationCollegeConfirmation({
        teamName, collegeName, theme, ideaTitle, ideaDescription,
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
      member1Name, member1Email, member1Phone, member1DisabilityType,
      member2Name, member2Email, member2Phone,
      member3Name, member3Email, member3Phone,
    } = req.body

    // ── Validation ───────────────────────────────────────
    const errors = validate([
      { field: 'participationType', check: isValidEnum(participationType, ['solo', 'team']), msg: 'must be solo or team' },
      { field: 'ideaTitle', check: ideaTitle && sanitizeText(ideaTitle, 200).length > 0, msg: 'required, max 200 chars' },
      { field: 'ideaDescription', check: ideaDescription && sanitizeText(ideaDescription, 2000).length > 0, msg: 'required, max 2000 chars' },
      { field: 'member1Name', check: member1Name && sanitizeText(member1Name, 100).length > 0, msg: 'required' },
      { field: 'member1Email', check: isValidEmail(member1Email), msg: 'invalid email' },
      { field: 'member1Phone', check: isValidPhone(member1Phone), msg: 'must be exactly 10 digits' },
      { field: 'member1DisabilityType', check: member1DisabilityType && sanitizeText(member1DisabilityType, 100).length > 0, msg: 'required' },
    ])
    if (member2Email && member2Email.trim()) errors.push(...validate([{ field: 'member2Email', check: isValidEmail(member2Email), msg: 'invalid email' }]))
    if (member2Phone && member2Phone.trim()) errors.push(...validate([{ field: 'member2Phone', check: isValidPhone(member2Phone), msg: 'must be 10 digits' }]))
    if (member3Email && member3Email.trim()) errors.push(...validate([{ field: 'member3Email', check: isValidEmail(member3Email), msg: 'invalid email' }]))
    if (member3Phone && member3Phone.trim()) errors.push(...validate([{ field: 'member3Phone', check: isValidPhone(member3Phone), msg: 'must be 10 digits' }]))
    if (errors.length) return res.status(400).json({ success: false, message: 'Validation failed', errors })

    if (req.file && !isValidImageBuffer(req.file.buffer)) {
      return res.status(400).json({ success: false, message: 'Uploaded file is not a valid image' })
    }

    // ── Sanitize ─────────────────────────────────────────
    const sPartType = participationType.trim()
    const sIdeaTitle = sanitizeText(ideaTitle, 200)
    const sIdeaDesc = sanitizeText(ideaDescription, 2000)
    const sM1Name = sanitizeText(member1Name, 100)
    const sM1Email = member1Email.trim().toLowerCase()
    const sM1Phone = member1Phone.trim()
    const sDisability = sanitizeText(member1DisabilityType, 100)

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
      protoImagePath = path.join(UPLOAD_DIR, filename)
      fs.writeFileSync(protoImagePath, req.file.buffer)
    }

    const { data, error } = await supabase
      .from('innovation_pwd_registrations')
      .insert([{
        participation_type: sPartType,
        idea_title: sIdeaTitle,
        idea_description: sIdeaDesc,
        name: sM1Name,
        email: sM1Email,
        phone: sM1Phone,
        disability_type: sDisability,
        members,
        prototype_image_path: protoImagePath,
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
        member1Name, member1Email, member1Phone, member1DisabilityType,
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
    const { orgName, orgType, address, studentCount, contactName, contactEmail, contactPhone } = req.body

    // ── Validation ───────────────────────────────────────
    const errors = validate([
      { field: 'orgName', check: orgName && sanitizeText(orgName, 200).length > 0, msg: 'required, max 200 chars' },
      { field: 'orgType', check: orgType && sanitizeText(orgType, 100).length > 0, msg: 'required' },
      { field: 'contactName', check: contactName && sanitizeText(contactName, 100).length > 0, msg: 'required' },
      { field: 'contactEmail', check: isValidEmail(contactEmail), msg: 'invalid email' },
      { field: 'contactPhone', check: isValidPhone(contactPhone), msg: 'must be exactly 10 digits' },
      { field: 'studentCount', check: !studentCount || isValidInt(studentCount, 0, 100000), msg: 'must be a number 0–100000' },
    ])
    if (errors.length) return res.status(400).json({ success: false, message: 'Validation failed', errors })

    const { data, error } = await supabase
      .from('talent_organizations')
      .insert([{
        org_name: sanitizeText(orgName, 200),
        org_type: sanitizeText(orgType, 100),
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
      sendTalentOrgConfirmation({ orgName, orgType, address, studentCount, contactName, contactEmail, contactPhone })
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
      orgName, studentName, studentAge, disabilityType,
      talentCategory, talentDescription, guardianName, guardianPhone, guardianEmail, videoLink,
    } = req.body

    // ── Validation ───────────────────────────────────────
    const errors = validate([
      { field: 'orgName', check: orgName && sanitizeText(orgName, 200).length > 0, msg: 'required' },
      { field: 'studentName', check: studentName && sanitizeText(studentName, 100).length > 0, msg: 'required' },
      { field: 'studentAge', check: isValidInt(studentAge, 1, 120), msg: 'must be a number 1–120' },
      { field: 'disabilityType', check: disabilityType && sanitizeText(disabilityType, 100).length > 0, msg: 'required' },
      { field: 'talentCategory', check: talentCategory && sanitizeText(talentCategory, 100).length > 0, msg: 'required' },
      { field: 'guardianName', check: guardianName && sanitizeText(guardianName, 100).length > 0, msg: 'required' },
      { field: 'guardianPhone', check: isValidPhone(guardianPhone), msg: 'must be exactly 10 digits' },
    ])
    if (guardianEmail && guardianEmail.trim()) errors.push(...validate([{ field: 'guardianEmail', check: isValidEmail(guardianEmail), msg: 'invalid email' }]))
    if (videoLink && videoLink.trim()) errors.push(...validate([{ field: 'videoLink', check: isValidURL(videoLink), msg: 'must be a valid http/https URL' }]))
    if (errors.length) return res.status(400).json({ success: false, message: 'Validation failed', errors })

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

    const { data, error } = await supabase
      .from('talent_nominations')
      .insert([{
        org_name: sanitizeText(orgName, 200),
        student_name: sanitizeText(studentName, 100),
        student_age: parseInt(studentAge, 10),
        disability_type: sanitizeText(disabilityType, 100),
        talent_category: sanitizeText(talentCategory, 100),
        talent_desc: talentDescription ? sanitizeText(talentDescription, 2000) : null,
        guardian_name: sanitizeText(guardianName, 100),
        guardian_phone: guardianPhone.trim(),
        guardian_email: guardianEmail ? guardianEmail.trim().toLowerCase() : null,
        video_link: videoLink ? videoLink.trim() : '',
        video_file_path: videoFilePath,
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
        orgName, studentName, studentAge, disabilityType,
        talentCategory, talentDescription,
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

// ── 5. Blind Cricket Tournament ───────────────────────────────────────────────
// POST /api/cricket
app.post('/api/cricket', registrationLimiter, async (req, res) => {
  try {
    const {
      teamName, city, state, playerCount,
      hasPlayedBefore, additionalInfo,
      contactName, contactEmail, contactPhone,
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
    ])
    if (errors.length) return res.status(400).json({ success: false, message: 'Validation failed', errors })

    const { data, error } = await supabase
      .from('cricket_team_registrations')
      .insert([{
        team_name: sanitizeText(teamName, 100),
        city: sanitizeText(city, 100),
        state: sanitizeText(state, 100),
        player_count: parseInt(playerCount, 10),
        has_played_before: hasPlayedBefore === 'yes',
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
}

app.patch('/api/admin/status/:type/:id', requireAdmin, async (req, res) => {
  try {
    const { type, id } = req.params
    const { status, adminNote } = req.body
    const meta = TABLE_MAP[type]
    if (!meta) return res.status(400).json({ success: false, message: 'Unknown type' })
    if (!isValidUUID(id)) return res.status(400).json({ success: false, message: 'Invalid record ID format' })
    if (!['approved', 'rejected', 'pending'].includes(status)) {
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