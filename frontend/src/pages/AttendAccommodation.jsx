import { useState } from 'react'
import { motion } from 'framer-motion'
import PageShell from './PageShell.jsx'
import { postJSON } from '../api'
import SubmitLoader from '../components/SubmitLoader.jsx'

const ROOM_TYPES = [
  { value: 'single', label: 'Single Room' },
  { value: 'double', label: 'Double Room' },
  { value: 'shared', label: 'Shared Room' },
]

const EMPTY_FORM = {
  fullName: '',
  email: '',
  phone: '',
  organization: '',
  arrivalDate: '',
  departureDate: '',
  roomType: '',
  accessibilityNeeds: '',
  specialRequests: '',
  dietaryRequirements: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
}

export default function AttendAccommodation() {
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validation
    if (!form.fullName.trim()) { setError('Full name is required'); setLoading(false); return }
    if (!form.email.trim()) { setError('Email is required'); setLoading(false); return }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) { setError('Please enter a valid email'); setLoading(false); return }
    if (!/^\d{10}$/.test(form.phone)) { setError('Phone number must be exactly 10 digits'); setLoading(false); return }
    if (!form.arrivalDate) { setError('Arrival date is required'); setLoading(false); return }
    if (!form.departureDate) { setError('Departure date is required'); setLoading(false); return }
    if (!form.roomType) { setError('Please select a room type'); setLoading(false); return }

    // Date validation
    const arrival = new Date(form.arrivalDate)
    const departure = new Date(form.departureDate)
    if (departure <= arrival) { setError('Departure date must be after arrival date'); setLoading(false); return }

    try {
      await postJSON('/api/accommodation-request', form)
      setSubmitted(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <PageShell
        title="Request Submitted"
        subtitle="We'll get back to you soon with accommodation details."
      >
        <div className="max-w-xl rounded-2xl border border-brand-cyan/20 bg-brand-cyan-light p-8 text-center">
          <p className="font-display text-lg font-bold text-slate-900">
            🏨 Your accommodation request has been submitted successfully!
          </p>
          <p className="mt-3 text-sm text-slate-500">
            We'll review your request and contact you within 24-48 hours with availability and pricing details.
          </p>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell
      title="Accommodation"
      subtitle="Request accessible and comfortable accommodation for your stay at VYUGA."
    >
      <SubmitLoader visible={loading} />
      
      {/* Information Section */}
      <div className="mb-8 rounded-2xl bg-gradient-to-r from-brand-cyan-light/50 to-brand-lime-light/50 p-6">
        <h3 className="mb-4 font-hero text-xl font-bold text-slate-900">Accommodation Information</h3>
        <ul className="space-y-2 text-sm text-slate-600">
          <li>• Partner hotels with accessibility features available</li>
          <li>• Campus guest house options for budget-friendly stays</li>
          <li>• All accommodations are wheelchair accessible</li>
          <li>• Special dietary requirements can be arranged</li>
          <li>• Transportation assistance available on request</li>
        </ul>
      </div>

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl space-y-8"
      >
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <Section title="Personal Information">
          <Field label="Full Name" value={form.fullName} onChange={set('fullName')} required />
          <Field label="Email" type="email" value={form.email} onChange={set('email')} required />
          <Field label="Phone" type="tel" value={form.phone} onChange={set('phone')} required pattern="\d{10}" maxLength={10} title="Enter exactly 10 digits" />
          <Field label="Organization (Optional)" value={form.organization} onChange={set('organization')} />
        </Section>

        <Section title="Stay Details">
          <Field label="Arrival Date" type="date" value={form.arrivalDate} onChange={set('arrivalDate')} required />
          <Field label="Departure Date" type="date" value={form.departureDate} onChange={set('departureDate')} required />
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-brand-cyan">
              Room Type <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={form.roomType}
              onChange={set('roomType')}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-cyan/20"
            >
              <option value="">Select room type</option>
              {ROOM_TYPES.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
        </Section>

        <Section title="Special Requirements">
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-brand-cyan">
              Accessibility Needs
            </label>
            <textarea
              value={form.accessibilityNeeds}
              onChange={set('accessibilityNeeds')}
              rows={3}
              placeholder="Please describe any accessibility requirements..."
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-cyan/20"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-brand-cyan">
              Dietary Requirements
            </label>
            <textarea
              value={form.dietaryRequirements}
              onChange={set('dietaryRequirements')}
              rows={2}
              placeholder="Any dietary restrictions or preferences..."
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-cyan/20"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-brand-cyan">
              Special Requests
            </label>
            <textarea
              value={form.specialRequests}
              onChange={set('specialRequests')}
              rows={2}
              placeholder="Any other special requests or preferences..."
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-cyan/20"
            />
          </div>
        </Section>

        <Section title="Emergency Contact">
          <Field label="Emergency Contact Name" value={form.emergencyContactName} onChange={set('emergencyContactName')} />
          <Field label="Emergency Contact Phone" type="tel" value={form.emergencyContactPhone} onChange={set('emergencyContactPhone')} pattern="\d{10}" maxLength={10} />
        </Section>

        <div className="flex items-center gap-4 mt-8 mb-8">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full bg-brand-cyan px-8 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-brand-cyan/90 hover:scale-[1.03] active:scale-[0.98] disabled:opacity-60"
            style={{ backgroundColor: '#0197B2' }}
          >
            {loading ? 'Submitting...' : 'Submit Request'}
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

function Field({ label, value, onChange, type = 'text', required = false, pattern, maxLength, title, placeholder }) {
  const handlePhoneInput = (e) => {
    if (type === 'tel') {
      // Only allow digits
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
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-cyan/20"
      />
    </div>
  )
}

