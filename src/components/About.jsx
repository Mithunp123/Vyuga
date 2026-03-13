import { motion } from 'framer-motion'

const _motion = motion

const highlights = [
  { title: '3 days', desc: 'Keynotes, workshops, and expo experiences.' },
  { title: '40+ sessions', desc: 'Research, product showcases, and hands-on demos.' },
  { title: 'Global community', desc: 'Designers, engineers, educators, and advocates.' },
  { title: 'Accessibility-first', desc: 'Practical guidance for inclusive tech delivery.' },
]

export default function About() {
  return (
    <section id="about" className="bg-white text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-7">
            <motion.h2
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.45 }}
              className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl"
            >
              About the conference
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.45, delay: 0.04 }}
              className="mt-5 max-w-2xl text-base leading-relaxed text-slate-600"
            >
              Empower 2025 brings together the people building technology for everyone—assistive
              innovators, inclusive designers, researchers, educators, startups, and policy leaders.
              Expect focused tracks, real-world demos, and actionable takeaways you can apply
              immediately.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.45, delay: 0.08 }}
              className="mt-7 grid gap-4 sm:grid-cols-2"
            >
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(2,6,23,0.06)]">
                <p className="text-xs font-semibold tracking-widest text-slate-500">FOCUS</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  Accessibility across design, tech, and innovation.
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  Learn from practitioners shipping inclusive products at scale.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(2,6,23,0.06)]">
                <p className="text-xs font-semibold tracking-widest text-slate-500">FORMAT</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  Talks, workshops, networking, and exhibitors.
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  Practical sessions designed for teams and builders.
                </p>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.45 }}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-extrabold tracking-tight text-slate-900">
                  Event highlights
                </p>
                <span className="rounded-full bg-brand-cyan/10 px-3 py-1 text-xs font-bold text-brand-cyan">
                  Empower 2025
                </span>
              </div>

              <div className="mt-5 grid gap-4">
                {highlights.map((h) => (
                  <div
                    key={h.title}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <p className="text-sm font-bold text-slate-900">{h.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{h.desc}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl bg-brand-lime/10 p-5">
                <p className="text-sm font-bold text-slate-900">
                  Build accessibility into every roadmap
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  From standards and policy to shipping products—learn what works.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

