import { useEffect, useRef, useState } from 'react'
import { useInView, useScroll, useTransform, motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { ArrowUpRight, Calendar, Trophy, Medal } from 'lucide-react'

import group from '../assets/images/group.png'
import hand from '../assets/images/hand.png'
import three from '../assets/images/three.png'
import think from '../assets/images/think.png'
import child from '../assets/images/child.png'
import cricketImg from '../assets/images/cirket.png'
import chessImg from '../assets/images/chess.png'
import nexgugaLogo from '../assets/present by/nexguga.png'
import srpLogo from '../assets/present by/SRP.webp'
import ksrctLogo from '../assets/present by/ksrct logo.png'
import triNexguga from '../assets/present by/tri_nexguga.png'
import logoSrpIcon from '../assets/present by/logo_SRP.jpg'
import aboutImg from '../assets/about.png'
import srp1 from '../assets/aboutsrp/1.jpg'
import srp2 from '../assets/aboutsrp/2.jpg'
import srp3 from '../assets/aboutsrp/3.jpg'
import nexyugaGroup from '../assets/nexyuga_group.png'
import eventImage from '../assets/images/event.png'
import triangleImg from '../assets/loading/triangle.png'

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
    description: 'Where innovation, sports, and talent unite for impactful days',
    image: three,
    accent: 'text-brand-cyan'
  },
  {
    value: '200',
    suffix: '+',
    unit: 'Elites & Adaptive Innovators',
    description: 'The audience, where partners, families, and friends come together to support inclusion',
    image: hand,
    accent: 'text-brand-lime'
  },
  {
    value: '1000',
    suffix: '+',
    unit: 'Attendees',
    description: 'A vibrant gathering of participants, where above 80% are specially abled individuals',
    image: child,
    accent: 'text-brand-cyan'
  },
  {
    value: '50',
    suffix: '+',
    unit: 'NGOs & Special Schools',
    description: 'A strong network of NGOs and organizations championing inclusion',
    image: group,
    accent: 'text-brand-lime'
  },
]

const features = [
  { text: 'A child who was never given a stage finally performs with confidence', accent: 'text-brand-cyan' },
  { text: 'An innovator turns daily challenges into solutions for thousands', accent: 'text-brand-lime' },
  { text: 'A player proves passion goes beyond physical limitations', accent: 'text-brand-cyan' },
  { text: 'Society learns to see ability, not disability', accent: 'text-brand-lime' },
  { text: 'A strategist proves that vision lies in the mind, not the eyes', accent: 'text-brand-cyan' },
]

const aims = [
  'Restore confidence',
  'Create visibility', 
  'Build independence',
  'Inspire society to see ability, not disability'
]

const eventsList = [
  {
    title: "Innovation Fest",
    description: "An innovation fest focused on assistive technology, centered around themes for specially abled and by specially abled. Participants develop impactful solutions that address real-world accessibility challenges. Top three winners under each theme will receive cash prizes and recognition.",
    color: "!text-[#5BCB2B]",
    image: think
  },
  {
    title: "Special Talent Utsav",
    description: "A Special Talent Utsav where school students showcase their talents across three categories: Grades 1–5, 6–8, and 9–12. Each category will recognize top performers with cash prizes.All participants will receive exciting prizes and appreciation.",
    color: "!text-[#5BCB2B]",
    image: eventImage
  },
  {
    title: "Blind Cricket",
    description: "An inclusive blind cricket tournament showcasing skill, teamwork, and determination beyond vision.Players compete using adapted rules, highlighting true sportsmanship and ability. Winner and runner-up teams will receive cash prizes and trophies, celebrating excellence and inspiring every participant.",
    color: "!text-[#5BCB2B]",
    image: cricketImg
  },
  {
    title: "Blind Chess",
    description: "An inclusive blind chess tournament that challenges strategy, memory, and focus beyond sight.Players compete using adaptive methods, showcasing intelligence, patience, and precision. Winner and runner-up will receive prizes, celebrating excellence and strategic brilliance.",
    color: "!text-[#5BCB2B]",
    image: chessImg
  }
]

