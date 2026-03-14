import PageShell from './PageShell.jsx'
import Speakers from '../components/Speakers.jsx'

export default function SpeakersPage() {
  return (
    <PageShell title="Speakers" subtitle="Keynotes and featured speakers.">
      <Speakers />
    </PageShell>
  )
}

