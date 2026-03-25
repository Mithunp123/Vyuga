import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

export default function EventCard({ title, accent, description, onClick, buttonText = 'View Details', disabled = false, index = 0 }) {
  const num = String(index + 1).padStart(2, '0')

  return (
    <motion.div
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.65, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      className="event-card-cinematic group relative h-full min-h-[290px]"
    >
      <div className="event-card-inner relative flex flex-1 flex-col rounded-3xl bg-white overflow-hidden">

        {/* Top gradient accent bar */}
        <div className="h-[3px] w-full bg-gradient-to-r from-brand-cyan to-brand-lime" />

        {/* Cinematic sweep overlay — same as speaker cards */}
        <div className="pointer-events-none absolute inset-0 cinematic-sweep rounded-3xl" />

        <div className="relative flex flex-1 flex-col p-5 sm:p-6">

          {/* Number + label row */}
          <div className="flex items-start justify-between mb-2">
            <span className="font-impact text-3xl sm:text-4xl leading-none tracking-wider text-[#0197B2]/30 transition-colors duration-500 group-hover:text-[#0197B2]/50 select-none">
              {num}
            </span>
            <span className="font-mono-display mt-1 text-[9px] sm:text-[10px] font-medium uppercase tracking-[0.2em] text-[#0197B2] transition-colors duration-300">
              Event {num}
            </span>
          </div>

          {/* Title — mixed fonts like hero: impact + serif italic accent */}
          <div className="mb-2">
            <h3 className="font-hero text-base sm:text-lg font-extrabold leading-tight text-[#5BCB2B] lg:text-[1.1rem]">
              {title}
            </h3>
            {accent && (
              <span className="font-serif text-sm sm:text-base italic text-[#0197B2] lg:text-[0.95rem] leading-snug block mt-0.5">
                {accent}
              </span>
            )}
          </div>

          {/* Gradient line reveal on hover */}
          <div className="mb-3 h-[2px] w-full bg-gradient-to-r from-brand-cyan to-brand-lime event-line-reveal shrink-0" />

          <div className="overflow-hidden flex-1">
            <p className="text-xs sm:text-[13px] leading-relaxed text-slate-500 line-clamp-3">{description}</p>
          </div>

          {/* CTA button */}
          <div className="mt-auto shrink-0 pt-3">
            <button
              type="button"
              disabled={disabled}
              onClick={() => !disabled && onClick && onClick()}
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
