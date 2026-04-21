import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Info, AlertCircle } from 'lucide-react'
import PageShell from './PageShell.jsx'
import { postFormData } from '../api'
import { fetchEventFee } from '../paymentHandler.js'
import compressVideo from '../compressVideo'
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

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const ORG_SIZE_OPTIONS = [
  { value: '<10', label: 'Less than 10 students' },
  { value: '10-30', label: '10-30 students' },
  { value: '30-50', label: '30-50 students' },
  { value: '50-100', label: '50-100 students' },
  { value: '100+', label: '100+ students' },
]

const ORG_TYPES = [
  'NGO', 'School', 'Rehabilitation Center', 'Community Center', 'Government Institution', 'Other'
]

const TALENT_CATEGORIES = [
  'Music', 'Dance', 'Art & Painting', 'Recitation / Poetry', 'Drama', 'Other',
]

const GRADE_CATEGORIES = ['1–5', '6–8', '9–12']

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

const RELATION_OPTIONS = [
  'Parent', 'Sibling', 'Teacher', 'Relative', 'Guardian', 'Other'
]

const EMPTY = {
  // Organization details
  orgName: '',
  orgType: '',
  orgTypeOther: '',
  orgAddress: '',
  orgCity: '',
  orgState: '',
  orgZip: '',
  orgSize: '',
  orgDisabilityFocus: '', // 'single' or 'multiple'
  orgDisabilityTypes: [], // array of disability types
  
  // Contact details
  contactName: '',
  contactDesignation: '',
  contactPhone: '',
  contactEmail: '',
  
  // Nomination type
  nominationType: '', // 'individual' or 'team'
  teamSize: '',
  
  // Student/Team details
  studentName: '',
  studentAge: '',
  disabilityType: [],
  disabilityTypeOther: '',
  talentCategory: '',
  talentCategoryOther: '',
  gradeCategory: '',
  talentDescription: '',
  guardianName: '',
  guardianRelation: '',
  guardianRelationOther: '',
  guardianPhone: '',
  guardianEmail: '',
  videoLink: '',
  social: '',
  
  // Team members (when nominationType is 'team')
  teamMembers: [],
}

