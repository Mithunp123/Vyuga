import { useRef, useState } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { X, Loader2, CheckCircle } from 'lucide-react'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// Sponsorship benefits data
const sponsorshipTiers = [
  {
    name: 'PLATINUM',
    price: '₹ 10,00,000',
    color: 'from-yellow-400 to-yellow-600',
    textColor: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    benefits: [
      { name: 'Powered by [Sponsor Name]', included: true },
      { name: 'Logo on stage, banners & creatives', included: true },
      { name: 'Opening keynote opportunity', included: true },
      { name: 'Branding on Innovation Fest & Blind Cricket', included: true },
      { name: 'Logo on jerseys', included: true, note: 'Front' },
      { name: 'Logo on Trophies', included: true },
      { name: 'Press, media & social promotion', included: true },
      { name: 'Logo on website & registration', included: true },
    ]
  },
  {
    name: 'GOLD',
    price: '₹ 5,00,000',
    color: 'from-amber-400 to-amber-600',
    textColor: 'text-amber-600',
    bgColor: 'bg-amber-50',
    benefits: [
      { name: 'Powered by [Sponsor Name]', included: false },
      { name: 'Logo on stage, banners & creatives', included: true },
      { name: 'Opening keynote opportunity', included: false },
      { name: 'Branding on Innovation Fest & Blind Cricket', included: true },
      { name: 'Logo on jerseys', included: true, note: 'Side' },
      { name: 'Logo on Trophies', included: false },
      { name: 'Press, media & social promotion', included: true },
      { name: 'Logo on website & registration', included: true },
    ]
  },
  {
    name: 'SILVER',
    price: '₹ 3,00,000',
    color: 'from-gray-400 to-gray-600',
    textColor: 'text-gray-600',
    bgColor: 'bg-gray-50',
    benefits: [
      { name: 'Powered by [Sponsor Name]', included: false },
      { name: 'Logo on stage, banners & creatives', included: true },
      { name: 'Opening keynote opportunity', included: false },
      { name: 'Branding on Innovation Fest & Blind Cricket', included: true },
      { name: 'Logo on jerseys', included: false },
      { name: 'Logo on Trophies', included: false },
      { name: 'Press, media & social promotion', included: true },
      { name: 'Logo on website & registration', included: true },
    ]
  }
]

