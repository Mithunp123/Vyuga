import { motion } from 'framer-motion'
import PageShell from './PageShell.jsx'
import EventCard from '../components/EventCard.jsx'

const EVENTS = [
  {
    title: 'Inclusive Innovation Fest',
    accent: 'For Specially Abled',
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
    title: 'Inclusive Innovation Fest',
    accent: 'By Specially Abled',
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
    title: 'Special Talent',
    accent: 'Utsav',
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
    title: 'Blind Cricket',
    accent: 'Tournament',
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
      {/* Section header — matching site's mixed-font cinematic style */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="mb-12 sm:mb-14"
      >
        <div className="flex items-baseline gap-3">
          <span className="font-serif text-2xl italic font-light text-brand-cyan sm:text-3xl">
            Pick your
          </span>
          <span className="font-impact text-4xl tracking-[0.08em] text-stroke sm:text-5xl">
            EVENT
          </span>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <div className="h-[3px] w-16 rounded-full bg-gradient-to-r from-brand-cyan to-brand-lime animate-line-grow" />
          <span className="font-marker text-sm text-brand-lime">4 events</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="grid gap-7 sm:grid-cols-2"
      >
        {EVENTS.map((event, i) => (
          <EventCard key={event.registerLink} index={i} {...event} />
        ))}
      </motion.div>
    </PageShell>
  )
}

