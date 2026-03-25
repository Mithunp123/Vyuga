import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export default function EventCard({ title, accent, description, details, registerLink, buttonText = 'Register Now', disabled = false, index = 0 }) {
  const navigate = useNavigate()
  const num = String(index + 1).padStart(2, '0')

  return (
    <motion.div
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.65, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      className="event-card-cinematic group relative h-full"
    >
      <div className="event-card-inner relative flex flex-1 flex-col rounded-3xl bg-white overflow-hidden">

        {/* Top gradient accent bar */}
        <div className="h-[3px] w-full bg-gradient-to-r from-brand-cyan to-brand-lime" />

        {/* Cinematic sweep overlay — same as speaker cards */}
        <div className="pointer-events-none absolute inset-0 cinematic-sweep rounded-3xl" />

        <div className="relative flex flex-1 flex-col p-4 sm:p-5">

          {/* Number + label row */}
          <div className="flex items-start justify-between mb-3">
            <span className="font-impact text-[2.5rem] leading-none tracking-wider text-[#0197B2]/30 transition-colors duration-500 group-hover:text-[#0197B2]/50 select-none">
              {num}
            </span>
            <span className="font-mono-display mt-2 text-[10px] font-medium uppercase tracking-[0.2em] text-[#0197B2] transition-colors duration-300">
              Event {num}
            </span>
          </div>

          {/* Title — mixed fonts like hero: impact + serif italic accent */}
          <div className="mb-1">
            <h3 className="font-hero text-lg font-extrabold leading-tight text-[#5BCB2B] sm:text-xl">
              {title}
            </h3>
            {accent && (
              <span className="font-serif text-base italic text-[#0197B2] sm:text-lg">
                {accent}
              </span>
            )}
          </div>

          {/* Gradient line reveal on hover */}
          <div className="mb-3 h-[2px] w-full bg-gradient-to-r from-brand-cyan to-brand-lime event-line-reveal shrink-0" />

          <div className="overflow-y-auto custom-scrollbar flex-1 pr-2">
            <p className="text-xs sm:text-sm leading-relaxed text-slate-500 mb-3">{description}</p>

            {/* Detail sections */}
            {details?.map((section, i) => (
              <div key={i} className="mb-2 rounded-xl bg-gradient-to-br from-slate-50 to-white p-3 ring-1 ring-slate-100/80">
                <p className="font-marker mb-1 text-[10px] tracking-wider text-brand-cyan">
                  {section.label}
                </p>
                {Array.isArray(section.value) ? (
                  <ul className="space-y-1">
                    {section.value.map((item, j) => (
                      <li key={j} className="flex items-start gap-2 text-xs text-slate-600">
                        <span className="mt-[6px] h-1 w-1 shrink-0 rounded-full bg-brand-lime" />
                        <span className="font-display">{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="font-display text-xs font-medium text-slate-700">{section.value}</p>
                )}
              </div>
            ))}
          </div>

          {/* CTA button */}
          <div className="mt-3 shrink-0">
            <button
              type="button"
              disabled={disabled}
              onClick={() => !disabled && navigate(registerLink)}
              className={`group/btn inline-flex items-center gap-2 overflow-hidden rounded-full px-5 py-2 text-xs sm:text-sm font-bold text-white transition-all duration-300 ${
                disabled
                  ? 'bg-slate-400 cursor-not-allowed shadow-none'
                  : 'shadow-lg shadow-brand-cyan/15 hover:shadow-xl hover:shadow-brand-cyan/25 hover:scale-[1.03] active:scale-[0.97] shimmer-btn'
              }`}
            >
              <span className="font-display tracking-wide">{buttonText}</span>
              <ArrowRight className={`h-4 w-4 transition-transform duration-300 ${
                disabled ? '' : 'group-hover/btn:translate-x-1'
              }`} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
