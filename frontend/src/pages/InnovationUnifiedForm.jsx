import { useMemo, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import PageShell from './PageShell.jsx'
import { postFormData } from '../api'
import SubmitLoader from '../components/SubmitLoader.jsx'

const INNOVATION_TYPE_OPTIONS = [
  { value: '', label: 'Select one' },
  { value: 'for_specially_abled', label: 'For Specially Abled' },
  { value: 'by_specially_abled', label: 'Innovators (Specially Abled)' },
]

const THEME_OPTIONS = [
  'Cognitive & Learning Accessibility',
  'Physical & Mobility Accessibility',
  'Visual & Hearing Accessibility',
]

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
  innovationType: '',
  teamName: '',
  collegeName: '',
  theme: '',
  themeOther: '',
  participationType: 'innovators',
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
  const [prototypeUrl, setPrototypeUrl] = useState('')

  // Auto-detect innovation type based on route
  useEffect(() => {
    const path = location.pathname
    if (path.includes('innovation-college')) {
      setForm(prev => ({ ...prev, innovationType: 'for_specially_abled' }))
    } else if (path.includes('innovation-pwd')) {
      setForm(prev => ({ ...prev, innovationType: 'by_specially_abled' }))
    }
  }, [location.pathname])

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
      return 'Please select at least one disability type.'
    }
    if (isBySpeciallyAbled && form.member1DisabilityType?.includes('Other') && !form.member1DisabilityTypeOther.trim()) {
      return 'Please enter a disability type.'
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
      // Map 'innovators' to 'individual' for backend compatibility
      const typeToSend = form.participationType === 'innovators' ? 'individual' : form.participationType
      fd.append('participationType', typeToSend)
      
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

    if (protoFile) fd.append('prototypeImage', protoFile)
    if (udidFile) fd.append('udidCard', udidFile)
    if (prototypeUrl.trim()) fd.append('prototypeUrl', prototypeUrl.trim())
    return fd
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    // Map 'innovators' back to 'individual' for backend compatibility if needed, or update backend.
    // Assuming backend expects 'individual' or 'team'.
    // If backend is strict, we might need to map it in buildPayload.
    
    const validationError = validateCommon()
    if (validationError) {
      setError(validationError)
      setLoading(false)
      return
    }

    try {
      await postFormData(endpoint, buildPayload())
      setSubmitted(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    const name = isForSpeciallyAbled ? form.teamName : form.member1Name
    const categoryText = isForSpeciallyAbled ? 'For Specially Abled' : 'By Specially Abled'

    return (
      <PageShell title="Registration Successful" subtitle="Thank you for registering!">
        <div className="max-w-xl rounded-2xl border border-brand-cyan/20 bg-brand-cyan-light p-8 text-center">
          <p className="font-display text-lg font-bold text-slate-900">
            Registration submitted successfully for <span className="text-brand-cyan">{name}</span> ({categoryText}).
          </p>
          <p className="mt-3 text-sm text-slate-500">We'll contact you at the provided email address.</p>
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

  return (
    <PageShell
      title={pageTitle}
      subtitle={pageSubtitle}
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
                  <option value="Assistive Technology" className="font-bold">Assistive Technology (General)</option>
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
              {['innovators', 'team'].map((type) => (
                <label key={type} className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
                  <input
                    type="radio"
                    name="participationType"
                    value={type}
                    checked={form.participationType === type}
                    onChange={set('participationType')}
                    className="accent-brand-cyan"
                  />
                  {type === 'innovators' ? 'Innovators' : 'Team'}
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
                  <span className="text-slate-400 font-normal text-xs ml-1">(Max 50 words)</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={form.ideaDescription}
                  onChange={set('ideaDescription')}
                  placeholder="Provide a concise overview of your idea or prototype in 50 words or less..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-cyan/20"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-brand-cyan">
                  Pain Point <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={form.painPoint}
                  onChange={set('painPoint')}
                  placeholder={isForSpeciallyAbled
                    ? "What specific problem or challenge does your innovation address for specially abled individuals?"
                    : "What specific challenge or barrier do you face that your solution addresses?"}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-cyan/20"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-brand-cyan">
                  Solution <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={form.solution}
                  onChange={set('solution')}
                  placeholder={isForSpeciallyAbled
                    ? "Explain how your innovation solves the problem. What technology, approach, or methodology do you use?"
                    : "Explain how your assistive technology solution works and addresses the problem. What technology, approach, or methodology do you use?"}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-cyan/20"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-brand-cyan">
                  Unique Selling Proposition (USP) <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={form.usp}
                  onChange={set('usp')}
                  placeholder={isForSpeciallyAbled
                    ? "What makes your solution unique? How is it different from existing solutions?"
                    : "What makes your solution unique? How is it different from existing assistive technologies?"}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-cyan/20"
                />
              </div>
            </>
          )}
        </Section>

        {(isForSpeciallyAbled || isBySpeciallyAbled) && (
          <>
            <Section title={isBySpeciallyAbled ? (isTeamForBy ? 'Member 1 (Team Leader)' : 'Participant Details') : 'Member 1 (Team Leader)'}>
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
                    Type of Disability <span className="text-red-500">*</span>
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
                  label="Enter Disability Type"
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

        <button
          type="submit"
          disabled={loading || !declared || !form.innovationType}
          style={{ backgroundColor: '#0197B2' }}
          className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:scale-[1.03] hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
        >
          {loading ? 'Submitting...' : 'Submit Registration'}
        </button>
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
