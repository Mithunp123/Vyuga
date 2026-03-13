import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

function AnimatedCounter({ target, suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })

  useEffect(() => {
    if (!inView) return
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setCount(target); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [inView, target, duration])

  return <span ref={ref}>{count}{suffix}</span>
}

const stats = [
  { value: 3, suffix: '', label: 'DAYS', accent: 'text-brand-cyan' },
  { value: 40, suffix: '+', label: 'SESSIONS', accent: 'text-brand-lime' },
  { value: 500, suffix: '+', label: 'ATTENDEES', accent: 'text-brand-cyan' },
  { value: 15, suffix: '+', label: 'COUNTRIES', accent: 'text-brand-lime' },
]

export default function About() {
  const sectionRef = useRef(null)
  const inView = useInView(sectionRef, { once: true, amount: 0.2 })

  return (
    <section id="about" className="relative overflow-hidden bg-white" ref={sectionRef}>
      {/* ── Stats marquee band ── */}
      <div className="relative border-y border-slate-100 bg-gradient-to-r from-brand-cyan-light/30 via-white to-brand-lime-light/30 py-12 sm:py-16">
        <div className="absolute inset-0 dot-grid opacity-20" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-2 gap-8 sm:gap-12 lg:grid-cols-4">
            {stats.map((s, idx) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="text-center"
              >
                <p className={`font-impact text-6xl tracking-wider sm:text-7xl lg:text-8xl ${s.accent}`}>
                  <AnimatedCounter target={s.value} suffix={s.suffix} />
                </p>
                <p className="mt-2 font-mono text-[10px] tracking-[0.35em] text-slate-400">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── About content — asymmetric layout ── */}
      <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32">
        {/* Background accents */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-20 -right-20 h-80 w-80 rounded-full bg-brand-cyan/6 blur-[80px] animate-morph" />
          <div className="absolute bottom-20 -left-20 h-80 w-80 rounded-full bg-brand-lime/6 blur-[80px] animate-morph" style={{ animationDelay: '5s' }} />
        </div>

        <div className="relative grid gap-16 lg:grid-cols-2 lg:items-center">
          {/* Left — dramatic typography */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2"
            >
              <div className="gradient-line w-12" />
              <span className="font-mono text-[11px] font-semibold tracking-[0.25em] text-brand-cyan">ABOUT</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-5"
            >
              <span className="block font-hero text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Building tech
              </span>
              <span className="block font-hero text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                for <span className="gradient-text">everyone</span>
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6 max-w-lg text-base leading-relaxed text-slate-500 sm:text-lg"
            >
              Empower 2025 brings together assistive innovators, inclusive designers, researchers,
              educators, startups, and policy leaders for real-world impact.
            </motion.p>

            {/* Feature list with gradient accents */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-8 space-y-4"
            >
              {[
                { text: 'Keynotes from global accessibility leaders', color: 'from-brand-cyan' },
                { text: 'Hands-on workshops and rapid prototyping', color: 'from-brand-lime' },
                { text: 'Assistive tech expo with live demos', color: 'from-brand-cyan' },
                { text: 'Networking with 500+ practitioners', color: 'from-brand-lime' },
              ].map((item, idx) => (
                <motion.div
                  key={item.text}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.35 + idx * 0.08 }}
                  className="group flex items-center gap-4"
                >
                  <div className={`h-px flex-shrink-0 w-8 bg-gradient-to-r ${item.color} to-transparent transition-all duration-500 group-hover:w-12`} />
                  <span className="text-sm font-medium text-slate-600 transition-colors group-hover:text-slate-900">
                    {item.text}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Right — visual highlights with staggered reveals */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            {/* Bento-style grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Large feature */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="col-span-2 rounded-3xl bg-gradient-to-br from-brand-cyan/10 via-brand-cyan-light/30 to-white p-8 ring-1 ring-brand-cyan/10"
              >
                <span className="font-impact text-5xl tracking-wider gradient-text sm:text-6xl">3 DAYS</span>
                <p className="mt-2 text-sm text-slate-500">of keynotes, workshops, expo, and networking experiences.</p>
                <div className="mt-4 gradient-line w-full" />
              </motion.div>

              {/* Small features */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="rounded-3xl bg-gradient-to-br from-brand-lime-light/40 to-white p-6 ring-1 ring-brand-lime/10"
              >
                <span className="text-3xl">🎯</span>
                <p className="mt-3 font-hero text-lg font-bold text-slate-900">40+ Sessions</p>
                <p className="mt-1 text-xs text-slate-500">Research, demos, workshops</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="rounded-3xl bg-gradient-to-br from-brand-cyan-light/40 to-white p-6 ring-1 ring-brand-cyan/10"
              >
                <span className="text-3xl">🌍</span>
                <p className="mt-3 font-hero text-lg font-bold text-slate-900">Global</p>
                <p className="mt-1 text-xs text-slate-500">15+ countries, 500+ attendees</p>
              </motion.div>

              {/* Quote / CTA strip */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="col-span-2 flex items-center gap-4 rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-100"
              >
                <div className="h-12 w-1 rounded-full bg-gradient-to-b from-brand-cyan to-brand-lime" />
                <div>
                  <p className="font-hero text-sm font-bold text-slate-900">
                    "Build accessibility into every roadmap."
                  </p>
                  <p className="mt-1 font-mono text-[10px] tracking-widest text-slate-400">EMPOWER 2025 MISSION</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

