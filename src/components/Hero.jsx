import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { CalendarDays, MapPin } from 'lucide-react'

const _motion = motion

const heroBg =
  'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=2200&q=80'

export default function Hero() {
  return (
    <section id="home" className="relative">
      <div className="absolute inset-0">
        <img
          src={heroBg}
          alt="Conference auditorium"
          className="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 bg-white/80" />
        <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_20%_20%,rgba(1,151,178,0.18),transparent_55%),radial-gradient(700px_circle_at_75%_15%,rgba(91,203,43,0.18),transparent_55%)]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-6 sm:pb-20 md:pb-24 md:pt-14">
        <div className="grid items-center gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold tracking-widest text-slate-700"
            >
              <span className="h-2 w-2 rounded-full bg-brand-cyan" />
              EMPOWER 2025 · Assistive Technology Conference
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.05 }}
              className="mt-5 font-display text-balance text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl"
            >
              Welcome to 8th Annual Assistive Technology Conference
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-slate-700 sm:text-lg"
            >
              Empower is a global conference dedicated to accessibility in design, tech, and
              innovation. Join industry leaders, researchers, makers, and advocates for keynotes,
              workshops, and hands-on demos.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.16 }}
              className="mt-7 flex flex-col gap-3 sm:flex-row"
            >
              <Link
                id="register"
                to="/attend/register"
                className="inline-flex items-center justify-center rounded-lg bg-[#5BCB2B] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4FB423] focus:outline-none focus:ring-4 focus:ring-[#5BCB2B]/25"
              >
                Register Now
              </Link>
              <Link
                to="/program"
                className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:border-brand-cyan/40"
              >
                View Program
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.22 }}
              className="mt-9 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:gap-8"
            >
              <div className="flex items-center gap-3 text-sm">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-cyan/10 text-brand-cyan">
                  <CalendarDays className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold text-slate-900">3rd to 5th October</p>
                  <p className="text-xs text-slate-600">Workshops · Talks · Expo</p>
                </div>
              </div>
              <div className="h-px bg-slate-200 sm:h-10 sm:w-px" />
              <div className="flex items-center gap-3 text-sm">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-lime/10 text-brand-lime">
                  <MapPin className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold text-slate-900">IIT Delhi, New Delhi, India</p>
                  <p className="text-xs text-slate-600">Main Auditorium & Expo Hall</p>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="relative lg:col-span-5">
            <div className="mx-auto w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6">
              <p className="text-xs font-semibold tracking-widest text-slate-500">
                FEATURED TRACKS
              </p>
              <div className="mt-4 grid gap-3">
                {['Inclusive AI', 'Assistive Hardware', 'Policy & Standards', 'UX for Everyone'].map(
                  (t) => (
                    <div
                      key={t}
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800"
                    >
                      {t}
                    </div>
                  ),
                )}
              </div>

              <div className="mt-6 border-t border-slate-200 pt-5">
                <p className="text-xs font-semibold tracking-widest text-slate-500">SPONSORS</p>
                <div className="mt-3 grid grid-cols-3 gap-3">
                  {['HCLTech', 'Google', 'Microsoft'].map((name) => (
                    <div
                      key={name}
                      className="grid place-items-center rounded-xl border border-slate-200 bg-white px-3 py-3"
                    >
                      <span className="text-xs font-semibold text-slate-700">{name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

