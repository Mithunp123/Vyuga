import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import Preloader from '../components/Preloader.jsx'
import Navbar from '../components/Navbar.jsx'
import Hero from '../components/Hero.jsx'
import About from '../components/About.jsx'
import Schedule from '../components/Schedule.jsx'
import Speakers from '../components/Speakers.jsx'
import Sponsors from '../components/Sponsors.jsx'
import Exhibitors from '../components/Exhibitors.jsx'
import Gallery from '../components/Gallery.jsx'
import Footer from '../components/Footer.jsx'

function CTABanner() {
  return (
    <section className="relative overflow-hidden bg-slate-950 py-24 sm:py-32">
      {/* Particle dot grid */}
      <div className="absolute inset-0 dot-grid opacity-10" />
      {/* Glowing orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-brand-cyan/10 blur-[120px] animate-morph" />
        <div className="absolute -bottom-32 right-1/4 h-96 w-96 rounded-full bg-brand-lime/10 blur-[120px] animate-morph" style={{ animationDelay: '4s' }} />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 text-center sm:px-6">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="font-hero text-3xl font-extrabold text-white sm:text-5xl lg:text-6xl"
        >
          Ready to shape the future
          <span className="block mt-2 font-impact text-4xl tracking-[0.1em] text-brand-cyan sm:text-6xl lg:text-7xl">
            OF ACCESSIBILITY?
          </span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mx-auto mt-6 max-w-2xl text-base text-white/50 sm:text-lg"
        >
          Join 500+ designers, engineers, researchers, and advocates at IIT Delhi this October.
          Early bird pricing available now.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
        >
          <Link
            to="/attend/register"
            className="group inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-bold text-slate-900 shadow-xl shadow-white/10 transition-all duration-300 hover:shadow-2xl hover:shadow-white/20 hover:scale-105 active:scale-[0.98]"
          >
            Register Now
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            to="/program"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-8 py-4 text-sm font-bold text-white/70 backdrop-blur-sm transition-all duration-300 hover:bg-white/5 hover:border-white/30 hover:text-white"
          >
            Explore Program
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

export default function Home() {
  const [loaded, setLoaded] = useState(false)
  const handleLoaded = useCallback(() => setLoaded(true), [])

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {!loaded && <Preloader onComplete={handleLoaded} />}
      <Navbar />
      <main>
        <Hero />
        <About />
        <Schedule />
        <Speakers />
        <Sponsors />
        <Exhibitors />
        <Gallery />
        <CTABanner />
      </main>
      <Footer />
    </div>
  )
}

