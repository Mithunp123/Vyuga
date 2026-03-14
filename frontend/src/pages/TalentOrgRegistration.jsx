import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Building2, Users } from 'lucide-react'
import PageShell from './PageShell.jsx'
import { postJSON } from '../api'

const EMPTY = {
  orgName: '',
  orgType: '',
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  address: '',
  studentCount: '',
}

export default function TalentOrgRegistration() {
  // 'choose' | 'new' | 'done'
  const [view, setView] = useState('choose')
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [declared, setDeclared] = useState(false)
  const navigate = useNavigate()

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await postJSON('/api/talent-org', form)
      setView('done')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  /* ── Success screen ── */
  if (view === 'done') {
    return (
      <PageShell title="Organization Registered" subtitle="Proceed to nominate students.">
        <div className="max-w-xl space-y-6 rounded-2xl border border-[#0197B2]/20 bg-[#e0f6fa] p-8 text-center">
          <p className="font-display text-lg font-bold text-slate-900">
            🎉 <span style={{ color: '#0197B2' }}>{form.orgName}</span> has been registered successfully!
          </p>
          <p className="text-sm text-slate-500">Next step: Nominate your talented students and submit their performance videos.</p>
          <button
            onClick={() => navigate('/register/talent-student')}
            style={{ backgroundColor: '#0197B2' }}
            className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-bold text-white shadow-md transition-all hover:opacity-90 hover:scale-[1.03]"
          >
            Nominate Students <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </PageShell>
    )
  }

  /* ── Choice screen ── */
  if (view === 'choose') {
    return (
      <PageShell
        title="Special Talent Utsav"
        subtitle="Schools and organizations: register or nominate students for the talent showcase."
      >
        <div className="max-w-2xl space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid gap-5 sm:grid-cols-2"
          >
            {/* Create new organization */}
            <button
              onClick={() => setView('new')}
              className="group flex flex-col items-start gap-4 rounded-2xl border-2 border-slate-200 bg-white p-7 text-left shadow-sm transition-all hover:border-[#0197B2]/50 hover:shadow-lg"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ backgroundColor: '#e0f6fa' }}>
                <Building2 className="h-6 w-6" style={{ color: '#0197B2' }} />
              </span>
              <div>
                <p className="text-base font-bold text-slate-900">Register New Organization</p>
                <p className="mt-1 text-sm text-slate-500">New to VYUGA? Register your school or NGO and begin your journey with us.</p>
              </div>
              <span className="mt-auto inline-flex items-center gap-1 text-sm font-semibold" style={{ color: '#0197B2' }}>
                Create Organization <ArrowRight className="h-4 w-4" />
              </span>
            </button>

            {/* Already registered */}
            <button
              onClick={() => navigate('/register/talent-student')}
              className="group flex flex-col items-start gap-4 rounded-2xl border-2 border-slate-200 bg-white p-7 text-left shadow-sm transition-all hover:border-[#5BCB2B]/50 hover:shadow-lg"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ backgroundColor: '#e8f9de' }}>
                <Users className="h-6 w-6" style={{ color: '#5BCB2B' }} />
              </span>
              <div>
                <p className="text-base font-bold text-slate-900">Already Registered?</p>
                <p className="mt-1 text-sm text-slate-500">Organization already registered on VYUGA? Go ahead and nominate students.</p>
              </div>
              <span className="mt-auto inline-flex items-center gap-1 text-sm font-semibold" style={{ color: '#5BCB2B' }}>
                Nominate Students <ArrowRight className="h-4 w-4" />
              </span>
            </button>
          </motion.div>
        </div>
      </PageShell>
    )
  }

  /* ── New Organization Form ── */
  return (
    <PageShell
      title="Register New Organization"
      subtitle="Fill in your organization details to nominate talented students."
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
        <Section title="Organization Details">
          <Field label="Organization Name" value={form.orgName} onChange={set('orgName')} required />
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest" style={{ color: '#0197B2' }}>
              Organization Type <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={form.orgType}
              onChange={set('orgType')}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2"
              style={{ focusBorderColor: '#0197B2' }}
            >
              <option value="">Select type</option>
              <option value="school">School</option>
              <option value="ngo">NGO</option>
              <option value="rehabilitation_center">Rehabilitation Center</option>
              <option value="special_school">Special School</option>
              <option value="other">Other</option>
            </select>
          </div>
          <Field label="Address" value={form.address} onChange={set('address')} />
          <Field label="Number of Students to Nominate" type="number" value={form.studentCount} onChange={set('studentCount')} required />
        </Section>

        <Section title="Contact Person">
          <Field label="Contact Person Name" value={form.contactName} onChange={set('contactName')} required />
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

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setView('choose')}
            className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            ← Back
          </button>
          <button
            type="submit"
            disabled={loading || !declared}
            style={{ backgroundColor: '#0197B2' }}
            className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:opacity-90 hover:scale-[1.03] active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? 'Registering…' : 'Register Organization'}
          </button>
        </div>
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


