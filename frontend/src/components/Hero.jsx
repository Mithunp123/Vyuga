import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

import logoV from '../assets/logo/1.png'
import logoY from '../assets/logo/2.png'
import logoU from '../assets/logo/3.png'
import logoG from '../assets/logo/4.png'
import logoA from '../assets/logo/5.png'

/* ── Interactive particle network (Canvas) ── */
function ParticleCanvas() {
  const canvasRef = useRef(null)
  const mouse = useRef({ x: -9999, y: -9999 })
  const raf = useRef(null)

  const init = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let w = canvas.parentElement.offsetWidth
    let h = canvas.parentElement.offsetHeight
    canvas.width = w * dpr
    canvas.height = h * dpr
    canvas.style.width = w + 'px'
    canvas.style.height = h + 'px'
    ctx.scale(dpr, dpr)

    const count = Math.min(Math.floor((w * h) / 10000), 140)
    const pts = []
    for (let i = 0; i < count; i++) {
      pts.push({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 2.5 + 0.5,
        color: Math.random() > 0.5 ? '1,151,178' : '91,203,43',
      })
    }

    const maxDist = 130
    const mouseRadius = 220

    function draw() {
      ctx.clearRect(0, 0, w, h)
      const mx = mouse.current.x, my = mouse.current.y

      for (const p of pts) {
        const dmx = p.x - mx, dmy = p.y - my
        const dm = Math.sqrt(dmx * dmx + dmy * dmy)
        if (dm < mouseRadius && dm > 0) {
          const force = (mouseRadius - dm) / mouseRadius * 1.2
          p.vx += (dmx / dm) * force
          p.vy += (dmy / dm) * force
        }
        p.vx *= 0.97; p.vy *= 0.97
        p.x += p.vx; p.y += p.vy
        if (p.x < -10) p.x = w + 10
        if (p.x > w + 10) p.x = -10
        if (p.y < -10) p.y = h + 10
        if (p.y > h + 10) p.y = -10

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${p.color},${dm < mouseRadius ? 0.8 : 0.35})`
        ctx.fill()
      }

      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < maxDist) {
            ctx.beginPath()
            ctx.moveTo(pts[i].x, pts[i].y)
            ctx.lineTo(pts[j].x, pts[j].y)
            ctx.strokeStyle = `rgba(1,151,178,${(1 - dist / maxDist) * 0.12})`
            ctx.lineWidth = 0.6
            ctx.stroke()
          }
        }
      }
      raf.current = requestAnimationFrame(draw)
    }
    draw()

    const onResize = () => {
      w = canvas.parentElement.offsetWidth; h = canvas.parentElement.offsetHeight
      canvas.width = w * dpr; canvas.height = h * dpr
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    window.addEventListener('resize', onResize)
    return () => { window.removeEventListener('resize', onResize); cancelAnimationFrame(raf.current) }
  }, [])

  useEffect(() => { const cleanup = init(); return cleanup }, [init])

  useEffect(() => {
    const onMove = (e) => {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return
      mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }
    const onLeave = () => { mouse.current = { x: -9999, y: -9999 } }
    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('mouseleave', onLeave)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseleave', onLeave) }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 z-0" />
}

/* ── Countdown ── */
function useCountdown(targetDate) {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, new Date(targetDate) - new Date())
      setTime({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [targetDate])
  return time
}

/* ── Rotating circular text badge ── */
function RotatingBadge() {
  const text = '✦ VYUGA ✦ 2026 ✦ KSRCT ✦ JUN 26-27 '
  return (
    <div className="relative h-20 w-20 sm:h-24 sm:w-24">
      <svg viewBox="0 0 200 200" className="h-full w-full animate-rotate-text">
        <defs>
          <path id="circlePath" d="M100,100 m-75,0 a75,75 0 1,1 150,0 a75,75 0 1,1 -150,0" />
        </defs>
        <text className="fill-brand-cyan" style={{ fontSize: '20px', fontFamily: 'Space Grotesk', letterSpacing: '4px', fontWeight: 600 }}>
          <textPath href="#circlePath">{text}</textPath>
        </text>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-8 w-8 rounded-full bg-white shadow-lg shadow-brand-cyan/20 flex items-center justify-center border border-slate-200">
        </div>
      </div>
    </div>
  )
}

/* ── Marquee ── */
function MarqueeBand() {
  const items = ['INCLUSIVE DESIGN', 'ASSISTIVE TECHNOLOGY', 'ACCESSIBILITY', 'INNOVATION', 'VYUGA 2026', 'KSRCT']
  const doubled = [...items, ...items]
  return (
    <div className="relative overflow-hidden border-y border-brand-cyan/20 bg-white/50 backdrop-blur-sm">
      <div className="animate-marquee flex w-max">
        {doubled.map((item, i) => (
          <span key={i} className="flex items-center gap-4 px-2">
            <span className={`whitespace-nowrap py-2 font-impact text-2xl tracking-[0.06em] sm:text-4xl lg:text-5xl ${i % 2 === 0 ? 'text-slate-900' : 'text-brand-cyan'}`}>
              {item}
            </span>
            <span className="text-lg text-brand-lime select-none sm:text-xl">◆</span>
          </span>
        ))}
      </div>
    </div>
  )
}

export default function Hero() {
  const countdown = useCountdown('2026-06-26T09:00:00')
  const sectionRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] })
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0.15])
  const scale = useTransform(scrollYProgress, [0, 0.7], [1, 0.96])
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '15%'])
  const textRef = useRef(null)
  const textInView = useInView(textRef, { once: true })

  return (
    <section ref={sectionRef} id="home" className="relative min-h-screen h-screen overflow-hidden bg-white text-slate-900 flex flex-col justify-center">
      <ParticleCanvas />

      {/* Gradient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-[8%] h-[400px] w-[400px] rounded-full bg-brand-cyan/[0.1] blur-[100px] animate-morph" />
        <div className="absolute -bottom-40 right-[5%] h-[300px] w-[300px] rounded-full bg-brand-lime/[0.1] blur-[100px] animate-morph" style={{ animationDelay: '6s' }} />
      </div>

      <div className="relative z-10 w-full">
        <div className="mx-auto flex h-full max-w-7xl flex-col justify-center px-4 sm:px-6">
          <div ref={textRef} className="pt-33 pb-8">
            {/* Top row: handwritten label + rotating badge */}
            <div className="flex items-start justify-between">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
              >
                <span className="font-marker text-base text-brand-cyan sm:text-lg">
                  Ability Carnival
                </span>
                <div className="mt-1 flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-lime opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-lime" />
                  </span>
                  <span className="font-mono text-[9px] font-semibold tracking-[0.2em] text-slate-400">
                    JUN 26–27, 2026 · KSRCT
                  </span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 1, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="hidden sm:block"
              >
                <RotatingBadge />
              </motion.div>
            </div>

            {/* ── VYUGA TEXT + TYPOGRAPHY ── */}
            <div className="mt-2 space-y-0">
              {/* VYUGA — logo letter images */}
              <div className="overflow-hidden" aria-label="VYUGA">
                <div className="flex items-center justify-start gap-0">
                  {[logoV, logoY, logoU, logoG, logoA].map((src, i) => (
                    <motion.img
                      key={i}
                      src={src}
                      alt={['V','Y','U','G','A'][i]}
                      initial={{ opacity: 0, y: 80, filter: 'blur(12px)' }}
                      animate={textInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
                      transition={{ duration: 0.9, delay: 0.3 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                      className="-mx-[1vw] h-[15vw] w-auto object-contain mix-blend-multiply sm:h-[12vw] sm:-mx-[0.8vw] lg:h-[10vw] lg:-mx-[0.5vw]"
                      aria-hidden="true"
                    />
                  ))}
                </div>
              </div>

              {/* Mixed line: italic serif "the" + CONFERENCE outlined */}
              <div className="flex flex-wrap items-baseline gap-2 sm:gap-4 overflow-hidden">
                <motion.span
                  initial={{ opacity: 0, x: -30 }}
                  animate={textInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="font-serif text-[4vw] italic font-light text-brand-cyan sm:text-[3vw] lg:text-[2.5vw]"
                >
                  the
                </motion.span>
                <motion.span
                  initial={{ y: '120%' }}
                  animate={textInView ? { y: '0%' } : {}}
                  transition={{ duration: 0.9, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  className="font-impact text-[8vw] leading-[0.95] tracking-[0.1em] text-slate-900 sm:text-[6vw] lg:text-[5vw]"
                >
                  ABILITY CARNIVAL
                </motion.span>
              </div>

              {/* Year as giant gradient + tagline */}
              <div className="mt-0 flex flex-wrap items-end gap-3 sm:gap-6">
                <motion.span
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={textInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.7, delay: 1.0, ease: [0.22, 1, 0.36, 1] }}
                  className="font-impact text-[6vw] leading-[0.8] tracking-wider gradient-text sm:text-[5vw] lg:text-[4vw]"
                >
                  2026
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, x: -20 }}
                  animate={textInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.7, delay: 1.2 }}
                  className="mb-[0.5vw] max-w-sm font-serif text-sm italic text-slate-600 sm:text-base lg:text-lg"
                >
                  Assistive Technology · Inclusive Design · Innovation
                </motion.span>
              </div>
            </div>

            {/* ── Description + CTAs ── */}
            <div className="mt-6 grid gap-4 lg:grid-cols-2 lg:gap-8 items-center">
              <p className="max-w-lg text-sm font-semibold leading-relaxed text-slate-800 sm:text-base">
                <span className="font  text-slate-800">BE PART OF THE MOVEMENT,</span>
                Join <span className="font text-slate-800">1000+</span> innovators, architects, and advocates at India’s premier inclusive technology summit. Experience visionary keynotes, immersive workshops, and live hardware demos engineering the next frontier of universal access.
              </p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 1.6 }}
                className="flex flex-col gap-3 sm:flex-row lg:justify-end"
              >
                <Link
                  id="register"
                  to="/attend/register"
                  className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full px-8 py-3 text-xs font-bold text-white shadow-xl shadow-brand-cyan/25 transition-all hover:shadow-2xl hover:shadow-brand-cyan/35 hover:scale-[1.04] active:scale-[0.98]"
                >
                  <span className="absolute inset-0 shimmer-btn" />
                  <span className="relative flex items-center gap-2">
                    Register Now
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </motion.div>
            </div>

            {/* ── Countdown ── */}
            <div
              className="mt-8 mb-4 flex flex-wrap items-end gap-x-6 gap-y-2"
            >
              <span className="font-marker text-xs text-slate-700 font-medium">Starts in</span>
              <div className="flex items-baseline gap-1">
                {[
                  { v: countdown.days, l: 'DAYS' },
                  { v: countdown.hours, l: 'HRS' },
                  { v: countdown.minutes, l: 'MIN' },
                  { v: countdown.seconds, l: 'SEC' },
                ].map((t, i) => (
                  <div key={t.l} className="flex items-baseline">
                    <span className="font-impact text-4xl tracking-wide text-black/80 tabular-nums sm:text-5xl lg:text-6xl font-light">
                      {String(t.v).padStart(2, '0')}
                    </span>
                    <span className="ml-1 mr-2 font-mono text-[8px] font-medium tracking-[0.1em] text-slate-700">
                      {t.l}
                    </span>
                    {i < 3 && (
                      <span className="mr-2 font-serif text-2xl italic text-slate-400 sm:text-3xl font-medium">:</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Marquee — outside scroll-fade wrapper */}
      <div className="relative z-10">
        <MarqueeBand />
{/*
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2.0 }}
          className="border-b border-brand-cyan/10 bg-gradient-to-r from-slate-50 via-white to-slate-50 py-5"
        >
           Logos and text           <div className="mx-auto flex max-w-7xl items-center justify-center gap-4 px-4">
            <div className="hidden h-px w-16 bg-gradient-to-r from-transparent to-brand-cyan/30 sm:block" />
            <span className="font-marker text-sm text-brand-cyan">Co-presented by</span>
            <span className="font-hero text-lg font-extrabold tracking-[0.1em] text-slate-800 sm:text-xl">
              SRP FOUNDATION
            </span>
            <div className="hidden h-px w-16 bg-gradient-to-l from-transparent to-brand-lime/30 sm:block" />
          </div>
         

        </motion.div> */}
      </div>
    </section>
  )
}