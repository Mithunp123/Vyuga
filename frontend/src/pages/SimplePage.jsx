import { motion } from 'framer-motion'
import PageShell from './PageShell.jsx'

export default function SimplePage({ title, subtitle, bullets }) {
  return (
    <PageShell title={title} subtitle={subtitle}>
      <div className="max-w-3xl">
        {bullets?.length ? (
          <div className="grid gap-4">
            {bullets.map((b, idx) => (
              <motion.div
                key={b}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="group flex items-start gap-4 rounded-2xl border border-slate-100 bg-gradient-to-r from-white to-slate-50/50 p-5 shadow-sm transition-all hover:shadow-md hover:shadow-brand-cyan/5 hover:border-brand-cyan/15"
              >
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-cyan/15 to-brand-lime/10 text-xs font-bold text-brand-cyan ring-1 ring-brand-cyan/10">
                  {idx + 1}
                </span>
                <p className="text-sm font-medium leading-relaxed text-slate-700">{b}</p>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-8 text-center">
            <p className="text-sm text-slate-500">Content coming soon.</p>
          </div>
        )}
      </div>
    </PageShell>
  )
}

