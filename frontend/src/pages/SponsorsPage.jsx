import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'

// Sponsorship benefits data
const sponsorshipTiers = [
  {
    name: 'PLATINUM',
    price: '₹10,00,000',
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
    price: '₹5,00,000',
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
    price: '₹3,00,000',
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
             <a
              href="mailto:connect@nexyugainnovations.com"
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-brand-cyan/20 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-cyan/30"
            >
              Become a Sponsor
            </a>
        </div>
      </section>

      <Footer />
    </div>
  )
}

