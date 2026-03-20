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

function SponsorCTA() {
  const ctaRef = useRef(null)

  return (
    <div ref={ctaRef} className="relative mt-20 bg-slate-950 py-16">
      <div className="absolute inset-0 dot-grid opacity-10" />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6"
      >
        <motion.p className="font-marker text-xl text-brand-lime sm:text-2xl">Become a sponsor</motion.p>
        <p className="mt-4 font-serif text-lg italic text-white/60 sm:text-xl">
          Partner with us to reach 500+ accessibility innovators, designers, and engineers through the VYUGA Ability Carnival.
        </p>
        <a
          href="mailto:connect@nexyugainnovations.com"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-10 py-4 font-hero text-sm font-bold text-slate-900 transition-all hover:shadow-xl hover:scale-105"
        >
          Get in touch
        </a>
      </motion.div>
    </div>
  )
}

export default function SponsorsPage() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.1 })

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />

      {/* Hero — light with gradient accents */}
      <section className="relative overflow-hidden pt-32 pb-16 sm:pt-40 sm:pb-24">
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[900px] rounded-full bg-brand-cyan/[0.06] blur-[180px]" />
        <div className="pointer-events-none absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-brand-lime/[0.04] blur-[120px]" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3"
          >
            <div className="h-[2px] w-16 bg-gradient-to-r from-brand-lime to-brand-cyan" />
            <span className="font-mono text-[11px] font-semibold tracking-[0.3em] text-brand-cyan">FOR SPONSORS!</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mt-6"
          >
            <span className="font-hero text-5xl font-black tracking-tight text-slate-900 sm:text-7xl lg:text-8xl">
              Sponsorship{' '}
            </span>
            <br />
            <span className="font-marker text-5xl gradient-text sm:text-7xl lg:text-8xl">
              Benefits
            </span>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 max-w-lg font-serif text-lg italic text-slate-400 sm:text-xl"
          >
            Partner with us to gain national-level visibility and reach through the VYUGA Ability Carnival.
          </motion.p>
        </div>
      </section>

      {/* Sponsorship Benefits Table */}
      <section ref={ref} className="relative overflow-hidden pb-20">
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100"
          >
            {/* Table Header */}
            <div className="grid grid-cols-4 bg-gradient-to-r from-slate-50 to-white">
              <div className="p-6 sm:p-8">
                <h2 className="text-2xl font-bold text-brand-cyan sm:text-3xl">Benefits</h2>
              </div>
              {sponsorshipTiers.map((tier, idx) => (
                <div key={tier.name} className="p-6 text-center sm:p-8">
                  <div className={`inline-flex items-center justify-center rounded-full px-4 py-2 bg-gradient-to-r ${tier.color} text-white font-bold text-sm sm:text-base mb-2`}>
                    {tier.name}
                  </div>
                  <div className={`text-2xl font-bold ${tier.textColor} sm:text-3xl`}>
                    {tier.price}
                  </div>
                </div>
              ))}
            </div>

            {/* Table Body */}
            <div className="divide-y divide-slate-100">
              {sponsorshipTiers[0].benefits.map((benefit, benefitIdx) => (
                <div key={benefitIdx} className="grid grid-cols-4 hover:bg-slate-50/50 transition-colors">
                  <div className="p-4 sm:p-6 font-medium text-slate-700">
                    {benefit.name}
                  </div>
                  {sponsorshipTiers.map((tier, tierIdx) => (
                    <div key={tierIdx} className="p-4 sm:p-6 text-center">
                      {tier.benefits[benefitIdx]?.included ? (
                        <div className="flex flex-col items-center gap-1">
                          <svg className="h-6 w-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {tier.benefits[benefitIdx]?.note && (
                            <span className="text-xs font-medium text-green-600 italic">
                              {tier.benefits[benefitIdx].note}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xl">-</span>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Bottom Text */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 text-center font-serif text-lg text-slate-600"
          >
            Sponsors will gain national-level visibility and reach through the VYUGA Ability Carnival
          </motion.p>
        </div>

        <SponsorCTA />
      </section>

      <Footer />
    </div>
  )
}

