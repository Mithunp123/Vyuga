import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle } from 'lucide-react'
import PageShell from './PageShell.jsx'
import { postFormData } from '../api'
import SubmitLoader from '../components/SubmitLoader.jsx'
import SuccessModal from '../components/SuccessModal.jsx'
import PaymentWarningModal from '../components/PaymentWarningModal.jsx'
import { fetchEventFee } from '../paymentHandler.js'
import ApplicationStatusModal from '../components/ApplicationStatusModal.jsx'

const THEMES = [
  'Assistive Technology',
]

const EMPTY = {
  teamName: '',
  collegeName: '',
  theme: '',
  ideaTitle: '',
  ideaDescription: '',
  painPoint: '',
  solution: '',
  usp: '',
  member1Name: '', member1Email: '', member1Phone: '',
  member2Name: '', member2Email: '', member2Phone: '',
  member3Name: '', member3Email: '', member3Phone: '',
}

export default function InnovationCollegeForm() {
  const [form, setForm] = useState(EMPTY)
  const [isClosed, setIsClosed] = useState(false)

  useEffect(() => {
    fetchEventFee('innovation-college').then(result => {
      if (result) { setFee(result.baseFee); setGstFee(result.gstFee); }
    }).catch(console.error)
    // Check if form is open
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/form-settings`)
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          const setting = json.data.find(s => s.id === 'innovation-college')
          if (setting && setting.is_open === false) setIsClosed(true)
        }
      })
      .catch(console.error)
  }, [])
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [declared, setDeclared] = useState(false)
  const [protoFile, setProtoFile] = useState(null)
  const [pptFile, setPptFile] = useState(null)
  const [prototypeUrl, setPrototypeUrl] = useState('')
  const [fee, setFee] = useState(null)
  const [gstFee, setGstFee] = useState(null)
  const [showPaymentWarning, setShowPaymentWarning] = useState(false)

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const phoneFields = [form.member1Phone, form.member2Phone, form.member3Phone].filter(Boolean)
    const invalidPhone = phoneFields.find((p) => !/^\d{10}$/.test(p))
    if (invalidPhone) { setError('Phone number must be exactly 10 digits.'); setLoading(false); return }

    executeSubmit()
  }

  const executeSubmit = async () => {
    setShowPaymentWarning(false)
    setLoading(true)
    setError('')
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      if (protoFile) fd.append('prototypeImage', protoFile)
      if (pptFile) fd.append('pptFile', pptFile)
      if (prototypeUrl.trim()) fd.append('prototypeUrl', prototypeUrl.trim())

      const res = await postFormData('/api/innovation-college', fd)

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
      title="Inclusive Innovation Fest – For Specially Abled"
      subtitle="College students: register your 3-member team and choose a theme."
    >
      <SuccessModal
        isOpen={submitted}
        onClose={() => setSubmitted(false)}
        title="Registration Successful"
        message={`Your team ${form.teamName} has been registered for the Inclusive Innovation Fest (College Category). We'll contact you at the provided email addresses.`}
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
        <div className="rounded-2xl border border-[#0197B2]/20 bg-[#0197B2]/5 p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-base font-bold text-slate-800">Presentation Template</h3>
            <p className="text-sm text-slate-600 mt-1">Please use this official template to prepare your presentation.</p>
          </div>
          <a 
            href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/assets/Vyuga%20Template.pptx`} 
            download 
            className="flex-shrink-0 inline-flex items-center gap-2 rounded-xl bg-[#0197B2] px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-[#01788e] hover:shadow-lg"
          >
            📥 Download
          </a>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}
        {/* Team info */}
        <Section title="Team Information">
          <Field label="Team Name" value={form.teamName} onChange={set('teamName')} required />
          <Field label="College Name" value={form.collegeName} onChange={set('collegeName')} required />
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-brand-cyan">
              Theme <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={form.theme}
              onChange={set('theme')}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-cyan/20"
            >
              <option value="">Select a theme</option>
              {THEMES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <Field label="Idea / Project Title" value={form.ideaTitle} onChange={set('ideaTitle')} required />
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-brand-cyan">
              Brief Description <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={form.ideaDescription}
              onChange={(e) => {
                const words = e.target.value.trim() ? e.target.value.trim().split(/\s+/) : []
                if (words.length <= 50) set('ideaDescription')(e)
              }}
              placeholder="Provide a concise overview of your idea or prototype in 50 words or less..."
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-cyan/20"
            />
            <div className="flex justify-end mt-1 text-xs text-slate-400">
              {form.ideaDescription.trim() ? form.ideaDescription.trim().split(/\s+/).filter(Boolean).length : 0}/50 words
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-brand-cyan">
              Pain Point <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={form.painPoint}
              onChange={(e) => {
                const words = e.target.value.trim() ? e.target.value.trim().split(/\s+/) : []
                if (words.length <= 50) set('painPoint')(e)
              }}
              placeholder="What specific problem or challenge does your innovation address for specially abled individuals? (Max 50 words)"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-cyan/20"
            />
            <div className="flex justify-end mt-1 text-xs text-slate-400">
              {form.painPoint.trim() ? form.painPoint.trim().split(/\s+/).filter(Boolean).length : 0}/50 words
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-brand-cyan">
              Solution <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={form.solution}
              onChange={(e) => {
                const words = e.target.value.trim() ? e.target.value.trim().split(/\s+/) : []
                if (words.length <= 50) set('solution')(e)
              }}
              placeholder="Explain how your innovation solves the problem. What technology, approach, or methodology do you use? (Max 50 words)"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-cyan/20"
            />
            <div className="flex justify-end mt-1 text-xs text-slate-400">
              {form.solution.trim() ? form.solution.trim().split(/\s+/).filter(Boolean).length : 0}/50 words
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-brand-cyan">
              Unique Selling Proposition (USP) <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={form.usp}
              onChange={(e) => {
                const words = e.target.value.trim() ? e.target.value.trim().split(/\s+/) : []
                if (words.length <= 50) set('usp')(e)
              }}
              placeholder="What makes your solution unique? How is it different from existing solutions? (Max 50 words)"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-cyan/20"
            />
            <div className="flex justify-end mt-1 text-xs text-slate-400">
              {form.usp.trim() ? form.usp.trim().split(/\s+/).filter(Boolean).length : 0}/50 words
            </div>
          </div>
        </Section>

        {/* Members */}
        {[1, 2, 3].map((n) => (
          <Section key={n} title={`Member ${n}${n === 1 ? ' (Team Leader)' : ''}`}>
            <Field label="Full Name" value={form[`member${n}Name`]} onChange={set(`member${n}Name`)} required={n === 1} />
            <Field label="Email" type="email" value={form[`member${n}Email`]} onChange={set(`member${n}Email`)} required={n === 1} />
            <Field label="Phone" type="tel" value={form[`member${n}Phone`]} onChange={set(`member${n}Phone`)} required={n === 1} pattern="\d{10}" maxLength={10} title="Enter exactly 10 digits" />
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
          
          <div className="mt-4">
            <label className="mb-2 block text-sm font-medium text-slate-600">
              Prototype URL <span className="text-slate-400 font-normal text-xs">(Optional)</span>
            </label>
            <input
              type="url"
              placeholder="https://github.com/yourproject or https://yourapp.com"
              value={prototypeUrl}
              onChange={(e) => setPrototypeUrl(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:border-[#0197B2] focus:ring-1 focus:ring-[#0197B2] focus:outline-none"
            />
            <p className="mt-1 text-xs text-slate-500">Link to your online prototype, demo, or repository</p>
          </div>
        </div>

        {/* Presentation Upload */}
        <div>
          <h2 className="mb-4 font-display text-base font-bold text-slate-800 border-b border-slate-100 pb-2 flex justify-between items-center">
            <span>Upload Presentation <span className="text-red-500">*</span></span>
            <a 
              href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/assets/Vyuga%20Template.pptx`} 
              download 
              className="text-xs font-bold text-[#0197B2] hover:underline"
            >
              Download Template
            </a>
          </h2>
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center transition hover:border-[#0197B2]/50 hover:bg-slate-100">
            <span className="text-sm font-medium text-slate-600">
              {pptFile ? pptFile.name : 'Click to upload your presentation file'}
            </span>
            <span className="text-xs text-slate-400">PDF, PPT, or PPTX — max 10 MB</span>
            <input
              type="file"
              required
              accept=".pdf,.ppt,.pptx,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
              className="hidden"
              onChange={(e) => setPptFile(e.target.files[0] || null)}
            />
          </label>
          {pptFile && (
            <button
              type="button"
              onClick={() => setPptFile(null)}
              className="mt-2 text-xs text-red-500 hover:underline"
            >
              Remove presentation
            </button>
          )}
          <div className="mt-2 flex items-start gap-2 rounded-lg bg-orange-50 p-3 border border-orange-200 shadow-sm">
            <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
            <p className="text-xs font-medium text-orange-700 leading-relaxed">
              <strong className="font-bold uppercase tracking-wider text-[10px] mr-1 opacity-90 text-orange-800 block mb-0.5">Note:</strong> 
              Your presentation must strictly follow the provided template format.
            </p>
          </div>
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

        <div className="space-y-4">
          <button
            type="submit"
            disabled={loading || !declared}
            style={{ backgroundColor: '#0197B2' }}
            className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:opacity-90 hover:scale-[1.03] active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? 'Processing...' : 'Register Now'}
          </button>
          <ApplicationStatusModal
            eventType="innovation-college"
            label="Inclusive Innovation Fest – For Specially Abled"
          />
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

function Field({ label, value, onChange, type = 'text', required = false, colSpan = false, pattern, maxLength, title }) {
  const handlePhoneInput = (e) => {
    if (type === 'tel') {
      // Only allow digits
      e.target.value = e.target.value.replace(/\D/g, '')
    }
    onChange(e)
  }

  return (
    <div className={colSpan ? 'sm:col-span-2' : ''}>
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
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-cyan/20"
      />
    </div>
  )
}
