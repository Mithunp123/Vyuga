import { useEffect, useRef, useState } from 'react'
import { useInView, useScroll, useTransform, motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'

import group from '../assets/images/group.png'
import hand from '../assets/images/hand.png'
import three from '../assets/images/three.png'
import think from '../assets/images/think.png'
import child from '../assets/images/child.png'
import nexgugaLogo from '../assets/present by/nexguga.png'
import srpLogo from '../assets/present by/SRP.webp'
import ksrctLogo from '../assets/present by/ksrct logo.png'
import aboutImg from '../assets/about.png'
import srp1 from '../assets/aboutsrp/1.jpg'
import srp2 from '../assets/aboutsrp/2.jpg'
import srp3 from '../assets/aboutsrp/3.jpg'
import nexyugaGroup from '../assets/nexyuga_group.png'
import eventImage from '../assets/images/event.png'

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
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      }
      else {
        setCount(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [inView, target, duration])

  return <span ref={ref}>{count}{suffix}</span>
}

const stats = [
  {
    value: '2',
    unit: 'Days',
    description: 'Redefining the frontier by spotlighting human talent through universally accessible tech, inclusive storytelling, and real-world collaboration.',
    image: three,
    accent: 'text-brand-cyan'
  },
  {
    value: '200',
    suffix: '+',
    unit: 'Elites & Adaptive Innovators',
    description: 'Bridging the gap between cutting-edge tech and limitless talent, led by a community where innovation knows no bounds.',
    image: hand,
    accent: 'text-brand-lime'
  },
  {
    value: '1000',
    suffix: '+',
    unit: 'Attendees',
    description: 'Uniting institutional leaders, support networks, and next-gen innovators to architect a future where accessibility is the default.',
    image: child,
    accent: 'text-brand-cyan'
  },
  {
    value: '50',
    suffix: '+',
    unit: 'NGOs & Special Schools',
    description: 'Synergizing with advocacy partners and adaptive learning centers to drive universal access and create a truly inclusive society.',
    image: group,
    accent: 'text-brand-lime'
  },
]

const features = [
  { text: 'A child who was never given a stage finally performs with confidence', accent: 'font-serif italic text-brand-cyan' },
  { text: 'An innovator turns daily challenges into solutions for thousands', accent: 'font-marker text-brand-lime' },
  { text: 'A player proves passion goes beyond physical limitations', accent: 'font-serif italic text-brand-cyan' },
  { text: 'Society learns to see ability, not disability', accent: 'font-marker text-brand-lime' },
  { text: 'A strategist proves that vision lies in the mind, not the eyes', accent: 'font-serif italic text-brand-cyan' },
]

const aims = [
  'Restore confidence',
  'Create visibility', 
  'Build independence',
  'Inspire society to see ability, not disability'
]

const eventsList = [
  {
    title: "Innovation Fest for Differently Abled",
    description: "A competition where students build working tools and gadgets to help people with disabilities overcome daily struggles.",
    color: "text-brand-cyan"
  },
  {
    title: "Innovation Fest by Differently Abled",
    description: "A contest where people with disabilities pitch their own inventions and business ideas to help make the world a fairer place for everyone.",
    color: "text-brand-lime"
  },
  {
    title: "Special Talent Utsav",
    description: "A top-tier talent show where the best performers from different schools and colleges show off their skills in art and performance.",
    color: "text-brand-cyan"
  },
  {
    title: "Blind Cricket",
    description: "A professional cricket tournament for athletes with visual impairments, played at a high level with big prizes for the winners",
    color: "text-brand-lime"
  },
  {
    title: "Blind Chess",
    description: "A chess tournament for players with visual impairments, where they compete using specially designed boards and pieces to navigate the game through touch and memory.",
    color: "text-brand-cyan"
  }
]

