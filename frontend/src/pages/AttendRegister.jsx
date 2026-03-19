import { motion } from 'framer-motion'
import PageShell from './PageShell.jsx'
import EventCard from '../components/EventCard.jsx'

const EVENTS = [
  {
    title: 'Inclusive Innovation Fest',
    accent: 'By / For Specially Abled',
    description:
      'One unified registration form for both tracks. Participants choose whether their submission is by or for specially abled and continue with relevant fields.',
    details: [
      {
        label: 'Tracks',
        value: [
          'For Specially Abled: College teams (3 members)',
          'By Specially Abled: Individual or team (max 3)',
          'Type selection happens inside one form',
        ],
      },
      {
        label: 'Themes',
        value: [
          'Cognitive & Learning Accessibility',
          'Physical & Mobility Accessibility',
          'Visual & Hearing Accessibility',
        ],
      },
      {
        label: 'Event Flow',
        value: [
          'Round 1: Solution Submission (Online)',
          'Round 2: Online Pitch',
          'Round 3: Jury Shortlisting',
          'Finals: Live pitch at Vyuga',
        ],
      },
      { label: 'Awards', value: 'Top 3 positions with cash prizes' },
    ],
    registerLink: '/register/innovation',
    buttonText: 'Register Now',
  },
  {
    title: 'Special Talent',
    accent: 'Hunt',
    description:
      'A vibrant platform to celebrate the unique talents of specially abled school children. Top 20 perform live at Vyuga!',
    details: [
      {
        label: 'Eligibility & Selection',
        value: [
          'Schools/organizations nominate 1 team or individual',
          'Entries screened and shortlisted',
          'Top 20 participants selected for live performance',
        ],
      },
      {
        label: 'Awards',
        value: 'Top 3 performers receive special recognition and awards',
      },
    ],
    registerLink: '/register/talent-student',
    buttonText: 'Register Now',
  },
  {
    title: 'Blind Cricket',
    accent: 'Tournament',
    description:
      'Promoting inclusive sportsmanship, teamwork, and resilience among visually impaired players. More than a match — a celebration of determination beyond limits.',
    details: [
      {
        label: 'Awards',
        value: [
          'All participating teams receive cash prizes',
          'Winner & Runner-up awarded trophies',
        ],
      },
    ],
    registerLink: '/register/cricket',
    buttonText: 'Entry Now',
  },
  {
    title: 'Blind Chess',
    accent: 'Competition',
    description:
      'Highlighting the intellectual strength, focus, and strategic thinking of visually impaired individuals in an inclusive competitive environment.',
    details: [
      {
        label: 'Awards',
        value: [
          'Top performers receive trophies and cash prizes',
          'All participants receive certificates',
        ],
      },
    ],
    registerLink: '/register/chess',
    buttonText: 'Register will open soon',
    disabled: true,
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

