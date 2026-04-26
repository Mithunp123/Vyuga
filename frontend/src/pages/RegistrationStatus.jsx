import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, AlertCircle, Loader2, Clock, XCircle, Calendar, User } from 'lucide-react'

export default function RegistrationStatus() {
  const { eventType, id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

  useEffect(() => {
    async function fetchStatus() {
      try {
        setLoading(true)
        const res = await fetch(`${API_BASE}/api/status/${eventType}/${id}`)
        const json = await res.json()
        
        if (!res.ok || !json.success) {
          throw new Error(json.message || 'Failed to fetch registration data')
        }
        
        setData(json.data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    
    fetchStatus()
  }, [eventType, id, API_BASE])

  const getStatusConfig = (status) => {
    switch (status) {
      case 'selected':
      case 'confirmed':
        return {
          icon: <CheckCircle className="h-16 w-16 text-[#5BCB2B]" strokeWidth={1.5} />,
          title: 'Application Selected',
          color: 'text-[#5BCB2B]',
          bg: 'bg-green-50',
          border: 'border-green-200'
        }
      case 'rejected':
        return {
          icon: <XCircle className="h-16 w-16 text-rose-500" strokeWidth={1.5} />,
          title: 'Application Not Shortlisted',
          color: 'text-rose-500',
          bg: 'bg-rose-50',
          border: 'border-rose-200'
        }
      case 'pending':
      default:
        return {
          icon: <Clock className="h-16 w-16 text-amber-500" strokeWidth={1.5} />,
          title: 'Application Pending Review',
          color: 'text-amber-500',
          bg: 'bg-amber-50',
          border: 'border-amber-200'
        }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50 flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-slate-100 overflow-hidden"
      >
        <div className="h-2 bg-gradient-to-r from-[#0197B2] to-[#5BCB2B]" />

        <div className="p-8 sm:p-10">
          {loading ? (
            <div className="text-center py-10">
              <Loader2 className="mx-auto h-12 w-12 text-[#0197B2] animate-spin mb-4" />
              <p className="text-slate-500 font-medium">Loading your application details...</p>
            </div>
          ) : error ? (
            <div className="text-center py-6">
              <AlertCircle className="mx-auto h-16 w-16 text-rose-500 mb-6" strokeWidth={1.5} />
              <h1 className="text-2xl font-extrabold text-slate-800 mb-3">Oops!</h1>
              <p className="text-slate-500 text-sm mb-8">{error}</p>
              <button
                onClick={() => navigate('/')}
                className="rounded-full bg-[#0197B2] px-8 py-3 font-bold text-white shadow-md hover:bg-[#01788e] transition-all"
              >
                Back to Home
              </button>
            </div>
          ) : data ? (
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
                className="flex justify-center mb-6"
              >
                {getStatusConfig(data.status).icon}
              </motion.div>
              
              <h1 className={`text-2xl sm:text-3xl font-extrabold mb-3 ${getStatusConfig(data.status).color}`}>
                {getStatusConfig(data.status).title}
              </h1>
              <p className="text-slate-500 text-sm mb-8">
                Here are the details for your registration.
              </p>

              <div className="text-left space-y-4 mb-8">
                <div className="rounded-2xl bg-slate-50 border border-slate-100 p-5 space-y-4">
                  
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Applicant / Team Name</p>
                      <p className="font-medium text-slate-800 mt-1">{data.name}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Event Name</p>
                      <p className="font-medium text-slate-800 mt-1">{data.eventName}</p>
                    </div>
                  </div>

                  {data.adminNote && (
                    <div className={`p-4 rounded-xl border ${getStatusConfig(data.status).border} ${getStatusConfig(data.status).bg} mt-4`}>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Admin Note</p>
                      <p className="text-sm text-slate-700 italic">"{data.adminNote}"</p>
                    </div>
                  )}
                  
                  {data.submittedAt && (
                    <div className="pt-2 border-t border-slate-200">
                      <p className="text-xs text-slate-400 text-center">
                        Submitted on {new Date(data.submittedAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'long', year: 'numeric'
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => navigate('/')}
                className="rounded-full w-full bg-gradient-to-r from-[#0197B2] to-[#5BCB2B] px-8 py-3 font-bold text-white shadow-md hover:opacity-90 transition-all hover:scale-105"
              >
                Back to Home
              </button>
            </div>
          ) : null}
        </div>

        <div className="bg-slate-50 border-t border-slate-100 px-8 py-6 text-center">
          <p className="text-sm font-medium text-slate-600 mb-3">
            Follow us to get updates
          </p>
          <div className="flex justify-center gap-4 mb-5">
            <a href="https://www.linkedin.com/showcase/vyuga/posts/?feedView=all" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-[#0077b5] transition-colors" aria-label="LinkedIn">
              <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
                <path fill="currentColor" d="M20.447 20.452h-3.554v-5.569c0-1.328-.026-3.036-1.852-3.036-1.853 0-2.136 1.445-2.136 2.939v5.666H9.35V9h3.414v1.561h.046c.477-.9 1.637-1.852 3.37-1.852 3.601 0 4.267 2.37 4.267 5.455v6.288zM5.337 7.433A2.062 2.062 0 0 1 3.27 5.37a2.065 2.065 0 1 1 4.13 0c0 1.138-.924 2.063-2.063 2.063zM6.812 20.452H3.862V9h2.95v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.727v20.545C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.273V1.727C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
            <a href="https://www.instagram.com/vyuga_26/" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-[#E1306C] transition-colors" aria-label="Instagram">
              <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
                <path fill="currentColor" d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9A5.5 5.5 0 0 1 16.5 22h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm9 2h-9A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm6.2-.9a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0Z" />
              </svg>
            </a>
            <a href="https://www.youtube.com/@nexyugainnovations" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-[#FF0000] transition-colors" aria-label="YouTube">
              <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
                <path fill="currentColor" d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.55 9.376.55 9.376.55s7.505 0 9.377-.55a3.016 3.016 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
          </div>
          <div className="w-12 h-px bg-slate-200 mx-auto mb-5"></div>
          <p className="text-xs text-slate-400">
            Have questions? Contact us at{' '}
            <a href="mailto:vyuga@nexyugainnovations.com" className="text-[#0197B2] hover:underline font-medium">
              vyuga@nexyugainnovations.com
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
