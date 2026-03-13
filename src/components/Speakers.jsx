import { motion } from 'framer-motion'
import { speakers } from '../data/homeData.js'

const _motion = motion

export default function Speakers() {
  return (
    <section id="speakers" className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.45 }}
              className="font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl"
            >
              Keynote Speakers
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.45, delay: 0.04 }}
              className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base"
            >
              Meet the leaders shaping accessibility, inclusive AI, and assistive innovation.
            </motion.p>
          </div>
          <a
            href="#register"
            className="inline-flex w-fit items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-brand-cyan/40"
          >
            Become a speaker
          </a>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {speakers.map((s, idx) => (
            <motion.article
              key={s.name}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.45, delay: 0.03 * idx }}
              whileHover={{ y: -3 }}
              className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="relative h-16 w-16 overflow-hidden rounded-full ring-2 ring-white/10">
                  <img
                    src={s.image}
                    alt={s.name}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-110"
                  />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-base font-extrabold text-slate-900">{s.name}</p>
                  <p className="mt-0.5 text-sm font-semibold text-slate-600">{s.role}</p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold tracking-widest text-slate-500">
                  ORGANIZATION
                </p>
                <p className="mt-2 text-sm font-bold text-slate-900">{s.org}</p>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Keynote</span>
                <span className="rounded-full bg-brand-lime/15 px-3 py-1 text-xs font-bold text-brand-lime">
                  Featured
                </span>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}

