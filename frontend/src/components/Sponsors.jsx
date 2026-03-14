import { useRef } from 'react'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'
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

export default function Sponsors() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.15 })
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  // Scroll-driven color transitions: colored text → white
  const partnerColor = useTransform(scrollYProgress, [0, 0.3], ['#5BCB2B', '#ffffff'])
  const trustedColor = useTransform(scrollYProgress, [0, 0.3], ['#0197B2', '#ffffff'])
  const leadersColor = useTransform(scrollYProgress, [0, 0.3], ['#5BCB2B', '#ffffff'])
  const watermarkOpacity = useTransform(scrollYProgress, [0, 0.4], [0.04, 0.15])

  return (
    <section id="sponsors" className="relative overflow-hidden bg-slate-950" ref={ref}>
      <div className="absolute inset-0 dot-grid opacity-10" />
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-96 w-[800px] rounded-full bg-brand-cyan/8 blur-[150px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
        {/* Header — text turns white on scroll */}
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-3"
          >
            <div className="h-[2px] w-12 bg-gradient-to-r from-brand-lime to-brand-cyan" />
            <motion.span style={{ color: partnerColor }} className="font-mono text-[11px] font-semibold tracking-[0.3em]">PARTNERS</motion.span>
            <div className="h-[2px] w-12 bg-gradient-to-l from-brand-lime to-brand-cyan" />
          </motion.div>
          <div className="mt-4">
            <motion.span style={{ color: trustedColor }} className="font-serif text-4xl italic font-light sm:text-5xl lg:text-6xl">
              Trusted by{' '}
            </motion.span>
            <span className="font-hero text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
              industry
            </span>
            <br />
            <motion.span style={{ color: leadersColor }} className="font-marker text-4xl sm:text-5xl lg:text-6xl">
              leaders
            </motion.span>
          </div>
        </div>

        {/* Double marquee — colored logos, full visibility */}
        <div className="mt-12 space-y-4">
          {/* Row 1 */}
          <div className="relative">
            <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-24 bg-gradient-to-r from-slate-950 to-transparent" />
            <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-slate-950 to-transparent" />
            <div className="overflow-hidden">
              <div className="animate-marquee flex w-max gap-6">
                {[...sponsors, ...sponsors, ...sponsors].map((s, idx) => (
                  <div
                    key={`r1-${s.name}-${idx}`}
                    className="group flex w-[250px] shrink-0 items-center gap-5 border-b border-transparent px-4 py-5 transition-all duration-500 hover:border-brand-cyan/30"
                    title={`${s.tier} · ${s.name}`}
                  >
                    <img
                      src={localLogos[s.name] || s.src}
                      alt={`${s.name} logo`}
                      loading="lazy"
                      decoding="async"
                      className="h-10 w-16 object-contain opacity-90 transition duration-500 group-hover:scale-110"
                    />
                    <div>
                      <p className="font-hero text-sm font-bold text-white/80 transition-colors group-hover:text-white">{s.name}</p>
                      <p className="font-mono text-[9px] tracking-[0.2em] text-white/40">{s.tier.toUpperCase()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Row 2 — reverse */}
          <div className="relative">
            <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-24 bg-gradient-to-r from-slate-950 to-transparent" />
            <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-slate-950 to-transparent" />
            <div className="overflow-hidden">
              <div className="animate-marquee-reverse flex w-max gap-6">
                {[...sponsors, ...sponsors, ...sponsors].reverse().map((s, idx) => (
                  <div
                    key={`r2-${s.name}-${idx}`}
                    className="group flex w-[250px] shrink-0 items-center gap-5 border-b border-transparent px-4 py-5 transition-all duration-500 hover:border-brand-lime/30"
                    title={`${s.tier} · ${s.name}`}
                  >
                    <img
                      src={localLogos[s.name] || s.src}
                      alt={`${s.name} logo`}
                      loading="lazy"
                      decoding="async"
                      className="h-10 w-16 object-contain opacity-90 transition duration-500 group-hover:scale-110"
                    />
                    <div>
                      <p className="font-hero text-sm font-bold text-white/80 transition-colors group-hover:text-white">{s.name}</p>
                      <p className="font-mono text-[9px] tracking-[0.2em] text-white/40">{s.tier.toUpperCase()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Giant watermark — brightens on scroll */}
        <motion.div style={{ opacity: watermarkOpacity }} className="mt-12 overflow-hidden text-center">
          <span className="font-impact text-[10vw] leading-none tracking-[0.25em] text-white select-none">
            SPONSORS
          </span>
        </motion.div>
      </div>
    </section>
  )
}

