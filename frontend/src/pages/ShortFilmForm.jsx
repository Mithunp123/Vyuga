import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import PageShell from './PageShell.jsx'
import { postJSON } from '../api'
import { handlePaymentProcess } from '../paymentHandler.js'
import SubmitLoader from '../components/SubmitLoader.jsx'

const FILM_GENRES = [
  'Drama',
  'Documentary',
  'Animation',
  'Experimental',
  'Social Awareness',
  'Inspirational',
  'Other',
]

const EMPTY = {
  // Film details
  filmTitle: '',
  genre: '',
  genreOther: '',
  duration: '',
  synopsis: '',
  filmUrl: '',
  filmLanguage: '',
  // Director / Team
  directorName: '',
  teamName: '',
  collegeName: '',
  // Contact
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  // Extra
  additionalInfo: '',
}

export default function ShortFilmForm() {
  const [form, setForm] = useState(EMPTY)
  const [isClosed, setIsClosed] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [declared, setDeclared] = useState(false)

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/form-settings`)
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          const setting = json.data.find(s => s.id === 'shortfilm')
          if (setting && setting.is_open === false) setIsClosed(true)
        }
      })
      .catch(console.error)
  }, [])

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validate required fields
    if (!form.filmTitle.trim()) { setError('Film title is required.'); setLoading(false); return }
    if (!form.genre) { setError('Please select a genre.'); setLoading(false); return }
    if (form.genre === 'Other' && !form.genreOther.trim()) { setError('Please enter the genre.'); setLoading(false); return }
    if (!form.duration.trim() || isNaN(Number(form.duration)) || Number(form.duration) <= 0) {
      setError('Please enter a valid film duration in minutes.'); setLoading(false); return
    }
    if (!form.synopsis.trim()) { setError('Synopsis is required.'); setLoading(false); return }
    if (!form.filmUrl.trim()) { setError('Film link (Google Drive / YouTube) is required.'); setLoading(false); return }
    if (!form.directorName.trim()) { setError('Director name is required.'); setLoading(false); return }
    if (!/^\d{10}$/.test(form.contactPhone)) { setError('Phone number must be exactly 10 digits.'); setLoading(false); return }
    if (!form.contactEmail.trim() || !/\S+@\S+\.\S+/.test(form.contactEmail)) {
      setError('Please enter a valid email address.'); setLoading(false); return
    }

    try {
      const userInfo = {
        name: form.directorName || form.contactName,
        email: form.contactEmail,
        phone: form.contactPhone,
        eventType: 'shortfilm',
      }

      const paymentData = await handlePaymentProcess(userInfo)

      const submitData = {
        ...form,
        genre: form.genre === 'Other' ? form.genreOther : form.genre,
        razorpay_payment_id: paymentData.razorpay_payment_id,
        razorpay_order_id: paymentData.razorpay_order_id,
        razorpay_signature: paymentData.razorpay_signature,
      }

      await postJSON('/api/shortfilm', submitData)
      setSubmitted(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (isClosed) {
    return (
      <PageShell title="Registration Closed" subtitle="Registration for the Short Film Contest is currently closed.">
        <div className="mx-auto max-w-xl text-center py-20 px-6">
          <p className="text-xl font-bold text-slate-700">
            Thank you for your interest. Unfortunately, new registrations are no longer being accepted at this time.
          </p>
          <button onClick={() => window.history.back()} className="mt-8 rounded-full bg-[#0197B2] px-8 py-3 font-bold text-white transition hover:bg-[#01788e] shadow-md">
            Go Back
          </button>
        </div>
      </PageShell>
    )
  }

  if (submitted) {
    return (
      <PageShell title="Application Submitted!" subtitle="Thank you for submitting your short film.">
        <div className="max-w-xl rounded-2xl border border-brand-cyan/20 bg-brand-cyan-light p-8 text-center">
          <p className="font-display text-lg font-bold text-slate-900">
            🎬 <span className="text-brand-cyan">{form.filmTitle}</span> has been submitted for the Short Film Contest!
          </p>
          <p className="mt-3 text-sm text-slate-500">
            Our team will review your submission and reach out to <strong>{form.contactEmail}</strong> with further details.
          </p>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell
      title="Short Film Contest"
      subtitle="Submit your short film celebrating inclusivity, accessibility, and empowerment."
    >
      <SubmitLoader visible={loading} />
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

        {/* ── Film Details ── */}
        <Section title="Film Details">
          <Field label="Film Title" value={form.filmTitle} onChange={set('filmTitle')} required />

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-brand-cyan">
              Genre <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={form.genre}
              onChange={set('genre')}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-cyan/20"
            >
              <option value="">Select Genre</option>
              {FILM_GENRES.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {form.genre === 'Other' && (
            <Field label="Specify Genre" value={form.genreOther} onChange={set('genreOther')} required />
          )}

          <Field
            label="Duration (minutes)"
            type="number"
            value={form.duration}
            onChange={set('duration')}
            required
          />

          <Field label="Language of Film" value={form.filmLanguage} onChange={set('filmLanguage')} />

          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-brand-cyan">
              Synopsis <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              required
              value={form.synopsis}
              onChange={set('synopsis')}
              placeholder="Brief description of your film (max 300 words)..."
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-cyan/20"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-brand-cyan">
              Film Link (Google Drive / YouTube / Vimeo) <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              required
              value={form.filmUrl}
              onChange={set('filmUrl')}
              placeholder="https://drive.google.com/..."
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-cyan/20"
            />
            <p className="mt-1 text-xs text-slate-400">Ensure the link is publicly accessible or view-enabled.</p>
          </div>
        </Section>

        {/* ── Director / Team Details ── */}
        <Section title="Director & Team">
          <Field label="Director Name" value={form.directorName} onChange={set('directorName')} required />
          <Field label="Team / Production House Name" value={form.teamName} onChange={set('teamName')} />
          <Field label="College / Institution (if applicable)" value={form.collegeName} onChange={set('collegeName')} />
        </Section>

        {/* ── Contact Details ── */}
        <Section title="Contact Person">
          <Field label="Contact Name" value={form.contactName} onChange={set('contactName')} required />
          <Field label="Email" type="email" value={form.contactEmail} onChange={set('contactEmail')} required />
          <Field
            label="Phone"
            type="tel"
            value={form.contactPhone}
            onChange={set('contactPhone')}
            required
            pattern="\d{10}"
            maxLength={10}
            title="Enter exactly 10 digits"
          />
        </Section>

        {/* ── Additional Info ── */}
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-brand-cyan">
            Additional Information
          </label>
          <textarea
            rows={2}
            value={form.additionalInfo}
            onChange={set('additionalInfo')}
            placeholder="Any other details you'd like to share..."
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-cyan/20"
          />
        </div>

        {/* ── Declaration ── */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">Declaration</p>
          <label className="flex cursor-pointer items-start gap-3 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={declared}
              onChange={(e) => setDeclared(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-[#0197B2]"
            />
            I confirm that the film is my original work, the information provided is accurate, and I agree to the terms of VYUGA – Short Film Contest.
          </label>
        </div>

        <button
          type="submit"
          disabled={loading || !declared}
          style={{ backgroundColor: '#0197B2' }}
          className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:opacity-90 hover:scale-[1.03] active:scale-[0.98] disabled:opacity-60"
        >
          {loading ? 'Processing...' : 'Submit Film'}
        </button>
      </motion.form>
    </PageShell>
  )
}

function Section({ title, children }) {
  return (
    <div>
      <h2 className="mb-4 font-display text-base font-bold text-slate-800 border-b border-slate-100 pb-2">
        {title}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', required = false, pattern, maxLength, title }) {
  const handleInput = (e) => {
    if (type === 'tel') {
      e.target.value = e.target.value.replace(/\D/g, '')
    }
    onChange(e)
  }

  return (
    <div>
      <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-brand-cyan">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={handleInput}
        onKeyPress={(e) => {
          if (type === 'tel' && !/\d/.test(e.key)) e.preventDefault()
        }}
        pattern={pattern}
        maxLength={maxLength}
        title={title}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-cyan/20"
      />
    </div>
  )
}
