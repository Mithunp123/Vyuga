import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

export default function Preloader({ onComplete }) {
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    let raf
    let start = null
    const duration = 2200

    const step = (ts) => {
      if (!start) start = ts
      const elapsed = ts - start
      const p = Math.min(elapsed / duration, 1)
      /* Ease-out curve */
      const eased = 1 - Math.pow(1 - p, 3)
      setProgress(Math.round(eased * 100))

      if (p < 1) {
        raf = requestAnimationFrame(step)
      } else {
        setTimeout(() => setDone(true), 400)
        setTimeout(() => onComplete?.(), 1000)
      }
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [onComplete])

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="preloader"
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Dot grid background */}
          <div className="absolute inset-0 dot-grid opacity-40" />

          {/* Floating decorative blobs */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-brand-cyan/10 blur-[60px]"
            />
            <motion.div
              animate={{ scale: [1, 1.3, 1], rotate: [0, -90, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
              className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-brand-lime/10 blur-[60px]"
            />
          </div>

          <div className="relative z-10 flex flex-col items-center">
            {/* Logo text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-baseline gap-3"
            >
              <span className="font-hero text-5xl font-extrabold tracking-tight gradient-text sm:text-7xl">
                EMPOWER
              </span>
              <span className="font-impact text-4xl tracking-wider text-slate-300 sm:text-6xl">
                2025
              </span>
            </motion.div>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mt-3 font-mono text-xs tracking-[0.3em] text-slate-400"
            >
              ASSISTIVE TECHNOLOGY CONFERENCE
            </motion.p>

            {/* Progress bar */}
            <div className="relative mt-10 h-[3px] w-48 overflow-hidden rounded-full bg-slate-100 sm:w-64">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-brand-cyan to-brand-lime"
                style={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>

            {/* Percentage */}
            <motion.span
              className="mt-4 font-impact text-2xl tracking-wider text-slate-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {progress}%
            </motion.span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
