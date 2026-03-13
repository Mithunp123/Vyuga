import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

/* ─────────────────────────────────────────
   Interactive particle network (Canvas)
   Mouse-reactive connected dots
   ───────────────────────────────────────── */
function ParticleCanvas() {
  const canvasRef = useRef(null)
  const mouse = useRef({ x: -9999, y: -9999 })
  const particles = useRef([])
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

    const count = Math.min(Math.floor((w * h) / 12000), 120)
    const pts = []
    for (let i = 0; i < count; i++) {
      pts.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 2 + 1,
        color: Math.random() > 0.5 ? '1,151,178' : '91,203,43',
      })
    }
    particles.current = pts

    const maxDist = 150
    const mouseRadius = 200

    function draw() {
      ctx.clearRect(0, 0, w, h)
      const mx = mouse.current.x
      const my = mouse.current.y

      for (let i = 0; i < pts.length; i++) {
        const p = pts[i]
        // Mouse repulsion
        const dmx = p.x - mx
        const dmy = p.y - my
        const dm = Math.sqrt(dmx * dmx + dmy * dmy)
        if (dm < mouseRadius && dm > 0) {
          const force = (mouseRadius - dm) / mouseRadius * 0.8
          p.vx += (dmx / dm) * force
          p.vy += (dmy / dm) * force
        }
        // Damping
        p.vx *= 0.98
        p.vy *= 0.98
        p.x += p.vx
        p.y += p.vy
        // Wrap
        if (p.x < -10) p.x = w + 10
        if (p.x > w + 10) p.x = -10
        if (p.y < -10) p.y = h + 10
        if (p.y > h + 10) p.y = -10

        // Draw dot
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${p.color},0.5)`
        ctx.fill()
      }

      // Draw connections
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x
          const dy = pts[i].y - pts[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.15
            ctx.beginPath()
            ctx.moveTo(pts[i].x, pts[i].y)
            ctx.lineTo(pts[j].x, pts[j].y)
            ctx.strokeStyle = `rgba(1,151,178,${alpha})`
            ctx.lineWidth = 0.8
            ctx.stroke()
          }
        }
      }

      raf.current = requestAnimationFrame(draw)
    }

    draw()

    const onResize = () => {
      w = canvas.parentElement.offsetWidth
      h = canvas.parentElement.offsetHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = w + 'px'
      canvas.style.height = h + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      cancelAnimationFrame(raf.current)
    }
  }, [])

  useEffect(() => {
    const cleanup = init()
    return cleanup
  }, [init])

  useEffect(() => {
    const onMove = (e) => {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return
      mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }
    const onLeave = () => { mouse.current = { x: -9999, y: -9999 } }
    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('mouseleave', onLeave)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 z-0" />
}

/* ── Countdown hook ── */
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

/* ── Character-by-character text reveal ── */
function SplitText({ text, className, delay = 0, stagger = 0.035 }) {
  const chars = text.split('')
  return (
    <span className={className} aria-label={text}>
      {chars.map((ch, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 60, rotateX: -90 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{
            duration: 0.7,
            delay: delay + i * stagger,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="inline-block"
          style={{ perspective: '600px' }}
          aria-hidden="true"
        >
          {ch === ' ' ? '\u00A0' : ch}
        </motion.span>
      ))}
    </span>
  )
}

/* ── Infinite marquee band ── */
function MarqueeBand() {
  const items = [
    'INCLUSIVE DESIGN', 'ASSISTIVE TECHNOLOGY', 'ACCESSIBILITY',
    'INNOVATION', 'EMPOWER 2025', 'IIT DELHI',
  ]
  const doubled = [...items, ...items]

  return (
    <div className="relative overflow-hidden border-y border-slate-100/60 bg-white/40 backdrop-blur-sm">
      <div className="animate-marquee flex w-max">
        {doubled.map((item, i) => (
          <span key={i} className="flex items-center gap-8 px-4">
            <span
              className={`whitespace-nowrap py-5 font-impact text-5xl tracking-[0.08em] sm:text-7xl lg:text-8xl ${
                i % 2 === 0 ? 'text-stroke' : 'text-slate-900/[0.04]'
              }`}
            >
              {item}
            </span>
            <span className="text-3xl gradient-text select-none">✦</span>
          </span>
        ))}
      </div>
    </div>
  )
}

export default function Hero() {
  const countdown = useCountdown('2025-10-03T09:00:00')
  const sectionRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] })
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.7], [1, 0.96])
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '15%'])

  const textRef = useRef(null)
  const textInView = useInView(textRef, { once: true })

  return (
    <section ref={sectionRef} id="home" className="relative min-h-screen overflow-hidden bg-white">
      {/* Particle network canvas */}
      <ParticleCanvas />

      {/* Gradient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-[10%] h-[600px] w-[600px] rounded-full bg-brand-cyan/[0.07] blur-[120px] animate-morph" />
        <div className="absolute -bottom-40 right-[5%] h-[500px] w-[500px] rounded-full bg-brand-lime/[0.06] blur-[120px] animate-morph" style={{ animationDelay: '6s' }} />
        <div className="absolute top-[40%] left-[55%] h-[350px] w-[350px] rounded-full bg-brand-cyan/[0.04] blur-[100px] animate-morph" style={{ animationDelay: '3s' }} />
      </div>

      {/* Noise grain */}
      <div className="absolute inset-0 noise-overlay pointer-events-none" />

      {/* Main content — full viewport centered */}
      <motion.div className="relative z-10" style={{ opacity, scale, y }}>
        <div className="mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-4 sm:px-6">
          <div ref={textRef} className="pt-24 pb-8">
            {/* Date badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="mb-8 inline-flex items-center gap-3 rounded-full border border-brand-cyan/15 bg-white/70 px-5 py-2.5 shadow-lg shadow-brand-cyan/5 backdrop-blur-sm"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-lime opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-brand-lime" />
              </span>
              <span className="font-mono text-[11px] font-semibold tracking-[0.2em] text-slate-600">
                8TH ANNUAL · OCT 3–5, 2025 · IIT DELHI
              </span>
            </motion.div>

            {/* ── Massive typography block ── */}
            <div className="space-y-0">
              {/* Line 1: EMPOWER — full width, huge */}
              <div className="overflow-hidden">
                <SplitText
                  text="EMPOWER"
                  className="block font-hero text-[13vw] font-black leading-[0.9] tracking-[-0.02em] text-slate-900 sm:text-[11vw] lg:text-[9vw]"
                  delay={0.2}
                  stagger={0.04}
                />
              </div>

              {/* Line 2: CONFERENCE — outlined text stroke */}
              <div className="overflow-hidden">
                <motion.span
                  initial={{ y: '110%' }}
                  animate={textInView ? { y: '0%' } : {}}
                  transition={{ duration: 0.9, delay: 0.65, ease: [0.22, 1, 0.36, 1] }}
                  className="block font-impact text-[11vw] leading-[1] tracking-[0.12em] text-stroke sm:text-[9vw] lg:text-[7.5vw]"
                >
                  CONFERENCE
                </motion.span>
              </div>

              {/* Line 3: Year + tagline side by side */}
              <div className="mt-2 flex flex-wrap items-end gap-4 sm:gap-8">
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={textInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.7, delay: 1.0, ease: [0.22, 1, 0.36, 1] }}
                  className="font-impact text-[8vw] leading-[0.85] tracking-wider gradient-text sm:text-[6vw] lg:text-[5vw]"
                >
                  2025
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, x: -20 }}
                  animate={textInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.7, delay: 1.2 }}
                  className="mb-[0.8vw] max-w-md text-base leading-relaxed text-slate-400 sm:text-lg lg:text-xl"
                >
                  Assistive Technology · Inclusive Design · Innovation
                </motion.span>
              </div>
            </div>

            {/* ── Description + CTAs ── */}
            <div className="mt-10 grid gap-8 lg:grid-cols-2 lg:gap-16">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 1.4 }}
                className="max-w-lg text-base leading-relaxed text-slate-500 sm:text-lg"
              >
                Join 500+ researchers, designers, engineers and advocates for
                keynotes, workshops, and hands-on demos shaping inclusive technology
                at India's premier assistive tech conference.
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
                  className="group relative inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-full px-8 py-4 text-sm font-bold text-white shadow-xl shadow-brand-cyan/25 transition-all hover:shadow-2xl hover:shadow-brand-cyan/35 hover:scale-[1.04] active:scale-[0.98]"
                >
                  <span className="absolute inset-0 shimmer-btn" />
                  <span className="relative flex items-center gap-2">
                    Register Now
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
                <Link
                  to="/program"
                  className="group inline-flex items-center justify-center gap-2.5 rounded-full border-2 border-slate-200 bg-white/60 px-8 py-4 text-sm font-bold text-slate-800 backdrop-blur-sm transition-all hover:border-brand-cyan/30 hover:bg-white hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                >
                  Explore Program
                </Link>
              </motion.div>
            </div>

            {/* ── Countdown — massive inline numbers ── */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.8 }}
              className="mt-14 flex flex-wrap items-end gap-x-8 gap-y-4"
            >
              <span className="font-mono text-[10px] tracking-[0.3em] text-slate-400 self-center">
                EVENT STARTS IN
              </span>
              <div className="flex items-baseline gap-1">
                {[
                  { v: countdown.days, l: 'DAYS' },
                  { v: countdown.hours, l: 'HRS' },
                  { v: countdown.minutes, l: 'MIN' },
                  { v: countdown.seconds, l: 'SEC' },
                ].map((t, i) => (
                  <div key={t.l} className="flex items-baseline">
                    <span className="font-impact text-5xl tracking-wide text-slate-900 tabular-nums sm:text-6xl lg:text-7xl">
                      {String(t.v).padStart(2, '0')}
                    </span>
                    <span className="ml-1 mr-4 font-mono text-[9px] tracking-[0.2em] text-brand-cyan/60">
                      {t.l}
                    </span>
                    {i < 3 && (
                      <span className="mr-4 font-impact text-4xl text-slate-200 sm:text-5xl">:</span>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── Marquee band ── */}
        <MarqueeBand />

        {/* ── Partner logos strip ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 2.2 }}
          className="bg-white/80 backdrop-blur-sm py-8"
        >
          <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-4 sm:flex-row sm:justify-center sm:gap-12">
            <span className="font-mono text-[10px] tracking-[0.3em] text-slate-300">
              BACKED BY
            </span>
            <div className="flex items-center gap-10">
              {['hcltech.com', 'google.com', 'microsoft.com'].map((domain) => (
                <img
                  key={domain}
                  src={`https://logo.clearbit.com/${domain}`}
                  alt={domain.split('.')[0]}
                  className="h-6 w-auto grayscale opacity-30 transition-all duration-500 hover:grayscale-0 hover:opacity-100"
                  loading="lazy"
                />
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}

