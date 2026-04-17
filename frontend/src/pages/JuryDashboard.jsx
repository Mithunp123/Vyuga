import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, ClipboardList, CheckCircle, ChevronRight, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import logoImg from '../assets/logo.png'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function JuryDashboard() {
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedReg, setSelectedReg] = useState(null)
  const [score, setScore] = useState('')
  const [comments, setComments] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const navigate = useNavigate()
  const token = localStorage.getItem('juryToken')
  const username = localStorage.getItem('juryUsername')
  const name = localStorage.getItem('juryName')
  const designation = localStorage.getItem('juryDesignation')
  const organization = localStorage.getItem('juryOrganization')

  useEffect(() => {
    if (!token) {
      navigate('/jury-login')
      return
    }
    fetchRegistrations()
  }, [token])

  const fetchRegistrations = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/api/jury/registrations`, {
        headers: { 'x-jury-token': token }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to fetch')
      setRegistrations(data.data || [])
    } catch (err) {
      if (err.message.includes('Unauthorized')) {
        handleLogout()
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const [regStatus, setRegStatus] = useState('')
  const [savingStatus, setSavingStatus] = useState(false)

  const [evalFilter, setEvalFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const handleLogout = () => {
    localStorage.removeItem('juryToken')
    localStorage.removeItem('juryUsername')
    localStorage.removeItem('juryName')
    localStorage.removeItem('juryPhone')
    localStorage.removeItem('juryOrganization')
    localStorage.removeItem('juryDesignation')
    navigate('/jury-login')
  }

  const openEvaluation = (reg) => {
    setSelectedReg(reg)
    setRegStatus(reg.registration.status || 'pending')
    if (reg.evaluation) {
      setScore(reg.evaluation.score)
      setComments(reg.evaluation.comments || '')
    } else {
      setScore('')
      setComments('')
    }
  }

  const closeEvaluation = () => {
    setSelectedReg(null)
    setScore('')
    setComments('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!score) return

    setSubmitting(true)
    try {
      const res = await fetch(`${API_BASE}/api/jury/evaluate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-jury-token': token
        },
        body: JSON.stringify({
          eventType: selectedReg.event_type,
          registrationId: selectedReg.registration.id,
          score: parseInt(score, 10),
          comments
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      
      alert('✅ Evaluation Saved Successfully')
      
      // Update local state
      const updated = registrations.map(r => {
        if (r.registration.id === selectedReg.registration.id) {
          return { ...r, evaluation: { score: parseInt(score, 10), comments } }
        }
        return r
      })
      setRegistrations(updated)
      closeEvaluation()
    } catch (err) {
      alert('❌ ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateStatus = async () => {
    setSavingStatus(true)
    try {
      const res = await fetch(`${API_BASE}/api/jury/status/${selectedReg.event_type}/${selectedReg.registration.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-jury-token': token
        },
        body: JSON.stringify({ status: regStatus })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      
      alert('✅ Status Updated Successfully')
      const updated = registrations.map(r => {
        if (r.registration.id === selectedReg.registration.id) {
          return { ...r, registration: { ...r.registration, status: regStatus } }
        }
        return r
      })
      setRegistrations(updated)
      
      // Update selectedReg too so UI is instantly fresh
      setSelectedReg(prev => ({
        ...prev,
        registration: { ...prev.registration, status: regStatus }
      }))

    } catch (err) {
      alert('❌ ' + err.message)
    } finally {
      setSavingStatus(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#0197B2] border-t-transparent"></div>
      </div>
    )
  }

  const totalAssigned = registrations.length
  const evaluatedCount = registrations.filter(r => r.evaluation !== null).length

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <img src={logoImg} alt="Vyuga" className="h-8 object-contain" />
            <div className="h-6 w-px bg-slate-200"></div>
            <h1 className="text-lg font-bold text-slate-800">Jury Dashboard</h1>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
              <span className="font-semibold text-slate-800">{name || username}</span>
              {(designation || organization) && (
                <span className="text-xs text-slate-500 border-l border-slate-300 pl-2 ml-1">
                  {designation}{designation && organization ? ' @ ' : ''}{organization}
                </span>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 px-3 py-2 text-sm font-medium transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500 mb-1">Total Assigned</p>
            <p className="text-3xl font-bold text-slate-800">{totalAssigned}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500 mb-1">Evaluated</p>
            <p className="text-3xl font-bold text-[#5BCB2B]">{evaluatedCount}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500 mb-1">Pending</p>
            <p className="text-3xl font-bold text-[#0197B2]">{totalAssigned - evaluatedCount}</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-red-50 p-4 border border-red-200 text-red-700">
            {error}
          </div>
        )}

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden mb-8">
          <div className="border-b border-slate-200 bg-slate-50/50 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-slate-400" />
              Registrations List
            </h2>
            
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={evalFilter}
                onChange={e => setEvalFilter(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-[#0197B2]"
              >
                <option value="all">All Evaluations</option>
                <option value="evaluated">Evaluated Only</option>
                <option value="pending">Yet to Evaluate</option>
              </select>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-[#0197B2]"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Status: Pending</option>
                <option value="selected">Status: Selected</option>
                <option value="waitlist">Status: Waitlist</option>
                <option value="rejected">Status: Rejected</option>
              </select>
            </div>
          </div>
          
          {(() => {
            const filteredRegistrations = registrations.filter(item => {
              if (evalFilter === 'evaluated' && !item.evaluation) return false
              if (evalFilter === 'pending' && item.evaluation) return false

              const status = item.registration.status || 'pending'
              if (statusFilter !== 'all' && status !== statusFilter) return false

              return true
            })

            return filteredRegistrations.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                No matching registrations found.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredRegistrations.map((item, idx) => {
                const reg = item.registration
                const isEval = !!item.evaluation
                // Create a title logic based on event type
                const title = reg.team_name || reg.student_name || reg.film_title || reg.name || reg.full_name || reg.participant_name || `Registration #${idx + 1}`
                const subtitle = item.event_label
                
                return (
                  <div key={reg.id} className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 hover:bg-slate-50 transition-colors gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                        <h3 className="text-base font-bold text-slate-800 truncate">{title}</h3>
                        <span className="inline-flex w-fit items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-100">
                          {subtitle}
                        </span>
                        {isEval && (
                          <span className="inline-flex items-center gap-1 w-fit rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-100">
                            <CheckCircle className="h-3.5 w-3.5" /> Evaluated 
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500">
                        {reg.college_name && <span>{reg.college_name}</span>}
                        {reg.theme && <span>Theme: {reg.theme}</span>}
                        <span>ID: {reg.id.substring(0,8)}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => openEvaluation(item)}
                      className={`flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition sm:w-auto w-full ${
                        isEval 
                          ? 'border-2 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100'
                          : 'bg-[#0197B2] text-white hover:bg-[#017a94] shadow-md hover:shadow-lg'
                      }`}
                    >
                      {isEval ? 'Edit Evaluation' : 'Evaluate'}
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )
              })}
            </div>
          )
        })()}
        </div>
      </main>

      {/* Evaluation Modal */}
      <AnimatePresence>
        {selectedReg && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={closeEvaluation}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-3xl bg-white shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Review Submission</h2>
                  <p className="text-sm text-slate-500">{selectedReg.event_label}</p>
                </div>
                <button onClick={closeEvaluation} className="rounded-full p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 flex flex-col md:flex-row gap-6">
                
                {/* Details Column */}
                <div className="flex-1 space-y-6">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Submission Details</h3>
                    
                    {/* Explicit Media & Links section */}
                    {(selectedReg.registration.prototype_url || selectedReg.registration.performance_url || selectedReg.registration.film_url || selectedReg.registration.video_file_path || selectedReg.registration.prototype_image_path || selectedReg.registration.udid_card_path) && (
                      <div className="rounded-xl border border-[#0197B2]/20 bg-[#0197B2]/5 p-4 space-y-3 mb-4">
                        <h4 className="text-[10px] uppercase font-bold text-[#0197B2] mb-2 tracking-widest">Important Media Links</h4>
                        <div className="flex flex-col gap-2">
                          {[
                            { label: 'Prototype URL',  val: selectedReg.registration.prototype_url },
                            { label: 'Performance',    val: selectedReg.registration.performance_url },
                            { label: 'Short Film URL', val: selectedReg.registration.film_url }
                          ].map(link => 
                            link.val && (
                              <a key={link.label} href={link.val.startsWith('http') ? link.val : `https://${link.val}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-[#0197B2] w-fit px-4 py-2 rounded-lg hover:bg-[#017a94] transition-colors">
                                {link.label} ↗
                              </a>
                            )
                          )}

                          {[
                            { label: 'Video File',            val: selectedReg.registration.video_file_path },
                            { label: 'Prototype Image',       val: selectedReg.registration.prototype_image_path },
                            { label: 'Disability Cert (UID)', val: selectedReg.registration.udid_card_path }
                          ].map(file => {
                            if (!file.val) return null
                            const isExternalUrl = file.val.startsWith('http://') || file.val.startsWith('https://')
                            const hrefAttr = isExternalUrl ? file.val : `${API_BASE}/uploads/${file.val.replace(/^.*[\\\/]/, '')}`
                            
                            return (
                              <a key={file.label} href={hrefAttr} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 w-fit px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors">
                                {isExternalUrl ? 'Open' : 'View'} {file.label} ↗
                              </a>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-3">
                        {Object.entries(selectedReg.registration).map(([k, v]) => {
                         // Hide all payment related fields, internal fields, and anything we already distinctively render
                         if (k.toLowerCase().includes('payment') || k.toLowerCase().includes('transaction') || k.toLowerCase().includes('amount') || k.toLowerCase().includes('order_id')) return null
                         if (['id', 'created_at', 'updated_at', 'status', 'admin_note', 'email_sent'].includes(k)) return null
                         if (['prototype_url', 'performance_url', 'film_url', 'video_file_path', 'prototype_image_path', 'udid_card_path'].includes(k)) return null

                         // Hide contact info for Blind Jury mode
                         if (k.toLowerCase().includes('email') || k.toLowerCase().includes('phone') || k.toLowerCase().includes('contact')) return null

                         if (typeof v === 'object' || v === null || v === '') return null
                         
                         const isLink = String(v).startsWith('http')
                         const isFile = String(v).match(/\.(pdf|doc|png|jpg|mp4)($|\?)/i)
                         
                         return (
                           <div key={k}>
                             <span className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">{k.replace(/_/g, ' ')}</span>
                             {isLink ? (
                               <a href={v} target="_blank" rel="noreferrer" className="text-[#0197B2] font-semibold text-sm hover:underline break-all">Open Link ↗</a>
                             ) : isFile ? (
                               <a href={`${API_BASE}/uploads/${v}`} target="_blank" rel="noreferrer" className="text-[#0197B2] font-semibold text-sm hover:underline break-all">View File ↗</a>
                             ) : (
                               <span className="text-sm font-medium text-slate-800">{String(v)}</span>
                             )}
                           </div>
                         )
                       })}
                    </div>
                  </div>
                </div>

                {/* Score & Feedback Column */}
                <div className="w-full md:w-80 flex-shrink-0 border-l border-slate-100 pl-0 md:pl-6 space-y-6">
                  
                  {/* Status update block */}
                  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Registration Status</label>
                    <div className="flex items-center gap-2">
                      <select 
                        value={regStatus} 
                        onChange={(e) => setRegStatus(e.target.value)} 
                        className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-[#0197B2]"
                      >
                        <option value="pending">Pending</option>
                        <option value="selected">Selected</option>
                        <option value="waitlist">Waitlist</option>
                        <option value="rejected">Rejected</option>
                      </select>
                      <button 
                        onClick={handleUpdateStatus} 
                        disabled={savingStatus || regStatus === selectedReg.registration.status}
                        className="rounded-lg bg-[#0197B2] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#017a94] disabled:opacity-50"
                      >
                        {savingStatus ? '...' : 'Update'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Evaluation</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Score (out of 100)</label>
                        <input
                          type="number"
                          required
                          min="0"
                          max="100"
                          value={score}
                          onChange={e => setScore(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-lg font-bold text-slate-800 outline-none focus:border-[#0197B2] focus:ring-1 focus:ring-[#0197B2] transition shadow-inner"
                          placeholder="0 - 100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Feedback & Comments</label>
                        <textarea
                          rows={5}
                          value={comments}
                          onChange={e => setComments(e.target.value)}
                          className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-[#0197B2] focus:ring-1 focus:ring-[#0197B2] transition"
                          placeholder="Write your feedback..."
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full rounded-xl py-3 px-4 text-sm font-bold text-white shadow-md hover:shadow-lg transition disabled:opacity-50"
                        style={{ background: 'linear-gradient(90deg, #0197B2, #5BCB2B)' }}
                      >
                        {submitting ? 'Saving...' : 'Submit Evaluation'}
                      </button>
                    </form>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
