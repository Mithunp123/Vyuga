import { motion } from 'framer-motion'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'

export default function PageShell({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />

      {/* Page hero banner — light colorful gradient */}
      <div className="relative overflow-hidden bg-gradient-to-br from-brand-cyan-light via-white to-brand-lime-light pt-28 pb-16 sm:pb-20">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-brand-cyan/10 blur-[80px] animate-morph" />
          <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-brand-lime/8 blur-[80px] animate-morph" style={{ animationDelay: '3s' }} />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-brand-cyan"
          >
            <span className="h-px w-8 bg-brand-cyan" />
            EMPOWER 2025
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="mt-4 font-display text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl"
          >
            {title}
          </motion.h1>
          {subtitle ? (
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-4 max-w-3xl text-base leading-relaxed text-slate-500"
            >
              {subtitle}
            </motion.p>
          ) : null}
        </div>
        {/* Organic wave bottom */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" className="w-full h-[60px]" preserveAspectRatio="none">
            <path fill="#ffffff" d="M0,30 C240,0 480,60 720,30 C960,0 1200,60 1440,30 L1440,60 L0,60Z" />
          </svg>
        </div>
      </div>

      <main className="mx-auto w-full max-w-7xl px-4 pb-20 pt-8 sm:px-6">
        <div>{children}</div>
      </main>
      <Footer />
    </div>
  )
}

