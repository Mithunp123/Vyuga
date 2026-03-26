import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PageShell from './PageShell.jsx'
import EventCard from '../components/EventCard.jsx'

const INNOVATION_MAIN_EVENT = {
  title: 'Inclusive Innovation Fest',
  accent: 'For Specially Abled / By Specially Abled',
  description:
    'Participants choose whether their submission is for specially abled or by specially abled and continue with relevant fields.',
  details: [
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
    { label: 'Awards', value: 'Top three winners will receive cash prizes, mentorship opportunities, and certificates will be awarded to all finalists' },
  ],
  buttonText: 'Register Now',
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
    accent: 'By Specially Abled',
    description:
      'Specially abled individuals showcase their innovative solutions and entrepreneurial ideas to create an inclusive world.',
    details: [
      {
        label: 'Eligibility',
        value: [
          'Open to specially abled innovator',
          'Innovator or team participation (max 3 members)',
          'Innovator from any age group',
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
    buttonText: 'Enquiry Now',
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
  const navigate = useNavigate()
  const [selectedEvent, setSelectedEvent] = useState(null)
  
  const [formSettings, setFormSettings] = useState([])

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/form-settings`)
      .then(res => res.json())
      .then(json => {
        if (json.success) setFormSettings(json.data)
      })
      .catch(console.error)
  }, [])

  const isFormClosed = (link) => {
    if (!link) return false
    const id = link.split('/').pop()
    const setting = formSettings.find(s => s.id === id)
    return setting && setting.is_open === false
  }

  // Innovation main card: closed when BOTH sub-forms are closed
  const isBothInnovationClosed = (() => {
    if (formSettings.length === 0) return false
    const college = formSettings.find(s => s.id === 'innovation-college')
    const pwd = formSettings.find(s => s.id === 'innovation-pwd')
    return college && pwd && college.is_open === false && pwd.is_open === false
  })()

  // Disables background scroll when modal is open
  useEffect(() => {
    if (selectedEvent) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [selectedEvent])

  const allEvents = [INNOVATION_MAIN_EVENT, ...OTHER_EVENTS]

  return (
    <PageShell
      title="Register"
      subtitle="Choose an event below and complete your registration to be part of VYUGA – Inclusive Innovation Fest."
      heroPadding="pt-10 sm:pt-8 pb-0 sm:pb-0"
      compact={true}
      subtitleClass="text-slate-900"
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="mb-6 sm:mb-8 -mt-2 sm:-mt-4 relative z-10"
      >
        <div className="flex items-baseline gap-3">
          <span className="font-serif text-xl italic font-light text-slate-900 sm:text-2xl">
            Pick your
          </span>
          <span className="font-impact text-3xl tracking-[0.08em] text-stroke sm:text-4xl">
            EVENT
          </span>
        </div>
        <div className="mt-2 flex items-center gap-3">
          <div className="h-[2px] w-12 rounded-full bg-gradient-to-r from-brand-cyan to-brand-lime animate-line-grow" />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="grid gap-4 sm:grid-cols-2"
      >
        {allEvents.map((event, i) => {
        const isInnovationMain = !event.registerLink && event.isExpandable
          const closed = isInnovationMain ? isBothInnovationClosed : isFormClosed(event.registerLink)
          const mergedEvent = {
            ...event,
            disabled: closed || event.disabled,
            buttonText: closed ? 'Registration Closed' : event.buttonText
          }
          return (
          <EventCard 
            key={event.registerLink || `event-${i}`} 
            index={i} 
            {...mergedEvent}
            onClick={() => {
              if (mergedEvent.disabled) return
              setSelectedEvent(mergedEvent)
            }}
          />
        )})}
      </motion.div>

      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedEvent(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm sm:p-6"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative flex w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="relative bg-gradient-to-br from-[#0197B2] to-[#01788e] p-6 text-white sm:px-8 sm:pt-8 sm:pb-6">
                <button 
                  onClick={() => setSelectedEvent(null)} 
                  className="absolute right-4 top-4 rounded-full p-2 bg-white/10 hover:bg-white/20 transition backdrop-blur-sm"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className="pr-8">
                  <h2 className="font-hero text-2xl font-bold sm:text-3xl mb-1">{selectedEvent.title}</h2>
                  {selectedEvent.accent && (
                    <p className="font-serif text-lg italic text-brand-cyan-light/90">{selectedEvent.accent}</p>
                  )}
                </div>
              </div>
               
              {/* Modal Body */}
              <div className="overflow-y-auto custom-scrollbar p-6 sm:p-8 flex-1">
                <p className="text-slate-600 mb-6 leading-relaxed sm:text-[1.05rem]">{selectedEvent.description}</p>
                 
                <div className="flex flex-col gap-4">
                  {selectedEvent.details?.map((section, i) => (
                    <div key={i} className="rounded-2xl bg-slate-50 p-4 sm:p-5 ring-1 ring-slate-200/60">
                      <p className="font-marker mb-3 text-sm text-slate-900 tracking-wide">{section.label}</p>
                      {Array.isArray(section.value) ? (
                        <ul className="space-y-2.5">
                          {section.value.map((item, j) => (
                            <li key={j} className="flex items-start gap-3 text-sm text-slate-700">
                              <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#5BCB2B]" />
                              <span className="font-display leading-relaxed">{item}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="font-display text-sm leading-relaxed text-slate-700">{section.value}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
               
              {/* Modal Footer */}
              <div className="bg-slate-50/80 p-5 sm:px-8 border-t border-slate-100 flex flex-col gap-3 sm:flex-row sm:justify-end shrink-0">
                {selectedEvent.isExpandable ? (
                  <>
                    {INNOVATION_TRACKS.map((track, i) => {
                      const closed = isFormClosed(track.registerLink)
                      return (
                      <button 
                        key={i} 
                        disabled={closed}
                        onClick={() => {
                          if (!closed) {
                             setSelectedEvent(null)
                             navigate(track.registerLink)
                          }
                        }} 
                        className={`inline-flex justify-center items-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold text-white transition-all shadow-md ${closed ? 'bg-slate-400 cursor-not-allowed shadow-none hover:translate-y-0 text-slate-200 opacity-80' : 'bg-[#0197B2] hover:bg-[#01788e] hover:shadow-lg hover:-translate-y-0.5'}`}
                      >
                        {closed ? 'Registration Closed' : `Register (${track.accent})`}
                      </button>
                    )})}
                  </>
                ) : (
                  <button 
                    disabled={selectedEvent.disabled}
                    onClick={() => {
                      if (!selectedEvent.disabled) {
                        setSelectedEvent(null)
                        navigate(selectedEvent.registerLink)
                      }
                    }} 
                    className={`group inline-flex justify-center items-center gap-2 rounded-full px-8 py-3 text-sm font-bold text-white transition-all shadow-md ${
                      selectedEvent.disabled 
                        ? 'bg-slate-400 cursor-not-allowed shadow-none' 
                        : 'bg-[#5BCB2B] hover:bg-[#4eaa25] hover:scale-[1.02] hover:shadow-lg hover:shadow-[#5BCB2B]/20'
                    }`}
                  >
                    {selectedEvent.buttonText || 'Register Now'}
                    {!selectedEvent.disabled && (
                      <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageShell>
  )
}

