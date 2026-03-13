import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { exhibitors } from '../data/homeData.js'
import { ArrowRight } from 'lucide-react'

export default function Exhibitors() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.15 })

  return (
    <section id="exhibitors" className="relative overflow-hidden bg-white" ref={ref}>
      {/* Dot grid */}
      <div className="absolute inset-0 dot-grid opacity-15" />
      {/* Blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -bottom-32 left-1/3 h-96 w-96 rounded-full bg-brand-lime/6 blur-[120px] animate-morph" />
        <div className="absolute -top-32 right-1/4 h-80 w-80 rounded-full bg-brand-cyan/6 blur-[120px] animate-morph" style={{ animationDelay: '5s' }} />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2"
            >
              <div className="gradient-line w-12" />
              <span className="font-mono text-[11px] font-semibold tracking-[0.25em] text-brand-lime">
                EXPO FLOOR
              </span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <span className="block font-hero text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Featured
              </span>
              <span className="block font-impact text-3xl tracking-[0.1em] gradient-text sm:text-4xl">
                EXHIBITORS
              </span>
            </motion.h2>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="max-w-xs text-sm leading-relaxed text-slate-500"
          >
            Explore the latest tools, platforms, and assistive technology solutions.
          </motion.p>
        </div>

        {/* Exhibitor list — horizontal stacked layout */}
        <div className="mt-16 space-y-4">
          {exhibitors.map((e, idx) => (
            <motion.article
              key={e.name}
              initial={{ opacity: 0, x: idx % 2 === 0 ? -40 : 40 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.15 + idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="group relative"
            >
              <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-gradient-to-r from-white via-white to-brand-cyan-light/20 p-6 transition-all duration-500 hover:border-brand-cyan/20 hover:shadow-2xl hover:shadow-brand-cyan/10 sm:flex-row sm:items-center sm:gap-8">
                {/* Number */}
                <div className="flex-shrink-0">
                  <span className="font-impact text-5xl tracking-wide text-slate-100 transition-colors duration-500 group-hover:text-brand-cyan/20">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                </div>

                {/* Logo */}
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-slate-50 ring-1 ring-slate-100 transition-all duration-500 group-hover:ring-brand-cyan/20 group-hover:shadow-lg">
                  <img
                    src={e.logo}
                    alt={`${e.name} logo`}
                    loading="lazy"
                    decoding="async"
                    className="h-8 w-auto opacity-60 transition-all duration-500 group-hover:opacity-100"
                  />
                </div>

                {/* Text */}
                <div className="min-w-0 flex-1">
                  <h3 className="font-hero text-xl font-extrabold tracking-tight text-slate-900">{e.name}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-500">{e.description}</p>
                </div>

                {/* Arrow */}
                <div className="flex-shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-300 transition-all duration-500 group-hover:bg-brand-cyan group-hover:text-white group-hover:shadow-lg group-hover:shadow-brand-cyan/20">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>

                {/* Bottom gradient line */}
                <div className="absolute bottom-0 left-6 right-6 h-[2px] origin-left scale-x-0 bg-gradient-to-r from-brand-cyan to-brand-lime transition-transform duration-700 group-hover:scale-x-100" />
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}