export default function TalentStudentNomination() {
  const [form, setForm] = useState(EMPTY)
  const [isClosed, setIsClosed] = useState(false)
  const [fee, setFee] = useState(null)
  const [gstFee, setGstFee] = useState(null)

  useEffect(() => {
    fetchEventFee('specialtalent').then(result => {
      if (result) { setFee(result.baseFee); setGstFee(result.gstFee); }
    }).catch(console.error);
    
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/form-settings`)
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          const setting = json.data.find(s => s.id === 'talent-student')
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
  const [videoFile, setVideoFile] = useState(null)
  const [showPaymentWarning, setShowPaymentWarning] = useState(false)
  const [performanceUrl, setPerformanceUrl] = useState('')
  const [compressProgress, setCompressProgress] = useState(null)
  const [showDriveInfo, setShowDriveInfo] = useState(false)

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  // Handle team size change and initialize team members
  const handleTeamSizeChange = (e) => {
    const size = parseInt(e.target.value) || 0
    setForm((prevForm) => ({
      ...prevForm,
      teamSize: e.target.value,
      teamMembers: Array(size).fill().map((_, index) => ({
        name: '',
        age: '',
        disabilityType: [],
        disabilityTypeOther: '',
        guardianName: '',
        guardianRelation: '',
        guardianRelationOther: '',
        guardianPhone: '',
        guardianEmail: '',
      }))
    }))
  }

  // Update individual team member
  const updateTeamMember = (index, field, value) => {
    setForm((prev) => {
      let newMembers = [...prev.teamMembers]
      newMembers[index] = { ...newMembers[index], [field]: value }
      
      // Auto-sync Guardian details from Team Leader to all members explicitly
      if (index === 0 && field.startsWith('guardian')) {
        newMembers = newMembers.map((m, i) => {
          if (i === 0) return m;
          return { ...m, [field]: value }
        })
      }
      return { ...prev, teamMembers: newMembers }
    })
  }

  // Handle auto-populating guardian phone for team members
  const handleGuardianPhoneChange = (memberIndex, value) => {
    updateTeamMember(memberIndex, 'guardianPhone', value)
  }

  // Handle team member disability change
  const handleTeamMemberDisabilityChange = (memberIndex, disability) => {
    setForm((prevForm) => ({
      ...prevForm,
      teamMembers: prevForm.teamMembers.map((member, i) => {
        if (i !== memberIndex) return member
        const currentDisabilities = member.disabilityType || []
        const isSelected = currentDisabilities.includes(disability)
        
        return {
          ...member,
          disabilityType: isSelected 
            ? currentDisabilities.filter(d => d !== disability)
            : [...currentDisabilities, disability]
        }
      })
    }))
  }

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

  // Handle organization disability types selection
  const handleOrgDisabilityTypeChange = (disability) => {
    setForm((prevForm) => {
      const currentTypes = prevForm.orgDisabilityTypes || []
      const isSelected = currentTypes.includes(disability)
      
      // If organization focuses on single disability, only allow one selection
      if (prevForm.orgDisabilityFocus === 'single') {
        return {
          ...prevForm,
          orgDisabilityTypes: isSelected ? [] : [disability]
        }
      }
      
      // For multiple disability focus, allow multiple selections
      if (isSelected) {
        return {
          ...prevForm,
          orgDisabilityTypes: currentTypes.filter(type => type !== disability)
        }
      } else {
        return {
          ...prevForm,
          orgDisabilityTypes: [...currentTypes, disability]
        }
      }
    })
  }

  // Reset organization disability types when focus changes
  const handleOrgFocusChange = (e) => {
    setForm(prevForm => ({
      ...prevForm,
      orgDisabilityFocus: e.target.value,
      orgDisabilityTypes: [] // Reset selections when focus type changes
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const showError = (msg) => {
      setError(msg)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    if (!declared) { showError('Please confirm the declaration at the bottom of the form.'); return }
    if (!videoFile && !performanceUrl.trim()) { showError('Please provide a performance video by either uploading a file OR providing a Google Drive link.'); return }
    if (!form.orgName.trim()) { showError('Please enter organization name.'); return }
    if (!form.orgCity.trim()) { showError('Please enter organization city.'); return }
    if (!form.orgState.trim()) { showError('Please enter organization state.'); return }
    if (!form.contactName.trim()) { showError('Please enter contact person name.'); return }
    if (!form.contactEmail.trim()) { showError('Please enter contact email.'); return }
    if (!/^\d{10}$/.test(form.contactPhone)) { showError('Contact phone number must be exactly 10 digits.'); return }
    if (!form.orgSize) { showError('Please select organization size.'); return }
    if (!form.orgDisabilityFocus) { showError('Please select organization disability focus.'); return }
    if (!form.orgDisabilityTypes || form.orgDisabilityTypes.length === 0) { showError('Please select at least one disability type for organization.'); return }
    if (form.orgDisabilityFocus === 'single' && form.orgDisabilityTypes.length > 1) { showError('Single focus organizations can only select one disability type.'); return }
    if (!form.nominationType) { showError('Please select the nomination type (Individual or Team).'); return }
    if (form.orgType === 'Other' && !form.orgTypeOther.trim()) { showError('Please enter organization type.'); return }
    
    // Individual vs Team validation
    if (form.nominationType === 'individual') {
      if (!form.studentName.trim()) { showError('Please enter student name.'); return }
      if (!form.studentAge || parseInt(form.studentAge) < 1) { showError('Please enter valid student age.'); return }
      if (!form.disabilityType || form.disabilityType.length === 0) { showError('Please select at least one disability type.'); return }
      if (form.disabilityType.includes('Other') && !form.disabilityTypeOther.trim()) { showError('Please enter disability type.'); return }
      if (!form.guardianName.trim()) { showError('Please enter accompanying person name.'); return }
      if (!form.guardianRelation) { showError('Please select relationship for accompanying person.'); return }
      if (form.guardianRelation === 'Other' && !form.guardianRelationOther.trim()) { showError('Please specify relationship.'); return }
      if (!/^\d{10}$/.test(form.guardianPhone)) { showError('Accompanying person phone number must be exactly 10 digits.'); return }
    } else if (form.nominationType === 'team') {
      if (!form.teamSize || parseInt(form.teamSize) < 2) { showError('Please enter team size (minimum 2 members).'); return }
      if (!form.teamMembers || form.teamMembers.length === 0) { showError('Please add team members.'); return }
      
      // Validate each team member
      for (let i = 0; i < form.teamMembers.length; i++) {
        const member = form.teamMembers[i]
        if (!member.name.trim()) { showError(`Please enter name for team member ${i + 1}.`); return }
        if (!member.age || parseInt(member.age) < 1) { showError(`Please enter valid age for team member ${i + 1}.`); return }
        if (!member.disabilityType || member.disabilityType.length === 0) { showError(`Please select disability type for team member ${i + 1}.`); return }
        if (member.disabilityType.includes('Other') && !member.disabilityTypeOther.trim()) { showError(`Please enter disability type for team member ${i + 1}.`); return }
        if (!member.guardianName.trim()) { showError(`Please enter accompanying person name for team member ${i + 1}.`); return }
        if (!member.guardianRelation) { showError(`Please select relationship for team member ${i + 1}'s accompanying person.`); return }
        if (member.guardianRelation === 'Other' && !member.guardianRelationOther?.trim()) { showError(`Please specify relationship for team member ${i + 1}.`); return }
        if (!/^\d{10}$/.test(member.guardianPhone)) { showError(`Accompanying person phone for team member ${i + 1} must be exactly 10 digits.`); return }
      }
    }
    
    // Validate talent description and category
    const talentWords = form.talentDescription.trim() ? form.talentDescription.trim().split(/\s+/).filter(word => word.length > 0) : []
    if (!form.talentCategory) { showError('Please select a talent category.'); return }
    if (!form.talentDescription.trim()) { showError('Please provide a brief description of the talent.'); return }
    if (talentWords.length > 50) { showError('Talent description must not exceed 50 words.'); return }
    
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
    setCompressProgress(null)

    try {
      const fd = new FormData()
      
      // Add basic form fields
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'teamMembers') {
          // Handle team members as JSON and combine relationship
          const processedMembers = v.map(m => {
            const rel = m.guardianRelation === 'Other' ? m.guardianRelationOther : m.guardianRelation;
            const { guardianRelation, guardianRelationOther, ...rest } = m;
            return {
              ...rest,
              guardianName: rel ? `${m.guardianName} (${rel})` : m.guardianName
            };
          });
          fd.append(k, JSON.stringify(processedMembers))
        } else if (k === 'guardianName') {
          // Combine relationship for individual
          const rel = form.guardianRelation === 'Other' ? form.guardianRelationOther : form.guardianRelation;
          fd.append(k, rel ? `${v} (${rel})` : v);
        } else if (k === 'guardianRelation' || k === 'guardianRelationOther') {
          // Skip these fields as they are combined into guardianName
        } else if (Array.isArray(v)) {
          // Handle arrays (like disabilityType)
          fd.append(k, JSON.stringify(v))
        } else {
          fd.append(k, v || '')
        }
      })
      
      // Inject dummy values for removed Category fields
      fd.set('talentCategory', 'N/A')
      fd.set('gradeCategory', 'N/A')
      
      if (videoFile) {
        fd.append('performanceVideo', videoFile)
      }
      if (performanceUrl.trim()) {
        fd.append('performanceUrl', performanceUrl.trim())
      }
      
      const res = await postFormData('/api/talent-combined', fd)
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
      title="Special Talent Utsav – Organization & Nomination"
      subtitle="Register your organization and nominate talented students or teams."
    >
      <SuccessModal
        isOpen={submitted}
        onClose={() => setSubmitted(false)}
        title="Nomination Submitted"
        message={`${form.nominationType === 'team' ? 'Team nomination' : form.studentName} has been submitted for Special Talent Utsav! We'll review the submission and get back to you at the provided contact.`}
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
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        {/* Organization Registration */}
        <Section title="Organization Details">
          <Field label="Organization Name" value={form.orgName} onChange={set('orgName')} required />
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest" style={{ color: '#0197B2' }}>
              Organization Type <span className="text-red-500">*</span>
            </label>
            <select
              value={form.orgType}
              onChange={set('orgType')}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2"
              required
            >
              <option value="">Select organization type</option>
              {ORG_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          {form.orgType === 'Other' && (
            <Field label="Enter Organization Type" value={form.orgTypeOther} onChange={set('orgTypeOther')} required />
          )}
          <div className="sm:col-span-2">
            <Field label="Organization Address" value={form.orgAddress} onChange={set('orgAddress')} required/>
          </div>
          <CityAutocomplete
            value={form.orgCity}
            onChange={(val) => setForm((f) => ({ ...f, orgCity: val }))}
            required={true}
            label="City"
          />
          
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-brand-cyan">
              State <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={form.orgState}
              onChange={set('orgState')}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-cyan/20"
            >
              <option value="">Select State</option>
              {STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <Field label="ZIP Code" value={form.orgZip} onChange={set('orgZip')} placeholder="Optional" />
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest" style={{ color: '#0197B2' }}>
              Number of Students in Organization <span className="text-red-500">*</span>
            </label>
            <select
              value={form.orgSize}
              onChange={set('orgSize')}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2"
              required
            >
              <option value="">Select organization size</option>
              {ORG_SIZE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest" style={{ color: '#0197B2' }}>
              Organization Focus <span className="text-red-500">*</span>
            </label>
            <select
              value={form.orgDisabilityFocus}
              onChange={handleOrgFocusChange}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2"
              required
            >
              <option value="">Select organization focus</option>
              <option value="single">Single Disability Type</option>
              <option value="multiple">Multiple Disability Types</option>
            </select>
            <p className="mt-1 text-xs text-slate-500">
              Does your organization serve people with a single type of disability or multiple types?
            </p>
          </div>
          
          {form.orgDisabilityFocus && (
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest" style={{ color: '#0197B2' }}>
                Disability Types Supported <span className="text-red-500">*</span>
                {form.orgDisabilityFocus === 'single' && <span className="text-xs normal-case text-slate-500"> (Select one)</span>}
                {form.orgDisabilityFocus === 'multiple' && <span className="text-xs normal-case text-slate-500"> (Select multiple)</span>}
              </label>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {DISABILITY_TYPES.map((disability) => (
                  <label
                    key={disability}
                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 transition-colors"
                  >
                    <input
                      type={form.orgDisabilityFocus === 'single' ? 'radio' : 'checkbox'}
                      name={form.orgDisabilityFocus === 'single' ? 'singleOrgDisability' : undefined}
                      checked={form.orgDisabilityTypes?.includes(disability) || false}
                      onChange={() => handleOrgDisabilityTypeChange(disability)}
                      className="shrink-0"
                      style={{ accentColor: '#0197B2' }}
                    />
                    <span className="text-slate-700">{disability}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </Section>

        {/* SPOC Details Section */}
        <Section title="SPOC Details">
          <Field label="Name" value={form.contactName} onChange={set('contactName')} required />
          <Field label="Designation" value={form.contactDesignation} onChange={set('contactDesignation')} placeholder="e.g., Principal, Director, Manager" required/>
          <Field label="Email" type="email" value={form.contactEmail} onChange={set('contactEmail')} required />
          <Field label="Phone" type="tel" value={form.contactPhone} onChange={set('contactPhone')} required pattern="\d{10}" maxLength={10} title="Enter exactly 10 digits" />
        </Section>

        {/* Nomination Type */}
        <Section title="Nomination Type">
          <div className="sm:col-span-2">
            <label className="mb-3 block text-xs font-bold uppercase tracking-widest" style={{ color: '#0197B2' }}>
              Select the nomination type <span className="text-red-500">*</span>
            </label>
            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="nominationType"
                  value="individual"
                  checked={form.nominationType === 'individual'}
                  onChange={set('nominationType')}
                  className="mt-0.5 h-4 w-4 text-[#0197B2] focus:ring-[#0197B2] focus:ring-offset-0"
                />
                <div>
                  <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">Individual Student</span>
                  <p className="text-xs text-slate-500">Nominate Individual Performer</p>
                </div>
              </label>
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="nominationType"
                  value="team"
                  checked={form.nominationType === 'team'}
                  onChange={set('nominationType')}
                  className="mt-0.5 h-4 w-4 text-[#0197B2] focus:ring-[#0197B2] focus:ring-offset-0"
                />
                <div>
                  <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">Team</span>
                  <p className="text-xs text-slate-500">Nominate a group of students performing together</p>
                </div>
              </label>
            </div>
          </div>
          
        </Section>

        {/* Team Size Selection for Team nominations */}
        {form.nominationType === 'team' && (
          <Section title="Team Details">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest" style={{ color: '#0197B2' }}>
                Number of Team Members <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="2"
                max="20"
                value={form.teamSize}
                onChange={handleTeamSizeChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2"
                placeholder="Enter number of members"
                required
              />
              <p className="mt-1 text-xs text-slate-500">Minimum 2 members required for team nomination</p>
            </div>
          </Section>
        )}

        {/* Individual Student Details */}
        {form.nominationType === 'individual' && (
          <Section title="Student Details">
            <Field label="Student Full Name" value={form.studentName} onChange={set('studentName')} required />
            <Field label="Age" type="number" value={form.studentAge} onChange={set('studentAge')} required />
            <div>
              <label className="mb-3 block text-xs font-bold uppercase tracking-widest" style={{ color: '#0197B2' }}>
                Type of Disability <span className="text-red-500">*</span>
              </label>
              <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                {DISABILITY_TYPES.map((disability) => (
                  <label key={disability} className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={form.disabilityType?.includes(disability) || false}
                      onChange={() => handleDisabilityChange(disability)}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0197B2] focus:ring-[#0197B2] focus:ring-offset-0"
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
            <Field label="Who will accompany (Name)" value={form.guardianName} onChange={set('guardianName')} required />
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest" style={{ color: '#0197B2' }}>
                Relationship with Student <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={form.guardianRelation}
                onChange={set('guardianRelation')}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2"
              >
                <option value="">Select relationship</option>
                {RELATION_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            {form.guardianRelation === 'Other' && (
              <Field label="Please Specify Relationship" value={form.guardianRelationOther} onChange={set('guardianRelationOther')} required />
            )}
            <Field label="Accompanying Person Phone" type="tel" value={form.guardianPhone} onChange={set('guardianPhone')} required pattern="\d{10}" maxLength={10} title="Enter exactly 10 digits" />
            <Field label="Accompanying Person Email" type="email" value={form.guardianEmail} onChange={set('guardianEmail')} />
          </Section>
        )}

        {/* Team Member Details */}
        {form.nominationType === 'team' && form.teamMembers && form.teamMembers.length > 0 && (
          <div className="space-y-6">
            {form.teamMembers.map((member, index) => (
              <Section key={index} title={`Team Member ${index + 1}`}>
                <Field
                  label="Full Name"
                  value={member.name}
                  onChange={(e) => updateTeamMember(index, 'name', e.target.value)}
                  required
                />
                <Field
                  label="Age"
                  type="number"
                  value={member.age}
                  onChange={(e) => updateTeamMember(index, 'age', e.target.value)}
                  required
                />
                <div>
                  <label className="mb-3 block text-xs font-bold uppercase tracking-widest" style={{ color: '#0197B2' }}>
                    Type of Disability <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                    {DISABILITY_TYPES.map((disability) => (
                      <label key={disability} className="flex items-start gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={member.disabilityType?.includes(disability) || false}
                          onChange={() => handleTeamMemberDisabilityChange(index, disability)}
                          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0197B2] focus:ring-[#0197B2] focus:ring-offset-0"
                        />
                        <span className="text-sm text-slate-700 group-hover:text-slate-900 select-none">
                          {disability}
                        </span>
                      </label>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-slate-500">Select all that apply</p>
                </div>
                {member.disabilityType?.includes('Other') && (
                  <Field
                    label="Enter Disability Type"
                    value={member.disabilityTypeOther}
                    onChange={(e) => updateTeamMember(index, 'disabilityTypeOther', e.target.value)}
                    required
                  />
                )}
                <Field
                  label="Who will accompany (Name)"
                  value={member.guardianName}
                  onChange={(e) => updateTeamMember(index, 'guardianName', e.target.value)}
                  required
                  readOnly={index > 0}
                />
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest" style={{ color: '#0197B2' }}>
                    Relationship with Member <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={member.guardianRelation || ''}
                    onChange={(e) => updateTeamMember(index, 'guardianRelation', e.target.value)}
                    disabled={index > 0}
                    className={`w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 ${index > 0 ? 'bg-slate-50 opacity-70 cursor-not-allowed' : 'bg-white'}`}
                  >
                    <option value="">Select relationship</option>
                    {RELATION_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                {member.guardianRelation === 'Other' && (
                  <Field
                    label="Please Specify Relationship"
                    value={member.guardianRelationOther || ''}
                    onChange={(e) => updateTeamMember(index, 'guardianRelationOther', e.target.value)}
                  readOnly={index > 0}
                  />
                )}
                <div>
                  <Field
                    label="Accompanying Person Phone"
                    type="tel"
                    required
                    readOnly={index > 0}
                    value={member.guardianPhone}
                  onChange={(e) => handleGuardianPhoneChange(index, e.target.value)}
                    pattern="\d{10}"
                    maxLength={10}
                    title="Enter exactly 10 digits"
                    placeholder={index === 0 ? "Enter phone number" : "Auto-filled and locked"}
                  />
                  {index === 0 && (
                    <p className="mt-2 text-xs text-slate-500 pl-1">
                      This information automatically applies to all team members.
                    </p>
                  )}
                  {index > 0 && (
                    <p className="mt-2 text-xs text-slate-500 pl-1">
                      Auto-filled from team leader.
                    </p>
                  )}
                </div>
                <Field
                  label="Accompanying Person Email"
                  type="email"
                  value={member.guardianEmail}
                  onChange={(e) => updateTeamMember(index, 'guardianEmail', e.target.value)}
                  readOnly={index > 0}
                />
              </Section>
            ))}
          </div>
        )}

        {/* Talent Category */}
        {(form.nominationType === 'individual' || form.nominationType === 'team') && (
          <Section title="Talent Details">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest" style={{ color: '#0197B2' }}>
                Talent Category <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={form.talentCategory}
                onChange={set('talentCategory')}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-[#0197B2] focus:outline-none focus:ring-2 focus:ring-[#0197B2]/20"
              >
                <option value="">Select talent category</option>
                {TALENT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {form.talentCategory === 'Other' && (
                <div className="mt-3">
                  <Field label="Please specify talent category" value={form.talentCategoryOther} onChange={set('talentCategoryOther')} required />
                </div>
              )}
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest" style={{ color: '#0197B2' }}>
                Brief Description of Talent <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={form.talentDescription}
                onChange={(e) => {
                  const words = e.target.value.trim() ? e.target.value.trim().split(/\s+/) : []
                  if (words.length <= 50) {
                    set('talentDescription')(e)
                  }
                }}
                placeholder="Describe the specific talent, skills, or achievements... (max 50 words)"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2"
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-slate-500">
                  Be specific about the talent, skill level, achievements, or special abilities
                </p>
                <span className={`text-xs font-medium ${
                  form.talentDescription.trim().split(/\s+/).filter(word => word.length > 0).length > 50 
                    ? 'text-red-500' 
                    : form.talentDescription.trim().split(/\s+/).filter(word => word.length > 0).length > 40
                      ? 'text-amber-500'
                      : 'text-slate-400'
                }`}>
                  {form.talentDescription.trim() ? form.talentDescription.trim().split(/\s+/).filter(word => word.length > 0).length : 0}/50 words
                </span>
              </div>
            </div>
          </Section>
        )}


        {/* Video Upload Options */}

        {/* Video Upload - COMMENTED OUT
        <div>
          <h2 className="mb-4 font-display text-base font-bold text-slate-800 border-b border-slate-100 pb-2">
            Performance Video Upload <span className="text-slate-500 text-sm font-normal ml-2">(Option 1)</span>
          </h2>
          <p className="mb-3 text-xs text-slate-500">Upload a performance video (max 3 minutes). Accepted formats: MP4, MOV, AVI, WEBM.</p>
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center transition hover:border-[#0197B2]/50 hover:bg-slate-100">
            <span className="text-3xl">🎬</span>
            <span className="text-sm font-medium text-slate-600">
              {videoFile ? videoFile.name : 'Click to upload performance video'}
            </span>
            <span className="text-xs text-slate-400">MP4, MOV, AVI, WEBM — max 200 MB (~3 mins)</span>
            <input type="file" accept="video/mp4,video/quicktime,video/x-msvideo,video/webm,video/x-matroska" className="hidden" onChange={(e) => setVideoFile(e.target.files[0] || null)} />
          </label>
          {videoFile && (
            <div className="mt-2 flex items-center gap-3">
              <button type="button" onClick={() => setVideoFile(null)} className="text-xs text-red-500 hover:underline">Remove video</button>
              {videoFile.size >= 5 * 1024 * 1024 && (<span className="text-xs text-slate-400">{(videoFile.size / (1024 * 1024)).toFixed(1)} MB — will be compressed before upload</span>)}
            </div>
          )}
          {compressProgress !== null && (
            <div className="mt-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold" style={{ color: '#0197B2' }}>Compressing video…</span>
                <span className="text-xs text-slate-500">{compressProgress}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-300" style={{ width: `${compressProgress}%`, background: 'linear-gradient(90deg, #0197B2, #5BCB2B)' }} />
              </div>
            </div>
          )}
        END COMMENTED OUT */}

        <div>
          <div className="mt-4 relative bg-slate-50 border border-slate-200 p-5 rounded-2xl">
            <div className="mb-3 flex items-center justify-between border-b border-slate-200 pb-3">
              <label className="flex items-center gap-2 font-display text-base font-bold text-slate-800">
                Performance Drive Link <span className="text-red-500">*</span>
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
                      <li>Upload your performance video to a Google Drive folder.</li>
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
              required
              placeholder="https://drive.google.com/..."
              value={performanceUrl}
              onChange={(e) => setPerformanceUrl(e.target.value)}
              className="w-full mt-2 rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm placeholder:text-slate-400 focus:border-[#0197B2] focus:ring-4 focus:ring-[#0197B2]/10 focus:outline-none transition-all shadow-sm"
            />
            
            <div className="mt-4 flex items-start gap-3 rounded-xl bg-red-50 p-4 border border-red-200 shadow-sm">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
              <p className="text-[13px] font-medium text-red-700 leading-relaxed">
                <strong className="font-bold uppercase tracking-wider text-xs mr-1 opacity-90 text-red-800 block mb-0.5">Warning:</strong> 
                Make sure the drive link is public (Anyone with the link). If your drive link is private and inaccessible, your Application will be cancelled.
              </p>
            </div>
          </div>
        </div>

        <div>
          <div className="mt-4 relative bg-slate-50 border border-slate-200 p-5 rounded-2xl">
            <div className="mb-3 flex items-center justify-between border-b border-slate-200 pb-3">
              <label className="flex items-center gap-2 font-display text-base font-bold text-slate-800">
                Social Media Link <span className="text-slate-400 font-normal ml-1">(Optional)</span>
              </label>
            </div>
            
            <input
              type="url"
              placeholder="Instagram, YouTube, LinkedIn, etc."
              value={form.social}
              onChange={set('social')}
              className="w-full mt-2 rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm placeholder:text-slate-400 focus:border-[#0197B2] focus:ring-4 focus:ring-[#0197B2]/10 focus:outline-none transition-all shadow-sm"
            />
            <p className="mt-2 text-xs text-slate-500">Provide a link to your social media profile where we can see more of your work.</p>
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
            I confirm that the information provided is correct and I agree to participate in VYUGA – Special Talent Utsav.
          </label>
        </div>

        <div className="space-y-4">
          <button
            type="submit"
            disabled={loading}
            style={{ backgroundColor: '#0197B2' }}
            className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:opacity-90 hover:scale-[1.03] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : fee ? `Pay ₹${fee}` : 'Submit Nomination'}
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

function Field({ label, value, onChange, type = 'text', required = false, pattern, maxLength, title, placeholder, readOnly = false }) {
  const handlePhoneInput = (e) => {
    if (readOnly) return;
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
        placeholder={placeholder}
        readOnly={readOnly}
        className={`w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 ${readOnly ? 'bg-slate-50 opacity-70 cursor-not-allowed' : 'bg-white'}`}
      />
    </div>
  )
}
