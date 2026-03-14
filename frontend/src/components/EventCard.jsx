import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export default function EventCard({ title, accent, description, details, registerLink, index = 0 }) {
  const navigate = useNavigate()
  const num = String(index + 1).padStart(2, '0')

  return (
    <motion.div
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.65, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      className="event-card-cinematic group relative"
    >
      <div className="event-card-inner relative flex flex-1 flex-col rounded-3xl bg-white overflow-hidden">

        {/* Top gradient accent bar */}
        <div className="h-[3px] w-full bg-gradient-to-r from-brand-cyan to-brand-lime" />

        {/* Cinematic sweep overlay — same as speaker cards */}
        <div className="pointer-events-none absolute inset-0 cinematic-sweep rounded-3xl" />

        <div className="relative flex flex-1 flex-col p-6 sm:p-8">

          {/* Number + label row */}
          <div className="flex items-start justify-between mb-5">
            <span className="font-impact text-[3.5rem] leading-none tracking-wider text-slate-100 transition-colors duration-500 group-hover:text-brand-cyan/10 select-none">
              {num}
            </span>
            <span className="font-mono-display mt-2 text-[10px] font-medium uppercase tracking-[0.2em] text-slate-400 transition-colors duration-300 group-hover:text-brand-cyan">
              Event {num}
            </span>
          </div>

          {/* Title — mixed fonts like hero: impact + serif italic accent */}
          <div className="mb-1">
            <h3 className="font-hero text-xl font-extrabold leading-tight text-slate-900 sm:text-[1.35rem]">
              {title}
            </h3>
            {accent && (
              <span className="font-serif text-lg italic text-brand-cyan sm:text-xl">
                {accent}
              </span>
            )}
          </div>

          {/* Gradient line reveal on hover */}
          <div className="mb-4 h-[2px] w-full bg-gradient-to-r from-brand-cyan to-brand-lime event-line-reveal" />

          <p className="text-sm leading-relaxed text-slate-500 mb-4">{description}</p>

          {/* Detail sections */}
          {details?.map((section, i) => (
            <div key={i} className="mb-3 rounded-2xl bg-gradient-to-br from-slate-50 to-white p-4 ring-1 ring-slate-100/80">
              <p className="font-marker mb-2 text-[11px] tracking-wider text-brand-cyan">
                {section.label}
              </p>
              {Array.isArray(section.value) ? (
                <ul className="space-y-1.5">
                  {section.value.map((item, j) => (
                    <li key={j} className="flex items-start gap-2.5 text-sm text-slate-600">
                      <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-brand-lime" />
                      <span className="font-display">{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="font-display text-sm font-medium text-slate-700">{section.value}</p>
              )}
            </div>
          ))}

          {/* CTA button */}
          <div className="mt-auto pt-4">
            <button
              type="button"
              onClick={() => navigate(registerLink)}
              className="group/btn inline-flex items-center gap-2.5 overflow-hidden rounded-full px-7 py-3 text-sm font-bold text-white shadow-lg shadow-brand-cyan/15 transition-all duration-300 hover:shadow-xl hover:shadow-brand-cyan/25 hover:scale-[1.03] active:scale-[0.97] shimmer-btn"
            >
              <span className="font-display tracking-wide">Register Now</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
