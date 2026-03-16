require('dotenv').config()
const express = require('express')
const cors = require('cors')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { exec } = require('child_process')
const supabase = require('./supabase')
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
app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/uploads', express.static(UPLOAD_DIR))

// ── Multer – prototype images (innovation forms) ──────────────────────────────
// Uses memory storage so we can rename using the phone number from req.body
const protoStorage = multer.memoryStorage()
const protoUpload = multer({
  storage: protoStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/\.(png|jpe?g|webp)$/i.test(file.originalname)) cb(null, true)
    else cb(new Error('Only image files (PNG, JPG, WEBP) are allowed'))
  },
})

// ── Multer (video uploads for talent nominations) ─────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    // Name as guardianPhone_timestamp.ext for performance videos
    const phone = (req.body.guardianPhone || 'unknown').replace(/\D/g, '')
    cb(null, `${phone}_${Date.now()}${path.extname(file.originalname)}`)
  },
})
const upload = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200 MB for ~3 min video
  fileFilter: (req, file, cb) => {
    if (/\.(mp4|mov|avi|mkv|webm)$/i.test(file.originalname)) cb(null, true)
    else cb(new Error('Only video files are allowed'))
  },
})

// ── Video compression with ffmpeg ─────────────────────────────────────────────
function compressVideoWithFFmpeg(inputPath) {
  return new Promise((resolve) => {
    const ext = path.extname(inputPath)
    const outputPath = inputPath.replace(ext, '_compressed.mp4')

    // Check if ffmpeg is available
    exec('ffmpeg -version', (checkErr) => {
      if (checkErr) {
        console.warn('[ffmpeg] not found, skipping server-side compression')
        resolve(inputPath) // return original if ffmpeg not installed
        return
      }

      const cmd = [
        'ffmpeg', '-y', '-i', `"${inputPath}"`,
        '-vcodec', 'libx264',
        '-crf', '28',             // quality (23=default, 28=smaller, 32=very small)
        '-preset', 'fast',
        '-vf', 'scale=-2:720',    // scale to 720p height, keep aspect ratio
        '-acodec', 'aac',
        '-b:a', '96k',
        '-movflags', '+faststart', // web-friendly streaming
        `"${outputPath}"`,
      ].join(' ')

      exec(cmd, (err) => {
        if (err) {
          console.error('[ffmpeg] compression failed:', err.message)
          resolve(inputPath) // fallback to original
          return
        }
        // Delete original, use compressed
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
app.post('/api/log-error', async (req, res) => {
  const { endpoint, errorType, message, stack } = req.body
  if (!message) return res.status(400).json({ success: false, message: 'message is required' })
  await logError({
    source: 'user',
    endpoint: endpoint || '/unknown',
    method: 'CLIENT',
    errorType: errorType || 'client_error',
    message,
    stack,
    req,
  })
  res.json({ success: true })
})

// ── 1. Innovation Fest – College Category ─────────────────────────────────────
// POST /api/innovation-college
app.post('/api/innovation-college', protoUpload.single('prototypeImage'), async (req, res) => {
  try {
    const {
      teamName, collegeName, theme, ideaTitle, ideaDescription,
      member1Name, member1Email, member1Phone,
      member2Name, member2Email, member2Phone,
      member3Name, member3Email, member3Phone,
    } = req.body

    const members = []
    if (member2Name) members.push({ name: member2Name, email: member2Email || '', phone: member2Phone || '' })
    if (member3Name) members.push({ name: member3Name, email: member3Email || '', phone: member3Phone || '' })

    // Save prototype image locally as phonenumber_timestamp.ext
    let protoImagePath = null
    if (req.file) {
      const phone = (member1Phone || 'unknown').replace(/\D/g, '')
      const filename = `${phone}_${Date.now()}${path.extname(req.file.originalname)}`
      protoImagePath = path.join(UPLOAD_DIR, filename)
      fs.writeFileSync(protoImagePath, req.file.buffer)
    }

    const { data, error } = await supabase
      .from('innovation_college_registrations')
      .insert([{
        team_name: teamName,
        college_name: collegeName,
        theme,
        idea_title: ideaTitle,
        idea_description: ideaDescription,
        leader_name: member1Name,
        leader_email: member1Email,
        leader_phone: member1Phone,
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
app.post('/api/innovation-pwd', protoUpload.single('prototypeImage'), async (req, res) => {
  try {
    const {
      participationType, ideaTitle, ideaDescription,
      member1Name, member1Email, member1Phone, member1DisabilityType,
      member2Name, member2Email, member2Phone,
      member3Name, member3Email, member3Phone,
    } = req.body

    const members = []
    if (participationType === 'team') {
      if (member2Name) members.push({ name: member2Name, email: member2Email || '', phone: member2Phone || '' })
      if (member3Name) members.push({ name: member3Name, email: member3Email || '', phone: member3Phone || '' })
    }

    // Save prototype image locally as phonenumber_timestamp.ext
    let protoImagePath = null
    if (req.file) {
      const phone = (member1Phone || 'unknown').replace(/\D/g, '')
      const filename = `${phone}_${Date.now()}${path.extname(req.file.originalname)}`
      protoImagePath = path.join(UPLOAD_DIR, filename)
      fs.writeFileSync(protoImagePath, req.file.buffer)
    }

    const { data, error } = await supabase
      .from('innovation_pwd_registrations')
      .insert([{
        participation_type: participationType,
        idea_title: ideaTitle,
        idea_description: ideaDescription,
        name: member1Name,
        email: member1Email,
        phone: member1Phone,
        disability_type: member1DisabilityType,
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
app.post('/api/talent-org', async (req, res) => {
  try {
    const { orgName, orgType, address, studentCount, contactName, contactEmail, contactPhone } = req.body

    const { data, error } = await supabase
      .from('talent_organizations')
      .insert([{
        org_name: orgName,
        org_type: orgType,
        address: address || null,
        student_count: parseInt(studentCount, 10) || 0,
        contact_name: contactName,
        contact_email: contactEmail,
        contact_phone: contactPhone,
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
app.post('/api/talent-student', upload.single('performanceVideo'), async (req, res) => {
  try {
    const {
      orgName, studentName, studentAge, disabilityType,
      talentCategory, talentDescription, guardianName, guardianPhone, guardianEmail, videoLink,
    } = req.body

    // Compress uploaded video with ffmpeg (async, non-blocking for DB insert)
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
        org_name: orgName,
        student_name: studentName,
        student_age: parseInt(studentAge, 10),
        disability_type: disabilityType,
        talent_category: talentCategory,
        talent_desc: talentDescription || null,
        guardian_name: guardianName,
        guardian_phone: guardianPhone,
        guardian_email: guardianEmail || null,
        video_link: videoLink,
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
app.post('/api/cricket', async (req, res) => {
  try {
    const {
      teamName, city, state, playerCount,
      hasPlayedBefore, additionalInfo,
      contactName, contactEmail, contactPhone,
    } = req.body

    const { data, error } = await supabase
      .from('cricket_team_registrations')
      .insert([{
        team_name: teamName,
        city,
        state,
        player_count: parseInt(playerCount, 10),
        has_played_before: hasPlayedBefore === 'yes',
        additional_info: additionalInfo || null,
        contact_name: contactName,
        contact_email: contactEmail,
        contact_phone: contactPhone,
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
app.post('/api/admin/login', (req, res) => {
  try {
    const { password } = req.body
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
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' })
    }

    const { data, error } = await supabase
      .from(meta.table)
      .update({ status, admin_note: adminNote || null })
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
        await sendStatusUpdateEmail({ to: email, name, event: meta.event, status, adminNote })
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
    let query = supabase.from('error_logs').select('*').order('created_at', { ascending: false }).limit(parseInt(limit, 10))
    if (source) query = query.eq('source', source)
    if (errorType) query = query.eq('error_type', errorType)
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