export default function SponsorsPage() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.1 })
  const [modalOpen, setModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
    orgName: '',
    sponsorType: 'GOLD',
    amount: '',
    website: '',
    logo: null
  })

  const handleChange = (e) => {
    if (e.target.name === 'logo') {
      setFormData(prev => ({ ...prev, logo: e.target.files[0] }))
    } else {
      setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    const data = new FormData()
    data.append('name', formData.name)
    data.append('phone', formData.phone)
    data.append('email', formData.email)
    data.append('message', formData.message)
    data.append('orgName', formData.orgName)
    data.append('sponsorType', formData.sponsorType)
    data.append('amount', formData.amount)
    if (formData.website) data.append('website', formData.website)
    if (formData.logo) data.append('logo', formData.logo)

    try {
      const res = await fetch(`${API_BASE}/api/sponsors`, {
        method: 'POST',
        // headers: { 'Content-Type': 'application/json' }, // Remove content-type for FormData
        body: data
      })
      const result = await res.json()
      if (result.success) {
        setSuccess(true)
        setFormData({ name: '', phone: '', email: '', message: '', orgName: '', sponsorType: 'GOLD', amount: '', website: '', logo: null })
        setTimeout(() => {
          setSuccess(false)
          setModalOpen(false)
        }, 2000)
      } else {
        setError(result.message || 'Failed to submit')
      }
    } catch(err) {
      console.error(err)
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />

      {/* Hero — compact */}
      <section className="relative overflow-hidden pt-24 pb-8 sm:pt-28 sm:pb-10">
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[300px] w-[600px] rounded-full bg-brand-cyan/[0.06] blur-[120px]" />
        
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="font-hero text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
              Sponsorship{' '}
            </span>
            <span className="font-marker text-4xl gradient-text sm:text-5xl">
              Benefits
            </span>
          </motion.div>
        </div>
      </section>

      {/* Sponsorship Benefits Table */}
      <section ref={ref} className="relative overflow-hidden px-4 pb-12 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden rounded-2xl bg-white shadow-xl border border-slate-200"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200">
                    <th className="p-4 text-sm font-bold text-slate-500 uppercase tracking-wider w-1/3">Benefit</th>
                    {sponsorshipTiers.map((tier) => (
                      <th key={tier.name} className="p-4 text-center w-1/5 align-bottom">
                        <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold text-white mb-2 bg-gradient-to-r ${tier.color}`}>
                          {tier.name}
                        </div>
                        <div className={`text-xl font-bold ${tier.textColor}`}>
                          {tier.price}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sponsorshipTiers[0].benefits.map((benefit, idx) => (
                    <motion.tr
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.05, duration: 0.4 }}
                      className="hover:bg-slate-50/60 transition-colors group"
                    >
                      <td className="p-3 pl-6 text-sm font-medium text-slate-700 group-hover:text-slate-900">
                        {benefit.name}
                      </td>
                      {sponsorshipTiers.map((tier, tIdx) => {
                        const item = tier.benefits[idx]
                        return (
                          <td key={tIdx} className="p-3 text-center align-middle">
                            {item.included ? (
                              <motion.div 
                                initial={{ scale: 0 }}
                                whileInView={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 200, delay: 0.1 + (idx * 0.05) }}
                                className="flex flex-col items-center justify-center"
                              >
                                <div className={`flex items-center justify-center w-6 h-6 rounded-full ${tier.bgColor} text-green-600`}>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                                {item.note && (
                                  <span className="mt-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                                    {item.note}
                                  </span>
                                )}
                              </motion.div>
                            ) : (
                              <span className="block w-1.5 h-1.5 mx-auto rounded-full bg-slate-200" />
                            )}
                          </td>
                        )
                      })}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
        
        <div className="mt-8 text-center">
             <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-brand-cyan/20 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-cyan/30"
            >
              Become a Sponsor
            </button>
        </div>
      </section>

      <Footer />

      {/* ── Sponsor Form Modal ── */}
      <AnimatePresence>
        {modalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm"
              // onClick={() => setModalOpen(false)} // Moved click handler to wrapper
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-[70] overflow-y-auto"
              onClick={() => setModalOpen(false)}
            >
              <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                <div 
                  className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 w-full max-w-lg"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Close button */}
                  <button 
                    onClick={() => setModalOpen(false)}
                    className="absolute right-4 top-4 z-10 p-2 text-slate-400 hover:text-slate-600 bg-white/80 backdrop-blur-sm rounded-full"
                  >
                    <X className="h-5 w-5" />
                  </button>

                  <div className="p-6 sm:p-8">
                  <div className="mb-6 text-center">
                    <h3 className="font-display text-2xl font-bold text-slate-900">Become a Sponsor</h3>
                    <p className="mt-2 text-sm text-slate-600">
                      Fill out the form below and our team will get back to you shortly.
                    </p>
                  </div>

                  {success ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="mb-4 rounded-full bg-green-100 p-3 text-green-600">
                        <CheckCircle className="h-8 w-8" />
                      </div>
                      <h4 className="text-lg font-bold text-slate-900">Thank You!</h4>
                      <p className="text-slate-600">We have received your interest.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Organization Name <span className="text-red-500">*</span></label>
                        <input
                          required
                          type="text"
                          name="orgName"
                          value={formData.orgName}
                          onChange={handleChange}
                          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan"
                          placeholder="Your Organization"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="mb-1 block text-sm font-medium text-slate-700">Sponsor Type <span className="text-red-500">*</span></label>
                          <select
                            name="sponsorType"
                            value={formData.sponsorType}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan bg-white"
                          >
                            <option value="PLATINUM">Platinum</option>
                            <option value="GOLD">Gold</option>
                            <option value="SILVER">Silver</option>
                            <option value="OTHER">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="mb-1 block text-sm font-medium text-slate-700">Amount (₹) <span className="text-red-500">*</span></label>
                          <input
                            required
                            type="number"
                            name="amount"
                            value={formData.amount}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan"
                            placeholder="500000"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Organization Logo <span className="text-red-500">*</span></label>
                        <input
                          required
                          type="file"
                          name="logo"
                          accept="image/*"
                          onChange={handleChange}
                          className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none file:mr-4 file:rounded-full file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-700 hover:file:bg-slate-200"
                        />
                        <p className="mt-1 text-xs text-slate-500">Upload high-quality PNG, JPG or WEBP.</p>
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Website URL (Optional)</label>
                        <input
                          type="url"
                          name="website"
                          value={formData.website}
                          onChange={handleChange}
                          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan"
                          placeholder="https://example.com"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Contact Person Name <span className="text-red-500">*</span></label>
                        <input
                          required
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan"
                          placeholder="Your Name"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="mb-1 block text-sm font-medium text-slate-700">Phone Number <span className="text-red-500">*</span></label>
                          <input
                            required
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan"
                            placeholder="+91 XXXXX XXXXX"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-sm font-medium text-slate-700">Email Address <span className="text-red-500">*</span></label>
                          <input
                            required
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan"
                            placeholder="you@company.com"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Message (Optional)</label>
                        <textarea
                          rows={3}
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan"
                          placeholder="Tell us about your interest..."
                        />
                      </div>

                      {error && (
                        <p className="text-center text-xs font-medium text-red-500">{error}</p>
                      )}

                      <button
                        type="submit"
                        disabled={loading}
                        className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-slate-900/20 transition-transform active:scale-95 disabled:opacity-70"
                      >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit Interest'}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

