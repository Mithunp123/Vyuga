import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import logoImg from '../assets/logo.png'
import SubmitLoader from '../components/SubmitLoader.jsx'
import AdminSettingsView from '../components/AdminSettingsView.jsx'
import AdminGalleryView from '../components/AdminGalleryView.jsx'
import AdminPaymentsView from '../components/AdminPaymentsView.jsx'
import AdminJuryView from '../components/AdminJuryView.jsx'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const TABS = [
  { id: 'innovation-college', label: 'Innovation (For Specially Abled)', endpoint: '/api/admin/innovation-college' },
  { id: 'innovation-pwd',     label: 'Innovation (By Specially Abled)',  endpoint: '/api/admin/innovation-pwd' },
  { id: 'talent-student',     label: 'Talent Utsav – Nominations',       endpoint: '/api/admin/talent-student' },
  { id: 'shortfilm',          label: 'Short Film Contest',               endpoint: '/api/admin/shortfilm' },
  { id: 'cricket',            label: 'Blind Cricket',                    endpoint: '/api/admin/cricket' },
  { id: 'chess',              label: 'Blind Chess',                      endpoint: '/api/admin/chess' },
  { id: 'accommodation',      label: 'Accommodation Requests',           endpoint: '/api/admin/accommodation' },
  { id: 'sponsors',           label: 'Sponsor Messages',                 endpoint: '/api/admin/sponsors' },
  { id: 'payments',           label: 'Payments',                      endpoint: null },
  { id: 'settings',           label: 'Form Controls',                 endpoint: null },
  { id: 'gallery',            label: 'Gallery',                       endpoint: null },
  { id: 'jury',               label: 'Jury Management',               endpoint: null },
]

