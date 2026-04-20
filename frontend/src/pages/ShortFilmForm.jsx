import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import PageShell from './PageShell.jsx'
import { postJSON } from '../api'
import { handlePaymentProcess, fetchEventFee } from '../paymentHandler.js'
import SubmitLoader from '../components/SubmitLoader.jsx'
import SuccessModal from '../components/SuccessModal.jsx'
import PaymentWarningModal from '../components/PaymentWarningModal.jsx'

// Film genres removed

const EMPTY = {
  // Film details
  filmTitle: '',
  duration: '',
  synopsis: '',
  filmUrl: '',
  filmLanguage: '',
  // Participation
  participationType: 'individual',
  teamMembers: ['', '', ''],   // names for up to 3 team members
  // Accessibility (mandatory)
  hasSubtitles: false,
  hasAudioDescription: false,
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
  const [fee, setFee] = useState(null)
  const [gstFee, setGstFee] = useState(null)
  const [showPaymentWarning, setShowPaymentWarning] = useState(false)

  const setCheck = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.checked }))

  // Update a single team member name by index
  const setMember = (idx) => (e) => {
    const val = e.target.value
    setForm((f) => {
      const members = [...f.teamMembers]
      members[idx] = val
      return { ...f, teamMembers: members }
    })
  }

  useEffect(() => {
    fetchEventFee('shortfilm').then(result => {
      if (result) {
        setFee(result.baseFee)
        setGstFee(result.gstFee)
      }
    }).catch(console.error)
    // Also check form open/closed
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
    const dur = Number(form.duration)
    if (!form.duration.trim() || isNaN(dur) || dur < 1 || dur > 3) {
      setError('Duration must be between 1 and 3 minutes (strict event rule).'); setLoading(false); return
    }
    const synopsisWordCount = form.synopsis.trim().split(/\s+/).filter(Boolean).length;
    if (!form.synopsis.trim()) { setError('Synopsis is required.'); setLoading(false); return }
    if (synopsisWordCount > 50) { setError('Synopsis must be 50 words or less.'); setLoading(false); return }
    if (!form.filmLanguage.trim()) { setError('Film language is required.'); setLoading(false); return }
    if (!form.filmUrl.trim()) { setError('Film link (Google Drive / YouTube) is required.'); setLoading(false); return }
    if (!form.participationType) { setError('Please select participation type.'); setLoading(false); return }
    if (form.participationType === 'team') {
      const filled = form.teamMembers.filter(n => n.trim())
      if (filled.length === 0) { setError('Please enter at least one team member name.'); setLoading(false); return }
    }
    if (!form.hasSubtitles) { setError('You must confirm that the film includes English subtitles/captions (mandatory).'); setLoading(false); return }
    if (!form.hasAudioDescription) { setError('You must confirm that the film includes audio description (mandatory).'); setLoading(false); return }
    if (!form.directorName.trim()) { setError('Director name is required.'); setLoading(false); return }
    if (!/^\d{10}$/.test(form.contactPhone)) { setError('Phone number must be exactly 10 digits.'); setLoading(false); return }
    if (!form.contactEmail.trim() || !/\S+@\S+\.\S+/.test(form.contactEmail)) {
      setError('Please enter a valid email address.'); setLoading(false); return
    }

    if (fee) {
      setLoading(false)
      setShowPaymentWarning(true)
    } else {
      executeSubmit()
    }
  }

  const executeSubmit = async () => {
    setShowPaymentWarning(false)
    setLoading(true)
    setError('')

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
        genre: 'N/A',
        participationType: form.participationType,
        teamMembers: form.participationType === 'team'
          ? JSON.stringify(form.teamMembers.filter(n => n.trim()))
          : null,
        hasSubtitles: form.hasSubtitles,
        hasAudioDescription: form.hasAudioDescription,
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

  return (
    <PageShell
      title="Short Film Contest"
      subtitle="Submit your short film celebrating inclusivity, accessibility, and empowerment."
    >
      <SuccessModal
        isOpen={submitted}
        onClose={() => setSubmitted(false)}
        title="Application Submitted!"
        message={`${form.filmTitle || 'Your film'} has been submitted! Our team will review your submission and reach out to ${form.contactEmail} with further details.`}
      />
      <PaymentWarningModal
        isOpen={showPaymentWarning}
        onProceed={executeSubmit}
        onCancel={() => setShowPaymentWarning(false)}
        fee={fee}
        gstFee={gstFee}
        totalFee={(fee || 0) + (gstFee || 0)}
      />
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
              Duration (minutes) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              min={1}
              max={3}
              value={form.duration}
              onChange={set('duration')}
              placeholder="1 – 3"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-cyan/20"
            />
            <p className="mt-1 text-xs text-amber-600 font-semibold">Strict limit: 1–3 minutes including titles & credits</p>
          </div>

          <Field label="Language of Film" value={form.filmLanguage} onChange={set('filmLanguage')} required />

          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-brand-cyan">
              Synopsis <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              required
              value={form.synopsis}
              onChange={(e) => {
                const words = e.target.value.trim() ? e.target.value.trim().split(/\s+/) : []
                if (words.length <= 50) set('synopsis')(e)
              }}
              placeholder="Brief description of your film (max 50 words)..."
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-cyan/20"
            />
            <div className="flex justify-end mt-1 text-xs text-slate-400">
              {form.synopsis.trim() ? form.synopsis.trim().split(/\s+/).filter(Boolean).length : 0}/50 words
            </div>
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

        {/* ── Participation Type ── */}
        <Section title="Participation">
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-brand-cyan">
              Participation Type <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              {['individual', 'team'].map((type) => (
                <label key={type} className={`flex items-center gap-2 cursor-pointer rounded-xl border px-5 py-3 text-sm font-semibold capitalize transition-all ${
                  form.participationType === type
                    ? 'border-brand-cyan bg-brand-cyan/5 text-brand-cyan'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}>
                  <input
                    type="radio"
                    name="participationType"
                    value={type}
                    checked={form.participationType === type}
                    onChange={set('participationType')}
                    className="accent-[#0197B2]"
                  />
                  {type === 'individual' ? 'Individual' : 'Team'}
                </label>
              ))}
            </div>
            <p className="mt-1.5 text-xs text-slate-400">Maximum 1 entry per participant/team</p>
          </div>

          {/* Conditional: team member names */}
          {form.participationType === 'team' && (
            <div className="sm:col-span-2">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-brand-cyan">
                Team Members <span className="text-slate-400 normal-case font-normal">(max 3)</span>
              </p>
              <div className="space-y-3">
                {form.teamMembers.map((name, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-cyan/10 text-xs font-bold text-brand-cyan">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={name}
                      onChange={setMember(idx)}
                      placeholder={`Member ${idx + 1} full name${idx === 0 ? ' (required)' : ' (optional)'}`}
                      required={idx === 0}
                      className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-cyan/20"
                    />
                  </div>
                ))}
              </div>
              <p className="mt-2 text-xs text-slate-400">At least 1 member name required · Max 3 members per team</p>
            </div>
          )}
        </Section>

        {/* ── Accessibility Compliance ── */}
        <div className="rounded-xl border border-slate-200 bg-white px-5 py-5">
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-800">
            Accessibility Compliance <span className="text-red-500">*</span>
          </p>
          <p className="mb-2 text-xs text-slate-500">Both items below are <strong>compulsory</strong> per event rules. Your film will be disqualified if either is missing.</p>
          <p className="mb-4 text-xs font-semibold" style={{ color: '#0197B2' }}>
            Ensure your video folder contains both of these video files before submitting.
          </p>
          <div className="space-y-3">
            <label className="flex cursor-pointer items-start gap-3 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.hasSubtitles}
                onChange={setCheck('hasSubtitles')}
                className="mt-0.5 h-4 w-4 shrink-0"
                style={{ accentColor: '#0197B2' }}
              />
              <span>
                <strong>Subtitles / Captions (English)</strong> — I confirm the film includes English subtitles covering all dialogues and important sound cues (e.g., [door knocks]).
              </span>
            </label>
            <label className="flex cursor-pointer items-start gap-3 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.hasAudioDescription}
                onChange={setCheck('hasAudioDescription')}
                className="mt-0.5 h-4 w-4 shrink-0"
                style={{ accentColor: '#0197B2' }}
              />
              <span>
                <strong>Audio Description</strong> — I confirm the film includes narration describing visuals for visually impaired audiences, clear and synced with the video.
              </span>
            </label>
          </div>
        </div>

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

        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-brand-cyan">
            Additional Information
          </label>
          <textarea
            rows={2}
            value={form.additionalInfo}
            onChange={(e) => {
              const words = e.target.value.trim() ? e.target.value.trim().split(/\s+/) : []
              if (words.length <= 50) set('additionalInfo')(e)
            }}
            placeholder="Any other details you'd like to share... (Max 50 words)"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-cyan/20"
          />
          <div className="flex justify-end mt-1 text-xs text-slate-400">
            {form.additionalInfo.trim() ? form.additionalInfo.trim().split(/\s+/).filter(Boolean).length : 0}/50 words
          </div>
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

        <div className="space-y-4">
          <button
            type="submit"
            disabled={loading || !declared}
            style={{ backgroundColor: '#0197B2' }}
            className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:opacity-90 hover:scale-[1.03] active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? 'Processing...' : fee ? `Pay ₹${fee} + GST` : 'Submit Film'}
          </button>
        </div>
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
