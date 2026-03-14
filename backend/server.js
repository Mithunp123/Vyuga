require('dotenv').config()
const express = require('express')
const cors = require('cors')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
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
const PORT = process.env.PORT || 5000
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

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

// ── 1. Innovation Fest – College Category ─────────────────────────────────────
// POST /api/innovation-college
app.post('/api/innovation-college', protoUpload.single('prototypeImage'), async (req, res) => {
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
    console.error('[innovation-college]', error.message)
    return res.status(500).json({ success: false, message: error.message })
  }
  sendInnovationCollegeConfirmation({
    teamName, collegeName, theme, ideaTitle, ideaDescription,
    member1Name, member1Email, member1Phone,
    member2Name, member2Email, member2Phone,
    member3Name, member3Email, member3Phone,
  })
  res.status(201).json({ success: true, data })
})

// ── 2. Innovation Fest – PWD Category ────────────────────────────────────────
// POST /api/innovation-pwd
app.post('/api/innovation-pwd', protoUpload.single('prototypeImage'), async (req, res) => {
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
    console.error('[innovation-pwd]', error.message)
    return res.status(500).json({ success: false, message: error.message })
  }
  sendInnovationPwdConfirmation({
    participationType, ideaTitle, ideaDescription,
    member1Name, member1Email, member1Phone, member1DisabilityType,
    member2Name, member2Email, member2Phone,
    member3Name, member3Email, member3Phone,
  })
  res.status(201).json({ success: true, data })
})

// ── 3. Special Talent Utsav– Organization Registration ──────────────────────
// GET /api/talent-org  – list all registered organizations
app.get('/api/talent-org', async (req, res) => {
  const { data, error } = await supabase
    .from('talent_organizations')
    .select('id, org_name, org_type, contact_name, contact_email')
    .order('registered_at', { ascending: false })

  if (error) {
    console.error('[talent-org GET]', error.message)
    return res.status(500).json({ success: false, message: error.message })
  }
  res.json({ success: true, data })
})

// POST /api/talent-org
app.post('/api/talent-org', async (req, res) => {
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
    console.error('[talent-org]', error.message)
    if (error.code === '23505') {
      return res.status(409).json({ success: false, message: 'This email is already registered.' })
    }
    return res.status(500).json({ success: false, message: error.message })
  }
  sendTalentOrgConfirmation({ orgName, orgType, address, studentCount, contactName, contactEmail, contactPhone })
  res.status(201).json({ success: true, data })
})

// ── 4. Special Talent Utsav – Student Nomination ─────────────────────────────
// POST /api/talent-student  (multipart/form-data; required performanceVideo field)
app.post('/api/talent-student', upload.single('performanceVideo'), async (req, res) => {
  const {
    orgName, studentName, studentAge, disabilityType,
    talentCategory, talentDescription, guardianName, guardianPhone, guardianEmail, videoLink,
  } = req.body

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
      video_file_path: req.file ? req.file.path : null,
    }])
    .select()
    .single()

  if (error) {
    console.error('[talent-student]', error.message)
    return res.status(500).json({ success: false, message: error.message })
  }

  // Fetch org contact email so we can notify the organisation too
  const { data: orgData } = await supabase
    .from('talent_organizations')
    .select('contact_email, contact_name')
    .eq('org_name', orgName)
    .maybeSingle()

  sendTalentStudentConfirmation({
    orgName, studentName, studentAge, disabilityType,
    talentCategory, talentDescription,
    guardianName, guardianPhone, guardianEmail, videoLink,
    orgContactEmail: orgData?.contact_email || null,
    orgContactName: orgData?.contact_name || null,
  })
  res.status(201).json({ success: true, data })
})

// ── 5. Blind Cricket Tournament ───────────────────────────────────────────────
// POST /api/cricket
app.post('/api/cricket', async (req, res) => {
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
    console.error('[cricket]', error.message)
    return res.status(500).json({ success: false, message: error.message })
  }
  sendCricketConfirmation({ teamName, city, state, playerCount, hasPlayedBefore, additionalInfo, contactName, contactEmail, contactPhone })
  res.status(201).json({ success: true, data })
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
  const { password } = req.body
  if (password === process.env.ADMIN_TOKEN) {
    res.json({ success: true, token: process.env.ADMIN_TOKEN })
  } else {
    res.status(401).json({ success: false, message: 'Invalid password' })
  }
})

// ── Admin: all innovation-college registrations ───────────────────────────────
app.get('/api/admin/innovation-college', requireAdmin, async (req, res) => {
  const { data, error } = await supabase
    .from('innovation_college_registrations')
    .select('*')
    .order('submitted_at', { ascending: false })
  if (error) return res.status(500).json({ success: false, message: error.message })
  res.json({ success: true, data })
})

// ── Admin: all innovation-pwd registrations ───────────────────────────────────
app.get('/api/admin/innovation-pwd', requireAdmin, async (req, res) => {
  const { data, error } = await supabase
    .from('innovation_pwd_registrations')
    .select('*')
    .order('submitted_at', { ascending: false })
  if (error) return res.status(500).json({ success: false, message: error.message })
  res.json({ success: true, data })
})

// ── Admin: all talent organisations ──────────────────────────────────────────
app.get('/api/admin/talent-org', requireAdmin, async (req, res) => {
  const { data, error } = await supabase
    .from('talent_organizations')
    .select('*')
    .order('registered_at', { ascending: false })
  if (error) return res.status(500).json({ success: false, message: error.message })
  res.json({ success: true, data })
})

// ── Admin: all talent nominations ────────────────────────────────────────────
app.get('/api/admin/talent-student', requireAdmin, async (req, res) => {
  const { data, error } = await supabase
    .from('talent_nominations')
    .select('*')
    .order('submitted_at', { ascending: false })
  if (error) return res.status(500).json({ success: false, message: error.message })
  res.json({ success: true, data })
})

// ── Admin: all cricket registrations ─────────────────────────────────────────
app.get('/api/admin/cricket', requireAdmin, async (req, res) => {
  const { data, error } = await supabase
    .from('cricket_team_registrations')
    .select('*')
    .order('submitted_at', { ascending: false })
  if (error) return res.status(500).json({ success: false, message: error.message })
  res.json({ success: true, data })
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
    console.error('[status-update]', error.message)
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
      console.error(`[status-update] Email failed for ${email}:`, err.message)
    }
  } else {
    console.warn(`[status-update] No email address found for ${meta.nameField}`)
  }
  res.json({ success: true, data })
})

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ success: false, message: err.message || 'Internal server error' })
})

app.listen(PORT, () => console.log(`VYUGA API running on http://localhost:${PORT}`))
