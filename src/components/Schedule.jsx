import { motion } from 'framer-motion'
import { scheduleSummary } from '../data/homeData.js'
import { Mic, Users, Wrench } from 'lucide-react'

const _motion = motion

const iconByTitle = {
  Workshops: Wrench,
  'Keynote Talks': Mic,
  Networking: Users,
}

export default function Schedule() {
  return (
    <section id="program" className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="flex items-end justify-between gap-6">
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.45 }}
              className="font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl"
            >
              Schedule Summary
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.45, delay: 0.04 }}
              className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base"
            >
              A quick view of the key conference moments—designed for learning, connection, and
              hands-on exploration.
            </motion.p>
          </div>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {scheduleSummary.map((item, idx) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.45, delay: 0.03 * idx }}
              whileHover={{ y: -3 }}
              className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-cyan/10 text-brand-cyan">
                  {(() => {
                    const Icon = iconByTitle[item.title] ?? Wrench
                    return <Icon className="h-5 w-5" aria-hidden="true" />
                  })()}
                </div>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                  {item.time}
                </span>
              </div>

              <h3 className="mt-5 text-lg font-extrabold tracking-tight text-slate-900">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {item.description}
              </p>

              <div className="mt-6 h-px w-full bg-slate-200" />
              <p className="mt-5 text-xs font-semibold tracking-widest text-slate-500">
                EXPLORE MORE
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}

