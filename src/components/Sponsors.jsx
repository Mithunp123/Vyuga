import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { sponsors } from '../data/homeData.js'

export default function Sponsors() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.15 })

  return (
    <section id="sponsors" className="relative overflow-hidden bg-slate-950" ref={ref}>
      {/* Dot grid */}
      <div className="absolute inset-0 dot-grid opacity-10" />
      {/* Gradient glow */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-96 w-[800px] rounded-full bg-brand-cyan/8 blur-[150px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32">
        {/* Header */}
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2"
          >
            <div className="h-[2px] w-12 bg-gradient-to-r from-brand-lime to-brand-cyan" />
            <span className="font-mono text-[11px] font-semibold tracking-[0.25em] text-brand-lime">
              PARTNERS
            </span>
            <div className="h-[2px] w-12 bg-gradient-to-l from-brand-lime to-brand-cyan" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <span className="block font-hero text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Trusted by
            </span>
            <span className="block font-impact text-4xl tracking-[0.15em] text-brand-cyan sm:text-5xl">
              INDUSTRY LEADERS
            </span>
          </motion.h2>
        </div>

        {/* Double marquee rows */}
        <div className="mt-16 space-y-4">
          {/* Row 1 - forward */}
          <div className="relative">
            <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-24 bg-gradient-to-r from-slate-950 to-transparent" />
            <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-slate-950 to-transparent" />
            <div className="overflow-hidden">
              <div className="animate-marquee flex w-max gap-8">
                {[...sponsors, ...sponsors, ...sponsors].map((s, idx) => (
                  <div
                    key={`row1-${s.name}-${idx}`}
                    className="group flex w-[220px] shrink-0 items-center gap-4 rounded-2xl border border-white/5 bg-white/5 px-5 py-4 backdrop-blur-sm transition-all duration-500 hover:border-brand-cyan/30 hover:bg-white/10"
                    title={`${s.tier} · ${s.name}`}
                  >
                    <img
                      src={s.src}
                      alt={`${s.name} logo`}
                      loading="lazy"
                      decoding="async"
                      className="h-8 w-8 object-contain brightness-0 invert opacity-50 transition duration-500 group-hover:opacity-100"
                    />
                    <div>
                      <p className="text-sm font-bold text-white/80 group-hover:text-white transition-colors">{s.name}</p>
                      <p className="text-[10px] font-semibold tracking-widest text-white/30">{s.tier.toUpperCase()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Row 2 - reverse */}
          <div className="relative">
            <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-24 bg-gradient-to-r from-slate-950 to-transparent" />
            <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-slate-950 to-transparent" />
            <div className="overflow-hidden">
              <div className="animate-marquee-reverse flex w-max gap-8">
                {[...sponsors, ...sponsors, ...sponsors].reverse().map((s, idx) => (
                  <div
                    key={`row2-${s.name}-${idx}`}
                    className="group flex w-[220px] shrink-0 items-center gap-4 rounded-2xl border border-white/5 bg-white/5 px-5 py-4 backdrop-blur-sm transition-all duration-500 hover:border-brand-lime/30 hover:bg-white/10"
                    title={`${s.tier} · ${s.name}`}
                  >
                    <img
                      src={s.src}
                      alt={`${s.name} logo`}
                      loading="lazy"
                      decoding="async"
                      className="h-8 w-8 object-contain brightness-0 invert opacity-50 transition duration-500 group-hover:opacity-100"
                    />
                    <div>
                      <p className="text-sm font-bold text-white/80 group-hover:text-white transition-colors">{s.name}</p>
                      <p className="text-[10px] font-semibold tracking-widest text-white/30">{s.tier.toUpperCase()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Big sponsor text watermark */}
        <div className="mt-16 overflow-hidden text-center">
          <span className="font-impact text-[8vw] leading-none tracking-[0.2em] text-white/[0.03] select-none">
            SPONSORS
          </span>
        </div>
      </div>
    </section>
  )
}

