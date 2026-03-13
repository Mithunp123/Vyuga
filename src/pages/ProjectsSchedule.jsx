import SimplePage from './SimplePage.jsx'

export default function ProjectsSchedule() {
  return (
    <SimplePage
      title="Schedule"
      subtitle="A clear timeline view of conference activities."
      bullets={[
        'Day 1: Workshops + Opening keynote',
        'Day 2: Keynotes + Panels + Networking',
        'Day 3: Expo + Closing sessions',
      ]}
    />
  )
}