const eventSchedules = [
  {
    name: "Innovative Fest",
    timeline: [
      { label: "Application Open", date: "10/04/2026" },
      { label: "Application Close", date: "10/05/2026" },
      { label: "1st Round Results", date: "20/05/2026" }
    ],
    prizes: [
      { category: "For Specially Abled", rewards: [{pos: "1st", val: "25K"}, {pos: "2nd", val: "15K"}, {pos: "3rd", val: "10K"}] },
      { category: "By Specially Abled", rewards: [{pos: "1st", val: "25K"}, {pos: "2nd", val: "15K"}, {pos: "3rd", val: "10K"}] }
    ]
  },
  {
    name: "Special Talent",
    timeline: [
      { label: "Application Open", date: "10/04/2026" },
      { label: "Application Close", date: "20/05/2026" },
      { label: "1st Round Results", date: "20/05/2026" }
    ],
    prizes: [
      { category: "Overall", rewards: [{pos: "1st", val: "15K"}, {pos: "2nd", val: "10K"}, {pos: "3rd", val: "5K"}] }
    ]
  },
  {
    name: "Short Film",
    timeline: [
      { label: "Application Open", date: "10/04/2026" },
      { label: "Application Close", date: "20/05/2026" },
      { label: "1st Round Results", date: "20/05/2026" }
    ],
    prizes: [
      { category: "Overall", rewards: [{pos: "1st", val: "15K"}, {pos: "2nd", val: "10K"}, {pos: "3rd", val: "5K"}] }
    ]
  },
  {
    name: "Blind Cricket",
    timeline: [],
    prizes: [
      { category: "Overall", rewards: [{pos: "1st", val: "10K"}, {pos: "2nd", val: "5K"}] }
    ]
  },
  {
    name: "Blind Chess",
    timeline: [],
    prizes: [
      { category: "Overall", rewards: [{pos: "1st", val: "3K"}, {pos: "2nd", val: "2K"}] }
    ]
  }
]

