const nodemailer = require('nodemailer')
const path = require('path')
const fs = require('fs')
const pdfmake = require('pdfmake')

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '465', 10),
  secure: process.env.SMTP_SECURE !== 'false',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})



// Absolute path to the logo (copied into backend/assets/)
const LOGO_PATH = path.join(__dirname, 'assets', 'logo.png')

// ── Shared HTML shell ─────────────────────────────────────────────────────────
function shell(title, bodyHtml) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 0;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

      <!-- Header -->
      <tr>
        <td style="background:linear-gradient(135deg,#0197B2 0%,#5BCB2B 100%);padding:28px 32px;text-align:center;">
          <img src="cid:vyuga-logo" alt="VYUGA" height="56" style="display:block;margin:0 auto 10px;" />
          <p style="margin:0;color:#ffffff;font-size:13px;opacity:0.85;letter-spacing:0.08em;text-transform:uppercase;">Ability Carnival · Inclusive Innovation Fest</p>
        </td>
      </tr>

      <!-- Body -->
      <tr><td style="padding:32px;">
        <h1 style="margin:0 0 6px;font-size:22px;color:#0f172a;">${title}</h1>
        <p style="margin:0 0 24px;font-size:14px;color:#64748b;">Thank you for registering with VYUGA. Here is a summary of your submission.</p>
        ${bodyHtml}
      </td></tr>

      <!-- Footer -->
      <tr>
        <td style="background:#f8fafc;padding:20px 32px;border-top:1px solid #e2e8f0;text-align:center;">
          <p style="margin:0;font-size:12px;color:#94a3b8;">© 2026 VYUGA – Ability Carnival. All rights reserved.</p>
          <p style="margin:4px 0 0;font-size:12px;color:#94a3b8;">This is an automated confirmation email. Please do not reply.</p>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>`
}

// ── Row helper ────────────────────────────────────────────────────────────────
function row(label, value) {
  if (!value && value !== 0) return ''
  return `<tr>
    <td style="padding:8px 12px;font-size:13px;font-weight:600;color:#475569;background:#f8fafc;border-radius:6px;white-space:nowrap;vertical-align:top;">${label}</td>
    <td style="padding:8px 12px;font-size:13px;color:#1e293b;vertical-align:top;">${value}</td>
  </tr>`
}

function table(rows) {
  return `<table width="100%" cellpadding="0" cellspacing="4" style="margin-bottom:20px;border-collapse:separate;border-spacing:0 4px;">${rows}</table>`
}

function section(heading, rows) {
  return `
    <p style="margin:20px 0 8px;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#0197B2;">${heading}</p>
    ${table(rows)}
  `
}

// ── Send helper ───────────────────────────────────────────────────────────────
async function sendMail(to, subject, html) {
  try {

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'VYUGA Carnival <no-reply@vyuga.in>',
      to,
      subject,
      html,
      attachments: [{
        filename: 'logo.png',
        path: LOGO_PATH,
        cid: 'vyuga-logo',
      }],
    })

  } catch (err) {
    console.error('[mailer] Failed to send email:', {
      to,
      subject,
      message: err?.message,
      code: err?.code,
      command: err?.command,
      response: err?.response,
      stack: err?.stack,
    })
  }
}

function statusButton(d) {
  if (!d.registrationId || !d.eventType) return ''
  const baseUrl = process.env.FRONTEND_URL || process.env.CLIENT_ORIGIN || 'https://vyuga.nexyuga.in'
  const url = `${baseUrl}/status/${d.eventType}/${d.registrationId}`
  return `
    <div style="text-align:center;margin-top:32px;">
      <a href="${url}" style="display:inline-block;padding:12px 24px;background:#0197B2;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600;font-size:14px;">Check Application Status</a>
    </div>
  `
}

// ── 1. Innovation Fest – College (For Specially Abled) ───────────────────────
async function sendInnovationCollegeConfirmation(d) {
  const members = [
    row('Team Leader', `${d.member1Name} · ${d.member1Email} · ${d.member1Phone}`),
    d.member2Name ? row('Member 2', `${d.member2Name}${d.member2Email ? ' · ' + d.member2Email : ''}${d.member2Phone ? ' · ' + d.member2Phone : ''}`) : '',
    d.member3Name ? row('Member 3', `${d.member3Name}${d.member3Email ? ' · ' + d.member3Email : ''}${d.member3Phone ? ' · ' + d.member3Phone : ''}`) : '',
  ].join('')

  const html = shell('Registration Confirmed – Innovation Fest (For Specially Abled)', `
    ${section('Team Information', [
    row('Team Name', d.teamName),
    row('College', d.collegeName),
    row('Theme', d.theme),
    row('Idea Title', d.ideaTitle),
    row('Description', d.ideaDescription),
  ].join(''))}
    ${section('Team Members', members)}
    ${d.paymentStatus ? section('Payment Details', [
    row('Status', `<span style="color:#16a34a;font-weight:bold;">${d.paymentStatus}</span>`),
    row('Order ID', d.razorpayOrderId),
    row('Transaction ID', d.razorpayPaymentId),
  ].join('')) : ''}
    ${statusButton(d)}
  `)
  await sendMail(d.member1Email, 'Registration Confirmed – VYUGA Innovation Fest (For Specially Abled)', html)
}

// ── 2. Innovation Fest – PWD (By Specially Abled) ────────────────────────────
async function sendInnovationPwdConfirmation(d) {
  const extraMembers = [
    d.member2Name ? row('Member 2', `${d.member2Name}${d.member2Email ? ' · ' + d.member2Email : ''}${d.member2Phone ? ' · ' + d.member2Phone : ''}`) : '',
    d.member3Name ? row('Member 3', `${d.member3Name}${d.member3Email ? ' · ' + d.member3Email : ''}${d.member3Phone ? ' · ' + d.member3Phone : ''}`) : '',
  ].join('')

  const html = shell('Registration Confirmed – Innovation Fest (By Specially Abled)', `
    ${section('Innovation Details', [
    row('Participation', d.participationType === 'team' ? 'Team' : 'Individual'),
    row('Idea Title', d.ideaTitle),
    row('Description', d.ideaDescription),
  ].join(''))}
    ${section('Primary Participant', [
    row('Name', d.member1Name),
    row('Email', d.member1Email),
    row('Phone', d.member1Phone),
    row('Disability Type', d.member1DisabilityType),
  ].join(''))}
    ${extraMembers ? section('Additional Team Members', extraMembers) : ''}
    ${d.paymentStatus ? section('Payment Details', [
    row('Status', `<span style="color:#16a34a;font-weight:bold;">${d.paymentStatus}</span>`),
    row('Order ID', d.razorpayOrderId),
    row('Transaction ID', d.razorpayPaymentId),
  ].join('')) : ''}
    ${statusButton(d)}
  `)
  await sendMail(d.member1Email, 'Registration Confirmed – VYUGA Innovation Fest (By Specially Abled)', html)
}

// ── 3. Talent Utsav – Organization ───────────────────────────────────────────
async function sendTalentOrgConfirmation(d) {
  const focusText = d.orgFocus === 'single' ? 'Single Disability Type' : 'Multiple Disability Types'
  const disabilityList = Array.isArray(d.disabilityTypes) ? d.disabilityTypes.join(', ') : (d.disabilityTypes || 'Not specified')

  const html = shell('Organization Registered – Special Talent Utsav', `
    ${section('Organization Details', [
    row('Organization Name', d.orgName),
    row('Type', d.orgType ? d.orgType.replace(/_/g, ' ') : ''),
    row('Focus', focusText),
    row('Disability Types', disabilityList),
    row('Address', d.address),
    row('Students to Nominate', d.studentCount),
  ].join(''))}
    ${section('Contact Person', [
    row('Name', d.contactName),
    row('Email', d.contactEmail),
    row('Phone', d.contactPhone),
  ].join(''))}
    <p style="font-size:13px;color:#475569;margin-top:16px;">
      Next step: Visit the <strong>Student Nomination</strong> form to nominate your talented students.
    </p>
    ${statusButton(d)}
  `)
  await sendMail(d.contactEmail, 'Organization Registered – VYUGA Special Talent Utsav', html)
}

// ── 4. Talent Utsav – Student Nomination ─────────────────────────────────────
// Sends to guardian email + org contact email
async function sendTalentStudentConfirmation(d) {
  const html = shell('Nomination Submitted – Special Talent Utsav', `
    ${section('Organization', [row('Organization', d.orgName)].join(''))}
    ${section('Student Details', [
    row('Student Name', d.studentName),
    row('Age', d.studentAge),
    row('Disability Type', d.disabilityType),
    row('Talent Category', d.talentCategory),
    row('Description', d.talentDescription),
  ].join(''))}
    ${section('Guardian Details', [
    row('Guardian Name', d.guardianName),
    row('Guardian Phone', d.guardianPhone),
    row('Guardian Email', d.guardianEmail),
    row('Video Link', d.videoLink ? `<a href="${d.videoLink}" style="color:#0197B2;">${d.videoLink}</a>` : ''),
  ].join(''))}
    ${d.paymentStatus ? section('Payment Details', [
    row('Status', `<span style="color:#16a34a;font-weight:bold;">${d.paymentStatus}</span>`),
    row('Order ID', d.razorpayOrderId),
    row('Transaction ID', d.razorpayPaymentId),
  ].join('')) : ''}
    <p style="font-size:13px;color:#475569;margin-top:16px;">
      📹 Your performance video has been received and will be reviewed by our team.
    </p>
    ${statusButton(d)}
  `)
  const isValidRecipient = (email) => typeof email === 'string' && email.includes('@')
  const primaryRecipients = Array.from(new Set([
    d.guardianEmail,
    d.payerEmail,
  ].filter(isValidRecipient)))

  for (const email of primaryRecipients) {
    await sendMail(email, 'Nomination Submitted – VYUGA Special Talent Utsav', html)
  }

  // Also notify the organization contact
  if (isValidRecipient(d.orgContactEmail) && !primaryRecipients.includes(d.orgContactEmail)) {
    const orgHtml = shell('New Student Nominated – Special Talent Utsav', `
      <p style="font-size:14px;color:#1e293b;margin:0 0 20px;">
        A new student from your organization has been nominated for the Special Talent Utsav.
      </p>
      ${section('Student Details', [
      row('Student Name', d.studentName),
      row('Age', d.studentAge),
      row('Disability Type', d.disabilityType),
      row('Talent Category', d.talentCategory),
      row('Description', d.talentDescription),
    ].join(''))}
      ${section('Guardian Details', [
      row('Guardian Name', d.guardianName),
      row('Guardian Phone', d.guardianPhone),
      row('Guardian Email', d.guardianEmail),
    ].join(''))}
    `)
    await sendMail(d.orgContactEmail, `New Nomination: ${d.studentName} – VYUGA Special Talent Utsav`, orgHtml)
  }

  if (!primaryRecipients.length && !isValidRecipient(d.orgContactEmail)) {
    console.error('[mailer] No valid recipient found for talent nomination confirmation — studentName:', d.studentName)
  }
}

// ── 5. Blind Cricket ─────────────────────────────────────────────────────────
async function sendCricketConfirmation(d) {
  const html = shell('Interest Submitted – Blind Cricket Tournament', `
    ${section('Team Details', [
    row('Team Name', d.teamName),
    row('City', d.city),
    row('State', d.state),
    row('Number of Players', d.playerCount),
    row('Played Before?', d.hasPlayedBefore === 'yes' ? 'Yes' : 'No'),
    row('Additional Info', d.additionalInfo),
  ].join(''))}
    ${section('Contact Person', [
    row('Name', d.contactName),
    row('Email', d.contactEmail),
    row('Phone', d.contactPhone),
  ].join(''))}
    ${d.paymentStatus ? section('Payment Details', [
    row('Status', `<span style="color:#16a34a;font-weight:bold;">${d.paymentStatus}</span>`),
    row('Order ID', d.razorpayOrderId),
    row('Transaction ID', d.razorpayPaymentId),
  ].join('')) : ''}
    <p style="font-size:13px;color:#475569;margin-top:16px;">
      Our team will reach out to you with tournament details soon.
    </p>
    ${statusButton(d)}
  `)
  await sendMail(d.contactEmail, 'Interest Submitted – VYUGA Blind Cricket Tournament', html)
}

// ── 6. Blind Chess ───────────────────────────────────────────────────────────
async function sendChessConfirmation(d) {
  const html = shell('Registration Confirmed – Blind Chess Competition', `
    ${section('Participant Details', [
    row('Name', d.participantName),
    row('Email', d.email),
    row('Phone', d.phone),
    row('Age', d.age),
    row('City', d.city),
    row('State', d.state),
    row('Disability Type', d.disabilityType),
  ].join(''))}
    ${section('Chess Experience', [
    row('Played Before?', d.hasPlayedBefore === 'yes' ? 'Yes' : 'No'),
    row('Experience Level', d.experienceLevel ? d.experienceLevel.replace(/_/g, ' ') : ''),
    row('Additional Info', d.additionalInfo),
  ].join(''))}
    <p style="font-size:13px;color:#475569;margin-top:16px;">
      Our team will reach out to you with competition details soon.
    </p>
    ${statusButton(d)}
  `)
  await sendMail(d.email, 'Registration Confirmed – VYUGA Blind Chess Competition', html)
}

// ── 7. Short Film Contest ───────────────────────────────────────────────────
async function sendShortFilmConfirmation(d) {
  const html = shell('Registration Confirmed – Short Film Contest', `
    ${section('Film Details', [
    row('Film Title', d.filmTitle),
    row('Language', d.filmLanguage),
    row('Duration (mins)', d.duration),
    row('Genre', d.genre),
    row('Participation', d.participationType),
    row('Director', d.directorName),
    row('Film Link', d.filmUrl ? `<a href="${d.filmUrl}" style="color:#0197B2;">${d.filmUrl}</a>` : ''),
  ].join(''))}
    ${section('Contact Person', [
    row('Name', d.contactName),
    row('Email', d.contactEmail),
    row('Phone', d.contactPhone),
  ].join(''))}
    ${d.paymentStatus ? section('Payment Details', [
    row('Status', `<span style="color:#16a34a;font-weight:bold;">${d.paymentStatus}</span>`),
    row('Order ID', d.razorpayOrderId),
    row('Transaction ID', d.razorpayPaymentId),
  ].join('')) : ''}
    <p style="font-size:13px;color:#475569;margin-top:16px;">
      Your short film registration has been received successfully. Our team will contact you if any additional details are needed.
    </p>
    ${statusButton(d)}
  `)
  await sendMail(d.contactEmail, 'Registration Confirmed – VYUGA Short Film Contest', html)
}

// ── Status update email ───────────────────────────────────────────────────────
async function sendStatusUpdateEmail({ to, name, event, status, adminNote }) {
  const STATUS_STYLES = {
    selected: { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', label: 'Selected' },
    rejected: { color: '#475569', bg: '#f8fafc', border: '#e2e8f0', label: 'Not Shortlisted' },
    pending: { color: '#d97706', bg: '#fffbeb', border: '#fde68a', label: 'Pending Review' },
  }
  const s = STATUS_STYLES[status] || STATUS_STYLES.pending
  const html = shell(`Registration ${s.label} – VYUGA`, `
    <div style="border-radius:12px;padding:20px 24px;margin-bottom:20px;border:1px solid ${s.border};background:${s.bg};">
      <p style="margin:0;font-size:22px;font-weight:800;color:${s.color};">${s.label}</p>
      <p style="margin:6px 0 0;font-size:14px;color:#475569;">Your registration for <strong>${event}</strong> has been updated.</p>
    </div>
    ${section('Registration Details', [
    row('Registered By', name),
    row('Event', event),
    row('Status', `<span style="font-weight:700;color:${s.color};">${s.label}</span>`),
    adminNote ? row('Note from Admin', adminNote) : '',
  ].join(''))}
    <p style="font-size:13px;color:#475569;margin-top:16px;">
      If you have any questions, please contact the VYUGA organizing team.
    </p>
  `)

  await sendMail(to, `Registration ${s.label} – VYUGA 2026`, html)
}

// ── Number to words (Indian system) ──────────────────────────────────────────
function numberToWords(num) {
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
  if (!num || isNaN(num)) return 'Zero'
  const n = Math.round(num)
  if (n === 0) return 'Zero'
  const s = ('000000000' + String(n)).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/)
  if (!s) return 'Zero'
  let str = ''
  str += s[1] != 0 ? (a[Number(s[1])] || b[s[1][0]] + ' ' + a[s[1][1]]) + ' Crore ' : ''
  str += s[2] != 0 ? (a[Number(s[2])] || b[s[2][0]] + ' ' + a[s[2][1]]) + ' Lakh ' : ''
  str += s[3] != 0 ? (a[Number(s[3])] || b[s[3][0]] + ' ' + a[s[3][1]]) + ' Thousand ' : ''
  str += s[4] != 0 ? (a[Number(s[4])] || b[s[4][0]] + ' ' + a[s[4][1]]) + ' Hundred ' : ''
  str += s[5] != 0 ? ((str !== '') ? 'and ' : '') + (a[Number(s[5])] || b[s[5][0]] + ' ' + a[s[5][1]]) : ''
  return str.trim()
}

// ── GST Invoice PDF Generator ─────────────────────────────────────────────────
const EVENT_LABEL_MAP = {
  'innovation-college': 'Inclusive Innovation Fest – For Specially Abled (College)',
  'innovation-pwd': 'Inclusive Innovation Fest – By Specially Abled',
  'shortfilm': 'Short Film Contest',
  'cricket': 'Blind Cricket Tournament',
  'specialtalent': 'Special Talent Utsav',
  'talent-combined': 'Special Talent Utsav – Nominations',
  'chess': 'Blind Chess Competition',
}

async function generateInvoicePdf(invoiceData) {
  const {
    invoiceNumber, invoiceDate, payerName, payerEmail, payerPhone,
    eventType, baseAmount, gstAmount, totalAmount, razorpayPaymentId
  } = invoiceData

  const base = baseAmount / 100        // ₹ value
  const gst = gstAmount / 100
  const total = totalAmount / 100
  const cgst = gst / 2
  const sgst = gst / 2
  const cgstRate = 9
  const sgstRate = 9
  const eventName = EVENT_LABEL_MAP[eventType] || eventType
  const totalWords = numberToWords(Math.round(total)) + ' Rupees Only'
  const fmt = (n) => n.toFixed(2)

  // Embed logo as base64
  let logoDataUri = null
  try {
    const logoBuffer = fs.readFileSync(LOGO_PATH)
    logoDataUri = 'data:image/png;base64,' + logoBuffer.toString('base64')
  } catch (_) { /* logo file missing – skip */ }

  // pdfmake v3 – register fonts once then use promise-based getBuffer()
  pdfmake.addFonts({
    Roboto: {
      normal: path.join(__dirname, 'node_modules/pdfmake/fonts/Roboto/Roboto-Regular.ttf'),
      bold: path.join(__dirname, 'node_modules/pdfmake/fonts/Roboto/Roboto-Medium.ttf'),
      italics: path.join(__dirname, 'node_modules/pdfmake/fonts/Roboto/Roboto-Italic.ttf'),
      bolditalics: path.join(__dirname, 'node_modules/pdfmake/fonts/Roboto/Roboto-MediumItalic.ttf'),
    }
  })
  pdfmake.setUrlAccessPolicy(() => false)

  // Brand colours
  const TEAL = '#0197B2'
  const GREEN = '#5BCB2B'
  const DARK = '#0f172a'
  const GREY = '#64748b'
  const BORDER = '#e2e8f0'
  const LIGHT = '#f8fafc'

  const headerContent = logoDataUri
    ? [
      { image: logoDataUri, width: 60, margin: [0, 0, 0, 4] },
      { text: 'NEXYUGA INNOVATIONS PRIVATE LIMITED', style: 'companyName' },
    ]
    : [{ text: 'NEXYUGA INNOVATIONS PRIVATE LIMITED', style: 'companyName' }]

  const docDefinition = {
    pageSize: 'A4',
    pageMargins: [40, 40, 40, 60],
    defaultStyle: { font: 'Roboto', fontSize: 9, color: DARK },
    styles: {
      companyName: { fontSize: 14, bold: true, color: '#ffffff', margin: [0, 0, 0, 2] },
      invoiceTitle: { fontSize: 20, bold: true, color: '#ffffff', alignment: 'right' },
      sectionHeader: { fontSize: 8, bold: true, color: TEAL, margin: [0, 10, 0, 4], textTransform: 'uppercase' },
      tableHeader: { fontSize: 8, bold: true, color: '#ffffff', fillColor: TEAL },
      label: { fontSize: 8, color: GREY },
      value: { fontSize: 9, bold: true },
      totalRow: { fontSize: 10, bold: true },
      footerText: { fontSize: 8, color: GREY, italics: true },
    },
    content: [
      // ── Header Band ──────────────────────────────────────────────────
      {
        table: {
          widths: ['*', 'auto'],
          body: [[
            {
              stack: headerContent,
              fillColor: TEAL,
              border: [false, false, false, false],
              margin: [12, 12, 0, 12]
            },
            {
              stack: [
                { text: 'TAX INVOICE', style: 'invoiceTitle' },
                { text: `Invoice No: ${invoiceNumber}`, fontSize: 8, color: '#e2e8f0', alignment: 'right' },
                { text: `Date: ${new Date(invoiceDate).toLocaleDateString('en-IN')}`, fontSize: 8, color: '#e2e8f0', alignment: 'right' },
              ],
              fillColor: TEAL,
              border: [false, false, false, false],
              margin: [0, 12, 12, 12]
            }
          ]]
        },
        layout: 'noBorders'
      },

      // ── Company & Buyer Info ──────────────────────────────────────────
      { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5, lineColor: GREEN }], margin: [0, 8, 0, 8] },
      {
        columns: [
          {
            width: '50%',
            stack: [
              { text: 'NEXYUGA INNOVATIONS PRIVATE LIMITED', bold: true, fontSize: 10, color: TEAL },
              { text: 'K.S.Rangasamy College of Technology, Tiruchengode', style: 'label', margin: [0, 3, 0, 0] },
              { text: 'Tamil Nadu – 637215', style: 'label', margin: [0, 2, 0, 0] },
              { text: 'GSTIN: U85499TN2025PTC184403', style: 'label', margin: [0, 2, 0, 0] },
              { text: 'SAC Code: 999291', style: 'label', margin: [0, 2, 0, 0] },
              { text: 'Ph: 04288-274374 | vyuga@nexyugainnovations.com', style: 'label', margin: [0, 2, 0, 0] },
            ]
          },
          {
            width: '50%',
            stack: [
              { text: 'BILLED TO', bold: true, fontSize: 10, color: GREEN },
              { text: payerName || '—', bold: true, fontSize: 9, margin: [0, 3, 0, 0] },
              { text: payerEmail || '—', style: 'label', margin: [0, 2, 0, 0] },
              { text: payerPhone ? `Ph: ${payerPhone}` : '', style: 'label', margin: [0, 2, 0, 0] },
              { text: 'Place of Supply: Tamil Nadu (33)', style: 'label', margin: [0, 2, 0, 0] },
            ]
          }
        ]
      },

      // ── Items Table ───────────────────────────────────────────────────
      { text: 'PARTICULARS', style: 'sectionHeader', margin: [0, 12, 0, 0] },
      {
        table: {
          headerRows: 1,
          widths: [20, '*', 50, 50, 50, 50, 50, 60],
          body: [
            // Header
            [
              { text: 'S.No', style: 'tableHeader', alignment: 'center' },
              { text: 'Description of Service', style: 'tableHeader' },
              { text: 'SAC', style: 'tableHeader', alignment: 'center' },
              { text: 'Taxable Value (₹)', style: 'tableHeader', alignment: 'right' },
              { text: 'CGST 9% (₹)', style: 'tableHeader', alignment: 'right' },
              { text: 'SGST 9% (₹)', style: 'tableHeader', alignment: 'right' },
              { text: 'IGST (₹)', style: 'tableHeader', alignment: 'right' },
              { text: 'Total (₹)', style: 'tableHeader', alignment: 'right' },
            ],
            // Data row
            [
              { text: '1', alignment: 'center' },
              { text: `Event Registration Fee\n${eventName}\nVYUGA – Ability Carnival 2026`, fontSize: 8 },
              { text: '999291', alignment: 'center', fontSize: 8 },
              { text: fmt(base), alignment: 'right' },
              { text: fmt(cgst), alignment: 'right' },
              { text: fmt(sgst), alignment: 'right' },
              { text: '–', alignment: 'right' },
              { text: fmt(total), bold: true, alignment: 'right' },
            ],
            // Totals
            [
              { text: '', border: [false, false, false, false] },
              { text: 'TOTAL', bold: true, alignment: 'right', border: [false, false, false, false] },
              { text: '', border: [false, false, false, false] },
              { text: fmt(base), bold: true, alignment: 'right', fillColor: LIGHT },
              { text: fmt(cgst), bold: true, alignment: 'right', fillColor: LIGHT },
              { text: fmt(sgst), bold: true, alignment: 'right', fillColor: LIGHT },
              { text: '–', bold: true, alignment: 'right', fillColor: LIGHT },
              { text: fmt(total), bold: true, alignment: 'right', color: TEAL, fillColor: LIGHT },
            ],
          ]
        },
        layout: {
          hLineWidth: (i, node) => (i === 0 || i === 1 || i === node.table.body.length) ? 1 : 0.5,
          vLineWidth: () => 0.5,
          hLineColor: () => BORDER,
          vLineColor: () => BORDER,
          paddingLeft: () => 6,
          paddingRight: () => 6,
          paddingTop: () => 5,
          paddingBottom: () => 5,
        }
      },

      // ── Amount in words & GST summary ────────────────────────────────
      { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5, lineColor: BORDER }], margin: [0, 8, 0, 8] },
      {
        columns: [
          {
            width: '60%',
            stack: [
              { text: 'Amount Chargeable (in words)', style: 'sectionHeader', margin: [0, 0, 0, 2] },
              { text: `INR ${totalWords.toUpperCase()}`, bold: true, fontSize: 9, color: TEAL },
            ]
          },
          {
            width: '40%',
            table: {
              widths: ['*', 70],
              body: [
                [{ text: 'Base Amount:', style: 'label' }, { text: `₹ ${fmt(base)}`, alignment: 'right', style: 'value' }],
                [{ text: `CGST @ ${cgstRate}%:`, style: 'label' }, { text: `₹ ${fmt(cgst)}`, alignment: 'right', style: 'value' }],
                [{ text: `SGST @ ${sgstRate}%:`, style: 'label' }, { text: `₹ ${fmt(sgst)}`, alignment: 'right', style: 'value' }],
                [
                  { text: 'TOTAL:', bold: true, fontSize: 10, color: DARK },
                  { text: `₹ ${fmt(total)}`, alignment: 'right', bold: true, fontSize: 10, color: TEAL }
                ],
              ]
            },
            layout: 'noBorders'
          }
        ]
      },

      // ── Payment Reference ─────────────────────────────────────────────
      { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5, lineColor: BORDER }], margin: [0, 8, 0, 8] },
      {
        table: {
          widths: ['*', '*'],
          body: [[
            { text: `Payment Reference: ${razorpayPaymentId || 'N/A'}`, style: 'label' },
            { text: `Payment Mode: Online (Razorpay)`, style: 'label', alignment: 'right' }
          ]]
        },
        layout: 'noBorders'
      },

      // ── Declaration & Signature ────────────────────────────────────────
      { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5, lineColor: BORDER }], margin: [0, 12, 0, 8] },
      {
        columns: [
          {
            width: '60%',
            stack: [
              { text: 'Declaration', bold: true, fontSize: 8, decoration: 'underline', margin: [0, 0, 0, 4] },
              { text: 'We declare that this invoice shows the actual price of the services described and that all particulars are true and correct. Tax is payable under the Reverse Charge Mechanism: No.', style: 'footerText' },
            ]
          },
          {
            width: '40%',
            alignment: 'right',
            stack: [
              { text: 'For NEXYUGA INNOVATIONS PRIVATE LIMITED', bold: true, fontSize: 8, alignment: 'right' },
              { text: '\n\n\n', fontSize: 8 },
              { text: 'Authorized Signatory', style: 'footerText', alignment: 'right' },
            ]
          }
        ]
      },
    ],
    footer: (currentPage, pageCount) => ({
      margin: [40, 0, 40, 0],
      columns: [
        { text: `© 2026 VYUGA – Ability Carnival | vyuga.nexyuga.in`, style: 'footerText' },
        { text: `Page ${currentPage} of ${pageCount}`, style: 'footerText', alignment: 'right' }
      ]
    })
  }

  // pdfmake v3 uses a Promise-based getBuffer()
  const pdfDoc = pdfmake.createPdf(docDefinition)
  const buffer = await pdfDoc.getBuffer()
  return buffer
}

// ── Send GST Invoice Email ─────────────────────────────────────────────────────
async function sendGSTInvoiceEmail({ payerName, payerEmail, payerPhone, eventType, baseAmount, gstAmount, totalAmount, razorpayOrderId, razorpayPaymentId, invoiceDate }) {
  try {
    const invoiceNumber = `VYG-${Date.now().toString().slice(-8)}`
    const eventLabel = EVENT_LABEL_MAP[eventType] || eventType
    const base = baseAmount / 100
    const total = totalAmount / 100
    const gst = gstAmount / 100
    const fmt = (n) => n.toFixed(2)

    // Build the invoice PDF buffer
    const pdfBuffer = await generateInvoicePdf({
      invoiceNumber,
      invoiceDate: invoiceDate || new Date().toISOString(),
      payerName, payerEmail, payerPhone,
      eventType, baseAmount, gstAmount, totalAmount,
      razorpayPaymentId
    })

    const html = shell(`GST Tax Invoice – ${eventLabel}`, `
      <div style="border-radius:12px;padding:20px 24px;margin-bottom:20px;border:1px solid #bbf7d0;background:#f0fdf4;">
        <p style="margin:0;font-size:20px;font-weight:800;color:#16a34a;">Payment Successful</p>
        <p style="margin:6px 0 0;font-size:14px;color:#475569;">Your registration for <strong>${eventLabel}</strong> is confirmed.</p>
      </div>
      ${section('Invoice Details', [
      row('Invoice No.', invoiceNumber),
      row('Date', new Date(invoiceDate || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })),
      row('Payment Ref.', razorpayPaymentId || razorpayOrderId),
    ].join(''))}
      ${section('Payment Breakdown', [
      row('Base Registration Fee', `₹ ${fmt(base)}`),
      row('CGST @ 9%', `₹ ${fmt(gst / 2)}`),
      row('SGST @ 9%', `₹ ${fmt(gst / 2)}`),
      row('Total Amount Paid', `<span style="font-size:16px;font-weight:800;color:#0197B2;">₹ ${fmt(total)}</span>`),
    ].join(''))}
      <p style="font-size:13px;color:#475569;margin-top:16px;">
        📎 Please find your <strong>GST Tax Invoice</strong> attached as a PDF for your records.
      </p>
    `)

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'VYUGA Carnival <no-reply@vyuga.in>',
      to: payerEmail,
      subject: `GST Tax Invoice – VYUGA (${invoiceNumber})`,
      html,
      attachments: [
        {
          filename: 'logo.png',
          path: LOGO_PATH,
          cid: 'vyuga-logo',
        },
        {
          filename: `VYUGA_Invoice_${invoiceNumber}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        }
      ]
    })

  } catch (err) {
    console.error('[mailer] Failed to send GST invoice:', err.message)
  }
}

module.exports = {
  sendInnovationCollegeConfirmation,
  sendInnovationPwdConfirmation,
  sendTalentOrgConfirmation,
  sendTalentStudentConfirmation,
  sendCricketConfirmation,
  sendChessConfirmation,
  sendShortFilmConfirmation,
  sendStatusUpdateEmail,
  sendGSTInvoiceEmail,
  sendMail,
  transporter,
}
