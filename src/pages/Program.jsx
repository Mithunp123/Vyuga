import { motion } from 'framer-motion'
import { Calendar, Wrench, Mic, FileText } from 'lucide-react'
import PageShell from './PageShell.jsx'

const programs = [
  { href: '/projects/schedule', title: 'Schedule', desc: 'Timeline overview and daily agenda.', icon: Calendar, color: 'from-brand-cyan/15 to-brand-cyan/5' },
  { href: '/projects/workshops', title: 'Workshops', desc: 'Hands-on sessions and labs.', icon: Wrench, color: 'from-brand-lime/15 to-brand-lime/5' },
  { href: '/projects/keynotes', title: 'Keynote Speakers', desc: 'Featured keynotes and speakers.', icon: Mic, color: 'from-purple-500/15 to-purple-500/5' },
  { href: '/projects/call-for-paper', title: 'Call for Paper', desc: 'Submission guidelines and important dates.', icon: FileText, color: 'from-blue-500/15 to-blue-500/5' },
]

export default function Program() {
  return (
    <PageShell
      title="Program"
      subtitle="Explore the schedule summary, workshops, keynotes, and conference tracks."
    >
      <div className="grid gap-5 sm:grid-cols-2">
        {programs.map((p, idx) => {
          const Icon = p.icon
          return (
            <motion.a
              key={p.href}
              href={p.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="card-hover-glow group rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
            >
              <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${p.color} ring-1 ring-slate-100`}>
                <Icon className="h-5 w-5 text-slate-700" />
              </div>
              <p className="text-base font-bold text-slate-900">{p.title}</p>
              <p className="mt-1 text-sm text-slate-500">{p.desc}</p>
            </motion.a>
          )
        })}
      </div>
    </PageShell>
  )
}

