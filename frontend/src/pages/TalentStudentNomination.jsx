import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import PageShell from './PageShell.jsx'
import { postFormData } from '../api'
import compressVideo from '../compressVideo'
import SubmitLoader from '../components/SubmitLoader.jsx'

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
  talentDescription: '',
  guardianName: '',
  guardianPhone: '',
  guardianEmail: '',
  videoLink: '',
  
  // Team members (when nominationType is 'team')
  teamMembers: [],
}

export default function TalentStudentNomination() {
  const [form, setForm] = useState(EMPTY)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [declared, setDeclared] = useState(false)
  const [videoFile, setVideoFile] = useState(null)
  const [performanceUrl, setPerformanceUrl] = useState('')
  const [compressProgress, setCompressProgress] = useState(null)

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
        guardianPhone: '',
        guardianEmail: '',
      }))
    }))
  }

  // Update individual team member
  const updateTeamMember = (index, field, value) => {
    setForm((prevForm) => ({
      ...prevForm,
      teamMembers: prevForm.teamMembers.map((member, i) => 
        i === index ? { ...member, [field]: value } : member
      )
    }))
  }

  // Special handler for guardian phone that auto-populates from first member
  const handleGuardianPhoneChange = (index, value) => {
    setForm((prevForm) => ({
      ...prevForm,
      teamMembers: prevForm.teamMembers.map((member, i) => {
        if (i === index) {
          return { ...member, guardianPhone: value }
        } else if (index === 0 && member.guardianPhone === '') {
          // Auto-populate from first member only if current member's phone is empty
          return { ...member, guardianPhone: value }
        }
        return member
      })
    }))
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Basic validation
    if (!videoFile) { setError('Please upload the performance video.'); return }
    if (!form.orgName.trim()) { setError('Please enter organization name.'); return }
    if (!form.orgCity.trim()) { setError('Please enter organization city.'); return }
    if (!form.orgState.trim()) { setError('Please enter organization state.'); return }
    if (!form.contactName.trim()) { setError('Please enter contact person name.'); return }
    if (!form.contactEmail.trim()) { setError('Please enter contact email.'); return }
    if (!/^\d{10}$/.test(form.contactPhone)) { setError('Contact phone number must be exactly 10 digits.'); return }
    if (!form.orgSize) { setError('Please select organization size.'); return }
    if (!form.orgDisabilityFocus) { setError('Please select organization disability focus.'); return }
    if (!form.nominationType) { setError('Please select nomination type (Individual or Team).'); return }
    if (form.orgType === 'Other' && !form.orgTypeOther.trim()) { setError('Please enter organization type.'); return }
    
    // Individual vs Team validation
    if (form.nominationType === 'individual') {
      if (!form.studentName.trim()) { setError('Please enter student name.'); return }
      if (!form.studentAge || parseInt(form.studentAge) < 1) { setError('Please enter valid student age.'); return }
      if (!form.disabilityType || form.disabilityType.length === 0) { setError('Please select at least one disability type.'); return }
      if (form.disabilityType.includes('Other') && !form.disabilityTypeOther.trim()) { setError('Please enter disability type.'); return }
      if (!form.guardianName.trim()) { setError('Please enter accompanying person name.'); return }
      if (!/^\d{10}$/.test(form.guardianPhone)) { setError('Accompanying person phone number must be exactly 10 digits.'); return }
    } else if (form.nominationType === 'team') {
      if (!form.teamSize || parseInt(form.teamSize) < 2) { setError('Please enter team size (minimum 2 members).'); return }
      if (!form.teamMembers || form.teamMembers.length === 0) { setError('Please add team members.'); return }
      
      // Validate each team member
      for (let i = 0; i < form.teamMembers.length; i++) {
        const member = form.teamMembers[i]
        if (!member.name.trim()) { setError(`Please enter name for team member ${i + 1}.`); return }
        if (!member.age || parseInt(member.age) < 1) { setError(`Please enter valid age for team member ${i + 1}.`); return }
        if (!member.disabilityType || member.disabilityType.length === 0) { setError(`Please select disability type for team member ${i + 1}.`); return }
        if (member.disabilityType.includes('Other') && !member.disabilityTypeOther.trim()) { setError(`Please enter disability type for team member ${i + 1}.`); return }
        if (!member.guardianName.trim()) { setError(`Please enter accompanying person name for team member ${i + 1}.`); return }
        if (!/^\d{10}$/.test(member.guardianPhone)) { setError(`Accompanying person phone for team member ${i + 1} must be exactly 10 digits.`); return }
      }
    }
    
    if (!form.talentCategory) { setError('Please select talent category.'); return }
    if (form.talentCategory === 'Other' && !form.talentCategoryOther.trim()) { setError('Please enter talent category.'); return }
    
    // Validate talent description word count
    const talentWords = form.talentDescription.trim() ? form.talentDescription.trim().split(/\s+/).filter(word => word.length > 0) : []
    if (!form.talentDescription.trim()) { setError('Please provide a brief description of the talent.'); return }
    if (talentWords.length > 50) { setError('Talent description must not exceed 50 words.'); return }
    
    setLoading(true)
    setError('')
    try {
      // Compress video in browser before uploading
      setCompressProgress(0)
      const compressed = await compressVideo(videoFile, {
        maxWidth: 720,
        videoBitsPerSecond: 800_000,
        onProgress: setCompressProgress,
      })
      setCompressProgress(null)

      const fd = new FormData()
      
      // Add basic form fields
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'teamMembers') {
          // Handle team members as JSON
          fd.append(k, JSON.stringify(v))
        } else if (Array.isArray(v)) {
          // Handle arrays (like disabilityType)
          fd.append(k, JSON.stringify(v))
        } else {
          fd.append(k, v || '')
        }
      })
      
      fd.append('performanceVideo', compressed)
      if (performanceUrl.trim()) fd.append('performanceUrl', performanceUrl.trim())
      
      await postFormData('/api/talent-combined', fd)
      setSubmitted(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <PageShell title="Nomination Submitted" subtitle="Thank you for nominating!">
        <div className="max-w-xl rounded-2xl border border-[#5BCB2B]/30 bg-[#e8f9de] p-8 text-center">
          <p className="font-display text-lg font-bold text-slate-900">
            🌟 {form.nominationType === 'team' ? 'Team nomination' : <span style={{ color: '#0197B2' }}>{form.studentName}</span>} has been submitted for Special Talent Utsav!
          </p>
          <p className="mt-3 text-sm text-slate-500">
            We'll review the submission and get back to you at the provided contact.
          </p>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell
      title="Special Talent Utsav – Organization & Nomination"
      subtitle="Register your organization and nominate talented students or teams."
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
          <Field label="Contact Person Name" value={form.contactName} onChange={set('contactName')} required />
          <Field label="Contact Designation" value={form.contactDesignation} onChange={set('contactDesignation')} placeholder="e.g., Principal, Director, Manager" />
          <Field label="Contact Email" type="email" value={form.contactEmail} onChange={set('contactEmail')} required />
          <Field label="Contact Phone" type="tel" value={form.contactPhone} onChange={set('contactPhone')} required pattern="\d{10}" maxLength={10} title="Enter exactly 10 digits" />
          <div className="sm:col-span-2">
            <Field label="Organization Address" value={form.orgAddress} onChange={set('orgAddress')} />
          </div>
          <Field label="City" value={form.orgCity} onChange={set('orgCity')} required />
          <Field label="State" value={form.orgState} onChange={set('orgState')} required />
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
              onChange={set('orgDisabilityFocus')}
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
        </Section>

        {/* Nomination Type */}
        <Section title="Nomination Type">
          <div className="sm:col-span-2">
            <label className="mb-3 block text-xs font-bold uppercase tracking-widest" style={{ color: '#0197B2' }}>
              What would you like to nominate? <span className="text-red-500">*</span>
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
                  <p className="text-xs text-slate-500">Nominate one talented student</p>
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
                />
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest" style={{ color: '#0197B2' }}>
                    Accompanying Person Phone <span className="text-red-500">*</span>
                    {index === 0 && (
                      <span className="ml-2 text-xs font-normal text-slate-500 lowercase">(will auto-populate for all members)</span>
                    )}
                  </label>
                  <input
                    type="tel"
                    required
                    value={member.guardianPhone}
                    onChange={(e) => {
                      // Only allow digits
                      e.target.value = e.target.value.replace(/\D/g, '')
                      handleGuardianPhoneChange(index, e.target.value)
                    }}
                    onKeyPress={(e) => {
                      if (!/\d/.test(e.key)) {
                        e.preventDefault()
                      }
                    }}
                    pattern="\d{10}"
                    maxLength={10}
                    title="Enter exactly 10 digits"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2"
                    placeholder={index === 0 ? "Enter phone number" : "Auto-filled or enter different number"}
                  />
                  {index === 0 && (
                    <p className="mt-1 text-xs text-slate-500">
                      This phone number will be copied to all team members. You can change individual numbers if needed.
                    </p>
                  )}
                  {index > 0 && (
                    <p className="mt-1 text-xs text-slate-500">
                      Same as team leader's number. Change if different person will accompany.
                    </p>
                  )}
                </div>
                <Field
                  label="Accompanying Person Email"
                  type="email"
                  value={member.guardianEmail}
                  onChange={(e) => updateTeamMember(index, 'guardianEmail', e.target.value)}
                />
              </Section>
            ))}
          </div>
        )}

        {/* Talent Category */}
        {(form.nominationType === 'individual' || form.nominationType === 'team') && (
          <Section title="Talent Details">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest" style={{ color: '#0197B2' }}>
                Talent Category <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={form.talentCategory}
                onChange={set('talentCategory')}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2"
              >
                <option value="">Select talent category</option>
                {TALENT_CATEGORIES.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            {form.talentCategory === 'Other' && (
              <Field label="Enter Talent Category" value={form.talentCategoryOther} onChange={set('talentCategoryOther')} required />
            )}
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

        {/* Video Upload */}
        <div>
          <h2 className="mb-4 font-display text-base font-bold text-slate-800 border-b border-slate-100 pb-2">
            Performance Video Upload <span className="text-red-500 text-sm font-normal">* Required</span>
          </h2>
          <p className="mb-3 text-xs text-slate-500">Upload a performance video (max 3 minutes). Accepted formats: MP4, MOV, AVI, WEBM.</p>
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center transition hover:border-[#0197B2]/50 hover:bg-slate-100">
            <span className="text-3xl">🎬</span>
            <span className="text-sm font-medium text-slate-600">
              {videoFile ? videoFile.name : 'Click to upload performance video'}
            </span>
            <span className="text-xs text-slate-400">MP4, MOV, AVI, WEBM — max 200 MB (~3 mins)</span>
            <input
              type="file"
              accept="video/mp4,video/quicktime,video/x-msvideo,video/webm,video/x-matroska"
              className="hidden"
              onChange={(e) => setVideoFile(e.target.files[0] || null)}
            />
          </label>
          {videoFile && (
            <div className="mt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setVideoFile(null)}
                className="text-xs text-red-500 hover:underline"
              >
                Remove video
              </button>
              {videoFile.size >= 5 * 1024 * 1024 && (
                <span className="text-xs text-slate-400">
                  {(videoFile.size / (1024 * 1024)).toFixed(1)} MB — will be compressed before upload
                </span>
              )}
            </div>
          )}
          {compressProgress !== null && (
            <div className="mt-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold" style={{ color: '#0197B2' }}>Compressing video…</span>
                <span className="text-xs text-slate-500">{compressProgress}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${compressProgress}%`, background: 'linear-gradient(90deg, #0197B2, #5BCB2B)' }}
                />
              </div>
            </div>
          )}
          
          <div className="mt-4">
            <label className="mb-2 block text-sm font-medium text-slate-600">
              Performance URL <span className="text-slate-400 font-normal text-xs">(Optional)</span>
            </label>
            <input
              type="url"
              placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
              value={performanceUrl}
              onChange={(e) => setPerformanceUrl(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:border-[#0197B2] focus:ring-1 focus:ring-[#0197B2] focus:outline-none"
            />
            <p className="mt-1 text-xs text-slate-500">Link to online performance video (YouTube, Vimeo, etc.)</p>
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

        <button
          type="submit"
          disabled={loading || !declared || !videoFile || !form.nominationType}
          style={{ backgroundColor: '#0197B2' }}
          className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:opacity-90 hover:scale-[1.03] active:scale-[0.98] disabled:opacity-60"
        >
          {loading ? 'Submitting…' : 'Submit Registration & Nomination'}
        </button>
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


