import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Info, AlertCircle } from 'lucide-react'
import PageShell from './PageShell.jsx'
import { postFormData } from '../api'
import SubmitLoader from '../components/SubmitLoader.jsx'
import SuccessModal from '../components/SuccessModal.jsx'
import PaymentWarningModal from '../components/PaymentWarningModal.jsx'
import CityAutocomplete from '../components/CityAutocomplete.jsx'
import ApplicationStatusModal from '../components/ApplicationStatusModal.jsx'

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
  'Cognitive Disability',
  'Autism',
  'Multiple Specially Abled',
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
  nominatorType: '',
  instagramId: '',
  
  // Nomination type — always individual for parent form
  nominationType: 'individual',
  teamSize: '',
  
  // Student/Team details
  studentName: '',
  studentAge: '',
  disabilityType: [],
  disabilityTypeOther: '',
  talentCategory: '',
  talentCategoryOther: '',
  talentDescription: '',
  guardianName: '',
  guardianRelation: '',
  guardianRelationOther: '',
  guardianPhone: '',
  guardianEmail: '',
  videoLink: '',
  
  // Team members (when nominationType is 'team')
  teamMembers: [],
}

export default function TalentParentNomination() {
  const [form, setForm] = useState(EMPTY)
  const [isClosed, setIsClosed] = useState(false)
  const [fee, setFee] = useState(null)
  const [gstFee, setGstFee] = useState(null)

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/form-settings`)
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          // Use 'talent-org' record which holds the correct ₹399 fee for Parent/Individual Nomination
          const setting = json.data.find(s => s.id === 'talent-combined')
            || json.data.find(s => s.id === 'talent-org')
          if (setting) {
            if (setting.is_open === false) setIsClosed(true)
            if (setting.registration_fee_paise !== undefined && setting.registration_fee_paise !== null) {
              const basePaise = setting.registration_fee_paise
              const gstPaise = Math.round(basePaise * 18 / 100)
              setFee(basePaise / 100)
              setGstFee(gstPaise / 100)
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
  const [performanceUrl, setPerformanceUrl] = useState('')
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
    if (!performanceUrl.trim()) { showError('Please provide a Google Drive link for the performance video.'); return }
    if (!/^https?:\/\//i.test(performanceUrl.trim()) || !performanceUrl.includes('drive.google.com')) {
      showError('Please enter a valid public Google Drive link.'); return
    }
    if (!form.contactName.trim()) { showError('Please enter nominator name.'); return }
    if (!form.contactEmail.trim()) { showError('Please enter email address.'); return }
    if (!/^\d{10}$/.test(form.contactPhone)) { showError('Phone number must be exactly 10 digits.'); return }
    if (!form.nominatorType) { showError('Please select who is nominating.'); return }
    if (form.nominatorType === 'Influencer' && !form.instagramId.trim()) { showError('Please enter Instagram ID.'); return }
    if (!form.orgAddress || !form.orgAddress.trim()) { showError('Please enter address.'); return }
    if (!form.orgCity.trim()) { showError('Please select city.'); return }
    if (!form.orgState.trim()) { showError('Please select state.'); return }
    if (!form.talentCategory) { showError('Please select a talent category.'); return }
    
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
    
    // Validate talent description word count
    const talentWords = form.talentDescription.trim() ? form.talentDescription.trim().split(/\s+/).filter(word => word.length > 0) : []
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
      
      // Inject dummy org fields for Parent Nomination
      fd.set('orgName', `(${form.nominatorType || 'Parent'} Nomination) ` + form.contactName);
      fd.set('orgSize', '<10');
      fd.set('orgDisabilityFocus', 'single');
      fd.set('orgDisabilityTypes', JSON.stringify(['Parent/Individual']));
      fd.set('orgType', 'Other');
      fd.set('orgTypeOther', form.nominatorType || 'Parent');
      // gradeCategory is removed from parent form, inject dummy
      fd.set('gradeCategory', '1–5');

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
      title="Special Talent Utsav – Nominator & Participant Registration Form"
      subtitle="(Parents, Individuals, Influencers & Others)"
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

        {/* Nominator Details Section */}
        <Section title="Nominator Details">
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-[#0197B2]">
              Who is Nominating? <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={form.nominatorType}
              onChange={set('nominatorType')}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-[#0197B2] focus:outline-none focus:ring-2 focus:ring-[#0197B2]/20"
            >
              <option value="">Select Nominator</option>
              {['Influencer', 'Parent', 'Guardian', 'Teacher', 'Other'].map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <Field label="Nominator Name" value={form.contactName} onChange={set('contactName')} required />
          <Field label="Email Address" type="email" value={form.contactEmail} onChange={set('contactEmail')} required />
          <Field label="Phone Number" type="tel" value={form.contactPhone} onChange={set('contactPhone')} required pattern="\d{10}" maxLength={10} title="Enter exactly 10 digits" />
          
          {form.nominatorType === 'Influencer' && (
             <Field label="Instagram ID" value={form.instagramId} onChange={set('instagramId')} required />
          )}

          <div className="sm:col-span-2">
            <Field label="Address" value={form.orgAddress} onChange={set('orgAddress')} required/>
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
                    Type of Specially Abled <span className="text-red-500">*</span>
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
                        Type of Specially Abled <span className="text-red-500">*</span>
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
                    label="Enter Specially Abled Type"
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

        {/* Talent Details */}
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

        {/* Video Upload Option disabled: Drive link only for parent nomination */}
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
            <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-amber-700">
              Please share a <strong>video format only</strong> (MP4, MOV, AVI, WEBM). Do not share documents,images or any other files.
            </p>
            
            <div className="mt-4 flex items-start gap-3 rounded-xl bg-red-50 p-4 border border-red-200 shadow-sm">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
              <p className="text-[13px] font-medium text-red-700 leading-relaxed">
                <strong className="font-bold uppercase tracking-wider text-xs mr-1 opacity-90 text-red-800 block mb-0.5">Warning:</strong> 
                Make sure the drive link is public (Anyone with the link). If your drive link is private and inaccessible, your Application will be cancelled.
              </p>
            </div>
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
          <ApplicationStatusModal
            eventType="talent-combined"
            label="Special Talent Utsav"
          />
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
