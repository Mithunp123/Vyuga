import { motion } from 'framer-motion'
import PageShell from './PageShell.jsx'
import EventCard from '../components/EventCard.jsx'

const EVENTS = [
  {
    title: 'Inclusive Innovation Fest – For Specially Abled',
    description:
      'College students should submit innovative solutions under given themes. Teams can present ideas or prototypes.',
    details: [
      {
        label: 'Themes',
        value: [
          'Cognitive & Learning Accessibility',
          'Physical & Mobility Accessibility',
          'Visual & Hearing Accessibility',
        ],
      },
      { label: 'Team Size', value: '3 members per team' },
    ],
    registerLink: '/register/innovation-college',
  },
  {
    title: 'Inclusive Innovation Fest – By Specially Abled',
    description:
      'This category is for innovators with disabilities who want to create solutions for accessibility and independence.',
    details: [
      {
        label: 'Eligibility',
        value: [
          'Must be an innovator',
          'Must not be a registered startup',
          'Must be a person with disability',
        ],
      },
      { label: 'Participation', value: 'Individual or team (max 3 members)' },
      { label: 'Theme', value: 'Assistive Technology' },
    ],
    registerLink: '/register/innovation-pwd',
  },
  {
    title: 'Special Talent Utsav',
    description:
      'A platform for children with disabilities to showcase their talents on stage. Schools and organizations can nominate talented students.',
    details: [
      {
        label: 'Process',
        value: ['Organization registration', 'Student nomination', 'Video submission'],
      },
    ],
    registerLink: '/register/talent-org',
  },
  {
    title: 'Blind Cricket Tournament',
    description:
      'Teams can submit their interest to participate in the blind cricket tournament.',
    details: [],
    registerLink: '/register/cricket',
  },
]

export default function AttendRegister() {
  return (
    <PageShell
      title="Register"
      subtitle="Choose an event below and complete your registration to be part of VYUGA – Inclusive Innovation Fest."
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="grid gap-6 sm:grid-cols-2 xl:grid-cols-2"
      >
        {EVENTS.map((event, i) => (
          <EventCard key={event.registerLink} index={i} {...event} />
        ))}
      </motion.div>
    </PageShell>
  )
}

