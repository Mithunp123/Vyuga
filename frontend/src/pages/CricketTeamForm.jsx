import { useState } from 'react'
import { motion } from 'framer-motion'
import PageShell from './PageShell.jsx'
import { postJSON } from '../api'

const EMPTY = {
  teamName: '',
  city: '',
  state: '',
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  playerCount: '',
  hasPlayedBefore: '',
  additionalInfo: '',
}

export default function CricketTeamForm() {
  const [form, setForm] = useState(EMPTY)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [declared, setDeclared] = useState(false)

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await postJSON('/api/cricket', form)
      setSubmitted(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <PageShell title="Interest Submitted!" subtitle="Thank you for your participation interest.">
        <div className="max-w-xl rounded-2xl border border-brand-cyan/20 bg-brand-cyan-light p-8 text-center">
          <p className="font-display text-lg font-bold text-slate-900">
            🏏 Team <span className="text-brand-cyan">{form.teamName}</span> has submitted their interest
            for the Blind Cricket Tournament!
          </p>
          <p className="mt-3 text-sm text-slate-500">
            Our team will reach out to {form.contactName} at {form.contactEmail} with further details.
          </p>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell
      title="Blind Cricket Tournament"
      subtitle="Submit your team's interest to participate in the tournament."
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
        <Section title="Team Details">
          <Field label="Team Name" value={form.teamName} onChange={set('teamName')} required />
          <Field label="City" value={form.city} onChange={set('city')} required />
          <Field label="State" value={form.state} onChange={set('state')} required />
          <Field label="Number of Players" type="number" value={form.playerCount} onChange={set('playerCount')} required />
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-brand-cyan">
              Has the team played in tournaments before? <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={form.hasPlayedBefore}
              onChange={set('hasPlayedBefore')}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-cyan/20"
            >
              <option value="">Select</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-brand-cyan">
              Additional Information
            </label>
            <textarea
              rows={2}
              value={form.additionalInfo}
              onChange={set('additionalInfo')}
              placeholder="Any other details about your team..."
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-cyan/20"
            />
          </div>
        </Section>

        <Section title="Contact Person">
          <Field label="Contact Name" value={form.contactName} onChange={set('contactName')} required />
          <Field label="Email" type="email" value={form.contactEmail} onChange={set('contactEmail')} required />
          <Field label="Phone" type="tel" value={form.contactPhone} onChange={set('contactPhone')} required />
        </Section>

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
          disabled={loading || !declared}
          style={{ backgroundColor: '#0197B2' }}
          className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:opacity-90 hover:scale-[1.03] active:scale-[0.98] disabled:opacity-60"
        >
          {loading ? 'Submitting…' : 'Submit Interest'}
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

function Field({ label, value, onChange, type = 'text', required = false }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-brand-cyan">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-cyan/20"
      />
    </div>
  )
}
