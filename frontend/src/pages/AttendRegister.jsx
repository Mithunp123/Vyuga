import { motion } from 'framer-motion'
import { useState } from 'react'
import PageShell from './PageShell.jsx'
import EventCard from '../components/EventCard.jsx'

const INNOVATION_MAIN_EVENT = {
  title: 'Inclusive Innovation Fest',
  accent: 'Innovators / For Specially Abled',
  description:
    'One unified registration form for both tracks. Participants choose whether their submission is by specially abled (Innovators) or for specially abled and continue with relevant fields.',
  details: [
    {
      label: 'Tracks',
      value: [
        'For Specially Abled: College teams (3 members)',
        'By Specially Abled: Innovators with or without team members',
        'Type selection happens inside one form',
      ],
    },
    {
      label: 'Focus Sector',
      value: [
        'Assistive Technology',
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
  buttonText: 'View Tracks',
  isExpandable: true,
}

const INNOVATION_TRACKS = [
  {
    title: 'Innovation Fest',
    accent: 'For Specially Abled',
    description:
      'College teams develop innovative solutions to improve accessibility and quality of life for specially abled individuals.',
    details: [
      {
        label: 'Eligibility',
        value: [
          'College/University students only',
          'Team of exactly 3 members',
          'All team members must be from same institution',
        ],
      },
      {
        label: 'Focus Sector',
        value: [
          'Assistive Technology',
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
      { 
        label: 'Awards', 
        value: 'Top three winners will receive cash prizes, mentorship opportunities, and certificates will be awarded to all finalists'
      },
    ],
    registerLink: '/register/innovation-college',
    buttonText: 'Register Now',
  },
  {
    title: 'Innovation Fest',
    accent: 'Innovators (Specially Abled)',
    description:
      'Specially abled individuals showcase their innovative solutions and entrepreneurial ideas to create an inclusive world.',
    details: [
      {
        label: 'Eligibility',
        value: [
          'Open to specially abled innovators',
          'Innovators or team participation (max 3 members)',
          'Innovators from any age group',
        ],
      },
      {
        label: 'Focus Sector',
        value: [
          'Assistive Technology',
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
      { 
        label: 'Awards', 
        value: 'Top three winners will receive cash prizes, mentorship opportunities, and certificates will be awarded to all finalists'
      },
    ],
    registerLink: '/register/innovation-pwd',
    buttonText: 'Register Now',
  },
]

const OTHER_EVENTS = [
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
        value: 'Top three winners will receive cash prizes, mentorship opportunities, and certificates will be awarded to all finalists',
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
  const [showInnovationTracks, setShowInnovationTracks] = useState(false)
  
  const handleInnovationClick = () => {
    setShowInnovationTracks(!showInnovationTracks)
  }

  // When innovation tracks are shown, only show those tracks
  const allEvents = showInnovationTracks 
    ? INNOVATION_TRACKS
    : [INNOVATION_MAIN_EVENT, ...OTHER_EVENTS]

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
          <span className="font-marker text-sm text-brand-lime">
            {showInnovationTracks ? '2 tracks' : '4 events'}
          </span>
        </div>
        
        {/* Back to main view button */}
        {showInnovationTracks && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setShowInnovationTracks(false)}
            className="mt-4 inline-flex items-center gap-2 text-sm text-brand-cyan hover:text-brand-cyan/80 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="font-display">Back to all events</span>
          </motion.button>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="grid gap-7 sm:grid-cols-2"
      >
        {allEvents.map((event, i) => (
          <ExpandableEventCard 
            key={event.registerLink || `event-${i}`} 
            index={i} 
            {...event}
            onExpand={event.isExpandable ? handleInnovationClick : undefined}
          />
        ))}
      </motion.div>
    </PageShell>
  )
}

// Enhanced EventCard component that can handle expansion
function ExpandableEventCard({ onExpand, isExpandable, ...props }) {
  const handleClick = () => {
    if (isExpandable && onExpand) {
      onExpand()
    }
  }

  if (isExpandable) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 36 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.65, delay: props.index * 0.12, ease: [0.22, 1, 0.36, 1] }}
        className="event-card-cinematic group relative cursor-pointer"
        onClick={handleClick}
      >
        <div className="event-card-inner relative flex flex-1 flex-col rounded-3xl bg-white overflow-hidden">
          <div className="h-[3px] w-full bg-gradient-to-r from-brand-cyan to-brand-lime" />
          <div className="pointer-events-none absolute inset-0 cinematic-sweep rounded-3xl" />
          
          <div className="relative flex flex-1 flex-col p-6 sm:p-8">
            <div className="flex items-start justify-between mb-5">
              <span className="font-impact text-[3.5rem] leading-none tracking-wider text-slate-100 transition-colors duration-500 group-hover:text-brand-cyan/10 select-none">
                {String(props.index + 1).padStart(2, '0')}
              </span>
              <span className="font-mono-display mt-2 text-[10px] font-medium uppercase tracking-[0.2em] text-slate-400 transition-colors duration-300 group-hover:text-brand-cyan">
                Event {String(props.index + 1).padStart(2, '0')}
              </span>
            </div>

            <div className="mb-1">
              <h3 className="font-hero text-xl font-extrabold leading-tight text-slate-900 sm:text-[1.35rem]">
                {props.title}
              </h3>
              {props.accent && (
                <span className="font-serif text-lg italic text-brand-cyan sm:text-xl">
                  {props.accent}
                </span>
              )}
            </div>

            <div className="mb-4 h-[2px] w-full bg-gradient-to-r from-brand-cyan to-brand-lime event-line-reveal" />
            <p className="text-sm leading-relaxed text-slate-500 mb-4">{props.description}</p>

            {props.details?.map((section, i) => (
              <div key={i} className="mb-3 rounded-2xl bg-gradient-to-br from-slate-50 to-white p-4 ring-1 ring-slate-100/80">
                <p className="font-marker mb-2 text-[11px] tracking-wider text-brand-cyan">
                  {section.label}
                </p>
                {Array.isArray(section.value) ? (
                  <ul className="space-y-1.5">
                    {section.value.map((item, j) => (
                      <li key={j} className="flex items-start gap-2.5 text-sm text-slate-600">
                        <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-brand-lime" />
                        <span className="font-display">{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="font-display text-sm font-medium text-slate-700">{section.value}</p>
                )}
              </div>
            ))}

            <div className="mt-auto pt-4">
              <button
                type="button"
                className="group/btn inline-flex items-center gap-2.5 overflow-hidden rounded-full px-7 py-3 text-sm font-bold text-white transition-all duration-300 shadow-lg shadow-brand-cyan/15 hover:shadow-xl hover:shadow-brand-cyan/25 hover:scale-[1.03] active:scale-[0.97] shimmer-btn"
              >
                <span className="font-display tracking-wide">{props.buttonText}</span>
                <svg className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  return <EventCard {...props} />
}

