import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, CheckCircle, Clock, XCircle, FileText, ExternalLink, Phone } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const STATUS_CFG = {
  selected: { label: 'Selected ✓', color: '#16a34a', bg: '#f0fdf4' },
  approved: { label: 'Approved ✓', color: '#16a34a', bg: '#f0fdf4' },
  waitlist: { label: 'Waitlisted', color: '#0284c7', bg: '#f0f9ff' },
  rejected: { label: 'Rejected', color: '#dc2626', bg: '#fef2f2' },
  pending:  { label: 'Under Review', color: '#d97706', bg: '#fffbeb' },
}

const PAY_CFG = {
  paid:    { label: 'Paid', color: '#16a34a', bg: '#f0fdf4' },
  pending: { label: 'Pending', color: '#d97706', bg: '#fffbeb' },
  created: { label: 'Awaiting Payment', color: '#0197B2', bg: '#e0f6fa' },
  failed:  { label: 'Failed', color: '#dc2626', bg: '#fef2f2' },
}

function StatusBadge({ value, cfg }) {
  const c = cfg[value] || cfg.pending
  return (
    <span
      className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold"
      style={{ color: c.color, background: c.bg }}
    >
      {c.label}
    </span>
  )
}

export default function ApplicationStatusModal({ eventType, label }) {
  const [open, setOpen] = useState(false)
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState('')

  const handleSearch = async (e) => {
    if (e && e.preventDefault) e.preventDefault()
    if (!/^\d{10}$/.test(phone)) {
      setError('Please enter exactly 10 digits.')
      return
    }
    setLoading(true)
    setError('')
    setResults(null)
    try {
      const res = await fetch(
        `${API_BASE}/api/my-registration?phone=${encodeURIComponent(phone)}&eventType=${encodeURIComponent(eventType)}`
      )
      const json = await res.json()
      if (!json.success) {
        setError(json.message || 'No registration found.')
      } else {
        setResults(json.data)
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setPhone('')
    setResults(null)
    setError('')
  }

  return (
    <div className="w-full flex justify-start mt-2">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => { setOpen(true); reset() }}
        className="inline-flex items-center gap-1.5 rounded-full border border-[#0197B2]/30 bg-transparent px-3 py-1.5 text-[11px] font-medium text-[#0197B2] transition hover:bg-[#0197B2]/5"
      >
        <Search className="h-3 w-3" />
        Check Application Status
      </button>

      {/* Modal overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}
          >
            <motion.div
              className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden"
              initial={{ scale: 0.92, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.94, y: 20, opacity: 0 }}
              transition={{ type: 'spring', damping: 22, stiffness: 280 }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-6 py-4 bg-[#0197B2]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">
                      Application Status
                    </p>
                    <p className="text-sm font-bold text-white leading-tight">{label}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); setOpen(false); }}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/30"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5 text-left">
                <p className="text-sm text-slate-500">
                  Enter the phone number you used during registration to check your application status.
                </p>

                {/* Search form */}
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleSearch()
                        }
                      }}
                      placeholder="10-digit phone number"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-2.5 text-sm text-slate-800 focus:border-[#0197B2] focus:outline-none focus:ring-2 focus:ring-[#0197B2]/20"
                      maxLength={10}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSearch}
                    disabled={loading || phone.length !== 10}
                    className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition disabled:opacity-60 bg-[#0197B2]"
                  >
                    {loading ? (
                      <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                    Search
                  </button>
                </div>

                {/* Error */}
                {error && (
                  <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                    <XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                    <p className="text-sm text-red-700 font-medium">{error}</p>
                  </div>
                )}

                {/* Results */}
                {results && results.length > 0 && (
                  <div className="space-y-4">
                    {results.map((reg, i) => (
                      <motion.div
                        key={reg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5 shadow-sm"
                      >
                        {/* Name & date */}
                        <div className="flex items-start justify-between gap-3 mb-4">
                          <div>
                            <p className="font-bold text-slate-900 text-base leading-tight">{reg.name}</p>
                            {reg.submittedAt && (
                              <p className="text-xs text-slate-400 mt-0.5">
                                Submitted: {new Date(reg.submittedAt).toLocaleDateString('en-IN', {
                                  day: 'numeric', month: 'short', year: 'numeric',
                                })}
                              </p>
                            )}
                          </div>
                          {results.length > 1 && (
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                              #{i + 1}
                            </span>
                          )}
                        </div>

                        {/* Status badges */}
                        <div className="flex flex-wrap gap-3 mb-4">
                          <div>
                            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Application</p>
                            <StatusBadge value={reg.applicationStatus} cfg={STATUS_CFG} />
                          </div>
                          {reg.applicationStatus !== 'pending' && (
                            <div>
                              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Payment</p>
                              <StatusBadge value={reg.paymentStatus} cfg={PAY_CFG} />
                            </div>
                          )}
                          {reg.payment?.invoiceNumber && (
                            <div>
                              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Receipt No.</p>
                              <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold bg-slate-100 text-slate-700 font-mono">
                                {reg.payment.invoiceNumber}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Admin note */}
                        {reg.adminNote && (
                          <div className="mb-4 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600 mb-1">Note from Admin</p>
                            <p className="text-sm text-amber-800">{reg.adminNote}</p>
                          </div>
                        )}

                        {/* Invoice link */}
                        {reg.payment?.invoiceLink ? (
                          <a
                            href={reg.payment.invoiceLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white transition hover:shadow-lg hover:scale-[1.02] bg-[#0197B2]"
                          >
                            <ExternalLink className="h-4 w-4" />
                            View / Pay Invoice
                          </a>
                        ) : reg.paymentStatus !== 'paid' && reg.applicationStatus !== 'pending' && (
                          <div className="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5">
                            <Clock className="h-4 w-4 text-slate-400" />
                            <p className="text-xs text-slate-500 font-medium">Invoice link not available yet.</p>
                          </div>
                        )}

                        {reg.paymentStatus === 'paid' && (
                          <div className="flex items-center gap-2 mt-3">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <p className="text-sm font-semibold text-green-700">
                              Payment complete — ₹{((reg.payment?.amount || 0) / 100).toFixed(2)}
                            </p>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
