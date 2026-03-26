import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import PageShell from './PageShell.jsx'
import { postJSON } from '../api'
import SubmitLoader from '../components/SubmitLoader.jsx'

const DISABILITY_TYPES = [
  'Visual Impairment',
  'Low Vision', 
  'Hearing Impairment',
  'Mobility Impairment',
  'Speech Impairment',
  'Intellectual Disability',
  'Autism Spectrum Disorder',
  'Multiple Disabilities',
  'Other',
]

const EMPTY = {
  orgName: '',
  orgType: '',
  orgTypeOther: '',
  orgFocus: '', // 'single' or 'multiple'
  disabilityTypes: [], // array of selected disability types
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  address: '',
  studentCount: '',
}

export default function TalentOrgRegistration() {
  // 'new' | 'done'
  const [view, setView] = useState('new')
  const [form, setForm] = useState(EMPTY)
  const [isClosed, setIsClosed] = useState(false)

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/form-settings`)
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          const setting = json.data.find(s => s.id === 'talent-org')
          if (setting && setting.is_open === false) setIsClosed(true)
        }
      })
      .catch(console.error)
  }, [])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [declared, setDeclared] = useState(false)
  const navigate = useNavigate()

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleDisabilityTypeChange = (disability) => {
    setForm((prevForm) => {
      const currentTypes = prevForm.disabilityTypes || []
      const isSelected = currentTypes.includes(disability)
      
      // If organization focuses on single disability, only allow one selection
      if (prevForm.orgFocus === 'single') {
        return {
          ...prevForm,
          disabilityTypes: isSelected ? [] : [disability]
        }
      }
      
      // For multiple disability focus, allow multiple selections
      if (isSelected) {
        return {
          ...prevForm,
          disabilityTypes: currentTypes.filter(type => type !== disability)
        }
      } else {
        return {
          ...prevForm,
          disabilityTypes: [...currentTypes, disability]
        }
      }
    })
  }

  // Reset disability types when focus changes
  const handleFocusChange = (e) => {
    setForm(prevForm => ({
      ...prevForm,
      orgFocus: e.target.value,
      disabilityTypes: [] // Reset selections when focus type changes
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    // Validation
    if (!/^\d{10}$/.test(form.contactPhone)) { 
      setError('Phone number must be exactly 10 digits.'); 
      setLoading(false); 
      return 
    }
    if (form.orgType === 'other' && !form.orgTypeOther.trim()) { 
      setError('Please enter organization type.'); 
      setLoading(false); 
      return 
    }
    if (!form.orgFocus) {
      setError('Please select organization focus.');
      setLoading(false);
      return
    }
    if (!form.disabilityTypes || form.disabilityTypes.length === 0) {
      setError('Please select at least one disability type.');
      setLoading(false);
      return
    }
    if (form.orgFocus === 'single' && form.disabilityTypes.length > 1) {
      setError('Single focus organizations can only select one disability type.');
      setLoading(false);
      return
    }
    
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
  if (isClosed) {
    return (
      <PageShell title="Registration Closed" subtitle="Registration for this event is currently closed.">
        <div className="mx-auto max-w-xl text-center py-20 px-6">
          <p className="text-xl font-bold text-slate-700">Thank you for your interest. Unfortunately, new registrations are no longer being accepted at this time.</p>
          <button onClick={() => window.history.back()} className="mt-8 rounded-full bg-[#0197B2] px-8 py-3 font-bold text-white transition hover:bg-[#01788e] shadow-md">
            Go Back
          </button>
        </div>
      </PageShell>
    )
  }

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

  /* ── New Organization Form ── */
  return (
    <PageShell
      title="Register New Organization"
      subtitle="Fill in your organization details to nominate talented students."
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
          {form.orgType === 'other' && (
            <Field label="Enter Organization Type" value={form.orgTypeOther} onChange={set('orgTypeOther')} required />
          )}
          <Field label="Address" value={form.address} onChange={set('address')} />
          <Field label="Number of Students to Nominate" type="number" value={form.studentCount} onChange={set('studentCount')} required />
        </Section>

        <Section title="Organization Focus">
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest" style={{ color: '#0197B2' }}>
              Organization Focus <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={form.orgFocus}
              onChange={handleFocusChange}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2"
              style={{ focusBorderColor: '#0197B2' }}
            >
              <option value="">Select focus</option>
              <option value="single">Single Disability Type</option>
              <option value="multiple">Multiple Disability Types</option>
            </select>
          </div>
          
          {form.orgFocus && (
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest" style={{ color: '#0197B2' }}>
                Disability Types Supported <span className="text-red-500">*</span>
                {form.orgFocus === 'single' && <span className="text-xs normal-case text-slate-500"> (Select one)</span>}
                {form.orgFocus === 'multiple' && <span className="text-xs normal-case text-slate-500"> (Select multiple)</span>}
              </label>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {DISABILITY_TYPES.map((disability) => (
                  <label
                    key={disability}
                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 transition-colors"
                  >
                    <input
                      type={form.orgFocus === 'single' ? 'radio' : 'checkbox'}
                      name={form.orgFocus === 'single' ? 'singleDisability' : undefined}
                      checked={form.disabilityTypes?.includes(disability) || false}
                      onChange={() => handleDisabilityTypeChange(disability)}
                      className="shrink-0 accent-[#0197B2]"
                    />
                    <span className="text-slate-700">{disability}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </Section>

        <Section title="Contact Person">
          <Field label="Contact Person Name" value={form.contactName} onChange={set('contactName')} required />
          <Field label="Email" type="email" value={form.contactEmail} onChange={set('contactEmail')} required />
          <Field label="Phone" type="tel" value={form.contactPhone} onChange={set('contactPhone')} required pattern="\d{10}" maxLength={10} title="Enter exactly 10 digits" />
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

function Field({ label, value, onChange, type = 'text', required = false, pattern, maxLength, title }) {
  const handlePhoneInput = (e) => {
    if (type === 'tel') {
      // Only allow digits
      e.target.value = e.target.value.replace(/\D/g, '')
    }
    onChange(e)
  }

  return (
    <div>
      <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest" style={{ color: '#0197B2' }}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={handlePhoneInput}
        onKeyPress={(e) => {
          if (type === 'tel' && !/\d/.test(e.key)) {
            e.preventDefault()
          }
        }}
        pattern={pattern}
        maxLength={maxLength}
        title={title}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2"
      />
    </div>
  )
}


