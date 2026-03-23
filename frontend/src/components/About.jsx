import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import { useLocation } from 'react-router-dom'

// Import logos
import srpLogo from '../assets/present by/SRP.webp'
import nexgugaLogo from '../assets/present by/nexguga.png'
import ksrctLogo from '../assets/present by/ksrct logo.png'
import aboutImg from '../assets/about.png'

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
  { 
    value: 2, 
    suffix: '', 
    label: 'DAYS', 
    description: 'Redefining the frontier by spotlighting human talent through universally accessible tech.',
    accent: 'text-brand-cyan' 
  },
  { 
    value: 200, 
    suffix: '+', 
    label: 'ELITES & ADAPTIVE INNOVATORS', 
    description: 'Bridging the gap between cutting-edge tech and limitless talent, led by a community where 80% represent the future of accessible design.',
    accent: 'text-brand-lime' 
  },
  { 
    value: 1000, 
    suffix: '+', 
    label: 'ATTENDEES', 
    description: 'Uniting Institutional Leaders, Support Networks, and Next-Gen Innovators to architect a more inclusive future.',
    accent: 'text-brand-cyan' 
  },
  { 
    value: 50, 
    suffix: '+', 
    label: 'NGOs & SPECIAL SCHOOLS', 
    description: 'Synergizing with Advocacy Partners and Adaptive Learning Centers to drive universal accessibility.',
    accent: 'text-brand-lime' 
  },
]

const features = [
  { text: 'A child who was never given a stage finally performs with confidence', accent: 'font-serif italic text-brand-cyan' },
  { text: 'An innovator turns daily challenges into solutions for thousands', accent: 'font-marker text-brand-lime' },
  { text: 'A player proves passion goes beyond physical limitations', accent: 'font-serif italic text-brand-cyan' },
  { text: 'Society learns to see ability, not disability', accent: 'font-marker text-brand-lime' },
]

const aims = [
  'Restore confidence',
  'Create visibility', 
  'Build independence',
  'Inspire society to see ability, not disability'
]