export default function About() {
  const [currentSrpImage, setCurrentSrpImage] = useState(0)
  const srpImages = [srp1, srp2, srp3]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSrpImage((prev) => (prev + 1) % srpImages.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const sectionRef = useRef(null)
  const inView = useInView(sectionRef, { once: true, amount: 0.15 })
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] })
  const parallaxY = useTransform(scrollYProgress, [0, 1], [60, -60])
  const location = useLocation()

  return (
    <section id="about" className="relative overflow-hidden bg-white" ref={sectionRef}>
      {/* ── Presented by section ── */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-50 via-white to-slate-50 min-h-screen flex flex-col justify-center">
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
                  <div className="relative bg-white rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border border-slate-100 flex items-center justify-center h-40 w-64 sm:h-56 sm:w-80">
                    <img
                      src={nexgugaLogo}
                      alt="Nexyuga Innovation"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
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
                  <div className="relative bg-white rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border border-slate-100 flex items-center justify-center h-40 w-64 sm:h-56 sm:w-80">
                    <img
                      src={srpLogo}
                      alt="SRP Foundation"
                      className="max-h-full max-w-full object-contain"
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
                <div className="relative bg-white rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border border-slate-100 flex items-center justify-center h-40 w-64 sm:h-56 sm:w-80">
                  <img
                    src={ksrctLogo}
                    alt="KSRCT"
                    className="max-h-[85%] max-w-[85%] object-contain"
                  />
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Stats — random shaped boxes ── */}
      <div className="relative overflow-hidden border-y border-slate-100 min-h-screen flex flex-col justify-center bg-slate-50/50">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-cyan-light/10 via-transparent to-brand-lime-light/10" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((s, idx) => {
              // Random border radius for organic feel
              const borderRadius = [
                'rounded-[2rem_1rem_2rem_1rem]',
                'rounded-[1rem_2rem_1rem_2rem]',
                'rounded-[2rem_2rem_1rem_1rem]',
                'rounded-[1rem_1rem_2rem_2rem]'
              ][idx % 4]
              
              return (
                <motion.div
                  key={s.unit}
                  initial={{ opacity: 0, y: 40 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.7, delay: idx * 0.12, ease: [0.22, 1, 0.36, 1] }}
                  className={`group relative overflow-hidden bg-white border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 cursor-pointer h-full ${borderRadius} p-6 sm:p-8 flex flex-col items-center justify-center text-center`}
                >
                  {/* Flowing background animation on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-white opacity-50" />
                  <div className="absolute inset-0 bg-gradient-to-r from-brand-cyan/5 via-brand-lime/5 to-brand-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Content */}
                  <div className="relative z-10 w-full flex flex-col items-center">
                    <img 
                      src={s.image} 
                      alt={s.unit} 
                      className="h-16 w-auto mb-4 object-contain opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                    />
                    <p className={`font-impact text-5xl sm:text-6xl tracking-wider transition-colors duration-300 ${s.accent} group-hover:!text-[#5BCB2B] group-hover:drop-shadow-lg mb-2`}>
                      <AnimatedCounter target={s.value} suffix={s.suffix} />
                    </p>
                    <p className="font-mono text-[10px] tracking-[0.2em] text-slate-400 group-hover:text-slate-800 transition-colors duration-300 mb-4 font-bold uppercase">
                      {s.unit}
                    </p>
                    {s.description && (
                      <p className="text-sm leading-relaxed text-slate-600 group-hover:text-slate-900 transition-colors duration-300 line-clamp-3">
                        {s.description}
                      </p>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── About — cinematic split layout, NO cards ── */}
      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 min-h-screen flex flex-col justify-center">
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
            <span className="font-mono text-sm sm:text-base font-semibold tracking-[0.3em] text-brand-cyan">ABOUT VYUGA</span>
          </motion.div>

          {/* Giant headline with mixed fonts */}
          <div className="mt-4 space-y-1">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              <span className="font-hero text-[4vw] font-black leading-[0.9] tracking-tight text-slate-900 sm:text-2xl lg:text-4xl">
                A voice for{' '}
              </span>
              <span className="font-serif text-[4vw] italic font-light leading-[0.9] text-brand-cyan sm:text-2xl lg:text-4xl">
                abilities
              </span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <span className="font-hero text-[4vw] font-black leading-[0.9] tracking-tight text-slate-900 sm:text-2xl lg:text-4xl">
                often{' '}
              </span>
              <span className="font-marker text-[4vw] leading-[0.9] gradient-text sm:text-2xl lg:text-4xl">
                unseen
              </span>
            </motion.div>
          </div>

          {/* Two-column text + feature list — no boxes */}
          <div className="mt-8 grid gap-8 lg:grid-cols-5">
            <div
              className="lg:col-span-2"
            >
              <p className="text-base leading-relaxed text-slate-800 font-medium sm:text-lg">
                Vyuga is not just an event — it's a space where differently abled individuals are celebrated, heard, and empowered. 
                In a world where they are often limited by opportunities rather than their potential.
              </p>

              <p className="mt-4 text-sm leading-relaxed text-slate-700 sm:text-base">
                Vyuga features four major event experiences in a simple and inclusive format, designed to spotlight talent, innovation, and resilience.
              </p>

              <blockquote
                className="mt-6 border-l-4 border-brand-cyan pl-6"
              >
                <p className="font-serif text-lg italic text-slate-900 font-bold sm:text-xl">
                  "Disability is not a limitation — lack of opportunity is."
                </p>
                <cite className="mt-2 block font-mono text-[9px] not-italic tracking-[0.3em] text-slate-500 font-bold">
                  — VYUGA BELIEF
                </cite>
              </blockquote>

              <div
                className="mt-8 max-w-[200px]"
              >
                <img 
                  src={aboutImg} 
                  alt="About Vyuga" 
                  className="w-full h-auto object-contain"
                />
              </div>
            </div>

            {/* Platform examples */}
            <div className="lg:col-span-3">
              <p className="mb-4 font-display text-xs font-bold text-slate-600 uppercase tracking-wider">
                It is a platform where:
              </p>
              <div className="space-y-0 mb-6">
                {features.map((item, idx) => (
                  <div
                    key={item.text}
                    className="group flex items-start gap-4 border-b border-slate-100 py-2 transition-colors hover:border-brand-cyan/30"
                  >
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand-cyan" />
                    <span className={`text-sm sm:text-base transition-all duration-500 font-bold tracking-wide ${item.accent} group-hover:translate-x-2`}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>

              {/* Mission statement */}
              <div
                className="rounded-2xl bg-gradient-to-br from-brand-cyan-light/20 to-brand-lime-light/20 p-4 border border-brand-cyan/10"
              >
                <p className="font-display text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Through innovation, talent, and sports, Vyuga aims to:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {aims.map((aim, idx) => (
                    <div key={aim} className="flex items-center gap-1">
                      <span className="h-1 w-1 rounded-full bg-brand-lime" />
                      <span className="text-xs font-bold text-slate-800">{aim}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-2 border-t border-brand-cyan/20">
                  <p className="font-serif text-sm italic text-slate-900 font-bold text-center">
                    This is more than a competition. This is more than a festival.
                  </p>
                  <p className="font-marker text-base text-brand-cyan font-bold text-center mt-1">
                    Vyuga is a movement that turns hidden strength into pride.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── EVENT DETAILS SECTION ── */}
      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 border-t border-slate-100 h-screen max-h-[1080px] flex flex-col">
        <div className="flex items-center gap-3 mb-4 shrink-0">
          <div className="gradient-line w-16" />
          <span className="font-mono text-sm sm:text-lg font-semibold tracking-[0.3em] text-brand-cyan">EVENT EXPERIENCES</span>
        </div>

        <div className="grid gap-4 md:grid-cols-2 md:grid-rows-4 flex-1 min-h-0 pb-4">
          {eventsList.map((event, index) => {
            let gridClass = ""
            if (index === 0) gridClass = "md:col-span-2"
            else if (index === 1) gridClass = "md:row-span-2"
            else if (index === 4) gridClass = "md:col-span-2"

            return (
              <div key={index} className={`group relative bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 flex ${index === 0 ? 'flex-row items-center gap-4' : 'flex-col'} ${gridClass}`}>
                <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-brand-cyan to-brand-lime rounded-l-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className={`${index === 0 ? 'flex-1' : ''}`}>
                    <h4 className={`font-display text-lg sm:text-xl font-bold ${event.color} mb-2 uppercase tracking-wide shrink-0`}>
                      {event.title}
                    </h4>
                    <p className={`text-slate-600 text-sm leading-relaxed font-medium text-justify overflow-y-auto custom-scrollbar pr-2 ${index === 1 ? '' : 'flex-1'}`}>
                      {event.description}
                    </p>
                </div>

                {index === 0 && (
                   <img src={think} alt="Innovation" className="h-32 w-auto object-contain hidden sm:block" />
                )}

                {index === 1 && (
                  <div className="mt-4 flex-1 relative overflow-hidden rounded-xl">
                    <img src={eventImage} alt="Event" className="absolute inset-0 w-full h-full object-contain" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── ABOUT NEXYUGA ── */}
      {location.pathname === '/about' && (
        <div id="about-nexyuga" className="relative mx-auto max-w-7xl px-4 py-8 border-t border-slate-100 min-h-screen flex flex-col justify-center">
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
                <span className="font-hero text-[4vw] font-black leading-[0.9] tracking-tight text-slate-900 sm:text-2xl lg:text-4xl">
                  Driving digital{' '}
                </span>
                <span className="font-serif text-[4vw] italic font-light leading-[0.9] text-brand-cyan sm:text-2xl lg:text-4xl">
                  transformation
                </span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.2 }}
              >
                <span className="font-hero text-[4vw] font-black leading-[0.9] tracking-tight text-slate-900 sm:text-2xl lg:text-4xl">
                  with{' '}
                </span>
                <span className="font-marker text-[4vw] leading-[0.9] gradient-text sm:text-2xl lg:text-4xl">
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
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between border-t border-slate-100 pt-6">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-brand-cyan/10 flex items-center justify-center">
                        <img src={nexgugaLogo} alt="Nexyuga" className="h-6 w-auto" />
                      </div>
                      <div>
                        <p className="font-hero text-lg font-bold text-slate-800">Enable Independence</p>
                        <p className="text-xs font-mono text-slate-400 tracking-wider"></p>
                      </div>
                    </div>
                    <a 
                      href="https://nexyuga.in/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-2 rounded-full bg-slate-50 px-5 py-2.5 text-sm font-bold text-slate-700 transition-all hover:bg-brand-cyan hover:text-white"
                    >
                      Visit Website
                      <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </a>
                  </div>
                </motion.div>
              </motion.div>

              <div className="lg:col-span-3">
                 <p className="mb-6 font-display text-sm font-bold text-slate-600 uppercase tracking-wider">
                  We focus on:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
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
                        className="group flex items-start gap-4 border-b border-slate-100 py-3 transition-colors hover:border-brand-cyan/30"
                      >
                        <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand-cyan" />
                        <span className="text-base sm:text-lg transition-all duration-500 font-serif italic text-slate-600 group-hover:translate-x-2">
                          {item}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* Nexyuga Group Image - Side by side */}
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="w-full flex justify-center md:justify-end"
                  >
                    <img src={nexyugaGroup} alt="Nexyuga Team" className="max-w-full h-auto object-contain max-h-[250px]" />
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ABOUT SRP ── */}
      {location.pathname === '/about' && (
        <div id="about-srp" className="relative mx-auto max-w-7xl px-4 border-t border-slate-100 bg-slate-50/50 min-h-screen flex flex-col justify-center">
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
                <span className="font-hero text-[4vw] font-black leading-[0.9] tracking-tight text-slate-900 sm:text-2xl lg:text-4xl">
                  Uplifting{' '}
                </span>
                <span className="font-serif text-[4vw] italic font-light leading-[0.9] text-brand-lime sm:text-2xl lg:text-4xl">
                  communities
                </span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.2 }}
              >
                <span className="font-hero text-[4vw] font-black leading-[0.9] tracking-tight text-slate-900 sm:text-2xl lg:text-4xl">
                  through{' '}
                </span>
                <span className="font-marker text-[4vw] leading-[0.9] text-brand-lime sm:text-2xl lg:text-4xl">
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
                  Operating as a high-velocity catalyst for social equity, SRP Foundation is re-engineering community empowerment through precision-driven impact models. By synergizing adaptive education, healthcare accessibility, and advanced skill ecosystems, the Foundation transforms systemic barriers into gateways of opportunity. SRP Foundation doesn't simply provide aid; it architects a robust, inclusive infrastructure where human potential is the primary engine of progress.
                </p>
                 <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="mt-8"
                >
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between border-t border-slate-200/50 pt-6">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-brand-lime/10 flex items-center justify-center">
                        <img src={srpLogo} alt="SRP" className="h-6 w-auto" />
                      </div>
                      <div>
                        <p className="font-hero text-lg font-bold text-slate-800">Social Impact</p>
                        <p className="text-xs font-mono text-slate-400 tracking-wider">CORE MISSION</p>
                      </div>
                    </div>
                     <a 
                      href="https://www.shreerengapolymers.com/srp-foundation-plants-1600-trees-at-valluvar-college-of-science-and-management-karur/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 transition-all hover:bg-brand-lime hover:text-white hover:ring-brand-lime"
                    >
                      Visit Website
                      <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </a>
                  </div>
                </motion.div>
              </motion.div>

              <div className="lg:col-span-3">
                 <p className="mb-6 font-display text-sm font-bold text-slate-600 uppercase tracking-wider">
                  Our initiatives cover:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
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
                        className="group flex items-start gap-4 border-b border-slate-100 py-3 transition-colors hover:border-brand-lime/30"
                      >
                        <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand-lime" />
                        <span className="text-base sm:text-lg transition-all duration-500 font-serif italic text-slate-600 group-hover:translate-x-2">
                          {item}
                        </span>
                      </motion.div>
                    ))}
                  </div>

                   {/* SRP Slideshow */}
                   <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="w-full flex justify-center md:justify-end h-[250px] relative overflow-hidden rounded-xl"
                  >
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={currentSrpImage}
                        src={srpImages[currentSrpImage]}
                        alt="SRP Foundation Initiatives"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0 w-full h-full object-cover rounded-xl shadow-md"
                      />
                    </AnimatePresence>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

