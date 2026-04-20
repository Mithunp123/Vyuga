import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import PageShell from './PageShell.jsx'
import { postJSON } from '../api'
import SubmitLoader from '../components/SubmitLoader.jsx'
import SuccessModal from '../components/SuccessModal.jsx'
import PaymentWarningModal from '../components/PaymentWarningModal.jsx'
import CityAutocomplete from '../components/CityAutocomplete.jsx'

const STATES = [
  'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam',
  'Bihar', 'Chandigarh', 'Chattisgarh', 'Dadra and Nagar Haveli', 'Daman and Diu',
  'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir',
  'Jharkhand', 'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha',
  'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
  'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
];

const EMPTY = {
  participantName: '',
  email: '',
  phone: '',
  age: '',
  city: '',
  state: '',
  disabilityType: [],
  disabilityTypeOther: '',
  hasPlayedBefore: '',
  experienceLevel: '',
  experienceLevelOther: '',
  additionalInfo: '',
}

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

export default function BlindChessForm() {
  const [form, setForm] = useState(EMPTY)
  const [isClosed, setIsClosed] = useState(false)
  const [fee, setFee] = useState(null)
  const [gstFee, setGstFee] = useState(null)

  useEffect(() => {
    fetchEventFee('chess').then(result => {
      if (result) { setFee(result.baseFee); setGstFee(result.gstFee); }
    }).catch(console.error);
    
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/form-settings`)
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          const setting = json.data.find(s => s.id === 'chess')
          if (setting) {
            if (setting.is_open === false) setIsClosed(true)
            if (setting.registration_fee_paise !== undefined && setting.registration_fee_paise !== null) {
              setFee(setting.registration_fee_paise / 100)
            }
          }
        }
      })
      .catch(console.error)
  }, [])
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [declared, setDeclared] = useState(false)
  const [showPaymentWarning, setShowPaymentWarning] = useState(false)

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleDisabilityChange = (disability) => {
    setForm((prevForm) => {
      const currentDisabilities = prevForm.disabilityType || []
      const isSelected = currentDisabilities.includes(disability)
      
      if (isSelected) {
        return {
          ...prevForm,
          disabilityType: currentDisabilities.filter(d => d !== disability)
        }
      } else {
        return {
          ...prevForm,
          disabilityType: [...currentDisabilities, disability]
        }
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    if (!/^\d{10}$/.test(form.phone)) { setError('Phone number must be exactly 10 digits.'); setLoading(false); return }
    if (!form.disabilityType || form.disabilityType.length === 0) { setError('Please select at least one disability type.'); setLoading(false); return }
    if (form.disabilityType.includes('Other') && !form.disabilityTypeOther.trim()) { setError('Please enter disability type.'); setLoading(false); return }
    if (form.experienceLevel === 'other' && !form.experienceLevelOther.trim()) { setError('Please enter experience level.'); setLoading(false); return }

    if (fee) {
      setShowPaymentWarning(true)
      setLoading(false)
    } else {
      executeSubmit()
    }
  }

  const executeSubmit = async () => {
    setShowPaymentWarning(false)
    setLoading(true)
    setError('')
    try {
      await postJSON('/api/chess', form)
      setSubmitted(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

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

  return (
    <PageShell
      title="Blind Chess Competition"
      subtitle="Register to participate in the Blind Chess Competition and showcase your strategic thinking."
    >
      <SuccessModal
        isOpen={submitted}
        onClose={() => setSubmitted(false)}
        title="Registration Submitted!"
        message={`${form.participantName} has successfully registered for the Blind Chess Competition! Our team will reach out to you at ${form.email} with further details.`}
      />
      <PaymentWarningModal
        isOpen={showPaymentWarning}
        onProceed={executeSubmit}
        onCancel={() => setShowPaymentWarning(false)}
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

        {/* About Section */}
        <div className="rounded-xl border border-brand-cyan/20 bg-brand-cyan-light/30 p-5">
          <h3 className="font-display text-sm font-bold text-brand-cyan mb-2">About the Competition</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            The Blind Chess Competition is designed to highlight the intellectual strength, focus, and strategic thinking of visually impaired individuals.
            It creates an inclusive environment where participants can compete, challenge themselves, and showcase their mental abilities.
          </p>
          <div className="mt-3 pt-3 border-t border-brand-cyan/10">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Awards</p>
            <ul className="text-sm text-slate-600 space-y-1">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-lime"></span>
                Top performers will receive trophies and cash prizes
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-lime"></span>
                All participants will receive certificates
              </li>
            </ul>
          </div>
        </div>

        <Section title="Personal Details">
          <Field label="Full Name" value={form.participantName} onChange={set('participantName')} required />
          <Field label="Email" type="email" value={form.email} onChange={set('email')} required />
          <Field label="Phone" type="tel" value={form.phone} onChange={set('phone')} required pattern="\d{10}" maxLength={10} title="Enter exactly 10 digits" />
          <Field label="Age" type="number" value={form.age} onChange={set('age')} required min={5} max={100} />
          <CityAutocomplete
            value={form.city}
            onChange={(val) => setForm((f) => ({ ...f, city: val }))}
            required={true}
            label="City"
          />

          <div>
             <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-brand-cyan">
                State <span className="text-red-500">*</span>
             </label>
             <select
                required
                value={form.state}
                onChange={set('state')}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-cyan/20"
             >
                <option value="">Select State</option>
                {STATES.map((s) => (
                   <option key={s} value={s}>{s}</option>
                ))}
             </select>
          </div>
          <div>
            <label className="mb-3 block text-xs font-bold uppercase tracking-widest text-brand-cyan">
              Disability Type <span className="text-red-500">*</span>
            </label>
            <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
              {DISABILITY_TYPES.map((disability) => (
                <label key={disability} className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={form.disabilityType?.includes(disability) || false}
                    onChange={() => handleDisabilityChange(disability)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-cyan focus:ring-brand-cyan focus:ring-offset-0"
                  />
                  <span className="text-sm text-slate-700 group-hover:text-slate-900 select-none">
                    {disability}
                  </span>
                </label>
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-500">Select all that apply</p>
          </div>
          {form.disabilityType?.includes('Other') && (
            <Field label="Enter Disability Type" value={form.disabilityTypeOther} onChange={set('disabilityTypeOther')} required />
          )}
        </Section>

        <Section title="Chess Experience">
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-brand-cyan">
              Have you played chess before? <span className="text-red-500">*</span>
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
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-brand-cyan">
              Experience Level <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={form.experienceLevel}
              onChange={set('experienceLevel')}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-cyan/20"
            >
              <option value="">Select</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="other">Other</option>
            </select>
          </div>
          {form.experienceLevel === 'other' && (
            <Field label="Enter Experience Level" value={form.experienceLevelOther} onChange={set('experienceLevelOther')} required />
          )}
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-brand-cyan">
              Additional Information
            </label>
            <textarea
              rows={3}
              value={form.additionalInfo}
              onChange={set('additionalInfo')}
              placeholder="Any tournaments participated, achievements, special requirements, etc."
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-cyan/20"
            />
          </div>
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
            I confirm that the information provided is correct and I agree to participate in VYUGA – Blind Chess Competition.
          </label>
        </div>

        <div className="space-y-4">
          <button
            type="submit"
            disabled={loading || !declared}
            style={{ backgroundColor: '#0197B2' }}
            className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:opacity-90 hover:scale-[1.03] active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? 'Submitting...' : fee ? `Pay ₹${fee} + ₹${gstFee} GST (Total ₹${(fee + gstFee)?.toFixed(2)} )` : 'Register Now'}
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

function Field({ label, value, onChange, type = 'text', required = false, pattern, maxLength, title, min, max, list }) {
  const handlePhoneInput = (e) => {
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
        onChange={handlePhoneInput}
        onKeyPress={(e) => {
          if (type === 'tel' && !/\d/.test(e.key)) {
            e.preventDefault()
          }
        }}
        pattern={pattern}
        maxLength={maxLength}
        title={title}
        min={min}
        max={max}
        list={list}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-cyan/20"
      />
    </div>
  )
}
