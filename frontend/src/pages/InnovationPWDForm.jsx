import { useState } from 'react'
import { motion } from 'framer-motion'
import PageShell from './PageShell.jsx'
import { postFormData } from '../api'

const EMPTY = {
  participationType: 'individual',
  ideaTitle: '',
  ideaDescription: '',
  member1Name: '', member1Email: '', member1Phone: '', member1DisabilityType: '',
  member2Name: '', member2Email: '', member2Phone: '',
  member3Name: '', member3Email: '', member3Phone: '',
}

export default function InnovationPWDForm() {
  const [form, setForm] = useState(EMPTY)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [declared, setDeclared] = useState(false)
  const [protoFile, setProtoFile] = useState(null)

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      if (protoFile) fd.append('prototypeImage', protoFile)
      await postFormData('/api/innovation-pwd', fd)
      setSubmitted(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const isTeam = form.participationType === 'team'

  if (submitted) {
    return (
      <PageShell title="Registration Successful" subtitle="Thank you for registering!">
        <div className="max-w-xl rounded-2xl border border-brand-cyan/20 bg-brand-cyan-light p-8 text-center">
          <p className="font-display text-lg font-bold text-slate-900">
            🎉 <span className="text-brand-cyan">{form.member1Name}</span> has been registered for the
            Inclusive Innovation Fest (PWD Category).
          </p>
          <p className="mt-3 text-sm text-slate-500">We'll contact you at the provided email address.</p>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell
      title="Inclusive Innovation Fest – By Specially Abled"
      subtitle="Innovators with disabilities: register individually or as a team (max 3 members). Theme: Assistive Technology."
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
        {/* Participation type */}
        <Section title="Participation Type">
          <div className="sm:col-span-2 flex gap-6">
            {['individual', 'team'].map((type) => (
              <label key={type} className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
                <input
                  type="radio"
                  name="participationType"
                  value={type}
                  checked={form.participationType === type}
                  onChange={set('participationType')}
                  className="accent-brand-cyan"
                />
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </label>
            ))}
          </div>
        </Section>

        {/* Idea */}
        <Section title="Innovation Details">
          <Field label="Idea / Solution Title" value={form.ideaTitle} onChange={set('ideaTitle')} required />
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-brand-cyan">
              Brief Description <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={form.ideaDescription}
              onChange={set('ideaDescription')}
              placeholder="Describe your assistive technology solution..."
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-cyan/20"
            />
          </div>
        </Section>

        {/* Members */}
        <Section title={isTeam ? 'Member 1 (Team Leader)' : 'Participant Details'}>
          <Field label="Full Name" value={form.member1Name} onChange={set('member1Name')} required />
          <Field label="Email" type="email" value={form.member1Email} onChange={set('member1Email')} required />
          <Field label="Phone" type="tel" value={form.member1Phone} onChange={set('member1Phone')} required />
          <Field label="Type of Disability" value={form.member1DisabilityType} onChange={set('member1DisabilityType')} required />
        </Section>

        {isTeam && [2, 3].map((n) => (
          <Section key={n} title={`Member ${n}`}>
            <Field label="Full Name" value={form[`member${n}Name`]} onChange={set(`member${n}Name`)} />
            <Field label="Email" type="email" value={form[`member${n}Email`]} onChange={set(`member${n}Email`)} />
            <Field label="Phone" type="tel" value={form[`member${n}Phone`]} onChange={set(`member${n}Phone`)} />
          </Section>
        ))}

        {/* Prototype Image Upload */}
        <div>
          <h2 className="mb-4 font-display text-base font-bold text-slate-800 border-b border-slate-100 pb-2">
            Prototype Image Upload <span className="text-slate-400 font-normal text-sm">(Optional)</span>
          </h2>
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center transition hover:border-[#0197B2]/50 hover:bg-slate-100">
            <span className="text-2xl">🖼️</span>
            <span className="text-sm font-medium text-slate-600">
              {protoFile ? protoFile.name : 'Click to upload prototype image'}
            </span>
            <span className="text-xs text-slate-400">PNG, JPG, JPEG, WEBP — max 5 MB</span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              className="hidden"
              onChange={(e) => setProtoFile(e.target.files[0] || null)}
            />
          </label>
          {protoFile && (
            <button
              type="button"
              onClick={() => setProtoFile(null)}
              className="mt-2 text-xs text-red-500 hover:underline"
            >
              Remove image
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
          disabled={loading || !declared}
          style={{ backgroundColor: '#0197B2' }}
          className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:opacity-90 hover:scale-[1.03] active:scale-[0.98] disabled:opacity-60"
        >
          {loading ? 'Submitting…' : 'Submit Registration'}
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
