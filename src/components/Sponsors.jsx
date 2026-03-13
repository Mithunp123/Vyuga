import { motion } from 'framer-motion'
import { sponsors } from '../data/homeData.js'

const _motion = motion

export default function Sponsors() {
  return (
    <section id="sponsors" className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        <motion.h2
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.45 }}
          className="font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl"
        >
          Sponsors
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.45, delay: 0.04 }}
          className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base"
        >
          Thank you to our partners supporting accessibility, innovation, and community.
        </motion.p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {sponsors.map((s, idx) => (
            <motion.div
              key={`${s.name}-${idx}`}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: 0.02 * idx }}
              className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              title={`${s.tier} · ${s.name}`}
            >
              <div className="grid place-items-center rounded-xl bg-white p-3">
                <img
                  src={s.src}
                  alt={`${s.name} logo`}
                  loading="lazy"
                  decoding="async"
                  className="h-8 w-auto opacity-90 grayscale transition duration-300 group-hover:grayscale-0 group-hover:opacity-100"
                />
              </div>
              <p className="mt-3 truncate text-center text-xs font-semibold tracking-widest text-slate-500">
                {s.tier}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

