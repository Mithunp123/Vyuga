import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
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
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'center center'] })
  const textOpacity = useTransform(scrollYProgress, [0, 0.5], [0.4, 1])
  const textY = useTransform(scrollYProgress, [0, 0.5], [30, 0])
  const glowIntensity = useTransform(scrollYProgress, [0.2, 0.7], [0, 1])

  const readyColor = useTransform(scrollYProgress, [0, 0.5], ['#5BCB2B', '#ffffff'])

  return (
    <section ref={ref} className="relative overflow-hidden bg-slate-950 py-20 sm:py-28">
      <div className="absolute inset-0 dot-grid opacity-10" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-brand-cyan/10 blur-[120px] animate-morph" />
        <div className="absolute -bottom-32 right-1/4 h-96 w-96 rounded-full bg-brand-lime/10 blur-[120px] animate-morph" style={{ animationDelay: '4s' }} />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 text-center sm:px-6">
        <motion.p
          style={{ opacity: textOpacity, y: textY, color: readyColor }}
          className="font-marker text-2xl sm:text-3xl"
        >
          Are you ready?
        </motion.p>
        <motion.h2 style={{ opacity: textOpacity, y: textY }} className="mt-4">
          <motion.span
            className="block font-hero text-4xl font-extrabold text-white sm:text-6xl lg:text-7xl"
            style={{ textShadow: useTransform(glowIntensity, v => `0 0 ${v * 40}px rgba(1,151,178,${v * 0.5}), 0 0 ${v * 80}px rgba(1,151,178,${v * 0.2})`) }}
          >
            Shape the future
          </motion.span>
          <span className="block mt-2 font-impact text-5xl tracking-[0.12em] gradient-text sm:text-7xl lg:text-8xl">
            OF ACCESSIBILITY
          </span>
        </motion.h2>
        <motion.p
          style={{ opacity: useTransform(scrollYProgress, [0.1, 0.5], [0.3, 1]) }}
          className="mx-auto mt-6 max-w-2xl font-serif text-lg italic text-white sm:text-xl"
        >
          "Accessibility is not a feature. It is a social trend."
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
        >
          <Link
            to="/attend/register"
            className="group inline-flex items-center gap-2 rounded-full bg-white px-10 py-5 text-sm font-bold text-slate-900 shadow-xl shadow-white/10 transition-all duration-300 hover:shadow-2xl hover:shadow-white/20 hover:scale-105 active:scale-[0.98]"
          >
            Register Now
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            to="/program"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-10 py-5 text-sm font-bold text-white/70 backdrop-blur-sm transition-all duration-300 hover:bg-white/5 hover:border-white/30 hover:text-white"
          >
            Explore Program
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
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

