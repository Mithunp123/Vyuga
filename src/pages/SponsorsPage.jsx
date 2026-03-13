import { useRef } from 'react'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { sponsors } from '../data/homeData.js'

import logoGoogle from '../assets/logo-google.svg'
import logoMicrosoft from '../assets/logo-microsoft.svg'
import logoIBM from '../assets/logo-ibm.svg'
import logoAdobe from '../assets/logo-adobe.svg'
import logoIntel from '../assets/logo-intel.svg'
import logoHCLTech from '../assets/logo-hcltech.svg'

const localLogos = {
  Google: logoGoogle, Microsoft: logoMicrosoft, IBM: logoIBM,
  Adobe: logoAdobe, Intel: logoIntel, HCLTech: logoHCLTech,
}

const tiers = ['Silver Sponsor', 'Bronze Sponsor', 'Partner']
const tierColors = {
  'Silver Sponsor': { accent: 'text-brand-cyan', line: 'from-brand-cyan', bg: 'bg-gradient-to-br from-brand-cyan/5 to-transparent' },
  'Bronze Sponsor': { accent: 'text-brand-lime', line: 'from-brand-lime', bg: 'bg-gradient-to-br from-brand-lime/5 to-transparent' },
  Partner: { accent: 'text-slate-600', line: 'from-slate-300', bg: 'bg-gradient-to-br from-slate-50 to-transparent' },
}

function SponsorCTA() {
  const ctaRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: ctaRef, offset: ['start end', 'center center'] })
  const sponsorColor = useTransform(scrollYProgress, [0, 0.5], ['#5BCB2B', '#ffffff'])

  return (
    <div ref={ctaRef} className="relative mt-10 bg-slate-950 py-16">
      <div className="absolute inset-0 dot-grid opacity-10" />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6"
      >
        <motion.p style={{ color: sponsorColor }} className="font-marker text-xl sm:text-2xl">Become a sponsor</motion.p>
        <p className="mt-4 font-serif text-lg italic text-white/60 sm:text-xl">
          Partner with us to reach 500+ accessibility innovators, designers, and engineers.
        </p>
        <a
          href="mailto:info@vyuga.in"
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
            <span className="font-mono text-[11px] font-semibold tracking-[0.3em] text-brand-cyan">OUR PARTNERS</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mt-6"
          >
            <span className="font-hero text-5xl font-black tracking-tight text-slate-900 sm:text-7xl lg:text-8xl">
              Sponsors{' '}
            </span>
            <span className="font-serif text-5xl italic font-light text-brand-cyan sm:text-7xl lg:text-8xl">
              &
            </span>
            <br />
            <span className="font-marker text-5xl gradient-text sm:text-7xl lg:text-8xl">
              partners
            </span>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 max-w-lg font-serif text-lg italic text-slate-400 sm:text-xl"
          >
            The organizations and leaders powering Vyuga 2026 — shaping the future of inclusive technology together.
          </motion.p>
        </div>

        {/* Giant watermark — subtle color tint */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden text-center pointer-events-none">
          <span className="font-impact text-[18vw] leading-none tracking-[0.2em] select-none" style={{ color: 'rgba(1,151,178,0.04)' }}>
            SPONSORS
          </span>
        </div>
      </section>

      {/* Sponsor tiers — light theme with colored accents */}
      <section ref={ref} className="relative overflow-hidden pb-20">
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
          {tiers.map((tier, tierIdx) => {
            const tierSponsors = sponsors.filter((s) => s.tier === tier)
            if (tierSponsors.length === 0) return null
            const colors = tierColors[tier]

            return (
              <motion.div
                key={tier}
                initial={{ opacity: 0, y: 40 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: tierIdx * 0.2 }}
                className="mb-16 last:mb-0"
              >
                {/* Tier label */}
                <div className="flex items-center gap-4 mb-8">
                  <span className={`font-impact text-6xl tracking-wider sm:text-7xl ${colors.accent}`} style={{ opacity: 0.12 }}>
                    {String(tierIdx + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h2 className={`font-hero text-2xl font-bold tracking-tight ${colors.accent} sm:text-3xl`}>
                      {tier === 'Partner' ? 'Technology Partners' : `${tier}s`}
                    </h2>
                    <div className={`mt-2 h-[2px] w-24 bg-gradient-to-r ${colors.line} to-transparent`} />
                  </div>
                </div>

                {/* Sponsor items */}
                <div className="space-y-0">
                  {tierSponsors.map((s, idx) => (
                    <motion.div
                      key={s.name}
                      initial={{ opacity: 0, x: -30 }}
                      animate={inView ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.6, delay: tierIdx * 0.2 + idx * 0.1 }}
                      className={`group flex items-center gap-8 border-b border-slate-100 py-7 transition-all duration-500 hover:border-brand-cyan/30 hover:${colors.bg} sm:gap-12`}
                    >
                      <img
                        src={localLogos[s.name] || s.src}
                        alt={`${s.name} logo`}
                        loading="lazy"
                        className="h-14 w-14 flex-shrink-0 object-contain transition-all duration-500 group-hover:scale-110 sm:h-16 sm:w-16"
                      />
                      <div className="flex-1">
                        <h3 className="font-hero text-2xl font-bold tracking-tight text-slate-800 transition-colors group-hover:text-brand-cyan sm:text-3xl">
                          {s.name}
                        </h3>
                        <p className="mt-1 font-mono text-[10px] tracking-[0.3em] text-slate-400">{s.tier.toUpperCase()}</p>
                      </div>
                      <div className="h-[2px] w-0 bg-gradient-to-r from-brand-cyan to-brand-lime transition-all duration-700 group-hover:w-24 sm:group-hover:w-40" />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* CTA — dark accent band with scroll-to-white */}
        <SponsorCTA />
      </section>

      <Footer />
    </div>
  )
}

