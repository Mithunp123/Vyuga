import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export default function EventCard({ title, description, details, registerLink, index = 0 }) {
  const navigate = useNavigate()

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group flex flex-col rounded-2xl border border-slate-100 bg-white shadow-md hover:shadow-xl hover:shadow-brand-cyan/10 hover:border-brand-cyan/20 transition-all duration-300"
    >
      {/* Card header accent */}
      <div className="h-1.5 w-full rounded-t-2xl bg-gradient-to-r from-brand-cyan to-brand-lime" />

      <div className="flex flex-1 flex-col gap-4 p-6 sm:p-7">
        <h3 className="font-display text-lg font-bold leading-snug text-slate-900 sm:text-xl">
          {title}
        </h3>

        <p className="text-sm leading-relaxed text-slate-500">{description}</p>

        {/* Detail sections (themes, eligibility, process, etc.) */}
        {details?.map((section, i) => (
          <div key={i}>
            <p className="mb-1.5 text-xs font-bold uppercase tracking-widest text-brand-cyan">
              {section.label}
            </p>
            {Array.isArray(section.value) ? (
              <ul className="space-y-1">
                {section.value.map((item, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-lime" />
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm font-medium text-slate-700">{section.value}</p>
            )}
          </div>
        ))}

        <div className="mt-auto pt-2">
          <button
            onClick={() => navigate(registerLink)}
            style={{ backgroundColor: '#0197B2' }}
            className="group/btn inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white shadow-md transition-all duration-300 hover:opacity-90 hover:scale-[1.03] active:scale-[0.98]"
          >
            Register
            <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
