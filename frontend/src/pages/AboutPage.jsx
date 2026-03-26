import PageShell from './PageShell.jsx'
import About from '../components/About.jsx'

export default function AboutPage() {
  return (
    <PageShell 
      title="About" 
      subtitle="What Vyuga is and why it matters." 
      heroPadding="pt-20 pb-2" 
      fullWidth={true}
      titleClass="text-slate-900"
      subtitleClass="text-slate-900"
    >
      <About />
    </PageShell>
  )
}

