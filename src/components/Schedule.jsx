import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { scheduleSummary } from '../data/homeData.js'
import { Mic, Users, Wrench, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const iconByTitle = { Workshops: Wrench, 'Keynote Talks': Mic, Networking: Users }
const gradients = [
  'from-brand-cyan/15 to-brand-cyan-light/40',
  'from-brand-lime/15 to-brand-lime-light/40',
  'from-purple-100/60 to-indigo-50/40',
]

export default function Schedule() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section id="program" className="relative overflow-hidden bg-white" ref={ref}>
      {/* Dot grid bg */}
      <div className="absolute inset-0 dot-grid opacity-15" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32">
        {/* Header */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2"
            >
              <div className="gradient-line w-12" />
              <span className="font-mono text-[11px] font-semibold tracking-[0.25em] text-brand-cyan">
                PROGRAM
              </span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <span className="block font-hero text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Schedule
              </span>
              <span className="block font-impact text-3xl tracking-[0.1em] gradient-text sm:text-4xl">
                OVERVIEW
              </span>
            </motion.h2>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link
              to="/program"
              className="group inline-flex items-center gap-2 font-mono text-sm font-semibold text-brand-cyan transition-colors hover:text-brand-lime"
            >
              Full schedule
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>

        {/* Timeline with connecting line */}
        <div className="relative mt-16">
          {/* Horizontal gradient line */}
          <div className="absolute top-12 left-0 right-0 hidden md:block">
            <div className="mx-auto h-[2px] w-full max-w-4xl bg-gradient-to-r from-brand-cyan via-brand-lime to-brand-cyan opacity-20" />
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {scheduleSummary.map((item, idx) => {
              const Icon = iconByTitle[item.title] ?? Wrench
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 40 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.7, delay: 0.2 + idx * 0.15, ease: [0.22, 1, 0.36, 1] }}
                  className="group relative"
                >
                  {/* Timeline dot */}
                  <div className="relative mb-8 flex justify-center md:justify-start">
                    <div className="relative">
                      <div className="h-6 w-6 rounded-full bg-gradient-to-br from-brand-cyan to-brand-lime shadow-lg shadow-brand-cyan/20" />
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-brand-cyan to-brand-lime animate-pulse-ring" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className={`rounded-3xl bg-gradient-to-br ${gradients[idx]} to-white p-8 ring-1 ring-white/60 transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-brand-cyan/10 group-hover:-translate-y-2`}>
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-brand-cyan" />
                      <span className="font-mono text-[10px] tracking-[0.3em] text-slate-400">{item.time.toUpperCase()}</span>
                    </div>

                    <h3 className="mt-5 font-hero text-2xl font-extrabold tracking-tight text-slate-900">
                      {item.title}
                    </h3>

                    <p className="mt-3 text-sm leading-relaxed text-slate-500">
                      {item.description}
                    </p>

                    <div className="mt-6 overflow-hidden">
                      <div className="h-[2px] w-full origin-left scale-x-0 bg-gradient-to-r from-brand-cyan to-brand-lime transition-transform duration-700 group-hover:scale-x-100" />
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

