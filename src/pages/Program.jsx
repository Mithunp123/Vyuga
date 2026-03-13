import PageShell from './PageShell.jsx'

export default function Program() {
  return (
    <PageShell
      title="Program"
      subtitle="Explore the schedule summary, workshops, keynotes, and conference tracks."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <a
          href="/projects/schedule"
          className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-brand-cyan/40 hover:shadow-sm"
        >
          <p className="font-semibold">Schedule</p>
          <p className="mt-1 text-sm text-slate-600">Timeline overview and daily agenda.</p>
        </a>
        <a
          href="/projects/workshops"
          className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-brand-cyan/40 hover:shadow-sm"
        >
          <p className="font-semibold">Workshops</p>
          <p className="mt-1 text-sm text-slate-600">Hands-on sessions and labs.</p>
        </a>
        <a
          href="/projects/keynotes"
          className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-brand-cyan/40 hover:shadow-sm"
        >
          <p className="font-semibold">Keynote Speakers</p>
          <p className="mt-1 text-sm text-slate-600">Featured keynotes and speakers.</p>
        </a>
        <a
          href="/projects/call-for-paper"
          className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-brand-cyan/40 hover:shadow-sm"
        >
          <p className="font-semibold">Call for Paper</p>
          <p className="mt-1 text-sm text-slate-600">Submission guidelines and important dates.</p>
        </a>
      </div>
    </PageShell>
  )
}

