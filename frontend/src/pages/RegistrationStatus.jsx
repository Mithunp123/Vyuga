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

        <div className="bg-slate-50 border-t border-slate-100 px-8 py-4 text-center">
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
