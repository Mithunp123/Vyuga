import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { scheduleSummary } from '../data/homeData.js'
import { Mic, Users, Wrench, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const iconByTitle = { Workshops: Wrench, 'Keynote Talks': Mic, Networking: Users }

export default function Schedule() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section id="program" className="relative overflow-hidden bg-white" ref={ref}>
      <div className="absolute inset-0 dot-grid opacity-10" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
        {/* Header */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-3"
            >
              <div className="gradient-line w-16" />
              <span className="font-mono text-[11px] font-semibold tracking-[0.3em] text-brand-cyan">PROGRAM</span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-4"
            >
              <span className="font-hero text-4xl font-black tracking-tight text-slate-900 sm:text-5xl lg:text-7xl">
                Schedule{' '}
              </span>
              <span className="font-serif text-4xl italic font-light text-brand-cyan sm:text-5xl lg:text-7xl">
                overview
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
              className="group inline-flex items-center gap-2 font-marker text-sm text-brand-cyan transition-colors hover:text-brand-lime"
            >
              See full schedule
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>

        {/* Timeline — vertical line with text items, NO cards */}
        <div className="relative mt-20">
          {/* Vertical gradient line */}
          <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-brand-cyan via-brand-lime to-transparent sm:left-8" />

          <div className="space-y-0">
            {scheduleSummary.map((item, idx) => {
              const Icon = iconByTitle[item.title] ?? Wrench
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: -30 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.7, delay: 0.2 + idx * 0.15, ease: [0.22, 1, 0.36, 1] }}
                  className="group relative border-b border-slate-100 py-12 pl-8 sm:pl-20 transition-colors hover:border-brand-cyan/20"
                >
                  {/* Dot on timeline */}
                  <div className="absolute left-0 top-14 sm:left-8 -translate-x-1/2">
                    <div className="h-4 w-4 rounded-full border-2 border-brand-cyan bg-white transition-all duration-500 group-hover:bg-brand-cyan group-hover:scale-125 group-hover:shadow-lg group-hover:shadow-brand-cyan/30" />
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-12">
                    {/* Number + time */}
                    <div className="flex-shrink-0 sm:w-32">
                      <span className="font-impact text-6xl tracking-wide text-slate-100 transition-colors duration-500 group-hover:text-brand-cyan/20 sm:text-7xl">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <Icon className="h-3.5 w-3.5 text-brand-cyan/50" />
                        <span className="font-mono text-[10px] tracking-[0.3em] text-slate-400">{item.time.toUpperCase()}</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="font-hero text-2xl font-extrabold tracking-tight text-slate-900 transition-colors group-hover:text-brand-cyan sm:text-3xl">
                        {item.title}
                      </h3>
                      <p className="mt-2 max-w-lg text-sm leading-relaxed text-slate-500 sm:text-base">
                        {item.description}
                      </p>
                      {/* Expanding line on hover */}
                      <div className="mt-4 h-[2px] w-0 bg-gradient-to-r from-brand-cyan to-brand-lime transition-all duration-700 group-hover:w-full" />
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