const STATUS_CFG = {
  selected: { label: 'Selected', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
  waitlist: { label: 'Waitlist', color: '#0284c7', bg: '#f0f9ff', border: '#bae6fd' },
  rejected: { label: 'Rejected', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
  pending:  { label: 'Pending',  color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
}

// ── Column definitions per tab ────────────────────────────────────────────────
const COLUMNS = {
  'innovation-college': [
    { key: 'id',            label: 'ID',        fmt: (v) => v ? v.substring(0, 8) + '...' : '-' },
    { key: 'submitted_at',  label: 'Date',      fmt: fmtDate },
    { key: 'team_name',     label: 'Team Name' },
    { key: 'college_name',  label: 'College' },
    { key: 'theme',         label: 'Theme' },
    { key: 'leader_email',  label: 'Email' },
    { key: 'leader_phone',  label: 'Phone' },
    { key: 'payment_status',label: 'Payment',   fmt: (v) => <PaymentBadge status={v} /> },
  ],
  'innovation-pwd': [
    { key: 'id',                 label: 'ID',        fmt: (v) => v ? v.substring(0, 8) + '...' : '-' },
    { key: 'submitted_at',       label: 'Date',      fmt: fmtDate },
    { key: 'participation_type', label: 'Type' },
    { key: 'name',               label: 'Name' },
    { key: 'email',              label: 'Email' },
    { key: 'phone',              label: 'Phone' },
    { key: 'udid_card_path',     label: 'UDID',      fmt: (v) => v ? <a href={`${API_BASE}/uploads/${v}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View File</a> : '—' },
    { key: 'payment_status',     label: 'Payment',   fmt: (v) => <PaymentBadge status={v} /> },
  ],
  'talent-org': [
    { key: 'id',             label: 'ID',        fmt: (v) => v ? v.substring(0, 8) + '...' : '-' },
    { key: 'registered_at',  label: 'Date',        fmt: fmtDate },
    { key: 'org_name',       label: 'Organisation' },
    { key: 'contact_name',   label: 'Contact' },
    { key: 'contact_email',  label: 'Email' },
    { key: 'contact_phone',  label: 'Phone' },
  ],
  'talent-student': [
    { key: 'id',              label: 'ID',        fmt: (v) => v ? v.substring(0, 8) + '...' : '-' },
    { key: 'submitted_at',    label: 'Date',        fmt: fmtDate },
    { key: 'student_name',    label: 'Student/Team' },
    { key: 'nomination_type', label: 'Type',        fmt: (v) => v === 'team' ? 'Team' : v === 'individual' ? 'Individual' : '-' },
    { key: 'talent_category', label: 'Talent' },
    { key: 'contact_name',    label: 'Contact' },
    { key: 'contact_phone',   label: 'Phone' },
    { key: 'payment_status',  label: 'Payment',   fmt: (v) => <PaymentBadge status={v} /> },
  ],
  cricket: [
    { key: 'id',                     label: 'ID',        fmt: (v) => v ? v.substring(0, 8) + '...' : '-' },
    { key: 'submitted_at',           label: 'Date',              fmt: fmtDate },
    { key: 'team_name',              label: 'Team' },
    { key: 'city',                   label: 'City' },
    { key: 'state',                  label: 'State' },
    { key: 'contact_name',           label: 'Contact' },
    { key: 'contact_phone',          label: 'Phone' },
    { key: 'payment_status',         label: 'Payment',   fmt: (v) => <PaymentBadge status={v} /> },
  ],
  chess: [
    { key: 'id',                label: 'ID',        fmt: (v) => v ? v.substring(0, 8) + '...' : '-' },
    { key: 'submitted_at',      label: 'Date',       fmt: fmtDate },
    { key: 'participant_name',  label: 'Name' },
    { key: 'email',             label: 'Email' },
    { key: 'phone',             label: 'Phone' },
    { key: 'city',              label: 'City' },
  ],
  accommodation: [
    { key: 'id',                     label: 'ID',        fmt: (v) => v ? v.substring(0, 8) + '...' : '-' },
    { key: 'submitted_at',           label: 'Submitted',      fmt: fmtDate },
    { key: 'full_name',              label: 'Name' },
    { key: 'email',                  label: 'Email' },
    { key: 'phone',                  label: 'Phone' },
    { key: 'arrival_date',           label: 'Arrival',        fmt: fmtDateOnly },
    { key: 'departure_date',         label: 'Departure',      fmt: fmtDateOnly },
  ],
  sponsors: [
    { key: 'id',            label: 'ID',        fmt: (v) => v ? v.substring(0, 8) + '...' : '-' },
    { key: 'submitted_at',  label: 'Date',      fmt: fmtDate },
    { key: 'org_name',      label: 'Organization' },
    { key: 'sponsor_type',  label: 'Type' },
    { key: 'amount',        label: 'Amount',    fmt: (v) => v ? `₹${v}` : '-' },
    { key: 'name',          label: 'Contact Person' },
    { key: 'phone',         label: 'Phone' },
    { key: 'email',         label: 'Email' },
    { key: 'website_url',   label: 'Website',   fmt: (v) => v ? <a href={v} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Link</a> : '-' },
    { key: 'logo_path',     label: 'Logo',      fmt: (v) => v ? <a href={`${API_BASE}/uploads/${v}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View</a> : '-' },
  ],
  shortfilm: [
    { key: 'id',            label: 'ID',        fmt: (v) => v ? v.substring(0, 8) + '...' : '-' },
    { key: 'submitted_at',  label: 'Date',      fmt: fmtDate },
    { key: 'film_title',    label: 'Film Title' },
    { key: 'genre',         label: 'Genre' },
    { key: 'duration',      label: 'Duration',  fmt: (v) => v ? `${v} min` : '—' },
    { key: 'director_name', label: 'Director' },
    { key: 'contact_email', label: 'Email' },
    { key: 'contact_phone', label: 'Phone' },
    { key: 'film_url',      label: 'Film Link', fmt: (v) => v ? <a href={v} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View Film</a> : '—' },
    { key: 'payment_status',label: 'Payment',   fmt: (v) => <PaymentBadge status={v} /> },
  ],
}

function fmtDate(v) {
  if (!v) return '—'
  return new Date(v).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
}

function fmtTournamentExperience(experience) {
  if (!experience) return <span className="text-slate-400">No data</span>

  let expData
  try {
    // If it's already an object, use it; if it's a string, parse it
    expData = typeof experience === 'string' ? JSON.parse(experience) : experience
  } catch (e) {
    return <span className="text-red-500">Invalid data</span>
  }

  if (!expData.hasPlayedBefore) {
    return <span className="text-slate-500">No previous experience</span>
  }

  return (
    <div className="space-y-1">
      <div className="font-medium text-green-600">✓ Has Experience</div>
      {expData.tournamentCount && (
        <div className="text-sm text-slate-600">
          <span className="font-medium">Count:</span> {expData.tournamentCount}
        </div>
      )}
      {expData.eventNames && (
        <div className="text-sm text-slate-600">
          <span className="font-medium">Events:</span>
          <div className="mt-1 text-xs bg-slate-50 p-2 rounded border max-w-xs">
            {expData.eventNames.split(/[,\n]/).map((event, idx) => (
              <div key={idx} className="truncate">• {event.trim()}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function fmtDateOnly(v) {
  if (!v) return '—'
  return new Date(v).toLocaleDateString('en-IN', { dateStyle: 'medium' })
}

function fmtRoomType(v) {
  if (!v) return '—'
  return v.charAt(0).toUpperCase() + v.slice(1)
}

function fmtTruncate(v) {
  if (!v) return '—'
  if (typeof v !== 'string') return v
  return v.length > 30 ? v.substring(0, 30) + '...' : v
}

function exportCSV(tabId, rows) {
  if (!rows || !rows.length) return

  // 1. Determine all unique keys in the dataset
  const allKeys = new Set()
  rows.forEach(r => Object.keys(r).forEach(k => allKeys.add(k)))
  
  // 2. Merge with defined COLUMNS to prefer specific ordering/formatting where available
  const definedCols = COLUMNS[tabId] || []
  const definedKeySet = new Set(definedCols.map(c => c.key))
  
  // Create column definitions for keys that aren't in COLUMNS
  const extraCols = Array.from(allKeys)
    .filter(k => !definedKeySet.has(k))
    .map(k => ({ key: k, label: k })) // Raw key as label
    
  // Combine: Defined columns first, then extra columns
  let finalCols = [...definedCols, ...extraCols]

  // 3. Special handling for talent-student team members
  const isTalentStudent = (tabId === 'talent-student')
  if (isTalentStudent) {
    const memberCols = [
      { key: 'member_number', label: 'Member #' },
      { key: 'member_name', label: 'Member Name' },
      { key: 'member_age', label: 'Member Age' },
      { key: 'member_disability', label: 'Member Disability' },
      { key: 'member_guardian_name', label: 'Member Guardian' },
      { key: 'member_guardian_phone', label: 'Member Guardian Phone' }
    ]
    finalCols = [...finalCols, ...memberCols]
  }

  // Helper to escape CSV values
  const escapeCsv = (val) => {
    if (val === null || val === undefined) return ''
    const str = String(val)
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  // 4. Generate CSV lines
  const header = finalCols.map(c => escapeCsv(c.label)).join(',')
  const lines = []

  rows.forEach(r => {
    // Check if we need to expand rows (only for talent-student teams)
    if (isTalentStudent && r.nomination_type === 'team' && r.team_members) {
      let teamMembers = []
      try {
        teamMembers = typeof r.team_members === 'string' ? JSON.parse(r.team_members) : r.team_members
      } catch (e) {
        teamMembers = []
      }
      
      if (Array.isArray(teamMembers) && teamMembers.length > 0) {
         teamMembers.forEach((member, idx) => {
             const rowValues = finalCols.map(c => {
                 // Check if it is a member column
                 if (c.key === 'member_number') return idx + 1
                 if (c.key === 'member_name') return member.name || ''
                 if (c.key === 'member_age') return member.age || ''
                 if (c.key === 'member_disability') return member.disabilityType || ''
                 if (c.key === 'member_guardian_name') return member.guardianName || ''
                 if (c.key === 'member_guardian_phone') return member.guardianPhone || ''
                 
                 const val = r[c.key]
                 
                 // Try formatter if available
                 if (c.fmt) {
                     try {
                        const formatted = c.fmt(val, r)
                        if (typeof formatted === 'string' || typeof formatted === 'number') {
                            return formatted
                        }
                     } catch(e) {}
                 }
                 
                 if (typeof val === 'object' && val !== null) return JSON.stringify(val)
                 return val
             })
             lines.push(rowValues.map(escapeCsv).join(','))
         })
         return // Done with this row (expanded)
      }
    }

    // Default case (not expanded)
    const rowValues = finalCols.map(c => {
        // Member columns are empty for non-expanded rows
        if (['member_number', 'member_name', 'member_age', 'member_disability', 'member_guardian_name', 'member_guardian_phone'].includes(c.key)) {
            return ''
        }
        
        const val = r[c.key]
        
        // Try formatter if available
        if (c.fmt) {
             try {
                const formatted = c.fmt(val, r)
                if (typeof formatted === 'string' || typeof formatted === 'number') {
                    return formatted
                }
             } catch(e) {}
         }

        if (typeof val === 'object' && val !== null) return JSON.stringify(val)
        return val
    })
    lines.push(rowValues.map(escapeCsv).join(','))
  })
  
  const blob = new Blob([[header, ...lines].join('\n')], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `vyuga_${tabId}_${Date.now()}.csv`
  a.click()
  window.URL.revokeObjectURL(url)
}

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const s = STATUS_CFG[status] || STATUS_CFG.pending
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border"
      style={{ color: s.color, background: s.bg, borderColor: s.border }}>
      {s.label}
    </span>
  )
}

function PaymentBadge({ status }) {
  const isPaid = status === 'paid'
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold border"
      style={{ 
        color: isPaid ? '#16a34a' : '#d97706', 
        background: isPaid ? '#f0fdf4' : '#fffbeb', 
        borderColor: isPaid ? '#bbf7d0' : '#fde68a' 
      }}>
      {isPaid ? 'Paid' : 'Pending'}
    </span>
  )
}

// ── Expanded detail panel ─────────────────────────────────────────────────────
function ExpandedPanel({ row, tabId, token, onStatusChange, onClose }) {
  const [status, setStatus] = useState(row.status || 'pending')
  const [adminNote, setAdminNote] = useState(row.admin_note || '')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [triggering, setTriggering] = useState(false)

  // Org tab and Sponsors tab don't have status management
  const isOrgTab = ['talent-org', 'sponsors'].includes(tabId)

  const mediaPath = row.prototype_image_path || row.video_file_path
  const isVideo = mediaPath && /\.(mp4|mov|avi|mkv|webm)$/i.test(mediaPath)
  const isImage = mediaPath && /\.(png|jpe?g|webp)$/i.test(mediaPath)
  // Strip any leading path components — DB should store just filename now
  const mediaFilename = mediaPath ? mediaPath.replace(/^.*[\\\/]/, '') : null
  const mediaUrl = mediaFilename ? `${API_BASE}/uploads/${mediaFilename}` : null

  const save = async () => {
    setSaving(true)
    setSaveMsg('')
    try {
      const res = await fetch(`${API_BASE}/api/admin/status/${tabId}/${row.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify({ status, adminNote }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.message)
      
      alert('✅ Status saved successfully')
      onStatusChange(row.id, status, adminNote)
    } catch (err) {
      setSaveMsg('❌ ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const triggerEmail = async () => {
    if (status === 'pending') {
      alert("Cannot send email for pending status.")
      return
    }
    if (!window.confirm("Are you sure you want to trigger the status email to the user?")) return
    setTriggering(true)
    try {
      const res = await fetch(`${API_BASE}/api/admin/trigger-email/${tabId}/${row.id}`, {
        method: 'POST',
        headers: { 'x-admin-token': token },
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.message)
      
      alert('✅ Email sent successfully')
      row.email_sent = true
    } catch (err) {
      alert('❌ ' + err.message)
    } finally {
      setTriggering(false)
    }
  }

  return (
    <>
      <SubmitLoader visible={saving} />
      <div className="px-6 py-6" style={{ background: 'linear-gradient(135deg, #f0fbfd 0%, #f4fef0 100%)' }}>



      {/* ── Media preview ── */}
      {mediaUrl && (
        <div className="mb-5 rounded-2xl border-2 border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold tracking-wider uppercase mb-4" style={{ color: '#0197B2' }}>
            {isVideo ? 'Performance Video' : 'Prototype Image'}
          </p>
          {isImage && (
            <img src={mediaUrl} alt="Prototype" className="rounded-xl max-h-80 object-contain border border-slate-100" />
          )}
          {isVideo && (
            <video controls className="rounded-xl max-h-80 w-full border border-slate-100" style={{ background: '#000' }}>
              <source src={mediaUrl} />
              Your browser does not support video playback.
            </video>
          )}
          <a href={mediaUrl} target="_blank" rel="noreferrer"
            className="inline-block mt-3 text-xs font-semibold underline" style={{ color: '#0197B2' }}>
            Open in new tab ↗
          </a>
        </div>
      )}

      {/* ── URL Links ── */}
      {(row.prototype_url || row.performance_url) && (
        <div className="mb-5 rounded-2xl border-2 border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold tracking-wider uppercase mb-4" style={{ color: '#0197B2' }}>
            {row.performance_url ? 'Performance URL' : 'Prototype URL'}
          </p>
          {row.prototype_url && (
            <div className="mb-3">
              <p className="text-xs text-slate-500 mb-2">Prototype Link:</p>
              <a 
                href={row.prototype_url} 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-gradient-to-r from-[#0197B2] to-[#5BCB2B] px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
              >
                {row.prototype_url.length > 50 ? `${row.prototype_url.substring(0, 47)}...` : row.prototype_url} ↗
              </a>
            </div>
          )}
          {row.performance_url && (
            <div className="mb-3">
              <p className="text-xs text-slate-500 mb-2">Performance Link:</p>
              <a 
                href={row.performance_url} 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-gradient-to-r from-[#0197B2] to-[#5BCB2B] px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
              >
                {row.performance_url.length > 50 ? `${row.performance_url.substring(0, 47)}...` : row.performance_url} ↗
              </a>
            </div>
          )}
        </div>
      )}

      {/* ── Organization & Nomination Details (for talent-student) ── */}
      {tabId === 'talent-student' && (row.org_address || row.org_size || row.contact_name || row.nomination_type) && (
        <div className="mb-5 rounded-2xl border-2 border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold tracking-wider uppercase mb-4" style={{ color: '#0197B2' }}>
            Organization & Nomination Details
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Organization Details */}
            <div>
              <p className="text-xs font-semibold text-slate-600 mb-3 uppercase tracking-wider">Organization Details</p>
              <div className="space-y-2">
                {row.org_name && (
                  <div className="flex items-start gap-3">
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold min-w-[60px] mt-0.5">Name</span>
                    <span className="text-sm text-slate-800 font-medium">{row.org_name}</span>
                  </div>
                )}
                {row.org_address && (
                  <div className="flex items-start gap-3">
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold min-w-[60px] mt-0.5">Address</span>
                    <span className="text-sm text-slate-700">{row.org_address}</span>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold min-w-[60px] mt-0.5">Location</span>
                  <span className="text-sm text-slate-700">{row.org_city}{row.org_state && `, ${row.org_state}`}{row.org_zip && ` ${row.org_zip}`}</span>
                </div>
                {row.org_size && (
                  <div className="flex items-start gap-3">
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold min-w-[60px] mt-0.5">Size</span>
                    <span className="text-sm text-slate-700">{row.org_size} students</span>
                  </div>
                )}
                {row.org_disability_focus && (
                  <div className="flex items-start gap-3">
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold min-w-[60px] mt-0.5">Focus</span>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={{ 
                        backgroundColor: row.org_disability_focus === 'single' ? '#fef3c7' : '#dbeafe',
                        color: row.org_disability_focus === 'single' ? '#d97706' : '#1d4ed8'
                      }}>
                      {row.org_disability_focus === 'single' ? 'Single Disability' : 'Multiple Disabilities'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* SPOC Details */}
            <div>
              <p className="text-xs font-semibold text-slate-600 mb-3 uppercase tracking-wider">SPOC Details</p>
              <div className="space-y-2">
                {row.contact_name && (
                  <div className="flex items-start gap-3">
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold min-w-[60px] mt-0.5">Contact</span>
                    <span className="text-sm text-slate-800 font-medium">{row.contact_name}</span>
                  </div>
                )}
                {row.contact_designation && (
                  <div className="flex items-start gap-3">
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold min-w-[60px] mt-0.5">Title</span>
                    <span className="text-sm text-slate-700">{row.contact_designation}</span>
                  </div>
                )}
                {row.contact_email && (
                  <div className="flex items-start gap-3">
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold min-w-[60px] mt-0.5">Email</span>
                    <span className="text-sm text-slate-700">{row.contact_email}</span>
                  </div>
                )}
                {row.contact_phone && (
                  <div className="flex items-start gap-3">
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold min-w-[60px] mt-0.5">Phone</span>
                    <span className="text-sm text-slate-700">{row.contact_phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Nomination Details */}
            <div>
              <p className="text-xs font-semibold text-slate-600 mb-3 uppercase tracking-wider">Nomination Info</p>
              <div className="space-y-2">
                {row.nomination_type && (
                  <div className="flex items-start gap-3">
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold min-w-[60px] mt-0.5">Type</span>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={{ 
                        backgroundColor: row.nomination_type === 'team' ? '#e8f9de' : '#e0f6fa',
                        color: row.nomination_type === 'team' ? '#16a34a' : '#0197B2'
                      }}>
                      {row.nomination_type === 'team' ? `Team (${row.team_size || 'Unknown'} members)` : 'Individual'}
                    </span>
                  </div>
                )}
                {row.grade_category && (
                  <div className="flex items-start gap-3">
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold min-w-[60px] mt-0.5">Grade</span>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                      {row.grade_category}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Tournament Experience Details (for cricket) ── */}
      {tabId === 'cricket' && row.tournament_experience && (
        <div className="mb-5 rounded-2xl border-2 border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold tracking-wider uppercase mb-4" style={{ color: '#0197B2' }}>
            Tournament Experience
          </p>

          {(() => {
            try {
              const expData = typeof row.tournament_experience === 'string'
                ? JSON.parse(row.tournament_experience)
                : row.tournament_experience

              if (!expData.hasPlayedBefore) {
                return (
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                    <div className="w-3 h-3 rounded-full bg-slate-400"></div>
                    <span className="text-sm font-medium text-slate-600">No previous tournament experience</span>
                  </div>
                )
              }

              return (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm font-semibold text-green-700">Has Tournament Experience</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {expData.tournamentCount && (
                      <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <p className="text-xs font-semibold text-blue-600 mb-2 uppercase tracking-wider">Tournament Count</p>
                        <p className="text-2xl font-bold text-blue-700">{expData.tournamentCount}</p>
                        <p className="text-xs text-blue-600">tournaments played</p>
                      </div>
                    )}

                    {expData.eventNames && (
                      <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                        <p className="text-xs font-semibold text-purple-600 mb-3 uppercase tracking-wider">Event Names</p>
                        <div className="space-y-1">
                          {expData.eventNames.split(/[,\n]/).filter(Boolean).map((event, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 flex-shrink-0"></div>
                              <span className="text-sm text-purple-700 font-medium">{event.trim()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            } catch (e) {
              return (
                <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-200">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <span className="text-sm font-medium text-red-600">Invalid tournament experience data</span>
                </div>
              )
            }
          })()}
        </div>
      )}

      {/* ── All fields ──*/}
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: '#0197B2' }}>Full Record</p>
        <div className="flex flex-col gap-3">
          {Object.entries(row).filter(([k, v]) => k !== 'status' && !(Array.isArray(v) && v.length > 0 && typeof v[0] === 'object')).map(([k, v]) => (
            v !== null && v !== undefined && v !== '' ? (
              <div key={k} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 rounded-xl border border-slate-200 px-4 py-3" style={{ background: '#f8fafc' }}>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-bold min-w-[140px] shrink-0">{k.replace(/_/g, ' ')}</p>
                <p className="text-sm text-slate-800 font-medium break-words leading-relaxed w-full">
                  {typeof v === 'boolean'
                    ? (v ? 'Yes' : 'No')
                    : Array.isArray(v)
                      ? v.map((m, i) => <span key={i} className="block">{String(m)}</span>)
                      : k.endsWith('_at') ? fmtDate(v) 
                      : (k === 'prototype_url' || k === 'performance_url') && v.startsWith('http') ? (
                        <a href={v} target="_blank" rel="noreferrer" className="text-[#0197B2] hover:underline break-all">
                          {v} ↗
                        </a>
                      )
                      : String(v)
                  }
                </p>
              </div>
            ) : null
          ))}
          {/* Status at the end */}
          {row.status !== null && row.status !== undefined && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 rounded-xl border-2 border-slate-200 px-4 py-3" style={{ background: STATUS_CFG[row.status]?.bg || '#f8fafc' }}>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-bold min-w-[140px] shrink-0">Status</p>
              <p className="text-sm font-medium">
                <StatusBadge status={row.status} />
              </p>
            </div>
          )}
        </div>

        {/* ── Members / Players (array of objects) ── */}
        {Object.entries(row).filter(([, v]) => Array.isArray(v) && v.length > 0 && typeof v[0] === 'object').map(([k, arr]) => (
          <div key={k} className="mt-6">
            <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: '#0197B2' }}>
              {k.replace(/_/g, ' ')} ({arr.length})
            </p>
            <div className="flex flex-col gap-3">
              {arr.map((member, i) => (
                <div key={i} className="rounded-xl border-2 border-slate-200 bg-white overflow-hidden">
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center gap-3" style={{ background: 'linear-gradient(90deg, #e0f6fa, #e8f9de)' }}>
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: '#0197B2' }}>{i + 1}</span>
                    <span className="text-sm font-bold text-slate-800">{member.name || member.student_name || member.player_name || `#${i + 1}`}</span>
                  </div>
                  <div className="px-4 py-3 flex flex-col gap-2">
                    {Object.entries(member).map(([field, val]) => (
                      val !== null && val !== undefined && val !== '' ? (
                        <div key={field} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4">
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold min-w-[120px] shrink-0">{field.replace(/_/g, ' ')}</span>
                          <span className="text-sm text-slate-700 font-medium break-words leading-relaxed w-full">
                            {typeof val === 'boolean' ? (val ? 'Yes' : 'No') : String(val)}
                          </span>
                        </div>
                      ) : null
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ── Status controls (hidden for org tab) ── */}
      {!isOrgTab && (
        <div className="mt-5 rounded-2xl border-2 border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold tracking-wider uppercase mb-4" style={{ color: '#0197B2' }}>Review & Status</p>
          <div className="flex flex-wrap gap-3 mb-4">
            {Object.entries(STATUS_CFG).map(([key, s]) => (
              <button
                key={key}
                onClick={() => setStatus(key)}
                className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold border-2 transition-all"
                style={status === key
                  ? { background: s.bg, borderColor: s.color, color: s.color, boxShadow: `0 0 0 2px ${s.border}` }
                  : { background: '#f8fafc', borderColor: '#e2e8f0', color: '#64748b' }
                }
              >
                {s.label}
              </button>
            ))}
          </div>
          <textarea
            rows={2}
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            placeholder="Optional note to registrant (included in status email)…"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none resize-none mb-3"
          />
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={save}
              disabled={saving}
              className="rounded-xl px-5 py-2.5 text-sm font-bold text-white transition disabled:opacity-60"
              style={{ backgroundColor: '#0197B2' }}
            >
              {saving ? 'Saving…' : 'Save Status'}
            </button>
            <button
              onClick={triggerEmail}
              disabled={triggering || status === 'pending'}
              className="rounded-xl px-5 py-2.5 text-sm font-bold text-white transition disabled:opacity-60 shadow-sm"
              style={{ backgroundColor: '#5BCB2B' }}
            >
              {triggering ? 'Sending Email…' : row.email_sent ? 'Resend Status Email' : 'Trigger Status Email'}
            </button>
            {saveMsg && <span className="text-sm font-medium text-slate-600">{saveMsg}</span>}
          </div>
        </div>
      )}
      </div>
    </>
  )
}

// ── Main dashboard ────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState(null) // null = stats overview
  const [data, setData] = useState({})
  const [loading, setLoading] = useState({})
  const [errors, setErrors] = useState({})
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [expandedRow, setExpandedRow] = useState(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const navigate = useNavigate()

  const token = sessionStorage.getItem('vyuga_admin_token')

  useEffect(() => {
    if (!token) navigate('/vyuga-admin', { replace: true })
  }, [token, navigate])

  const fetchTab = useCallback(async (tabId) => {
    const tab = TABS.find((t) => t.id === tabId)
    if (!tab || data[tabId]) return
    setLoading((l) => ({ ...l, [tabId]: true }))
    try {
      const res = await fetch(`${API_BASE}${tab.endpoint}`, {
        headers: { 'x-admin-token': token },
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.message)
      setData((d) => ({ ...d, [tabId]: json.data }))
    } catch (err) {
      setErrors((e) => ({ ...e, [tabId]: err.message }))
    } finally {
      setLoading((l) => ({ ...l, [tabId]: false }))
    }
  }, [token, data])

  // Fetch all tabs on mount for summary counts
  useEffect(() => {
    TABS.forEach((tab) => fetchTab(tab.id))
  }, []) // eslint-disable-line

  useEffect(() => {
    if (activeTab) {
      fetchTab(activeTab)
      setSearch('')
      setStatusFilter('all')
      setExpandedRow(null)
    }
  }, [activeTab]) // eslint-disable-line

  const handleRefresh = () => {
    if (activeTab) {
      setData((d) => { const c = { ...d }; delete c[activeTab]; return c })
      setErrors((e) => { const c = { ...e }; delete c[activeTab]; return c })
      setExpandedRow(null)
    } else {
      // Reset all and refetch will happen via the effect below
      setData({})
      setErrors({})
    }
  }

  // Re-fetch any missing tabs (handles refresh)
  useEffect(() => {
    TABS.forEach((tab) => {
      if (!data[tab.id] && !loading[tab.id]) fetchTab(tab.id)
    })
  }, [data]) // eslint-disable-line

  const handleStatusChange = useCallback((id, status, adminNote) => {
    setData((d) => ({
      ...d,
      [activeTab]: d[activeTab]?.map((r) =>
        r.id === id ? { ...r, status, admin_note: adminNote } : r
      ) || [],
    }))
  }, [activeTab])

  const openEvent = (tabId) => {
    setActiveTab(tabId)
    setMobileOpen(false)
  }

  const goHome = () => {
    setActiveTab(null)
    setMobileOpen(false)
  }

  // Computed values for list view
  const rows = activeTab ? (data[activeTab] || []) : []
  const cols = activeTab ? (COLUMNS[activeTab] || []) : []

  const filtered = rows.filter((r) => {
    const matchSearch = !search.trim() || Object.values(r).some((v) =>
      String(v ?? '').toLowerCase().includes(search.toLowerCase())
    )
    const matchStatus = statusFilter === 'all' || (r.status || 'pending') === statusFilter
    return matchSearch && matchStatus
  })

  const statusCounts = rows.reduce((acc, r) => {
    const s = r.status || 'pending'
    acc[s] = (acc[s] || 0) + 1
    return acc
  }, {})

  // Helper: get status counts for any tab
  const getStatusCounts = (tabId) => {
    const tabRows = data[tabId] || []
    return tabRows.reduce((acc, r) => {
      const s = r.status || 'pending'
      acc[s] = (acc[s] || 0) + 1
      return acc
    }, {})
  }

  const totalRegs = Object.values(data).reduce((sum, arr) => sum + (arr?.length || 0), 0)
  const allLoaded = TABS.every((t) => data[t.id] || errors[t.id])

  const [bulkTriggering, setBulkTriggering] = useState(false)
  const triggerBulkEmailAll = async () => {
    if (!window.confirm(`Are you sure you want to trigger status emails to EVERYONE in this event who hasn't received one yet?\nEvent: ${TABS.find(t=>t.id === activeTab)?.label}`)) return
    
    setBulkTriggering(true)
    try {
      const res = await fetch(`${API_BASE}/api/admin/trigger-email-all/${activeTab}`, {
        method: 'POST',
        headers: { 'x-admin-token': token }
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.message)
      alert('✅ ' + json.message)
      await fetchData(activeTab)
    } catch (err) {
      alert('❌ Bulk Email Error: ' + err.message)
    } finally {
      setBulkTriggering(false)
    }
  }

  const logout = () => {
    sessionStorage.removeItem('vyuga_admin_token')
    navigate('/vyuga-admin')
  }

  return (
    <div className="flex h-screen bg-white text-slate-900 overflow-hidden">
      {/* ── Sidebar (Desktop) ── */}
      <aside className={`flex-col border-r border-slate-200 bg-white z-20 shadow-sm shrink-0 transition-all duration-300 ${sidebarOpen ? 'w-72 hidden lg:flex' : 'w-0 hidden'}`}>
        <div className="flex h-20 shrink-0 items-center justify-center border-b border-slate-100 overflow-hidden">
          <button onClick={goHome} className="transition-transform hover:scale-105">
            <img src={logoImg} alt="VYUGA" className="h-10 w-auto object-contain drop-shadow-lg" />
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4 space-y-1.5 custom-scrollbar overflow-x-hidden">
          <button
            onClick={goHome}
            className={[
              'w-full flex items-center gap-3 px-4 py-3 text-sm font-bold transition-all duration-300 rounded-xl relative overflow-hidden group text-left whitespace-nowrap',
              !activeTab
                ? 'bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 text-white shadow-lg shadow-cyan-500/30'
                : 'bg-white text-slate-600 hover:bg-slate-50 hover:text-cyan-600',
            ].join(' ')}
          >
             <span className="relative z-10">Dashboard</span>
          </button>

          <div className="mt-6 mb-2 px-4 text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase whitespace-nowrap">Events</div>

          {TABS.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => openEvent(tab.id)}
                className={[
                  'w-full flex items-center gap-3 px-4 py-3 text-sm font-bold transition-all duration-300 rounded-xl relative overflow-hidden text-left group whitespace-nowrap',
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 text-white shadow-lg shadow-cyan-500/30'
                    : 'bg-white text-slate-600 hover:bg-slate-50 hover:text-cyan-600',
                ].join(' ')}
              >
                <span className="relative z-10 truncate">{tab.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="border-t border-slate-100 p-4 shrink-0 overflow-hidden">
          <button
            onClick={logout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-600 transition-all hover:bg-red-50 hover:text-red-600 hover:border-red-100 whitespace-nowrap"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* ── Main Content Wrapper ── */}
      <div className="flex flex-1 flex-col h-screen overflow-hidden relative">
      
        {/* ── Desktop Toggle Button & Back Button (Visible only on lg) ── */}
        <div className="hidden lg:flex absolute top-4 left-4 z-40 items-center gap-3">
           <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 bg-white rounded-lg shadow-md border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <Menu className="h-5 w-5 text-slate-600" />
          </button>
          
          {activeTab && (
            <button 
              onClick={goHome} 
              className="px-4 py-2 bg-white rounded-lg shadow-md border border-slate-200 hover:bg-slate-50 transition-colors text-xs font-bold uppercase tracking-wider text-[#0197B2]"
            >
              ← Back to Dashboard
            </button>
          )}
        </div>

        {/* ── Mobile Header ── */}
        <header className="sticky top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-slate-100 lg:hidden shrink-0">
          <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 py-3 sm:px-6">
            <button onClick={goHome} className="inline-flex items-center gap-2.5 transition-transform hover:scale-105 relative z-10 flex-shrink-0">
              <img src={logoImg} alt="VYUGA" className="h-8 w-auto object-contain drop-shadow-lg" />
            </button>

            <button
              type="button"
              className="inline-flex items-center justify-center rounded-xl border border-brand-cyan/15 bg-white/60 p-2.5 text-slate-700 backdrop-blur transition-all hover:bg-white hover:shadow-md"
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          <AnimatePresence>
            {mobileOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden border-t border-slate-100 bg-white"
              >
                <div className="px-4 pb-4 sm:px-6 pt-2">
                  <div className="grid gap-0.5">
                    <button
                      onClick={() => { goHome(); setMobileOpen(false); }}
                      className={[
                        'rounded-xl px-4 py-2.5 text-sm font-semibold text-left transition-all',
                        !activeTab ? 'bg-brand-cyan/5 text-brand-cyan' : 'text-slate-600 hover:bg-brand-cyan/5 hover:text-brand-cyan',
                      ].join(' ')}
                    >
                      Dashboard
                    </button>
                    <div className="my-1 h-px bg-gradient-to-r from-transparent via-brand-cyan/15 to-transparent" />
                    <p className="px-4 py-1 text-[10px] font-bold tracking-[0.2em] text-brand-cyan">EVENTS</p>
                    {TABS.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => { openEvent(tab.id); setMobileOpen(false); }}
                        className={[
                          'rounded-xl px-4 py-2.5 text-sm font-semibold text-left transition-all',
                          activeTab === tab.id ? 'bg-brand-cyan/5 text-brand-cyan' : 'text-slate-600 hover:bg-brand-cyan/5 hover:text-brand-cyan',
                        ].join(' ')}
                      >
                        {tab.label}
                      </button>
                    ))}
                    <div className="mt-3 px-1">
                      <button
                        onClick={logout}
                        className="inline-flex w-full items-center justify-center overflow-hidden rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand-cyan/15 shimmer-btn"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-50/30">

      {/* ══════════════ STATS OVERVIEW (default) ══════════════ */}
      {!activeTab && (
        <>
          {/* Hero */}
         

          <div className="mx-auto max-w-screen-2xl px-6 sm:px-8 pb-20 pt-20 lg:pt-20">
            {/* Total summary card */}
            <div className="mb-10 rounded-2xl border border-slate-200 p-8 shadow-sm" style={{ background: 'linear-gradient(135deg, #e0f6fa 0%, #f4fef0 100%)' }}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold tracking-wider uppercase" style={{ color: '#0197B2' }}>Total Registrations</p>
                  <p className="text-5xl font-extrabold text-slate-900 mt-1">
                    {!allLoaded ? '...' : totalRegs}
                  </p>
                </div>
                <div className="flex gap-4">
                  {Object.entries(STATUS_CFG).map(([key, s]) => {
                    const count = Object.values(data).reduce((sum, arr) => {
                      return sum + (arr || []).filter((r) => (r.status || 'pending') === key).length
                    }, 0)
                    return (
                      <div key={key} className="text-center">
                        <p className="text-2xl font-bold" style={{ color: s.color }}>{count}</p>
                        <p className="text-xs font-semibold mt-0.5" style={{ color: s.color }}>{s.label}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Per-event cards */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {TABS.filter(t => t.endpoint).map((tab) => {
                const tabRows = data[tab.id] || []
                const count = tabRows.length
                const isLoading = loading[tab.id]
                const sc = getStatusCounts(tab.id)
                const isOrg = tab.id === 'talent-org'
                const isSponsors = tab.id === 'sponsors'
                const showStatus = !isOrg && !isSponsors

                return (
                  <motion.button
                    key={tab.id}
                    onClick={() => openEvent(tab.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="text-left rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-lg hover:border-[#0197B2]/30 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <p className="text-sm font-bold text-slate-800 leading-tight group-hover:text-[#0197B2] transition-colors">
                        {tab.label}
                      </p>
                      <span className="text-slate-300 text-sm group-hover:text-[#0197B2] transition-colors">→</span>
                    </div>

                    <p className="text-4xl font-extrabold text-slate-900 mb-4">
                      {isLoading ? '...' : count}
                    </p>

                    {showStatus && count > 0 && (
                      <div className="flex gap-3">
                        {Object.entries(STATUS_CFG).map(([key, s]) => (
                          <div key={key} className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                            <span className="text-xs font-semibold" style={{ color: s.color }}>
                              {sc[key] || 0}
                            </span>
                            <span className="text-xs text-slate-400">{s.label}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {isOrg && count > 0 && (
                      <p className="text-xs text-slate-400">
                        {count} organisation{count !== 1 ? 's' : ''} registered
                      </p>
                    )}

                    {isSponsors && count > 0 && (
                      <p className="text-xs text-slate-400">
                        {count} message{count !== 1 ? 's' : ''}
                      </p>
                    )}

                    {count === 0 && !isLoading && (
                      <p className="text-xs text-slate-400">No data yet</p>
                    )}
                  </motion.button>
                )
              })}
            </div>
          </div>
        </>
      )}

      {/* ══════════════ EVENT REGISTRATION LIST ══════════════ */}
      {activeTab && (
        <>
          {/* Hero for event */}
          <div className="relative overflow-hidden pt-16 lg:pt-16 pb-10" style={{ background: 'linear-gradient(135deg, #e0f6fa 0%, #ffffff 60%, #e8f9de 100%)' }}>
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full opacity-20" style={{ background: '#0197B2', filter: 'blur(70px)' }} />
              <div className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full opacity-15" style={{ background: '#5BCB2B', filter: 'blur(70px)' }} />
            </div>
            <div className="relative mx-auto max-w-screen-2xl px-6 sm:px-8">
              <div className="flex flex-col items-start gap-4">
                {/* Mobile Back Button (Desktop uses top bar) */}
                <button onClick={goHome} className="lg:hidden inline-flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-200 transition-colors hover:bg-white hover:shadow-sm" style={{ color: '#0197B2' }}>
                  ← Back to Dashboard
                </button>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full h-full gap-4">
                    <div>
                      <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                        {TABS.find((t) => t.id === activeTab)?.label}
                      </h1>
                      {activeTab !== 'payments' && activeTab !== 'settings' && activeTab !== 'gallery' && activeTab !== 'jury' && (
                        <p className="mt-2 text-sm text-slate-600">
                          {rows.length} registration{rows.length !== 1 ? 's' : ''} total
                        </p>
                      )}
                    </div>
                    {activeTab !== 'payments' && activeTab !== 'settings' && activeTab !== 'gallery' && activeTab !== 'jury' && activeTab !== 'accommodation' && activeTab !== 'sponsors' && (
                      <button 
                        onClick={triggerBulkEmailAll}
                        disabled={bulkTriggering}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#0197B2] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#017a94] disabled:opacity-50"
                      >
                        {bulkTriggering ? 'Sending...' : 'Bulk Trigger Status Emails'} 
                      </button>
                    )}
                  </div>
                </div>
            </div>
            <div className="pointer-events-none absolute bottom-0 left-0 right-0">
              <svg viewBox="0 0 1440 40" className="w-full h-[40px]" preserveAspectRatio="none">
                <path fill="#ffffff" d="M0,20 C360,40 1080,0 1440,20 L1440,40 L0,40Z" />
              </svg>
            </div>
          </div>

          <div className="mx-auto max-w-screen-2xl px-6 sm:px-8 pb-20 pt-8">
            {activeTab === 'settings' ? (
              <AdminSettingsView token={token} />
            ) : activeTab === 'gallery' ? (
              <AdminGalleryView token={token} />
            ) : activeTab === 'payments' ? (
              <AdminPaymentsView token={token} />
            ) : activeTab === 'jury' ? (
              <AdminJuryView token={token} />
            ) : (
             <>
            {/* Status summary pills (hidden for org tab) */}
            {rows.length > 0 && activeTab !== 'talent-org' && (
              <div className="flex flex-wrap gap-2.5 mb-6">
                <button
                  onClick={() => setStatusFilter('all')}
                  className="rounded-full px-4 py-2 text-xs font-bold border-2 transition"
                  style={statusFilter === 'all'
                    ? { background: '#0f172a', color: '#fff', borderColor: '#0f172a' }
                    : { background: '#fff', color: '#64748b', borderColor: '#e2e8f0' }
                  }
                >
                  All ({rows.length})
                </button>
                {Object.entries(STATUS_CFG).map(([key, s]) => (
                  <button
                    key={key}
                    onClick={() => setStatusFilter(key)}
                    className="rounded-full px-4 py-2 text-xs font-bold border-2 transition"
                    style={statusFilter === key
                      ? { background: s.bg, color: s.color, borderColor: s.color }
                      : { background: '#fff', color: '#64748b', borderColor: '#e2e8f0' }
                    }
                  >
                    {s.label} ({statusCounts[key] || 0})
                  </button>
                ))}
              </div>
            )}

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search registrations…"
                className="flex-1 rounded-full border-2 border-slate-200 px-5 py-3 text-sm outline-none focus:border-[#0197B2] transition-colors"
              />
              <button
                onClick={handleRefresh}
                className="rounded-full border-2 border-slate-200 px-6 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Refresh
              </button>
              <button
                onClick={() => filtered.length && exportCSV(activeTab, filtered)}
                disabled={!filtered.length}
                className="rounded-full px-6 py-3 text-sm font-bold text-white transition disabled:opacity-50 shadow-md hover:shadow-lg"
                style={{ backgroundColor: '#5BCB2B' }}
              >
                Export CSV
              </button>
            </div>

            {rows.length > 0 && (
              <p className="text-xs text-slate-400 mb-4">
                Showing <strong className="text-slate-700">{filtered.length}</strong> of <strong className="text-slate-700">{rows.length}</strong> records
              </p>
            )}

            {/* Table */}
            <div className="rounded-2xl border-2 border-slate-200 shadow-md overflow-hidden bg-white">
              {loading[activeTab] && (
                <div className="flex items-center justify-center py-32">
                  <div className="h-10 w-10 rounded-full border-4 animate-spin mr-4"
                    style={{ borderColor: '#e0f6fa', borderTopColor: '#0197B2' }} />
                  <span className="text-base font-semibold text-slate-600">Loading registrations...</span>
                </div>
              )}

              {errors[activeTab] && !loading[activeTab] && (
                <div className="py-20 text-center">
                  <p className="text-red-600 text-base font-semibold mb-4">{errors[activeTab]}</p>
                  <button 
                    onClick={handleRefresh} 
                    className="rounded-full px-6 py-2.5 text-sm font-bold transition-all"
                    style={{ backgroundColor: '#0197B2', color: '#fff' }}
                  >
                    Try Again
                  </button>
                </div>
              )}

              {!loading[activeTab] && !errors[activeTab] && filtered.length === 0 && (
                <div className="py-24 text-center">
                  <p className="text-slate-400 text-base">
                    {search || statusFilter !== 'all' ? 'No results match your filters.' : 'No registrations yet.'}
                  </p>
                </div>
              )}

              {!loading[activeTab] && !errors[activeTab] && filtered.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ background: 'linear-gradient(90deg, #e0f6fa, #e8f9de)' }}>
                        <th className="px-4 py-4 text-left text-xs font-bold tracking-wider text-slate-600 uppercase border-b-2 border-slate-200">#</th>
                        {cols.map((c) => (
                          <th key={c.key} className="px-4 py-4 text-left text-xs font-bold tracking-wider text-slate-600 uppercase border-b-2 border-slate-200">
                            {c.label}
                          </th>
                        ))}
                        {/* <th className="px-4 py-4 text-xs font-bold tracking-wider text-slate-600 uppercase text-right border-b-2 border-slate-200">Media</th> */}
                        {activeTab !== 'talent-org' && (
                          <th className="px-4 py-4 text-left text-xs font-bold tracking-wider text-slate-600 uppercase border-b-2 border-slate-200">Status</th>
                        )}
                        <th className="px-4 py-4 w-12 border-b-2 border-slate-200" />
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((row, idx) => (
                        <tr
                          key={row.id || idx}
                          className="border-b border-slate-200 hover:bg-gradient-to-r hover:from-brand-cyan/[0.03] hover:to-brand-lime/[0.03] transition-colors cursor-pointer"
                          onClick={() => setExpandedRow(expandedRow === row.id ? null : row.id)}
                        >
                          <td className="px-4 py-4 text-slate-500 text-sm font-medium border-r border-slate-100">{idx + 1}</td>
                          {cols.map((c) => {
                            const val = c.fmt ? c.fmt(row[c.key]) : (row[c.key] ?? '—')
                            return (
                              <td key={c.key} className="px-4 py-4 text-slate-700 text-sm max-w-[200px] truncate border-r border-slate-100">
                                {c.fmt ? val : String(val)}
                              </td>
                            )
                          })}
                          {/* Media Column - Removed */}
                          {/* <td className="px-4 py-4 text-right border-r border-slate-100">
                            {!!(row.prototype_image_path || row.video_file_path) || !!(row.prototype_url || row.performance_url) ? (
                              <div className="flex flex-col gap-1">
                                {!!(row.prototype_image_path || row.video_file_path) && (
                                  <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold"
                                    style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}>
                                    {row.video_file_path ? 'Video' : 'Image'}
                                  </span>
                                )}
                                {!!(row.prototype_url || row.performance_url) && (
                                  <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold"
                                    style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' }}>
                                    URL
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-300 text-xs">—</span>
                            )}
                          </td> */}
                          {activeTab !== 'talent-org' && (
                            <td className="px-4 py-4 border-r border-slate-100">
                              <StatusBadge status={row.status || 'pending'} />
                            </td>
                          )}
                          <td className="px-4 py-4 text-slate-400 text-sm text-right">
                            <button
                              onClick={(e) => { e.stopPropagation(); setExpandedRow(expandedRow === row.id ? null : row.id); }}
                              className="bg-[#0197B2] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#017a90] transition-colors shadow-sm"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* ── Detail Modal Popup ── */}
            <AnimatePresence>
              {expandedRow !== null && (() => {
                const modalRow = filtered.find((r) => r.id === expandedRow)
                if (!modalRow) return null
                return (
                  <motion.div
                    key="detail-modal-backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
                    onClick={() => setExpandedRow(null)}
                  >
                    <motion.div
                      key="detail-modal"
                      initial={{ opacity: 0, scale: 0.92, y: 30 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.92, y: 30 }}
                      transition={{ duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
                      className="relative w-full max-w-3xl max-h-[85vh] rounded-3xl border-2 border-slate-200 bg-white shadow-2xl overflow-hidden flex flex-col"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Modal header */}
                      <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b-2 border-slate-200" style={{ background: 'linear-gradient(90deg, #e0f6fa, #e8f9de)' }}>
                        <div>
                          <p className="text-sm font-bold tracking-wider uppercase" style={{ color: '#0197B2' }}>Registration Details</p>
                          <p className="text-xs text-slate-500 mt-0.5">#{filtered.indexOf(modalRow) + 1} — {TABS.find((t) => t.id === activeTab)?.label}</p>
                        </div>
                        <button
                          onClick={() => setExpandedRow(null)}
                          className="w-9 h-9 flex items-center justify-center rounded-full text-slate-500 hover:text-slate-800 hover:bg-white/80 transition-colors"
                          aria-label="Close"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                      </div>

                      {/* Modal body */}
                      <div className="overflow-y-auto flex-1 custom-scrollbar">
                        <ExpandedPanel
                          row={modalRow}
                          tabId={activeTab}
                          token={token}
                          onStatusChange={handleStatusChange}
                          onClose={() => setExpandedRow(null)}
                        />
                      </div>
                    </motion.div>
                  </motion.div>
                )
              })()}
            </AnimatePresence>
           </>
           )}

          </div>
        </>
      )}
      </main>
      </div>
    </div>
  )
}
