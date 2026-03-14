import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import logoImg from '../assets/logo.png'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const TABS = [
  { id: 'innovation-college', label: 'Innovation (For Specially Abled)', endpoint: '/api/admin/innovation-college' },
  { id: 'innovation-pwd',     label: 'Innovation (By Specially Abled)',  endpoint: '/api/admin/innovation-pwd' },
  { id: 'talent-org',         label: 'Talent Utsav – Organisations',     endpoint: '/api/admin/talent-org' },
  { id: 'talent-student',     label: 'Talent Utsav – Nominations',       endpoint: '/api/admin/talent-student' },
  { id: 'cricket',            label: 'Blind Cricket',                    endpoint: '/api/admin/cricket' },
]

const STATUS_CFG = {
  approved: { label: 'Approved', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
  rejected: { label: 'Rejected', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
  pending:  { label: 'Pending',  color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
}

// ── Column definitions per tab ────────────────────────────────────────────────
const COLUMNS = {
  'innovation-college': [
    { key: 'submitted_at',  label: 'Date',      fmt: fmtDate },
    { key: 'team_name',     label: 'Team Name' },
    { key: 'college_name',  label: 'College' },
    { key: 'theme',         label: 'Theme' },
    { key: 'idea_title',    label: 'Idea Title' },
    { key: 'leader_name',   label: 'Leader' },
    { key: 'leader_email',  label: 'Email' },
    { key: 'leader_phone',  label: 'Phone' },
  ],
  'innovation-pwd': [
    { key: 'submitted_at',       label: 'Date',      fmt: fmtDate },
    { key: 'participation_type', label: 'Type' },
    { key: 'idea_title',         label: 'Idea Title' },
    { key: 'name',               label: 'Name' },
    { key: 'email',              label: 'Email' },
    { key: 'phone',              label: 'Phone' },
    { key: 'disability_type',    label: 'Disability' },
  ],
  'talent-org': [
    { key: 'registered_at',  label: 'Date',        fmt: fmtDate },
    { key: 'org_name',       label: 'Organisation' },
    { key: 'org_type',       label: 'Type' },
    { key: 'contact_name',   label: 'Contact' },
    { key: 'contact_email',  label: 'Email' },
    { key: 'contact_phone',  label: 'Phone' },
    { key: 'student_count',  label: 'Students' },
  ],
  'talent-student': [
    { key: 'submitted_at',    label: 'Date',        fmt: fmtDate },
    { key: 'org_name',        label: 'Organisation' },
    { key: 'student_name',    label: 'Student' },
    { key: 'student_age',     label: 'Age' },
    { key: 'disability_type', label: 'Disability' },
    { key: 'talent_category', label: 'Talent' },
    { key: 'guardian_name',   label: 'Guardian' },
    { key: 'guardian_phone',  label: 'Phone' },
  ],
  cricket: [
    { key: 'submitted_at',      label: 'Date',    fmt: fmtDate },
    { key: 'team_name',         label: 'Team' },
    { key: 'city',              label: 'City' },
    { key: 'state',             label: 'State' },
    { key: 'player_count',      label: 'Players' },
    { key: 'has_played_before', label: 'Exp?',    fmt: (v) => (v ? 'Yes' : 'No') },
    { key: 'contact_name',      label: 'Contact' },
    { key: 'contact_email',     label: 'Email' },
    { key: 'contact_phone',     label: 'Phone' },
  ],
}

function fmtDate(v) {
  if (!v) return '—'
  return new Date(v).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
}

function exportCSV(tabId, rows) {
  const cols = COLUMNS[tabId]
  const header = cols.map((c) => c.label).join(',')
  const lines = rows.map((r) =>
    cols.map((c) => {
      const raw = r[c.key]
      const val = c.fmt ? c.fmt(raw) : (raw ?? '')
      return `"${String(val).replace(/"/g, '""')}"`
    }).join(',')
  )
  const blob = new Blob([[header, ...lines].join('\n')], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `vyuga_${tabId}_${Date.now()}.csv`
  a.click()
  URL.revokeObjectURL(url)
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

// ── Expanded detail panel ─────────────────────────────────────────────────────
function ExpandedPanel({ row, tabId, token, onStatusChange }) {
  const [status, setStatus] = useState(row.status || 'pending')
  const [adminNote, setAdminNote] = useState(row.admin_note || '')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  // Org tab doesn't have status management
  const isOrgTab = tabId === 'talent-org'

  const mediaPath = row.prototype_image_path || row.video_file_path
  const isVideo = mediaPath && /\.(mp4|mov|avi|mkv|webm)$/i.test(mediaPath)
  const isImage = mediaPath && /\.(png|jpe?g|webp)$/i.test(mediaPath)
  const mediaUrl = mediaPath ? `${API_BASE}/uploads/${mediaPath.replace(/^uploads[\\/]/, '')}` : null

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
      setSaveMsg('✅ Saved & email sent')
      onStatusChange(row.id, status, adminNote)
    } catch (err) {
      setSaveMsg('❌ ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="px-6 py-6" style={{ background: 'linear-gradient(135deg, #f0fbfd 0%, #f4fef0 100%)' }}>

      {/* ── Status controls (hidden for org tab) ── */}
      {!isOrgTab && (
        <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
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
          <div className="flex items-center gap-3">
            <button
              onClick={save}
              disabled={saving}
              className="rounded-xl px-5 py-2.5 text-sm font-bold text-white transition disabled:opacity-60"
              style={{ backgroundColor: '#0197B2' }}
            >
              {saving ? 'Saving…' : 'Save Status & Notify'}
            </button>
            {saveMsg && <span className="text-sm font-medium text-slate-600">{saveMsg}</span>}
          </div>
        </div>
      )}

      {/* ── Media preview ── */}
      {mediaUrl && (
        <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
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

      {/* ── All fields ── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: '#0197B2' }}>Full Record</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Object.entries(row).map(([k, v]) => (
            v !== null && v !== undefined && v !== '' ? (
              <div key={k} className="rounded-xl border border-slate-100 px-3 py-2.5" style={{ background: '#f8fafc' }}>
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-0.5">{k.replace(/_/g, ' ')}</p>
                <p className="text-sm text-slate-800 font-medium break-words leading-snug">
                  {k === 'status'
                    ? <StatusBadge status={v} />
                    : typeof v === 'boolean'
                      ? (v ? 'Yes' : 'No')
                      : Array.isArray(v)
                        ? v.map((m, i) => <span key={i} className="block">{typeof m === 'object' ? JSON.stringify(m) : String(m)}</span>)
                        : k.endsWith('_at') ? fmtDate(v) : String(v)
                  }
                </p>
              </div>
            ) : null
          ))}
        </div>
      </div>
    </div>
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

  const logout = () => {
    sessionStorage.removeItem('vyuga_admin_token')
    navigate('/vyuga-admin')
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* ── Navbar (matches user site) ── */}
      <header className="sticky top-0 left-0 right-0 z-50 glass shadow-lg shadow-brand-cyan/5 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          {/* Logo */}
          <button onClick={goHome} className="inline-flex items-center gap-2.5">
            <img src={logoImg} alt="VYUGA" className="h-14 w-auto object-contain" />
          </button>

          {/* Desktop nav links */}
          <nav className="hidden items-center gap-6 lg:flex" aria-label="Admin navigation">
            <button
              onClick={goHome}
              className={[
                'text-sm font-semibold transition-all duration-300 relative py-1',
                !activeTab
                  ? 'text-brand-cyan after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:rounded-full after:bg-gradient-to-r after:from-brand-cyan after:to-brand-lime'
                  : 'text-slate-600 hover:text-brand-cyan',
              ].join(' ')}
            >
              Dashboard
            </button>
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => openEvent(tab.id)}
                  className={[
                    'text-sm font-semibold transition-all duration-300 relative py-1',
                    isActive
                      ? 'text-brand-cyan after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:rounded-full after:bg-gradient-to-r after:from-brand-cyan after:to-brand-lime'
                      : 'text-slate-600 hover:text-brand-cyan',
                  ].join(' ')}
                >
                  {tab.label}
                </button>
              )
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={logout}
              className="hidden items-center justify-center overflow-hidden rounded-full px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand-cyan/15 transition-all hover:shadow-brand-cyan/25 hover:scale-[1.04] md:inline-flex shimmer-btn"
            >
              Logout
            </button>

            {/* Mobile menu toggle */}
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-xl border border-brand-cyan/15 bg-white/60 p-2.5 text-slate-700 backdrop-blur transition-all hover:bg-white hover:shadow-md lg:hidden"
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden lg:hidden"
            >
              <div className="mx-auto max-w-7xl px-4 pb-4 sm:px-6">
                <div className="rounded-2xl border border-brand-cyan/10 bg-white/80 p-3 shadow-2xl shadow-brand-cyan/5 backdrop-blur-xl">
                  <div className="grid gap-0.5">
                    <button
                      onClick={goHome}
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
                        onClick={() => openEvent(tab.id)}
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
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ══════════════ STATS OVERVIEW (default) ══════════════ */}
      {!activeTab && (
        <>
          {/* Hero */}
         

          <div className="mx-auto max-w-7xl px-6 sm:px-8 pb-20 pt-8">
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
              {TABS.map((tab) => {
                const tabRows = data[tab.id] || []
                const count = tabRows.length
                const isLoading = loading[tab.id]
                const sc = getStatusCounts(tab.id)
                const isOrg = tab.id === 'talent-org'

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

                    {!isOrg && count > 0 && (
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

                    {count === 0 && !isLoading && (
                      <p className="text-xs text-slate-400">No registrations yet</p>
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
          <div className="relative overflow-hidden pt-12 pb-10" style={{ background: 'linear-gradient(135deg, #e0f6fa 0%, #ffffff 60%, #e8f9de 100%)' }}>
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full opacity-20" style={{ background: '#0197B2', filter: 'blur(70px)' }} />
              <div className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full opacity-15" style={{ background: '#5BCB2B', filter: 'blur(70px)' }} />
            </div>
            <div className="relative mx-auto max-w-7xl px-6 sm:px-8">
              <button onClick={goHome} className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase mb-3 transition-colors hover:opacity-80" style={{ color: '#0197B2' }}>
                ← Back to Dashboard
              </button>
              <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                {TABS.find((t) => t.id === activeTab)?.label}
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                {rows.length} registration{rows.length !== 1 ? 's' : ''} total
              </p>
            </div>
            <div className="pointer-events-none absolute bottom-0 left-0 right-0">
              <svg viewBox="0 0 1440 40" className="w-full h-[40px]" preserveAspectRatio="none">
                <path fill="#ffffff" d="M0,20 C360,40 1080,0 1440,20 L1440,40 L0,40Z" />
              </svg>
            </div>
          </div>

          <div className="mx-auto max-w-screen-2xl px-6 sm:px-8 pb-20 pt-8">
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
            <div className="rounded-2xl border border-slate-200 shadow-md overflow-hidden bg-white">
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
                        <th className="px-4 py-4 text-left text-xs font-bold tracking-wider text-slate-600 uppercase">#</th>
                        {activeTab !== 'talent-org' && (
                          <th className="px-4 py-4 text-left text-xs font-bold tracking-wider text-slate-600 uppercase">Status</th>
                        )}
                        {cols.map((c) => (
                          <th key={c.key} className="px-4 py-4 text-left text-xs font-bold tracking-wider text-slate-600 uppercase">
                            {c.label}
                          </th>
                        ))}
                        <th className="px-4 py-4 text-xs font-bold tracking-wider text-slate-600 uppercase text-right">Media</th>
                        <th className="px-4 py-4 w-12" />
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((row, idx) => {
                        const hasMedia = !!(row.prototype_image_path || row.video_file_path)
                        const isExpanded = expandedRow === row.id
                        return (
                          <>
                            <tr
                              key={row.id || idx}
                              className="border-t border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer"
                              onClick={() => setExpandedRow(isExpanded ? null : row.id)}
                            >
                              <td className="px-4 py-4 text-slate-500 text-sm font-medium">{idx + 1}</td>
                              {activeTab !== 'talent-org' && (
                                <td className="px-4 py-4">
                                  <StatusBadge status={row.status || 'pending'} />
                                </td>
                              )}
                              {cols.map((c) => {
                                const val = c.fmt ? c.fmt(row[c.key]) : (row[c.key] ?? '—')
                                return (
                                  <td key={c.key} className="px-4 py-4 text-slate-700 text-sm max-w-[200px] truncate">
                                    {String(val)}
                                  </td>
                                )
                              })}
                              <td className="px-4 py-4 text-right">
                                {hasMedia ? (
                                  <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold"
                                    style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}>
                                    {row.video_file_path ? 'Video' : 'Image'}
                                  </span>
                                ) : (
                                  <span className="text-slate-300 text-xs">—</span>
                                )}
                              </td>
                              <td className="px-4 py-4 text-slate-400 text-sm text-right">
                                {isExpanded ? '▲' : '▼'}
                              </td>
                            </tr>

                            <AnimatePresence>
                              {isExpanded && (
                                <tr key={`exp-${row.id}`}>
                                  <td colSpan={cols.length + 4} className="px-0 py-0">
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.22 }}
                                      className="overflow-hidden"
                                    >
                                      <ExpandedPanel
                                        row={row}
                                        tabId={activeTab}
                                        token={token}
                                        onStatusChange={handleStatusChange}
                                      />
                                    </motion.div>
                                  </td>
                                </tr>
                              )}
                            </AnimatePresence>
                          </>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