/* ── Marquee ── */
function MarqueeBand() {
  const items = ['INCLUSIVE DESIGN', 'ASSISTIVE TECHNOLOGY', 'ACCESSIBILITY', 'INNOVATION', 'VYUGA 2026', 'KSRCT']
  const doubled = [...items, ...items]
  return (
    <div className="relative overflow-hidden bg-white/50 backdrop-blur-sm">
      <div className="animate-marquee flex w-max">
        {doubled.map((item, i) => (
          <span key={i} className="flex items-center gap-4 px-2">
            <span className="whitespace-nowrap py-2 font-sans font-bold text-xl tracking-widest sm:text-2xl lg:text-3xl text-[#5BCB2B]">
              {item}
            </span>
            <span className="flex items-center justify-center px-4 select-none">
              <img src={triangleImg} alt="Separator" className="h-4 sm:h-5 w-auto object-contain opacity-80" />
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}

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
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-50 via-white to-slate-50 pb-6">
        <MarqueeBand />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-cyan/5 via-transparent to-brand-lime/5" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-4">
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
              className="font-mono text-xs sm:text-sm font-bold tracking-[0.3em] text-slate-500 uppercase mb-4"
            >
              Presented by
            </motion.h3>

            <div className="flex flex-col items-center gap-4">
              {/* Main presenters */}
              <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-8">
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
                  <div className="relative bg-white rounded-2xl p-3 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border border-slate-100 flex items-center justify-center h-36 w-56">
                    <img src={nexgugaLogo} alt="Nexyuga Innovation" className="max-h-full max-w-full object-contain" />
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
                  <div className="relative bg-white rounded-2xl p-3 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border border-slate-100 flex items-center justify-center h-36 w-56">
                    <img src={srpLogo} alt="SRP Foundation" className="max-h-full max-w-full object-contain" />
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
                <div className="relative bg-white rounded-2xl p-3 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border border-slate-100 flex items-center justify-center h-36 w-56">
                  <img src={ksrctLogo} alt="KSRCT" className="max-h-[80%] max-w-[80%] object-contain" />
                </div>
              </motion.div>

            </div>

          </motion.div>

        </div>

      </div>

      {/* ── About — cinematic split layout, NO cards ── */}
      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 min-h-screen flex flex-col justify-center">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <motion.div style={{ y: parallaxY }} className="absolute top-10 right-[10%] h-80 w-80 rounded-full bg-brand-cyan/5 blur-[100px]" />
          <motion.div style={{ y: parallaxY }} className="absolute bottom-10 left-[5%] h-60 w-60 rounded-full bg-brand-lime/5 blur-[80px]" />
        </div>

        <div className="relative">
          {/* Two-column rectangle layout */}
          <div className="grid gap-10 lg:grid-cols-5 items-stretch">
            {/* LEFT: headline + body text + blockquote */}
            <div className="flex flex-col lg:col-span-2">
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

              <p className="mt-6 text-base leading-relaxed text-slate-800 font-medium sm:text-lg text-justify">
                Vyuga is more than just an innovation fest, it is a platform that celebrates inclusion in every form.
                From innovative solutions to inclusive sports like blind cricket and blind chess, and platforms like Special Talent Utsav, Vyuga creates opportunities for differently-abled individuals to showcase their strength, talent, and potential.
              </p>

              <p className="mt-4 text-sm leading-relaxed text-slate-700 sm:text-base text-justify">
                It is a space where innovation meets impact where technology solves problems, sports build confidence, and talent finds recognition.
                Vyuga is not just about ideas. It is about creating experiences that empower, include, and inspire.
              </p>

              <blockquote className="mt-6 border-l-4 border-[#5BCB2B] pl-6">
                <p className="font-serif text-base italic text-[#5BCB2B] font-bold sm:text-lg sm:whitespace-nowrap">
                  "Disability is not a limitation — lack of opportunity is."
                </p>
                <cite className="mt-2 block font-mono text-[9px] not-italic tracking-[0.3em] text-slate-500 font-bold">
                  — VYUGA BELIEF
                </cite>
              </blockquote>
            </div>

            {/* RIGHT: image (no box) + feature list */}
            <div className="lg:col-span-3 flex flex-col justify-between h-full">
              {/* About image — fits fully, no crop, no box */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="w-full mb-4 flex justify-center"
              >
                <img
                  src={aboutImg}
                  alt="About Vyuga"
                  className="w-full max-h-[340px] lg:max-h-[300px] object-contain rounded-xl"
                />
              </motion.div>

              <div className="mt-auto pt-6">
                <p className="mb-4 font-display text-xs font-bold text-slate-600 uppercase tracking-wider">
                  It is a platform where:
                </p>
                <div className="space-y-0">
                  {features.map((item, idx) => (
                    <div
                      key={item.text}
                      className="group flex items-start gap-4 border-b border-slate-100 py-2 transition-colors hover:border-brand-cyan/30"
                    >
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand-cyan" />
                      <span className={`text-sm sm:text-base transition-all duration-500 tracking-wide ${idx % 2 === 0 ? 'font-serif italic' : 'font-mono'} ${item.accent} group-hover:translate-x-2`}>
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Stats Cards (Moved) ── */}
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 w-full">
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
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: idx * 0.12, ease: [0.22, 1, 0.36, 1] }}
                  className={`group relative overflow-hidden bg-white border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-[1.02] cursor-pointer h-full min-h-[300px] sm:min-h-[340px] px-4 py-8 sm:px-6 sm:py-10 ${borderRadius} flex flex-col items-center justify-center text-center`}
                >
                  {/* Flowing background animation on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-white opacity-50" />
                  <div className="absolute inset-0 bg-gradient-to-r from-brand-cyan/5 via-brand-lime/5 to-brand-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Content */}
                  <div className="relative z-10 w-full h-full flex flex-col items-center justify-between gap-2">
                    <div className="flex-1 flex flex-col items-center justify-end">
                      <img 
                        src={s.image} 
                        alt={s.unit} 
                        className="h-12 w-auto mb-6 object-contain opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                      />
                      <p className={`font-impact text-5xl sm:text-6xl tracking-wider transition-colors duration-300 ${s.accent} group-hover:!text-[#5BCB2B] group-hover:drop-shadow-lg mb-2`}>
                        <AnimatedCounter target={s.value} suffix={s.suffix} />
                      </p>
                      <p className="font-mono text-[10px] sm:text-xs tracking-[0.2em] text-slate-400 group-hover:text-slate-800 transition-colors duration-300 font-bold uppercase">
                        {s.unit}
                      </p>
                    </div>
                    <div className="flex-1 flex items-start mt-4">
                      {s.description && (
                        <p className="text-xs sm:text-sm leading-relaxed text-slate-600 group-hover:text-slate-900 transition-colors duration-300 line-clamp-4">
                          {s.description}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── EVENT DETAILS SECTION ── */}
      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 border-t border-slate-100 min-h-[100dvh] flex flex-col">
        <div className="flex items-center gap-3 mb-4 shrink-0">
          <div className="gradient-line w-16" />
          <span className="font-mono text-sm sm:text-lg font-semibold tracking-[0.3em] text-brand-cyan">EVENT EXPERIENCES</span>
        </div>

        <div className="grid gap-4 md:grid-cols-2 flex-1 min-h-0 pb-4">
          {eventsList.map((event, index) => {
            let gridClass = ""
            // Layout: 
            // 0 (Innovation): col-span-2 (Full width top)
            // 1 (Talent): row-span-2 (Vertical left)
            // 2 (Cricket) & 3 (Chess): normal cells (Right stack)
            if (index === 0) gridClass = "md:col-span-2"
            else if (index === 1) gridClass = "md:row-span-2"
            
            return (
              <div key={index} className={`group relative bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 flex flex-col ${gridClass}`}>
                {/* Gradient Line */}
                <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-brand-cyan to-brand-lime rounded-l-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Card Content */}
                <div className="flex-1 flex flex-col h-full">
                  <div className={`flex items-center justify-between gap-4 sm:gap-10 h-full ${index === 1 ? 'flex-col items-start' : 'flex-row'}`}>
                    <div className={`flex-1 w-full`}>
                      <h4 className={`font-display text-lg sm:text-xl font-bold ${event.color} mb-2 uppercase tracking-wide`}>
                        {event.title}
                      </h4>
                      <p className="text-slate-600 text-sm leading-relaxed font-medium text-justify">
                        {event.description}
                      </p>
                    </div>
                    
                    {/* Horizontal side images (Innovation, Cricket, Chess) ALWAYS on the right */}
                    {(index === 0 || index === 2 || index === 3) && event.image && (
                      <div className="w-auto flex shrink-0">
                         <img src={event.image} alt={event.title} className="max-h-24 sm:max-h-40 w-auto object-contain drop-shadow-sm group-hover:drop-shadow-md transition-transform duration-300 group-hover:scale-105" />
                      </div>
                    )}

                    {/* Vertical bottom image (Talent Utsav) */}
                    {index === 1 && event.image && (
                      <div className="mt-auto pt-6 flex justify-center w-full">
                         <img src={event.image} alt={event.title} className="max-h-72 w-full object-contain drop-shadow-sm group-hover:drop-shadow-md transition-transform duration-300 group-hover:scale-[1.02]" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── TIMELINE & PRIZES SECTION ── */}
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 border-t border-slate-100 bg-white">
        <div className="flex flex-col items-center justify-center gap-3 mb-12">
          <div className="flex items-center gap-3">
            <div className="gradient-line w-8 sm:w-16" />
            <span className="font-mono text-sm sm:text-lg font-semibold tracking-[0.3em] text-brand-cyan text-center">SCHEDULE & AWARDS</span>
            <div className="gradient-line w-8 sm:w-16" />
          </div>
          <p className="text-slate-500 font-medium tracking-wide text-sm sm:text-base text-center">Key dates and prize pool for Vyuga events</p>
        </div>

        <div className="max-w-5xl mx-auto flex flex-col gap-6">
          {eventSchedules.map((event, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="flex flex-col md:flex-row bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
            >
              {/* Event Name Left Banner */}
              <div className="bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 md:w-1/3 p-6 sm:p-8 flex flex-col justify-center relative overflow-hidden">
                <div className="absolute left-0 top-0 w-1.5 h-full bg-gradient-to-b from-brand-cyan to-[#5BCB2B] opacity-80" />
                <h3 className="font-display text-2xl lg:text-3xl font-bold text-slate-800 uppercase tracking-wide group-hover:text-brand-cyan transition-colors">{event.name}</h3>
              </div>

              {/* Event Details Right Config */}
              <div className={`p-6 sm:p-8 md:w-2/3 grid gap-8 sm:gap-12 ${event.timeline.length > 0 ? 'md:grid-cols-2' : 'md:grid-cols-1'}`}>
                
                {/* Timeline Column */}
                {event.timeline.length > 0 && (
                  <div>
                    <h4 className="font-bold text-slate-400 uppercase text-[11px] sm:text-xs tracking-widest mb-4 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-brand-cyan" /> Key Dates
                    </h4>
                    <ul className="space-y-3 shrink-0">
                      {event.timeline.map((step, sIdx) => (
                        <li key={sIdx} className="flex justify-between items-center text-sm border-b border-slate-100 last:border-0 pb-2 last:pb-0">
                          <span className="text-slate-600 font-medium pr-4">{step.label}</span>
                          <span className={`font-bold shrink-0 text-right ${step.label.includes('Results') ? 'text-[#5BCB2B]' : 'text-slate-800'}`}>
                            {step.date}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Prizes Column */}
                {event.prizes.length > 0 && (
                  <div>
                    <h4 className="font-bold text-slate-400 uppercase text-[11px] sm:text-xs tracking-widest mb-4 flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-[#5BCB2B]" /> Prizes
                    </h4>
                    <div className="space-y-5">
                      {event.prizes.map((prizeGrp, pIdx) => (
                        <div key={pIdx}>
                          {prizeGrp.category !== "Overall" && (
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                              {prizeGrp.category}
                            </span>
                          )}
                          <div className="flex flex-wrap gap-x-5 gap-y-3 bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">
                            {prizeGrp.rewards.map((rew, rIdx) => {
                              let rankColor = rew.pos === "1st" ? "text-yellow-500" : rew.pos === "2nd" ? "text-slate-400" : "text-amber-600"
                              return (
                                <div key={rIdx} className="flex items-center gap-2 min-w-fit">
                                  <Medal className={`w-4 h-4 ${rankColor}`} />
                                  <span className="text-sm text-slate-600 whitespace-nowrap flex items-center gap-1.5">
                                    <span className="font-black text-slate-800">{rew.pos}</span> <div className="w-1 h-1 rounded-full bg-slate-300" /> <span className="font-bold text-slate-800 tracking-wide">₹{rew.val}</span>
                                  </span>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
              </div>
            </motion.div>
          ))}
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
                <span className="font-hero text-[3vw] font-black leading-[0.9] tracking-tight text-slate-900 sm:text-xl lg:text-3xl">
                  Fostering Independent {' '}
                </span>
                <span className="font-serif text-[3vw] italic font-light leading-[0.9] text-brand-cyan sm:text-xl lg:text-3xl">
                  Education
                </span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.2 }}
              >
                <span className="font-hero text-[3vw] font-black leading-[0.9] tracking-tight text-slate-900 sm:text-xl lg:text-3xl">
                  with{' '}
                </span>
                <span className="font-hero text-[3vw] leading-[0.9] text-[#5BCB2B] sm:text-xl lg:text-3xl">
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
                <p className="text-sm leading-relaxed text-slate-500 sm:text-base text-justify">
                  Nexyuga Innovation is an impact-driven startup focused on creating inclusive solutions for differently-abled individuals. With a vision to make learning accessible to all, Nexyuga develops affordable assistive products that promote independence and confidence.
                  <br /><br />
                  One of its key innovations, Vithara, is an independent tactile and Braille learning book designed for visually impaired learners. It combines touch-based elements with Braille to enable interactive and self-paced learning.
                  <br /><br />
                  Through products like Vithara, Nexyuga aims to bridge the gap between education and accessibility, empowering individuals to learn, explore, and grow without limitations.
                </p>
              </motion.div>

              <div className="lg:col-span-3">
                 <p className="mb-6 font-display text-sm font-bold text-slate-600 uppercase tracking-wider">
                  We focus on:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div className="flex flex-col h-full justify-center">
                    <div className="space-y-0">
                      {[
                        'Quality Education',
                        'Independent Learning',
                        'Assistive Technology',
                        'Inclusive Innovation'
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
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 0.7 }}
                      className="mt-8 flex"
                    >
                      <a 
                        href="https://nexyugainnovations.com/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="group inline-flex items-center gap-2.5 rounded-full bg-white px-5 py-2 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 transition-all hover:bg-brand-cyan hover:text-white hover:ring-brand-cyan"
                      >
                        <img src={triNexguga} alt="Nexyuga Icon" className="h-6 w-auto object-contain transition-transform group-hover:scale-110" />
                        Visit Website
                      </a>
                    </motion.div>
                  </div>
                  
                  {/* Nexyuga Group Image - Side by side */}
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="w-full flex justify-center md:justify-end"
                  >
                    <img src={nexyugaGroup} alt="Nexyuga Team" className="max-w-full h-auto object-contain max-h-[550px] scale-110 md:scale-125 lg:scale-[1.4] origin-center md:origin-right -translate-y-6 lg:-translate-y-12" />
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
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex items-center justify-end gap-3"
            >
              <span className="font-mono text-sm sm:text-lg font-semibold tracking-[0.3em] text-brand-lime text-right">ABOUT SRP FOUNDATION</span>
              <div className="gradient-line w-16" />
            </motion.div>

            <div className="mt-12 grid gap-16 lg:grid-cols-5 items-start">
              {/* LEFT Side: Image (col-span-2) */}
              <div className="lg:col-span-2 flex flex-col h-full justify-center lg:pt-[130px]">
                 <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="w-full flex justify-center md:justify-start h-[300px] lg:h-[380px] relative overflow-hidden rounded-xl"
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

              {/* RIGHT Side: Header + Initiatives + Text (col-span-3) */}
              <div className="lg:col-span-3 flex flex-col">
                <div className="space-y-1 mb-10 text-right">
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: 0.1 }}
                  >
                    <span className="font-hero text-[3vw] font-black leading-[0.9] tracking-tight text-slate-900 sm:text-xl lg:text-3xl">
                      Uplifting{' '}
                    </span>
                    <span className="font-serif text-[3vw] italic font-light leading-[0.9] text-brand-lime sm:text-xl lg:text-3xl">
                      communities
                    </span>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                  >
                    <span className="font-hero text-[3vw] font-black leading-[0.9] tracking-tight text-slate-900 sm:text-xl lg:text-3xl">
                      through{' '}
                    </span>
                    <span className="font-marker text-[3vw] leading-[0.9] text-[#5BCB2B] sm:text-xl lg:text-3xl">
                      empowerment
                    </span>
                  </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                  
                  {/* INITIATIVES (Middle) */}
                  <div className="flex flex-col h-full text-right">
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
                          className="group flex flex-row-reverse items-start gap-4 border-b border-slate-100 py-3 transition-colors hover:border-brand-lime/30"
                        >
                          <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand-lime" />
                          <span className="text-base sm:text-lg transition-all duration-500 font-serif italic text-slate-600 group-hover:-translate-x-2">
                            {item}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 0.7 }}
                      className="mt-8 flex justify-end"
                    >
                      <a 
                        href="https://www.shreerengapolymers.com/srp-foundation-plants-1600-trees-at-valluvar-college-of-science-and-management-karur/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="group inline-flex flex-row-reverse items-center gap-2.5 rounded-full bg-white px-5 py-2 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 transition-all hover:bg-brand-lime hover:text-white hover:ring-brand-lime"
                      >
                        <img src={logoSrpIcon} alt="SRP Icon" className="h-6 w-auto object-contain rounded-full transition-transform group-hover:scale-110" />
                        Visit Website
                      </a>
                    </motion.div>
                  </div>

                  {/* PARAGRAPH (Right) */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                  >
                    <p className="text-sm leading-relaxed text-slate-500 sm:text-base text-right">
                      SRP Foundation is a social impact organization committed to empowering communities and creating meaningful change through inclusive initiatives.
                      <br /><br />
                      The foundation works across various sectors to support underrepresented and differently-abled individuals, focusing on education, accessibility, and community development.
                      <br /><br />
                      Through collaborations, programs, and grassroots efforts, SRP Foundation aims to build an equitable society where every individual has the opportunity to grow, contribute, and thrive.
                    </p>
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

