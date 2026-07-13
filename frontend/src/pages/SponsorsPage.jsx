import { useRef, useState } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { X, Loader2, CheckCircle } from 'lucide-react'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import chelseaLogo from '../assets/present by/Chelsea.png'
import goodwillLogo from '../assets/present by/Goodwill.png'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// Sponsorship benefits data
const sponsorshipTiers = [
  {
    name: 'PLATINUM',
    price: '₹ 5,00,000',
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
    price: '₹ 3,00,000',
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
    price: '₹ 1,00,000',
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
    sponsorType: 'NULL',
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
        setFormData({ name: '', phone: '', email: '', message: '', orgName: '', sponsorType: 'NULL', amount: '', website: '', logo: null })
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
      <section className="relative overflow-hidden pt-20 pb-4 sm:pt-24 sm:pb-6">
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[300px] w-[600px] rounded-full bg-brand-cyan/[0.06] blur-[120px]" />
        
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="font-hero text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Sponsorship{' '}
            </span>
            <span className="font-marker text-3xl gradient-text sm:text-4xl">
              {/*Benefits*/}
            </span>
          </motion.div>
        </div>
      </section>

      {/* Current Sponsors Section */}
      <section className="relative overflow-hidden px-4 pb-12 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col gap-12 sm:gap-16 items-center">
            
            {/* Platinum Sponsor */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex flex-col items-center"
            >
              <h3 className="font-mono text-sm sm:text-base font-bold tracking-[0.3em] text-yellow-500 uppercase mb-6 text-center">
                Platinum Sponsor
              </h3>
              <div className="group relative perspective-1000">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-yellow-100 flex items-center justify-center h-48 w-72 sm:h-56 sm:w-80">
                  <img src={chelseaLogo} alt="Chelsea" className="max-h-full max-w-full object-contain" />
                </div>
              </div>
            </motion.div>

            {/* Golden Sponsor */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col items-center"
            >
              <h3 className="font-mono text-sm sm:text-base font-bold tracking-[0.3em] text-amber-500 uppercase mb-6 text-center">
                Golden Sponsor
              </h3>
              <div className="group relative perspective-1000">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-400/20 to-amber-600/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-amber-100 flex items-center justify-center h-48 w-72 sm:h-56 sm:w-80">
                  <img src={goodwillLogo} alt="Goodwill" className="max-h-full max-w-full object-contain" />
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Sponsorship Benefits Table 
      <section ref={ref} className="relative overflow-hidden px-4 pb-12 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr>
                    <th className="w-1/3 p-4 sm:p-5 bg-slate-50 border-b border-r border-slate-100 align-bottom">
                      <h3 className="text-lg font-bold text-slate-800">Sponsorship Benefits</h3>
                      <p className="text-xs text-slate-500 mt-1">Compare our sponsorship tiers</p>
                    </th>
                    {sponsorshipTiers.map(tier => (
                      <th key={tier.name} className={`w-[22%] p-4 border-b border-slate-100 text-center relative overflow-hidden ${tier.name !== 'SILVER' ? 'border-r' : ''}`}>
                        <div className={`absolute inset-0 opacity-10 bg-gradient-to-b ${tier.color}`} />
                        <div className="relative z-10">
                          <h4 className={`text-base font-black tracking-widest ${tier.textColor} mb-1`}>{tier.name}</h4>
                          <div className="text-xl font-bold text-slate-900 leading-tight">{tier.price}</div>
                          <div className="mt-4">
                            <button
                              onClick={() => {
                                setFormData(prev => ({ ...prev, sponsorType: tier.name }))
                                setModalOpen(true)
                              }}
                              className={`w-full rounded-xl py-1.5 px-3 text-xs font-bold text-white shadow-sm transition-all hover:-translate-y-1 bg-gradient-to-r ${tier.color}`}
                            >
                              Select {tier.name}
                            </button>
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sponsorshipTiers[0].benefits.map((benefit, bIdx) => (
                    <tr key={bIdx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3 sm:px-4 sm:py-3 font-medium text-slate-700 border-r border-slate-100 text-xs">
                        {benefit.name}
                      </td>
                      {sponsorshipTiers.map(tier => {
                        const tierBenefit = tier.benefits[bIdx]
                        return (
                          <td key={tier.name} className={`p-3 sm:p-4 text-center ${tier.name !== 'SILVER' ? 'border-r' : ''} border-slate-100`}>
                            {tierBenefit.included ? (
                              <div className="flex flex-col items-center justify-center gap-1">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                {tierBenefit.note && (
                                  <span className="text-[9px] uppercase tracking-wider font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-sm">{tierBenefit.note}</span>
                                )}
                              </div>
                            ) : (
                              <X className="w-4 h-4 text-slate-300 mx-auto" />
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </section>
      */}

      <section ref={ref} className="relative overflow-hidden px-4 pb-12 sm:px-6">
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

                      {/* Sponsor Type — hidden, set to NULL */}
                      <input type="hidden" name="sponsorType" value="NULL" />

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