export default function About() {
  const sectionRef = useRef(null)
  const inView = useInView(sectionRef, { once: true, amount: 0.15 })
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] })
  const parallaxY = useTransform(scrollYProgress, [0, 1], [60, -60])
  const location = useLocation()

  return (
    <section id="about" className="relative overflow-hidden bg-white" ref={sectionRef}>
      {/* ── Presented by section ── */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-50 via-white to-slate-50 py-8 sm:py-12">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-cyan/5 via-transparent to-brand-lime/5" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-center"
          >
            <motion.h3
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-mono text-xs sm:text-sm font-bold tracking-[0.3em] text-slate-500 uppercase mb-6"
            >
              Presented by
            </motion.h3>

            <div className="flex flex-col items-center gap-6">
              {/* Main presenters */}
              <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
                <motion.div
                  initial={{ opacity: 0, x: -30, rotateY: -15 }}
                  whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  whileHover={{ scale: 1.1, rotateY: 5 }}
                  className="group relative perspective-1000 cursor-pointer"
                  onClick={() => document.getElementById('about-nexyuga')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-brand-cyan/20 to-brand-lime/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative bg-white rounded-2xl p-4 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border border-slate-100">
                    <img
                      src={nexgugaLogo}
                      alt="Nexyuga Innovation"
                      className="h-16 sm:h-24 w-auto object-contain mx-auto"
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="font-marker text-xl sm:text-2xl text-slate-400"
                >
                  &
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 30, rotateY: 15 }}
                  whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  whileHover={{ scale: 1.1, rotateY: -5 }}
                  className="group relative perspective-1000 cursor-pointer"
                  onClick={() => document.getElementById('about-srp')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-brand-cyan/20 to-brand-lime/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative bg-white rounded-2xl p-4 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border border-slate-100">
                    <img
                      src={srpLogo}
                      alt="SRP Foundation"
                      className="h-16 sm:h-24 w-auto object-contain mx-auto"
                    />
                  </div>
                </motion.div>
              </div>

              {/* Association */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="flex items-center gap-3"
              >
                <div className="h-px w-8 sm:w-12 bg-gradient-to-r from-transparent to-slate-300" />
                <p className="font-mono text-[10px] sm:text-xs tracking-[0.2em] text-slate-400">IN ASSOCIATION WITH</p>
                <div className="h-px w-8 sm:w-12 bg-gradient-to-l from-transparent to-slate-300" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.8 }}
                whileHover={{ scale: 1.1, rotateX: 5 }}
                className="group relative perspective-1000"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-brand-cyan/20 to-brand-lime/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative bg-white rounded-2xl p-4 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border border-slate-100">
                  <img
                    src={ksrctLogo}
                    alt="KSRCT"
                    className="h-16 sm:h-24 w-auto object-contain mx-auto"
                  />
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Stats — enhanced boxes with hover effects ── */}
      <div className="relative overflow-hidden border-y border-slate-100 py-16 sm:py-20">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-cyan-light/20 via-transparent to-brand-lime-light/20" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((s, idx) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 40 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: idx * 0.12, ease: [0.22, 1, 0.36, 1] }}
                className="group relative overflow-hidden rounded-2xl bg-white/50 backdrop-blur-sm border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 cursor-pointer h-full"
              >
                {/* Flowing background animation on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-brand-cyan/10 via-brand-lime/10 to-brand-cyan/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />

                {/* Content */}
                <div className="relative text-center px-4 py-6 sm:px-6 sm:py-8">
                  <p className={`font-impact text-4xl sm:text-5xl lg:text-6xl tracking-wider transition-colors duration-300 ${s.accent} group-hover:text-white group-hover:drop-shadow-lg`}>
                    <AnimatedCounter target={s.value} suffix={s.suffix} />
                  </p>
                  <p className="mt-2 font-mono text-[8px] sm:text-[9px] tracking-[0.4em] text-slate-400 group-hover:text-slate-600 transition-colors duration-300">{s.label}</p>
                  {s.description && (
                    <p className="mt-3 text-xs sm:text-sm leading-relaxed text-slate-600 group-hover:text-slate-700 transition-colors duration-300 max-w-40 mx-auto">
                      {s.description}
                    </p>
                  )}
                </div>
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
            <span className="font-mono text-sm sm:text-lg font-semibold tracking-[0.3em] text-brand-cyan">ABOUT VYUGA</span>
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
                A voice for{' '}
              </span>
              <span className="font-serif text-[8vw] italic font-light leading-[0.9] text-brand-cyan sm:text-5xl lg:text-7xl">
                abilities
              </span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <span className="font-hero text-[8vw] font-black leading-[0.9] tracking-tight text-slate-900 sm:text-5xl lg:text-7xl">
                often{' '}
              </span>
              <span className="font-marker text-[8vw] leading-[0.9] gradient-text sm:text-5xl lg:text-7xl">
                unseen
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
                Vyuga is not just an event — it's a space where differently abled individuals are celebrated, heard, and empowered. 
                In a world where they are often limited by opportunities rather than their potential.
              </p>

              <motion.blockquote
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="mt-10 border-l-2 border-brand-cyan/40 pl-6"
              >
                <p className="font-serif text-xl italic text-slate-700 sm:text-2xl">
                  "Disability is not a limitation — lack of opportunity is."
                </p>
                <cite className="mt-3 block font-mono text-[10px] not-italic tracking-[0.3em] text-slate-400">
                  — VYUGA BELIEF
                </cite>
              </motion.blockquote>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.6 }}
                className="mt-12"
              >
                <img 
                  src={aboutImg} 
                  alt="About Vyuga" 
                  className="w-full h-auto object-contain"
                />
              </motion.div>
            </motion.div>

            {/* Platform examples */}
            <div className="lg:col-span-3">
              <p className="mb-6 font-display text-sm font-bold text-slate-600 uppercase tracking-wider">
                It is a platform where:
              </p>
              <div className="space-y-0 mb-10">
                {features.map((item, idx) => (
                  <motion.div
                    key={item.text}
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 + idx * 0.1 }}
                    className="group flex items-start gap-4 border-b border-slate-100 py-4 transition-colors hover:border-brand-cyan/30"
                  >
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand-cyan" />
                    <span className={`text-base sm:text-lg transition-all duration-500 ${item.accent} group-hover:translate-x-2`}>
                      {item.text}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* Mission statement */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="rounded-2xl bg-gradient-to-br from-brand-cyan-light/20 to-brand-lime-light/20 p-6 border border-brand-cyan/10"
              >
                <p className="font-display text-sm font-bold text-slate-600 uppercase tracking-wider mb-4">
                  Through innovation, talent, and sports, Vyuga aims to:
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {aims.map((aim, idx) => (
                    <div key={aim} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-lime" />
                      <span className="text-sm font-medium text-slate-700">{aim}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t border-brand-cyan/20">
                  <p className="font-serif text-lg italic text-slate-700 text-center">
                    This is more than a competition. This is more than a festival.
                  </p>
                  <p className="font-marker text-xl text-brand-cyan text-center mt-2">
                    Vyuga is a movement that turns hidden strength into pride.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* ── ABOUT NEXYUGA ── */}
      {location.pathname === '/about' && (
        <div id="about-nexyuga" className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 border-t border-slate-100">
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-3"
            >
              <div className="gradient-line w-16" />
              <span className="font-mono text-sm sm:text-lg font-semibold tracking-[0.3em] text-brand-cyan">ABOUT NEXYUGA</span>
            </motion.div>

            <div className="mt-8 space-y-1">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.1 }}
              >
                <span className="font-hero text-[6vw] font-black leading-[0.9] tracking-tight text-slate-900 sm:text-4xl lg:text-6xl">
                  Driving digital{' '}
                </span>
                <span className="font-serif text-[6vw] italic font-light leading-[0.9] text-brand-cyan sm:text-4xl lg:text-6xl">
                  transformation
                </span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.2 }}
              >
                <span className="font-hero text-[6vw] font-black leading-[0.9] tracking-tight text-slate-900 sm:text-4xl lg:text-6xl">
                  with{' '}
                </span>
                <span className="font-marker text-[6vw] leading-[0.9] gradient-text sm:text-4xl lg:text-6xl">
                  inclusive innovation
                </span>
              </motion.div>
            </div>

            <div className="mt-12 grid gap-16 lg:grid-cols-5">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="lg:col-span-2"
              >
                <p className="text-lg leading-relaxed text-slate-500 sm:text-xl text-justify">
                  A high-impact architect of digital equity, Nexyuga Innovations is engineering the next frontier of inclusive transformation. By synergizing scalable technical ecosystems with human-centric intuition, the firm translates complex engineering into seamless universal experiences that empower global enterprises and local communities alike. Nexyuga doesn't just build software; it bridges the gap between pioneering technology and meaningful human impact.
                </p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="mt-8"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-brand-cyan/10 flex items-center justify-center">
                      <img src={nexgugaLogo} alt="Nexyuga" className="h-6 w-auto" />
                    </div>
                    <div>
                      <p className="font-hero text-lg font-bold text-slate-800">Tech for Good</p>
                      <p className="text-xs font-mono text-slate-400 tracking-wider">CORE PHILOSOPHY</p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              <div className="lg:col-span-3">
                 <p className="mb-6 font-display text-sm font-bold text-slate-600 uppercase tracking-wider">
                  We focus on:
                </p>
                <div className="space-y-0">
                  {[
                    'Scalable Enterprise Solutions',
                    'Human-Centric Digital Design',
                    'Inclusive Tech Ecosystems',
                    'Empowering Local Communities'
                  ].map((item, idx) => (
                    <motion.div
                      key={item}
                      initial={{ opacity: 0, x: 30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.3 + idx * 0.1 }}
                      className="group flex items-start gap-4 border-b border-slate-100 py-4 transition-colors hover:border-brand-cyan/30"
                    >
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand-cyan" />
                      <span className="text-base sm:text-lg transition-all duration-500 font-serif italic text-slate-600 group-hover:translate-x-2">
                        {item}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ABOUT SRP ── */}
      {location.pathname === '/about' && (
        <div id="about-srp" className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 border-t border-slate-100 bg-slate-50/50">
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-3"
            >
              <div className="gradient-line w-16" />
              <span className="font-mono text-sm sm:text-lg font-semibold tracking-[0.3em] text-brand-lime">ABOUT SRP FOUNDATION</span>
            </motion.div>

            <div className="mt-8 space-y-1">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.1 }}
              >
                <span className="font-hero text-[6vw] font-black leading-[0.9] tracking-tight text-slate-900 sm:text-4xl lg:text-6xl">
                  Uplifting{' '}
                </span>
                <span className="font-serif text-[6vw] italic font-light leading-[0.9] text-brand-lime sm:text-4xl lg:text-6xl">
                  communities
                </span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.2 }}
              >
                <span className="font-hero text-[6vw] font-black leading-[0.9] tracking-tight text-slate-900 sm:text-4xl lg:text-6xl">
                  through{' '}
                </span>
                <span className="font-marker text-[6vw] leading-[0.9] text-brand-lime sm:text-4xl lg:text-6xl">
                  empowerment
                </span>
              </motion.div>
            </div>

            <div className="mt-12 grid gap-16 lg:grid-cols-5">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="lg:col-span-2"
              >
                <p className="text-lg leading-relaxed text-slate-500 sm:text-xl text-justify">
                  Operating as a high-velocity catalyst for social equity, SRP Foundation is re-engineering community empowerment through precision-driven impact models. By synergizing adaptive education, healthcare accessibility, and advanced skill ecosystems, the Foundation transforms systemic barriers into gateways of opportunity. SRP Foundation doesn’t simply provide aid; it architects a robust, inclusive infrastructure where human potential is the primary engine of progress.
                </p>
                 <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="mt-8"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-brand-lime/10 flex items-center justify-center">
                      <img src={srpLogo} alt="SRP" className="h-6 w-auto" />
                    </div>
                    <div>
                      <p className="font-hero text-lg font-bold text-slate-800">Social Impact</p>
                      <p className="text-xs font-mono text-slate-400 tracking-wider">CORE MISSION</p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              <div className="lg:col-span-3">
                 <p className="mb-6 font-display text-sm font-bold text-slate-600 uppercase tracking-wider">
                  Our initiatives cover:
                </p>
                <div className="space-y-0">
                  {[
                    'Accessible Education for All',
                    'Community Healthcare Support',
                    'Skill Development Workshops',
                    'Sustainable Livelihood Programs'
                  ].map((item, idx) => (
                    <motion.div
                      key={item}
                      initial={{ opacity: 0, x: 30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.3 + idx * 0.1 }}
                      className="group flex items-start gap-4 border-b border-slate-100 py-4 transition-colors hover:border-brand-lime/30"
                    >
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand-lime" />
                      <span className="text-base sm:text-lg transition-all duration-500 font-serif italic text-slate-600 group-hover:translate-x-2">
                        {item}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

