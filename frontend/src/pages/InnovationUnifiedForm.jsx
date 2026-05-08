import { useMemo, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { Info, AlertCircle } from 'lucide-react'
import PageShell from './PageShell.jsx'
import { postFormData } from '../api'
import { fetchEventFee } from '../paymentHandler.js'
import SubmitLoader from '../components/SubmitLoader.jsx'
import SuccessModal from '../components/SuccessModal.jsx'
import PaymentWarningModal from '../components/PaymentWarningModal.jsx'

const INNOVATION_TYPE_OPTIONS = [
  { value: '', label: 'Select one' },
  { value: 'for_specially_abled', label: 'For Specially Abled' },
  { value: 'by_specially_abled', label: 'By Specially Abled' },
]

const THEME_OPTIONS = [
  'Assistive Technology',
]

const DISABILITY_TYPES = [
  'Visual Impairment',
  'Low Vision',
  'Hearing Impairment',
  'Mobility Impairment',
  'Speech Impairment',
  'Cognitive Disability',
  'Autism',
  'Multiple Specially Abled',
  'Other',
]

const EMPTY = {
  innovationType: '',
  teamName: '',
  collegeName: '',
  theme: '',
  themeOther: '',
  participationType: 'individual',
  ideaTitle: '',
  ideaDescription: '',
  painPoint: '',
  solution: '',
  usp: '',
  member1Name: '',
  member1Email: '',
  member1Phone: '',
  member1DisabilityType: [],
  member1DisabilityTypeOther: '',
  member2Name: '',
  member2Email: '',
  member2Phone: '',
  member3Name: '',
  member3Email: '',
  member3Phone: '',
}

export default function InnovationUnifiedForm() {
  const location = useLocation()
  const [form, setForm] = useState(EMPTY)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [declared, setDeclared] = useState(false)
  const [protoFile, setProtoFile] = useState(null)
  const [udidFile, setUdidFile] = useState(null)
  const [pptFile, setPptFile] = useState(null)
  const [prototypeUrl, setPrototypeUrl] = useState('')
  const [showDriveInfo, setShowDriveInfo] = useState(false)
  const [isClosed, setIsClosed] = useState(false)
  const [fee, setFee] = useState(null)
  const [gstFee, setGstFee] = useState(null)
  const [showPaymentWarning, setShowPaymentWarning] = useState(false)

  // Auto-detect innovation type based on route
  useEffect(() => {
    const path = location.pathname
    if (path.includes('innovation-college')) {
      setForm(prev => ({ ...prev, innovationType: 'for_specially_abled' }))
    } else if (path.includes('innovation-pwd')) {
      setForm(prev => ({ ...prev, innovationType: 'by_specially_abled' }))
    }
  }, [location.pathname])

  useEffect(() => {
    // Determine the relevant formId based on selected strategy
    let formId = null;
    if (form.innovationType === 'for_specially_abled') {
      formId = 'innovation-college';
    } else if (form.innovationType === 'by_specially_abled') {
      formId = 'innovation-pwd';
    } else {
      // Not selected yet, fallback to route-based if present
      if (location.pathname.includes('innovation-college')) formId = 'innovation-college';
      if (location.pathname.includes('innovation-pwd')) formId = 'innovation-pwd';
    }

    setFee(null);
    setGstFee(null);
    setIsClosed(false);

    if (formId) {
      fetchEventFee(formId).then(result => {
        if (result) { 
          setFee(result.baseFee); 
          setGstFee(result.gstFee); 
        }
      }).catch(console.error);

      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/form-settings`)
        .then(res => res.json())
        .then(json => {
          if (json.success) {
            const setting = json.data.find(s => s.id === formId)
            if (setting && setting.is_open === false) setIsClosed(true)
          }
        }).catch(console.error);
    }
  }, [form.innovationType, location.pathname])

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleDisabilityChange = (disability) => {
    setForm((prevForm) => {
      const currentDisabilities = prevForm.member1DisabilityType || []
      const isSelected = currentDisabilities.includes(disability)
      
      if (isSelected) {
        return {
          ...prevForm,
          member1DisabilityType: currentDisabilities.filter(d => d !== disability)
        }
      } else {
        return {
          ...prevForm,
          member1DisabilityType: [...currentDisabilities, disability]
        }
      }
    })
  }

  const isForSpeciallyAbled = form.innovationType === 'for_specially_abled'
  const isBySpeciallyAbled = form.innovationType === 'by_specially_abled'
  const isTeamForBy = form.participationType === 'team'

  const endpoint = useMemo(() => {
    if (isForSpeciallyAbled) return '/api/innovation-college'
    if (isBySpeciallyAbled) return '/api/innovation-pwd'
    return ''
  }, [isForSpeciallyAbled, isBySpeciallyAbled])

  const validateCommon = () => {
    const phoneFields = [form.member1Phone, form.member2Phone, form.member3Phone].filter(Boolean)
    const invalidPhone = phoneFields.find((p) => !/^\d{10}$/.test(p))
    if (invalidPhone) return 'Phone number must be exactly 10 digits.'
    
    // Only check for innovation type selection if not auto-detected from route
    const isAutoDetected = location.pathname.includes('innovation-college') || location.pathname.includes('innovation-pwd')
    if (!isAutoDetected && !form.innovationType) return 'Please select whether registration is By or For specially abled.'
    
    if (isForSpeciallyAbled && !form.teamName.trim()) return 'Team name is required.'
    if (isForSpeciallyAbled && !form.collegeName.trim()) return 'College name is required.'
    if (isForSpeciallyAbled && !form.theme) return 'Please select a Focus Sector.'
    if (form.theme === 'Other' && !form.themeOther.trim()) return 'Please enter a custom Focus Sector.'
    if ((isForSpeciallyAbled || isBySpeciallyAbled) && !form.ideaTitle.trim()) return 'Idea/Solution title is required.'
    if ((isForSpeciallyAbled || isBySpeciallyAbled) && !form.ideaDescription.trim()) return 'Brief description is required.'
    if ((isForSpeciallyAbled || isBySpeciallyAbled) && !form.painPoint.trim()) return 'Pain point is required.'
    if ((isForSpeciallyAbled || isBySpeciallyAbled) && !form.solution.trim()) return 'Solution is required.'
    if ((isForSpeciallyAbled || isBySpeciallyAbled) && !form.usp.trim()) return 'USP is required.'
    if (isBySpeciallyAbled && (!form.member1DisabilityType || form.member1DisabilityType.length === 0)) {
      return 'Please select at least one specially abled type.'
    }
    if (isBySpeciallyAbled && form.member1DisabilityType?.includes('Other') && !form.member1DisabilityTypeOther.trim()) {
      return 'Please enter a specially abled type.'
    }
    if (isBySpeciallyAbled && !udidFile) {
      return 'Please upload the UDID card.'
    }
    if (udidFile && udidFile.size > 5 * 1024 * 1024) return 'UDID card must be less than 5MB.'
    return ''
  }

  const buildPayload = () => {
    const fd = new FormData()

    if (isForSpeciallyAbled) {
      fd.append('teamName', form.teamName)
      fd.append('collegeName', form.collegeName)
      fd.append('theme', form.theme)
      fd.append('themeOther', form.themeOther)
      fd.append('ideaTitle', form.ideaTitle)
      fd.append('ideaDescription', form.ideaDescription)
      fd.append('painPoint', form.painPoint)
      fd.append('solution', form.solution)
      fd.append('usp', form.usp)
      fd.append('member1Name', form.member1Name)
      fd.append('member1Email', form.member1Email)
      fd.append('member1Phone', form.member1Phone)
      fd.append('member2Name', form.member2Name)
      fd.append('member2Email', form.member2Email)
      fd.append('member2Phone', form.member2Phone)
      fd.append('member3Name', form.member3Name)
      fd.append('member3Email', form.member3Email)
      fd.append('member3Phone', form.member3Phone)
    } else {
      fd.append('participationType', form.participationType)
      
      fd.append('ideaTitle', form.ideaTitle)
      fd.append('ideaDescription', form.ideaDescription)
      fd.append('painPoint', form.painPoint)
      fd.append('solution', form.solution)
      fd.append('usp', form.usp)
      fd.append('member1Name', form.member1Name)
      fd.append('member1Email', form.member1Email)
      fd.append('member1Phone', form.member1Phone)
      fd.append('member1DisabilityType', form.member1DisabilityType)
      fd.append('member1DisabilityTypeOther', form.member1DisabilityTypeOther)
      if (isTeamForBy) {
        fd.append('member2Name', form.member2Name)
        fd.append('member2Email', form.member2Email)
        fd.append('member2Phone', form.member2Phone)
        fd.append('member3Name', form.member3Name)
        fd.append('member3Email', form.member3Email)
        fd.append('member3Phone', form.member3Phone)
      }
    }

    // if (protoFile) fd.append('prototypeImage', protoFile)
    if (udidFile) fd.append('udidCard', udidFile)
    if (pptFile) fd.append('pptFile', pptFile)
    if (prototypeUrl.trim()) fd.append('prototypeUrl', prototypeUrl.trim())
    return fd
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const showError = (msg) => {
      setError(msg)
      setLoading(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    
    if (!form.innovationType) {
      showError('Please select if your submission is For Specially Abled or By Specially Abled.')
      return
    }

    if (!declared) {
      showError('Please check the confirmation declaration at the bottom of the form before submitting.')
      return
    }
    
    setLoading(true)
    setError('')

    const err = validateCommon()
    if (err) {
      showError(err)
      return
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
      const payload = buildPayload();
      const res = await postFormData(endpoint, payload)
      if (res.invoice_link) {
         window.location.href = res.invoice_link;
      } else {
         setSubmitted(true)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (isClosed) {
    return (
      <PageShell title="Registration Closed" subtitle="Thank you for your interest.">
        <div className="max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="font-display text-lg font-bold text-slate-800">
            Registrations for Innovation Fest are currently closed.
          </p>
          <p className="mt-2 text-sm text-slate-500">Please check back later or contact support for queries.</p>
        </div>
      </PageShell>
    )
  }

  if (isClosed) {
    return (
      <PageShell title="Registration Closed" subtitle="Thank you for your interest.">
        <div className="max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="font-display text-lg font-bold text-slate-800">
            Registrations for Innovation Fest are currently closed.
          </p>
          <p className="mt-2 text-sm text-slate-500">Please check back later or contact support for queries.</p>
        </div>
      </PageShell>
    )
  }

  // Dynamic title and subtitle based on route
  const getPageTitleAndSubtitle = () => {
    const path = location.pathname
    if (path.includes('innovation-college')) {
      return {
        title: "Inclusive Innovation Fest – For Specially Abled",
        subtitle: "Register your college team to develop solutions for accessibility and inclusion."
      }
    } else if (path.includes('innovation-pwd')) {
      return {
        title: "Inclusive Innovation Fest – By Specially Abled", 
        subtitle: "Register to showcase your innovative solutions and entrepreneurial ideas."
      }
    } else {
      return {
        title: "Inclusive Innovation Fest",
        subtitle: "Submit one form and choose whether your participation is For or By specially abled."
      }
    }
  }

  const { title: pageTitle, subtitle: pageSubtitle } = getPageTitleAndSubtitle()

  const name = isForSpeciallyAbled ? form.teamName : form.member1Name
  const categoryText = isForSpeciallyAbled ? 'For Specially Abled' : 'By Specially Abled'

  return (
    <PageShell
      title={pageTitle}
      subtitle={pageSubtitle}
    >
      <SuccessModal
        isOpen={submitted}
        onClose={() => setSubmitted(false)}
        title="Registration Successful"
        message={`Registration submitted successfully for ${name} (${categoryText}). We'll contact you at ${form.member1Email}.`}
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
        className="max-w-2xl space-y-8 relative"
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
            Download
          </a>
        </div>
        {isBySpeciallyAbled && (
          <div className="rounded-2xl border border-[#0197B2]/20 bg-[#0197B2]/5 p-6 shadow-sm">
            <h3 className="mb-4 font-display text-xs font-bold uppercase tracking-widest text-[#0197B2]">Eligibility Criteria</h3>
            <ul className="space-y-2.5 text-[15px] font-medium text-slate-700">

              <li className="flex items-start gap-3">
                <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#0197B2]/20 text-[10px] text-[#0197B2]">✓</span>
                <span>Participant must be a specially abled individual</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#0197B2]/20 text-[10px] text-[#0197B2]">✓</span>
                <span>Participation can be individual or as a team (maximum 3 members)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#0197B2]/20 text-[10px] text-[#0197B2]">✓</span>
                <span>Must have a valid UDID card</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#0197B2]/20 text-[10px] text-[#0197B2]">✓</span>
                <span>Innovations should be in TRL levels 1–4</span>
              </li>
            </ul>
          </div>
        )}

        {isForSpeciallyAbled && (
          <div className="rounded-2xl border border-[#0197B2]/20 bg-[#0197B2]/5 p-6 shadow-sm">
            <h3 className="mb-4 font-display text-xs font-bold uppercase tracking-widest text-[#0197B2]">Eligibility Criteria</h3>
            <ul className="space-y-2.5 text-[15px] font-medium text-slate-700">
              <li className="flex items-start gap-3">
                <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#0197B2]/20 text-[10px] text-[#0197B2]">✓</span>
                <span>Open to college students across India</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#0197B2]/20 text-[10px] text-[#0197B2]">✓</span>
                <span>Sector: Assistive Technology</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#0197B2]/20 text-[10px] text-[#0197B2]">✓</span>
                <span>Each team must consist of 3 members</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#0197B2]/20 text-[10px] text-[#0197B2]">✓</span>
                <span>The problem statement must be based on real ground work (interacting with specially abled individuals to identify actual problems)</span>
              </li>
            </ul>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        {/* Only show Registration Type selector for the unified route */}
        {!location.pathname.includes('innovation-college') && !location.pathname.includes('innovation-pwd') && (
          <Section title="Registration Type">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-brand-cyan">
                Is this registration by or for specially abled? <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={form.innovationType}
                onChange={set('innovationType')}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-cyan/20"
              >
                {INNOVATION_TYPE_OPTIONS.map((option) => (
                  <option key={option.value || 'empty'} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </Section>
        )}

        <Section title="Innovation Details">
          {isForSpeciallyAbled && (
            <>
              <Field label="Team Name" value={form.teamName} onChange={set('teamName')} required />
              <Field label="College Name" value={form.collegeName} onChange={set('collegeName')} required />
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-brand-cyan">
                  Focus Sector <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={form.theme}
                  onChange={set('theme')}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-cyan/20"
                >
                  <option value="" disabled hidden>Assistive Technology</option>
                  {THEME_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              {form.theme === 'Other' && (
                <Field
                  label="Enter New Sector"
                  value={form.themeOther}
                  onChange={set('themeOther')}
                  required
                />
              )}
            </>
          )}

          {isBySpeciallyAbled && (
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
                  {type === 'individual' ? 'Individual' : 'Team'}
                </label>
              ))}
            </div>
          )}

          {(isForSpeciallyAbled || isBySpeciallyAbled) && (
            <>
              <Field label="Idea / Solution Title" value={form.ideaTitle} onChange={set('ideaTitle')} required />
              <div className="sm:col-span-2">
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
              <div className="sm:col-span-2">
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
                  placeholder={isForSpeciallyAbled
                    ? "What specific problem or challenge does your innovation address for specially abled individuals? (Max 50 words)"
                    : "What specific challenge or barrier do you face that your solution addresses? (Max 50 words)"}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-cyan/20"
                />
                <div className="flex justify-end mt-1 text-xs text-slate-400">
                  {form.painPoint.trim() ? form.painPoint.trim().split(/\s+/).filter(Boolean).length : 0}/50 words
                </div>
              </div>
              <div className="sm:col-span-2">
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
                  placeholder={isForSpeciallyAbled
                    ? "Explain how your innovation solves the problem. What technology, approach, or methodology do you use? (Max 50 words)"
                    : "Explain how your assistive technology solution works and addresses the problem. What technology, approach, or methodology do you use? (Max 50 words)"}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-cyan/20"
                />
                <div className="flex justify-end mt-1 text-xs text-slate-400">
                  {form.solution.trim() ? form.solution.trim().split(/\s+/).filter(Boolean).length : 0}/50 words
                </div>
              </div>
              <div className="sm:col-span-2">
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
                  placeholder={isForSpeciallyAbled
                    ? "What makes your solution unique? How is it different from existing solutions? (Max 50 words)"
                    : "What makes your solution unique? How is it different from existing assistive technologies? (Max 50 words)"}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-cyan/20"
                />
                <div className="flex justify-end mt-1 text-xs text-slate-400">
                  {form.usp.trim() ? form.usp.trim().split(/\s+/).filter(Boolean).length : 0}/50 words
                </div>
              </div>
            </>
          )}
        </Section>

        {(isForSpeciallyAbled || isBySpeciallyAbled) && (
          <>
            <Section title={isBySpeciallyAbled ? (isTeamForBy ? 'Member 1 (Team Leader)' : 'Individual Details') : 'Member 1 (Team Leader)'}>
              <Field label="Full Name" value={form.member1Name} onChange={set('member1Name')} required />
              <Field label="Email" type="email" value={form.member1Email} onChange={set('member1Email')} required />
              <Field
                label="Phone"
                type="tel"
                value={form.member1Phone}
                onChange={set('member1Phone')}
                required
                pattern="\d{10}"
                maxLength={10}
                title="Enter exactly 10 digits"
              />
              {isBySpeciallyAbled && (
                <>
                <div className="sm:col-span-2">
                  <label className="mb-3 block text-xs font-bold uppercase tracking-widest text-brand-cyan">
                    Type of Specially Abled <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                    {DISABILITY_TYPES.map((disability) => (
                      <label key={disability} className="flex items-start gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={form.member1DisabilityType?.includes(disability) || false}
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

                <div className="mt-6 sm:col-span-2">
                   <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-brand-cyan">
                    Upload UDID Card <span className="text-red-500">*</span>
                    <span className="text-slate-400 font-normal text-xs ml-1">(One card per team/individual)</span>
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    onChange={(e) => setUdidFile(e.target.files[0])}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500 file:mr-4 file:rounded-full file:border-0 file:bg-brand-cyan/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-cyan hover:file:bg-brand-cyan/20"
                  />
                  <p className="mt-1 text-xs text-slate-500">Accepted formats: PDF, JPG, PNG (Max 5MB)</p>
                </div>
                </>
              )}
              {isBySpeciallyAbled && form.member1DisabilityType?.includes('Other') && (
                <Field
                  label="Enter Specially Abled Type"
                  value={form.member1DisabilityTypeOther}
                  onChange={set('member1DisabilityTypeOther')}
                  required
                />
              )}
            </Section>

            {(isForSpeciallyAbled || (isBySpeciallyAbled && isTeamForBy)) && [2, 3].map((n) => (
              <Section key={n} title={`Member ${n}`}>
                <Field label="Full Name" value={form[`member${n}Name`]} onChange={set(`member${n}Name`)} required={isForSpeciallyAbled} />
                <Field label="Email" type="email" value={form[`member${n}Email`]} onChange={set(`member${n}Email`)} required={isForSpeciallyAbled} />
                <Field
                  label="Phone"
                  type="tel"
                  value={form[`member${n}Phone`]}
                  onChange={set(`member${n}Phone`)}
                  required={isForSpeciallyAbled}
                  pattern="\d{10}"
                  maxLength={10}
                  title="Enter exactly 10 digits"
                />
              </Section>
            ))}

            <div>
              {/*
              <h2 className="mb-4 border-b border-slate-100 pb-2 font-display text-base font-bold text-slate-800">
                Prototype Image Upload <span className="text-sm font-normal text-slate-400">(Optional)</span>
              </h2>
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center transition hover:border-[#0197B2]/50 hover:bg-slate-100">
                <span className="text-2xl">Image</span>
                <span className="text-sm font-medium text-slate-600">
                  {protoFile ? protoFile.name : 'Click to upload prototype image'}
                </span>
                <span className="text-xs text-slate-400">PNG, JPG, JPEG, WEBP - max 5 MB</span>
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
              */}
              
              {/* Presentation Upload */}
              <div className="mt-4">
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

              <div className="mt-4 relative bg-slate-50 border border-slate-200 p-5 rounded-2xl">
                <div className="mb-3 flex items-center justify-between border-b border-slate-200 pb-3">
                  <label className="flex items-center gap-2 font-display text-base font-bold text-slate-800">
                    Prototype Link(Concept or Design flow) <span className="text-slate-400 font-normal text-xs">(Optional)</span>
                  </label>
                  <button 
                    type="button" 
                    onClick={() => setShowDriveInfo(!showDriveInfo)} 
                    className="text-[#0197B2] hover:text-[#01788e] bg-white border border-[#0197B2]/20 flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                  >
                    <Info className="h-4 w-4" />
                    <span className="text-xs font-bold tracking-wide uppercase">How to get link</span>
                  </button>
                </div>
                
                <AnimatePresence>
                  {showDriveInfo && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }} 
                      animate={{ opacity: 1, height: 'auto' }} 
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mb-4 rounded-xl bg-[#e0f6fa] p-5 border border-[#0197B2]/30 text-sm text-slate-700 shadow-sm relative mt-2">
                        <div className="absolute -top-2 right-12 w-4 h-4 bg-[#e0f6fa] rotate-45 border-l border-t border-[#0197B2]/30" />
                        <h4 className="font-bold text-[#0197B2] mb-3 flex items-center gap-2 pb-2 border-b border-[#0197B2]/10 uppercase tracking-widest text-xs">
                          <Info className="h-4 w-4" />
                          Steps to get a public Google Drive link
                        </h4>
                        <ol className="list-decimal pl-5 space-y-2.5 text-[13px] text-slate-600 font-medium tracking-wide">
                          <li>Upload your project/prototype files to a Google Drive folder.</li>
                          <li>Right-click the folder/file and select <strong className="text-slate-800">Share</strong>.</li>
                          <li className="leading-snug">Under "General access", click "Restricted" and change it to <strong className="text-[#0197B2]">Anyone with the link</strong>.</li>
                          <li>Click <strong className="text-slate-800">Copy link</strong> and paste it below.</li>
                        </ol>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <input
                  type="url"
                  placeholder="https://drive.google.com/..."
                  value={prototypeUrl}
                  onChange={(e) => setPrototypeUrl(e.target.value)}
                  className="w-full mt-2 rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm placeholder:text-slate-400 focus:border-[#0197B2] focus:ring-4 focus:ring-[#0197B2]/10 focus:outline-none transition-all shadow-sm"
                />
                {/*
                <div className="mt-4 flex items-start gap-3 rounded-xl bg-red-50 p-4 border border-red-200 shadow-sm">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                  <p className="text-[13px] font-medium text-red-700 leading-relaxed">
                    <strong className="font-bold uppercase tracking-wider text-xs mr-1 opacity-90 text-red-800 block mb-0.5">Warning:</strong> 
                    Make sure the drive link is public (Anyone with the link). If your drive link is private and inaccessible, your Application will be cancelled.
                  </p>
                </div>
                */}
              </div>
            </div>
          </>
        )}

        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">Declaration</p>
          <label className="flex cursor-pointer items-start gap-3 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={declared}
              onChange={(e) => setDeclared(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-[#0197B2]"
            />
            I confirm that the information provided is correct and I agree to participate in VYUGA - Innovation Fest.
          </label>
        </div>

        <div className="space-y-4">
          <button
            type="submit"
            disabled={loading}
            style={{ backgroundColor: '#0197B2' }}
            className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:scale-[1.03] hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : fee ? `Pay ₹${fee}` : 'Submit Registration'}
          </button>
        </div>
      </motion.form>
    </PageShell>
  )
}

function Section({ title, children }) {
  return (
    <div>
      <h2 className="mb-4 border-b border-slate-100 pb-2 font-display text-base font-bold text-slate-800">
        {title}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', required = false, pattern, maxLength, title }) {
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
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-cyan/20"
      />
    </div>
  )
}
