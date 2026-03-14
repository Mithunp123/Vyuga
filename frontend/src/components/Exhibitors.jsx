import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { exhibitors } from '../data/homeData.js'
import { ArrowRight } from 'lucide-react'

export default function Exhibitors() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.15 })

  return (
    <section id="exhibitors" className="relative overflow-hidden bg-white" ref={ref}>
      <div className="absolute inset-0 dot-grid opacity-10" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -bottom-32 left-1/3 h-96 w-96 rounded-full bg-brand-lime/5 blur-[120px]" />
        <div className="absolute -top-32 right-1/4 h-80 w-80 rounded-full bg-brand-cyan/5 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-3"
            >
              <div className="gradient-line w-16" />
              <span className="font-mono text-[11px] font-semibold tracking-[0.3em] text-brand-lime">EXPO FLOOR</span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-4"
            >
              <span className="font-hero text-4xl font-black tracking-tight text-slate-900 sm:text-5xl lg:text-7xl">
                Featured{' '}
              </span>
              <span className="font-marker text-4xl gradient-text sm:text-5xl lg:text-7xl">
                exhibitors
              </span>
            </motion.h2>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="max-w-xs font-serif text-base italic text-slate-400"
          >
            Explore the latest tools, platforms, and assistive technology solutions.
          </motion.p>
        </div>

        {/* Exhibitor list — NO cards, just lines + text */}
        <div className="mt-20 space-y-0">
          {exhibitors.map((e, idx) => (
            <motion.article
              key={e.name}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.15 + idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="group relative border-b border-slate-100 transition-colors hover:border-brand-lime/30"
            >
              <div className="flex items-center gap-6 py-8 sm:gap-10">
                {/* Number */}
                <span className="flex-shrink-0 font-impact text-5xl tracking-wide text-slate-100 transition-colors duration-500 group-hover:text-brand-lime/30 sm:text-6xl">
                  {String(idx + 1).padStart(2, '0')}
                </span>

                {/* Logo */}
                <img
                  src={e.logo}
                  alt={`${e.name} logo`}
                  loading="lazy"
                  decoding="async"
                  className="h-10 w-10 flex-shrink-0 object-contain opacity-40 transition-all duration-500 group-hover:opacity-100 group-hover:scale-110"
                />

                {/* Text */}
                <div className="min-w-0 flex-1">
                  <h3 className="font-hero text-xl font-extrabold tracking-tight text-slate-900 transition-colors group-hover:text-brand-lime sm:text-2xl">
                    {e.name}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-400 sm:text-base">{e.description}</p>
                </div>

                {/* Arrow */}
                <ArrowRight className="h-5 w-5 flex-shrink-0 text-slate-200 transition-all duration-500 group-hover:text-brand-lime group-hover:translate-x-2" />
              </div>

              {/* Expanding gradient line */}
              <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-brand-lime to-brand-cyan transition-all duration-700 group-hover:w-full" />
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}

