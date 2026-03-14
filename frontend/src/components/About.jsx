import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'

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
  { value: 2, suffix: '', label: 'DAYS', accent: 'text-brand-cyan' },
  { value: 200, suffix: '+', label: 'INNOVATORS & SPECIAL ABLED', accent: 'text-brand-lime' },
  { value: 1000, suffix: '+', label: 'ATTENDEES', accent: 'text-brand-cyan' },
  { value: 50, suffix: '+', label: 'NGOs & SPECIAL SCHOOLS', accent: 'text-brand-lime' },
]

const features = [
  { text: 'Keynotes from global accessibility leaders', accent: 'font-marker text-brand-cyan' },
  { text: 'Hands-on workshops and rapid prototyping', accent: 'font-serif italic text-brand-lime' },
  { text: 'Assistive tech expo with live demos', accent: 'font-marker text-brand-cyan' },
  { text: 'Networking with 1000+ attendees', accent: 'font-serif italic text-brand-lime' },
]

export default function About() {
  const sectionRef = useRef(null)
  const inView = useInView(sectionRef, { once: true, amount: 0.15 })
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] })
  const parallaxY = useTransform(scrollYProgress, [0, 1], [60, -60])

  return (
    <section id="about" className="relative overflow-hidden bg-white" ref={sectionRef}>
      {/* ── Stats — inline horizontal flow, no cards ── */}
      <div className="relative overflow-hidden border-y border-slate-100 py-16 sm:py-20">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-cyan-light/20 via-transparent to-brand-lime-light/20" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-wrap items-baseline justify-center gap-x-12 gap-y-6 sm:gap-x-20">
            {stats.map((s, idx) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 40 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: idx * 0.12, ease: [0.22, 1, 0.36, 1] }}
                className="text-center"
              >
                <p className={`font-impact text-7xl tracking-wider sm:text-8xl lg:text-[7rem] ${s.accent}`}>
                  <AnimatedCounter target={s.value} suffix={s.suffix} />
                </p>
                <p className="mt-1 font-mono text-[9px] tracking-[0.4em] text-slate-400">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── About — cinematic split layout, NO cards ── */}
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <motion.div style={{ y: parallaxY }} className="absolute top-10 right-[10%] h-80 w-80 rounded-full bg-brand-cyan/5 blur-[100px]" />
          <motion.div style={{ y: parallaxY }} className="absolute bottom-10 left-[5%] h-60 w-60 rounded-full bg-brand-lime/5 blur-[80px]" />
        </div>

        <div className="relative">
          {/* Section label */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3"
          >
            <div className="gradient-line w-16" />
            <span className="font-mono text-[11px] font-semibold tracking-[0.3em] text-brand-cyan">ABOUT THE CONFERENCE</span>
          </motion.div>

          {/* Giant headline with mixed fonts */}
          <div className="mt-8 space-y-1">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              <span className="font-hero text-[8vw] font-black leading-[0.9] tracking-tight text-slate-900 sm:text-5xl lg:text-7xl">
                Building{' '}
              </span>
              <span className="font-serif text-[8vw] italic font-light leading-[0.9] text-brand-cyan sm:text-5xl lg:text-7xl">
                technology
              </span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <span className="font-hero text-[8vw] font-black leading-[0.9] tracking-tight text-slate-900 sm:text-5xl lg:text-7xl">
                for{' '}
              </span>
              <span className="font-marker text-[8vw] leading-[0.9] gradient-text sm:text-5xl lg:text-7xl">
                everyone
              </span>
            </motion.div>
          </div>

          {/* Two-column text + feature list — no boxes */}
          <div className="mt-16 grid gap-16 lg:grid-cols-5">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="lg:col-span-2"
            >
              <p className="text-lg leading-relaxed text-slate-500 sm:text-xl">
                Vyuga 2026 brings together assistive innovators, inclusive designers, researchers,
                educators, startups, and policy leaders for{' '}
                <span className="font-marker text-slate-800">real-world impact.</span>
              </p>

              <motion.blockquote
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="mt-10 border-l-2 border-brand-cyan/40 pl-6"
              >
                <p className="font-serif text-xl italic text-slate-700 sm:text-2xl">
                  "Build accessibility into every roadmap."
                </p>
                <cite className="mt-3 block font-mono text-[10px] not-italic tracking-[0.3em] text-slate-400">
                  — VYUGA 2026 MISSION
                </cite>
              </motion.blockquote>
            </motion.div>

            {/* Feature list — minimal lines, no boxes */}
            <div className="lg:col-span-3">
              <div className="space-y-0">
                {features.map((item, idx) => (
                  <motion.div
                    key={item.text}
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 + idx * 0.1 }}
                    className="group flex items-center gap-6 border-b border-slate-100 py-6 transition-colors hover:border-brand-cyan/30"
                  >
                    <span className="font-impact text-4xl text-slate-200 transition-colors group-hover:text-brand-cyan sm:text-5xl">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span className={`text-base sm:text-lg transition-all duration-500 ${item.accent} group-hover:translate-x-2`}>
                      {item.text}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

