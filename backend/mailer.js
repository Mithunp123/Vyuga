const nodemailer = require('nodemailer')
const path = require('path')

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
    await transporter.sendMail({
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
    console.error('[mailer] Failed to send email to', to, '–', err.message)
  }
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
  `)
  await sendMail(d.member1Email, '✅ Registration Confirmed – VYUGA Innovation Fest (For Specially Abled)', html)
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
  `)
  await sendMail(d.member1Email, '✅ Registration Confirmed – VYUGA Innovation Fest (By Specially Abled)', html)
}

// ── 3. Talent Utsav – Organization ───────────────────────────────────────────
async function sendTalentOrgConfirmation(d) {
  const html = shell('Organization Registered – Special Talent Utsav', `
    ${section('Organization Details', [
      row('Organization Name', d.orgName),
      row('Type', d.orgType ? d.orgType.replace(/_/g, ' ') : ''),
      row('Address', d.address),
      row('Students to Nominate', d.studentCount),
    ].join(''))}
    ${section('Contact Person', [
      row('Name', d.contactName),
      row('Email', d.contactEmail),
      row('Phone', d.contactPhone),
    ].join(''))}
    <p style="font-size:13px;color:#475569;margin-top:16px;">
      🎯 Next step: Visit the <strong>Student Nomination</strong> form to nominate your talented students.
    </p>
  `)
  await sendMail(d.contactEmail, '✅ Organization Registered – VYUGA Special Talent Utsav', html)
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
    <p style="font-size:13px;color:#475569;margin-top:16px;">
      📹 Your performance video has been received and will be reviewed by our team.
    </p>
  `)
  // Send to guardian
  if (d.guardianEmail) {
    await sendMail(d.guardianEmail, '✅ Nomination Submitted – VYUGA Special Talent Utsav', html)
  }
  // Also notify the organization contact
  if (d.orgContactEmail) {
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
    await sendMail(d.orgContactEmail, `📋 New Nomination: ${d.studentName} – VYUGA Special Talent Utsav`, orgHtml)
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
    <p style="font-size:13px;color:#475569;margin-top:16px;">
      🏏 Our team will reach out to you with tournament details soon.
    </p>
  `)
  await sendMail(d.contactEmail, '✅ Interest Submitted – VYUGA Blind Cricket Tournament', html)
}

// ── Status update email ───────────────────────────────────────────────────────
async function sendStatusUpdateEmail({ to, name, event, status, adminNote }) {
  const STATUS_STYLES = {
    approved: { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', icon: '✅', label: 'Approved' },
    rejected: { color: '#dc2626', bg: '#fef2f2', border: '#fecaca', icon: '❌', label: 'Rejected' },
    pending:  { color: '#d97706', bg: '#fffbeb', border: '#fde68a', icon: '⏳', label: 'Pending Review' },
  }
  const s = STATUS_STYLES[status] || STATUS_STYLES.pending
  const html = shell(`Registration ${s.label} – VYUGA`, `
    <div style="border-radius:12px;padding:20px 24px;margin-bottom:20px;border:1px solid ${s.border};background:${s.bg};">
      <p style="margin:0;font-size:22px;font-weight:800;color:${s.color};">${s.icon} ${s.label}</p>
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
  console.log(`[mailer] Sending status update email to ${to} (${status})`)
  await sendMail(to, `${s.icon} Registration ${s.label} – VYUGA 2026`, html)
}

module.exports = {
  sendInnovationCollegeConfirmation,
  sendInnovationPwdConfirmation,
  sendTalentOrgConfirmation,
  sendTalentStudentConfirmation,
  sendCricketConfirmation,
  sendStatusUpdateEmail,
}
