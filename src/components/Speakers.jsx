import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { speakers } from '../data/homeData.js'

export default function Speakers() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.15 })

  return (
    <section id="speakers" className="relative overflow-hidden bg-gradient-to-b from-white via-brand-cyan-light/15 to-white" ref={ref}>
      {/* Noise overlay */}
      <div className="absolute inset-0 noise-overlay pointer-events-none" />

      {/* Blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-1/4 h-80 w-80 rounded-full bg-brand-cyan/6 blur-[100px] animate-morph" />
        <div className="absolute bottom-20 right-1/4 h-80 w-80 rounded-full bg-brand-lime/6 blur-[100px] animate-morph" style={{ animationDelay: '4s' }} />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
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
              <span className="font-mono text-[11px] font-semibold tracking-[0.25em] text-brand-cyan">
                SPEAKERS
              </span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <span className="block font-hero text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Meet the
              </span>
              <span className="block font-impact text-4xl tracking-[0.1em] gradient-text sm:text-5xl">
                KEYNOTE SPEAKERS
              </span>
            </motion.h2>
          </div>

          <motion.a
            initial={{ opacity: 0, y: 14 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.3 }}
            href="#register"
            className="shimmer-btn inline-flex w-fit items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white shadow-lg shadow-brand-cyan/20 transition-all hover:shadow-xl hover:scale-105"
          >
            Become a speaker →
          </motion.a>
        </div>

        {/* Speaker grid — staggered creative layout */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {speakers.map((s, idx) => (
            <motion.article
              key={s.name}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.2 + idx * 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="group relative"
              style={{ marginTop: idx % 2 === 1 ? '2rem' : '0' }}
            >
              {/* Image with overlay */}
              <div className="relative aspect-[3/4] overflow-hidden rounded-3xl">
                <img
                  src={s.image}
                  alt={s.name}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
                {/* Hover glow */}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-cyan/30 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                {/* Text at bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <motion.div
                    className="translate-y-2 transition-transform duration-500 group-hover:translate-y-0"
                  >
                    <p className="font-hero text-xl font-extrabold text-white drop-shadow-lg">{s.name}</p>
                    <p className="mt-1 text-sm font-medium text-white/70">{s.role}</p>
                    <div className="mt-3 overflow-hidden">
                      <div className="h-[2px] w-full origin-left scale-x-0 bg-gradient-to-r from-brand-cyan to-brand-lime transition-transform duration-700 group-hover:scale-x-100" />
                    </div>
                    <p className="mt-3 font-mono text-[10px] tracking-widest text-white/50 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                      {s.org.toUpperCase()}
                    </p>
                  </motion.div>
                </div>

                {/* Badge */}
                <div className="absolute top-4 right-4">
                  <span className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold tracking-widest text-white backdrop-blur-sm ring-1 ring-white/20">
                    KEYNOTE
                  </span>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}

