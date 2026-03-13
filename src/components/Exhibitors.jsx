import { motion } from 'framer-motion'
import { exhibitors } from '../data/homeData.js'

const _motion = motion

export default function Exhibitors() {
  return (
    <section id="exhibitors" className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        <motion.h2
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.45 }}
          className="font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl"
        >
          Exhibitors
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.45, delay: 0.04 }}
          className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base"
        >
          Explore the latest tools, platforms, and assistive technology solutions from our
          exhibitors.
        </motion.p>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {exhibitors.map((e, idx) => (
            <motion.article
              key={e.name}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: 0.03 * idx }}
              whileHover={{ y: -3 }}
              className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white">
                  <img
                    src={e.logo}
                    alt={`${e.name} logo`}
                    loading="lazy"
                    decoding="async"
                    className="h-7 w-auto opacity-95"
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-lg font-extrabold text-slate-900">{e.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {e.description}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <span className="text-xs font-semibold tracking-widest text-slate-500">
                  EXHIBITOR
                </span>
                <a
                  href="#register"
                  className="text-xs font-bold text-brand-cyan transition hover:text-slate-900"
                >
                  Learn more →
                </a>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}

