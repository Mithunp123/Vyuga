import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { day1Speakers, day2Speakers, influencers } from '../data/homeData.js'

function SpeakerCard({ s, idx, inView, delayOffset = 0 }) {
  return (
    <motion.article
      key={s.name}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      whileHover={{ y: -10, scale: 1.015 }}
      transition={{ duration: 0.7, delay: delayOffset + idx * 0.12, ease: [0.22, 1, 0.36, 1] }}
      className="speaker-cinematic-card group relative"
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-3xl">
        <img
          src={s.image}
          alt={s.name}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="pointer-events-none absolute inset-0 cinematic-sweep" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-cyan/30 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

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
      </div>
    </motion.article>
  )
}

function SectionLabel({ label, inView, delay = 0 }) {
  return (
    <motion.h3
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
      className="mb-6 font-impact text-2xl tracking-[0.08em] gradient-text sm:text-3xl text-center"
    >
      {label}
    </motion.h3>
  )
}

export default function Speakers() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.15 })

  return (
    <section id="speakers" className="cinematic-speakers-bg relative overflow-hidden" ref={ref}>
      {/* Noise overlay */}
      <div className="absolute inset-0 noise-overlay pointer-events-none" />
      <div className="absolute inset-0 cinematic-vignette pointer-events-none" />

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
              className="themes-guests-title"
            >
              <span className="meet-word block text-4xl sm:text-5xl lg:text-6xl">
                Meet the
              </span>
              <span className="block text-4xl tracking-[0.08em] sm:text-5xl lg:text-6xl">
                <span className="themes-word">THEMES</span>
                <span className="amp-word"> &amp; </span>
                <span className="guests-word">GUESTS</span>
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

        {/* Day 1 Speakers */}
        <div className="mt-16">
          <SectionLabel label="DAY 1 — SPEAKERS" inView={inView} delay={0.2} />
          <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">
            {day1Speakers.map((s, idx) => (
              <SpeakerCard key={s.name} s={s} idx={idx} inView={inView} delayOffset={0.3} />
            ))}
          </div>
        </div>

        {/* Day 2 Speakers */}
        <div className="mt-14">
          <SectionLabel label="DAY 2 — SPEAKERS" inView={inView} delay={0.4} />
          <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">
            {day2Speakers.map((s, idx) => (
              <SpeakerCard key={s.name} s={s} idx={idx} inView={inView} delayOffset={0.5} />
            ))}
          </div>
        </div>

        {/* Influencers */}
        <div className="mt-14">
          <SectionLabel label="INFLUENCERS" inView={inView} delay={0.6} />
          <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">
            {influencers.map((s, idx) => (
              <SpeakerCard key={s.name} s={s} idx={idx} inView={inView} delayOffset={0.7} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

