import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import PageShell from './PageShell.jsx'
import { postJSON } from '../api'
import { handlePaymentProcess } from '../paymentHandler.js'
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
  teamName: '',
  teamType: '',
  teamTypeOther: '',
  city: '',
  state: '',
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  playerCount: '',
  hasPlayedBefore: '',
  tournamentCount: '',
  tournamentEvents: '',
  additionalInfo: '',
}

export default function CricketTeamForm() {
  const [form, setForm] = useState(EMPTY)
  const [isClosed, setIsClosed] = useState(false)
  const [error, setError] = useState('')
  const [declared, setDeclared] = useState(false)
  const [fee, setFee] = useState(null)
  const [showPaymentWarning, setShowPaymentWarning] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/form-settings`)
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          const setting = json.data.find(s => s.id === 'cricket')
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

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!/^\d{10}$/.test(form.contactPhone)) { setError('Phone number must be exactly 10 digits.'); return }
    if (form.teamType === 'other' && !form.teamTypeOther.trim()) { setError('Please enter team type.'); return }
    if (form.hasPlayedBefore === 'yes' && !form.tournamentCount.trim()) { setError('Please enter the number of tournaments played.'); return }
    if (form.hasPlayedBefore === 'yes' && (isNaN(form.tournamentCount) || parseInt(form.tournamentCount) < 1)) { setError('Tournament count must be a valid positive number.'); return }
    if (form.hasPlayedBefore === 'yes' && !form.tournamentEvents.trim()) { setError('Please enter the tournament/event names.'); return }

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
        name: form.captainName || form.contactName,
        email: form.contactEmail,
        phone: form.contactPhone,
        eventType: 'cricket',
      }

      const paymentData = await handlePaymentProcess(userInfo)

      let tournamentExperience = {
        hasPlayedBefore: form.hasPlayedBefore === 'yes'
      }
      if (form.hasPlayedBefore === 'yes') {
        tournamentExperience.tournamentCount = parseInt(form.tournamentCount)
        tournamentExperience.eventNames = form.tournamentEvents.trim()
      }

      const submitData = {
        ...form,
        tournamentExperience: JSON.stringify(tournamentExperience),
        razorpay_payment_id: paymentData.razorpay_payment_id,
        razorpay_order_id: paymentData.razorpay_order_id,
        razorpay_signature: paymentData.razorpay_signature,
      }

      await postJSON('/api/cricket', submitData)
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
      title="Blind Cricket Tournament"
      subtitle="Submit your team's interest to participate in the tournament."
    >
      <SuccessModal
        isOpen={submitted}
        onClose={() => setSubmitted(false)}
        title="Interest Submitted!"
        message={`Team ${form.teamName} has submitted their interest for the Blind Cricket Tournament! Our team will reach out to ${form.contactName} at ${form.contactEmail} with further details.`}
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
        <Section title="Team Details">
          <Field label="Team SPOC" value={form.teamName} onChange={set('teamName')} required />
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-brand-cyan">
              Team Type <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={form.teamType}
              onChange={set('teamType')}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-cyan/20"
            >
              <option value="">Select</option>
              <option value="school_team">School Team</option>
              <option value="club_team">Club Team</option>
              <option value="ngo_team">NGO Team</option>
              <option value="other">Other</option>
            </select>
          </div>
          {form.teamType === 'other' && (
            <Field label="Enter Team Type" value={form.teamTypeOther} onChange={set('teamTypeOther')} required />
          )}
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
          {form.hasPlayedBefore === 'yes' && (
            <>
              <Field
                label="How many tournaments has the team played?"
                type="number"
                value={form.tournamentCount}
                onChange={set('tournamentCount')}
                required
              />
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-brand-cyan">
                  Tournament/Event Names <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={form.tournamentEvents}
                  onChange={set('tournamentEvents')}
                  placeholder="Please list the tournaments/events your team has participated in (one per line or comma separated)"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-cyan/20"
                />
              </div>
            </>
          )}
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

        <div className="space-y-4">
          <button
            type="submit"
            disabled={loading || !declared}
            style={{ backgroundColor: '#0197B2' }}
            className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:opacity-90 hover:scale-[1.03] active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? 'Processing...' : fee ? `Pay ₹${fee} & Submit Interest` : 'Submit Interest'}
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

function Field({ label, value, onChange, type = 'text', required = false, pattern, maxLength, title, list }) {
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
        list={list}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-cyan/20"
      />
    </div>
  )
}
