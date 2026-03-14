import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import PageShell from './PageShell.jsx'
import { postFormData } from '../api'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const TALENT_CATEGORIES = [
  'Music', 'Dance', 'Art & Painting', 'Recitation / Poetry', 'Drama', 'Other',
]

const EMPTY = {
  orgName: '',
  studentName: '',
  studentAge: '',
  disabilityType: '',
  talentCategory: '',
  talentDescription: '',
  guardianName: '',
  guardianPhone: '',
  guardianEmail: '',
  videoLink: '',
}

export default function TalentStudentNomination() {
  const [form, setForm] = useState(EMPTY)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [declared, setDeclared] = useState(false)
  const [videoFile, setVideoFile] = useState(null)
  const [orgs, setOrgs] = useState([])
  const [orgsLoading, setOrgsLoading] = useState(true)
  const [orgSearch, setOrgSearch] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const orgRef = useRef(null)

  // Fetch registered organisations on mount
  useEffect(() => {
    fetch(`${API_BASE}/api/talent-org`)
      .then((r) => r.json())
      .then((json) => { if (json.success) setOrgs(json.data) })
      .catch(() => {})
      .finally(() => setOrgsLoading(false))
  }, [])

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e) => { if (orgRef.current && !orgRef.current.contains(e.target)) setShowSuggestions(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filteredOrgs = orgSearch.trim()
    ? orgs.filter((o) => o.org_name.toLowerCase().includes(orgSearch.toLowerCase()))
    : orgs

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!videoFile) { setError('Please upload the performance video.'); return }
    if (!form.orgName) { setError('Please select an organization.'); return }
    setLoading(true)
    setError('')
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      fd.append('performanceVideo', videoFile)
      await postFormData('/api/talent-student', fd)
      setSubmitted(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <PageShell title="Nomination Submitted" subtitle="Thank you for nominating!">
        <div className="max-w-xl rounded-2xl border border-[#5BCB2B]/30 bg-[#e8f9de] p-8 text-center">
          <p className="font-display text-lg font-bold text-slate-900">
            🌟 <span style={{ color: '#0197B2' }}>{form.studentName}</span> has been nominated for Special Talent Utsav!
          </p>
          <p className="mt-3 text-sm text-slate-500">
            We'll review the submission and get back to you at the provided contact.
          </p>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell
      title="Special Talent Utsav – Student Nomination"
      subtitle="Nominate a talented student and submit their performance video."
    >
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl space-y-8"
      >
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        {/* Organisation search */}
        <Section title="Organization">
          <div className="sm:col-span-2" ref={orgRef}>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest" style={{ color: '#0197B2' }}>
              Organization / School Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                autoComplete="off"
                value={orgSearch || form.orgName}
                placeholder={orgsLoading ? 'Loading organizations…' : 'Type to search your organization…'}
                disabled={orgsLoading}
                onChange={(e) => {
                  setOrgSearch(e.target.value)
                  setForm((f) => ({ ...f, orgName: '' }))
                  setShowSuggestions(true)
                }}
                onFocus={() => setShowSuggestions(true)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-10 text-sm text-slate-800 focus:outline-none focus:ring-2 disabled:bg-slate-50 disabled:text-slate-400"
              />
              {/* Clear button */}
              {(orgSearch || form.orgName) && (
                <button
                  type="button"
                  onClick={() => { setOrgSearch(''); setForm((f) => ({ ...f, orgName: '' })); setShowSuggestions(false) }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-lg leading-none"
                >×</button>
              )}
              {/* Suggestion list */}
              {showSuggestions && !orgsLoading && (
                <ul className="absolute z-20 mt-1 max-h-52 w-full overflow-auto rounded-xl border border-slate-200 bg-white shadow-lg">
                  {filteredOrgs.length > 0 ? (
                    filteredOrgs.map((o) => (
                      <li
                        key={o.id}
                        onMouseDown={() => {
                          setForm((f) => ({ ...f, orgName: o.org_name }))
                          setOrgSearch(o.org_name)
                          setShowSuggestions(false)
                        }}
                        className="cursor-pointer px-4 py-2.5 text-sm text-slate-800 hover:bg-[#e0f6fa] transition-colors"
                      >
                        <span className="font-medium">{o.org_name}</span>
                        {o.org_type && <span className="ml-2 text-xs text-slate-400 capitalize">{o.org_type.replace(/_/g, ' ')}</span>}
                      </li>
                    ))
                  ) : (
                    <li className="px-4 py-3 text-sm text-slate-400 italic">No matching organizations found</li>
                  )}
                </ul>
              )}
            </div>
            {form.orgName && (
              <p className="mt-1.5 text-xs text-[#0197B2]">✓ Selected: <span className="font-semibold">{form.orgName}</span></p>
            )}
          </div>
        </Section>

        {/* Student Details */}
        <Section title="Student Details">
          <Field label="Student Full Name" value={form.studentName} onChange={set('studentName')} required />
          <Field label="Age" type="number" value={form.studentAge} onChange={set('studentAge')} required />
          <Field label="Type of Disability" value={form.disabilityType} onChange={set('disabilityType')} required />
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest" style={{ color: '#0197B2' }}>
              Talent Category <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={form.talentCategory}
              onChange={set('talentCategory')}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2"
            >
              <option value="">Select category</option>
              {TALENT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest" style={{ color: '#0197B2' }}>
              Brief Description of Talent
            </label>
            <textarea
              rows={2}
              value={form.talentDescription}
              onChange={set('talentDescription')}
              placeholder="Describe the student's talent..."
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2"
            />
          </div>
        </Section>

        {/* Guardian */}
        <Section title="Guardian Details">
          <Field label="Guardian / Parent Name" value={form.guardianName} onChange={set('guardianName')} required />
          <Field label="Guardian Phone" type="tel" value={form.guardianPhone} onChange={set('guardianPhone')} required />
          <Field label="Guardian Email" type="email" value={form.guardianEmail} onChange={set('guardianEmail')} required />
        </Section>

        {/* Video Upload */}
        <div>
          <h2 className="mb-4 font-display text-base font-bold text-slate-800 border-b border-slate-100 pb-2">
            Performance Video Upload <span className="text-red-500 text-sm font-normal">* Required</span>
          </h2>
          <p className="mb-3 text-xs text-slate-500">Upload a performance video (max 3 minutes). Accepted formats: MP4, MOV, AVI, WEBM.</p>
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center transition hover:border-[#0197B2]/50 hover:bg-slate-100">
            <span className="text-3xl">🎬</span>
            <span className="text-sm font-medium text-slate-600">
              {videoFile ? videoFile.name : 'Click to upload performance video'}
            </span>
            <span className="text-xs text-slate-400">MP4, MOV, AVI, WEBM — max 200 MB (~3 mins)</span>
            <input
              type="file"
              accept="video/mp4,video/quicktime,video/x-msvideo,video/webm,video/x-matroska"
              className="hidden"
              onChange={(e) => setVideoFile(e.target.files[0] || null)}
            />
          </label>
          {videoFile && (
            <button
              type="button"
              onClick={() => setVideoFile(null)}
              className="mt-2 text-xs text-red-500 hover:underline"
            >
              Remove video
            </button>
          )}
        </div>

        {/* Declaration */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">Declaration</p>
          <label className="flex cursor-pointer items-start gap-3 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={declared}
              onChange={(e) => setDeclared(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-[#0197B2]"
            />
            I confirm that the information provided is correct and I agree to participate in VYUGA – Innovation Fest.
          </label>
        </div>

        <button
          type="submit"
          disabled={loading || !declared || !videoFile}
          style={{ backgroundColor: '#0197B2' }}
          className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:opacity-90 hover:scale-[1.03] active:scale-[0.98] disabled:opacity-60"
        >
          {loading ? 'Submitting…' : 'Submit Nomination'}
        </button>
      </motion.form>
    </PageShell>
  )
}

function Section({ title, children }) {
  return (
    <div>
      <h2 className="mb-4 font-display text-base font-bold text-slate-800 border-b border-slate-100 pb-2">{title}</h2>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', required = false }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest" style={{ color: '#0197B2' }}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2"
      />
    </div>
  )
}


