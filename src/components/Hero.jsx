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
    <div className="relative h-32 w-32 sm:h-40 sm:w-40">
      <svg viewBox="0 0 200 200" className="h-full w-full animate-rotate-text">
        <defs>
          <path id="circlePath" d="M100,100 m-75,0 a75,75 0 1,1 150,0 a75,75 0 1,1 -150,0" />
        </defs>
        <text className="fill-brand-cyan" style={{ fontSize: '14px', fontFamily: 'Space Grotesk', letterSpacing: '4px', fontWeight: 600 }}>
          <textPath href="#circlePath">{text}</textPath>
        </text>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-brand-cyan to-brand-lime shadow-lg shadow-brand-cyan/30 flex items-center justify-center">
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
    <div className="relative overflow-hidden border-y-2 border-brand-cyan/40 bg-gradient-to-r from-brand-cyan/20 via-brand-lime/20 to-brand-cyan/20">
      <div className="animate-marquee flex w-max">
        {doubled.map((item, i) => (
          <span key={i} className="flex items-center gap-6 px-3">
            <span className={`whitespace-nowrap py-5 font-impact text-5xl tracking-[0.06em] sm:text-7xl lg:text-[5.5rem] ${i % 2 === 0 ? 'text-slate-900' : 'text-brand-cyan'}`}>
              {item}
            </span>
            <span className="text-2xl text-brand-lime select-none sm:text-3xl">◆</span>
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
    <section ref={sectionRef} id="home" className="relative min-h-screen overflow-hidden bg-white">
      <ParticleCanvas />

      {/* Gradient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-[8%] h-[600px] w-[600px] rounded-full bg-brand-cyan/[0.07] blur-[120px] animate-morph" />
        <div className="absolute -bottom-40 right-[5%] h-[500px] w-[500px] rounded-full bg-brand-lime/[0.06] blur-[120px] animate-morph" style={{ animationDelay: '6s' }} />
      </div>
      <div className="absolute inset-0 noise-overlay pointer-events-none" />

      <motion.div className="relative z-10" style={{ opacity, scale, y }}>
        <div className="mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-4 sm:px-6">
          <div ref={textRef} className="pt-28 pb-8">
            {/* Top row: handwritten label + rotating badge */}
            <div className="flex items-start justify-between">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
              >
                <span className="font-marker text-lg text-brand-cyan sm:text-xl">
                  Ability Carnival
                </span>
                <div className="mt-2 flex items-center gap-3">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-lime opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-brand-lime" />
                  </span>
                  <span className="font-mono text-[11px] font-semibold tracking-[0.2em] text-slate-500">
                    JUN 26–27, 2026 · K.S.RANGASAMY COLLEGE OF TECHNOLOGY, TIRUCHENGODE
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
            <div className="mt-6 space-y-0">
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
                      className="-mx-[1vw] h-[22vw] w-auto object-contain mix-blend-multiply sm:h-[18vw] sm:-mx-[0.8vw] lg:h-[14vw] lg:-mx-[0.5vw]"
                      aria-hidden="true"
                    />
                  ))}
                </div>
              </div>

              {/* Mixed line: italic serif "the" + CONFERENCE outlined */}
              <div className="flex flex-wrap items-baseline gap-3 sm:gap-6 overflow-hidden">
                <motion.span
                  initial={{ opacity: 0, x: -30 }}
                  animate={textInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="font-serif text-[6vw] italic font-light text-brand-cyan sm:text-[4vw] lg:text-[3.5vw]"
                >
                  the
                </motion.span>
                <motion.span
                  initial={{ y: '120%' }}
                  animate={textInView ? { y: '0%' } : {}}
                  transition={{ duration: 0.9, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  className="font-impact text-[12vw] leading-[0.95] tracking-[0.1em] text-stroke sm:text-[10vw] lg:text-[8vw]"
                >
                  ABILITY CARNIVAL
                </motion.span>
              </div>

              {/* Year as giant gradient + tagline */}
              <div className="mt-1 flex flex-wrap items-end gap-4 sm:gap-8">
                <motion.span
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={textInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.7, delay: 1.0, ease: [0.22, 1, 0.36, 1] }}
                  className="font-impact text-[9vw] leading-[0.8] tracking-wider gradient-text sm:text-[7vw] lg:text-[5.5vw]"
                >
                  2026
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, x: -20 }}
                  animate={textInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.7, delay: 1.2 }}
                  className="mb-[1vw] max-w-md font-serif text-base italic text-slate-400 sm:text-lg lg:text-xl"
                >
                  Assistive Technology · Inclusive Design · Innovation
                </motion.span>
              </div>
            </div>

            {/* ── Description + CTAs ── */}
            <div className="mt-12 grid gap-8 lg:grid-cols-2 lg:gap-16">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 1.4 }}
                className="max-w-lg text-base leading-relaxed text-slate-500 sm:text-lg"
              >
                Join <span className="font-marker text-brand-cyan">1000+</span> researchers, designers, engineers and advocates for
                keynotes, workshops, and hands-on demos shaping inclusive technology
                at India's premier ability carnival.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 1.6 }}
                className="flex flex-col gap-4 sm:flex-row lg:justify-end"
              >
                <Link
                  id="register"
                  to="/attend/register"
                  className="group relative inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-full px-10 py-5 text-sm font-bold text-white shadow-xl shadow-brand-cyan/25 transition-all hover:shadow-2xl hover:shadow-brand-cyan/35 hover:scale-[1.04] active:scale-[0.98]"
                >
                  <span className="absolute inset-0 shimmer-btn" />
                  <span className="relative flex items-center gap-2">
                    Register Now
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
                <Link
                  to="/program"
                  className="group inline-flex items-center justify-center gap-2.5 rounded-full border-2 border-slate-200 bg-white/60 px-10 py-5 text-sm font-bold text-slate-800 backdrop-blur-sm transition-all hover:border-brand-cyan/30 hover:bg-white hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                >
                  Explore Program
                </Link>
              </motion.div>
            </div>

            {/* ── Countdown ── */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.8 }}
              className="mt-16 mb-24 flex flex-wrap items-end gap-x-8 gap-y-4"
            >
              <span className="font-marker text-sm text-brand-cyan">Starts in</span>
              <div className="flex items-baseline gap-1">
                {[
                  { v: countdown.days, l: 'DAYS' },
                  { v: countdown.hours, l: 'HRS' },
                  { v: countdown.minutes, l: 'MIN' },
                  { v: countdown.seconds, l: 'SEC' },
                ].map((t, i) => (
                  <div key={t.l} className="flex items-baseline">
                    <span className="font-impact text-6xl tracking-wide text-slate-900 tabular-nums sm:text-7xl lg:text-8xl">
                      {String(t.v).padStart(2, '0')}
                    </span>
                    <span className="ml-1 mr-3 font-mono text-[9px] font-bold tracking-[0.15em] text-brand-cyan">
                      {t.l}
                    </span>
                    {i < 3 && (
                      <span className="mr-3 font-serif text-4xl italic text-brand-cyan/40 sm:text-5xl">:</span>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Marquee — outside scroll-fade wrapper */}
      <div className="relative z-10">
        <MarqueeBand />

        {/* Co-presented by SRP Foundation */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2.0 }}
          className="border-b border-brand-cyan/10 bg-gradient-to-r from-slate-50 via-white to-slate-50 py-5"
        >
          <div className="mx-auto flex max-w-7xl items-center justify-center gap-4 px-4">
            <div className="hidden h-px w-16 bg-gradient-to-r from-transparent to-brand-cyan/30 sm:block" />
            <span className="font-marker text-sm text-brand-cyan">Co-presented by</span>
            <span className="font-hero text-lg font-extrabold tracking-[0.1em] text-slate-800 sm:text-xl">
              SRP FOUNDATION
            </span>
            <div className="hidden h-px w-16 bg-gradient-to-l from-transparent to-brand-lime/30 sm:block" />
          </div>
        </motion.div>
      </div>
    </section>
  )
}

