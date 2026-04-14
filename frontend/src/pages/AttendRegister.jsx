import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Trophy, Medal, Crown, Award } from 'lucide-react'
import PageShell from './PageShell.jsx'

import thinkImage from '../assets/images/think.png'
import eventImage from '../assets/images/event.png'
import cricketImage from '../assets/images/cirket.png'
import chessImage from '../assets/images/chess.png'
import shortFilmImage from '../assets/images/shortflim.png'

const EVENT_DATA = [
  {
    id: "innovation",
    title: "Inclusive Innovation Fest",
    accent: "For Specially Abled / By Specially Abled",
    description: "Participants choose whether their submission is for specially abled or by specially abled and continue with relevant fields. College teams and individuals develop innovative solutions to improve accessibility.",
    image: thinkImage,
    details: [
      { label: 'Focus Sector', value: ['Assistive Technology'] },
      { label: 'Eligibility', value: ['Open to specially abled innovators & college students', 'Team max 3 members', 'Innovator from any age group for PwD'] }
    ],
    timeline: [
      { label: "Application Open", date: "14/04/2026" },
      { label: "Application Close", date: "10/05/2026" },
      { label: "1st Round Results", date: "20/05/2026" }
    ],
    prizes: [
      { category: "Overall", genericText: "Prize up to ₹ 2 Lakh" }
    ],
    isExpandable: true,
    tracks: [
      { link: '/register/innovation-college', label: 'College Teams', id: 'innovation-college' },
      { link: '/register/innovation-pwd', label: 'Specially Abled', id: 'innovation-pwd' }
    ]
  },
  {
    id: "talent",
    title: "Special Talent Hunt",
    accent: "Live Performance",
    description: "A vibrant platform to celebrate the unique talents of specially abled school children. Top 20 perform live at Vyuga!",
    image: eventImage,
    details: [
      { label: 'Eligibility & Selection', value: ['Schools/organizations nominate 1 team or individual', 'Team max 3 members', 'Entries screened and shortlisted', 'Top 20 participants selected for live performance'] }
    ],
    timeline: [
      { label: "Application Open", date: "14/04/2026" },
      { label: "Application Close", date: "20/05/2026" },
      { label: "Finalist Announcement", date: "05/06/2026" }
    ],
    prizes: [
      { category: "Overall", genericText: "Prize up to ₹ 50,000" }
    ],
    isExpandable: true,
    tracks: [
      { link: '/register/talent-student', label: 'School / Org', id: 'talent-student' },
      { link: '/register/talent-parent', label: 'Parent / Guardian', id: 'talent-parent' }
    ]
  },
  {
    id: "shortfilm",
    title: "Short Film Contest",
    accent: "Cinematic Showcase",
    description: "Theme: \"Ability Beyond Disability\" — Films should focus on inclusion, empowerment, real-life challenges, or inspiring stories of persons with disabilities.",
    image: shortFilmImage,
    details: [
      {
        label: 'Duration',
        value: [
          'Minimum: 1 minute',
          'Maximum: 3 minutes (strict limit)',
          'Titles + credits must be included within 3 minutes',
        ]
      },
      {
        label: 'Accessibility (Mandatory)',
        value: [
          'Subtitles/Captions (Compulsory) — English, must include dialogues & important sound cues (e.g., [door knocks])',
          'Audio Description (Compulsory) — Narration describing visuals for visually impaired audiences, clear & synced',
          'Clear Audio Quality — Dialogue and narration must be audible and noise-free',
          'Both subtitle & audio description formats are compulsory',
        ]
      },
      {
        label: 'Participation',
        value: [
          'Open to students, freelancers, and filmmakers',
          'Individual or team participation allowed',
          'Max 1 entry per participant/team',
        ]
      },
      {
        label: 'Disqualification Rules',
        value: [
          'Exceeding the time limit',
          'Missing captions or audio description',
          'Plagiarism or copyright violation',
          'Film irrelevant to the theme',
        ]
      },
    ],
    timeline: [
      { label: "Application Open", date: "14/04/2026" },
      { label: "Application Close", date: "20/05/2026" },
      { label: "Finalist Announcement", date: "05/06/2026" }
    ],
    prizes: [
      { category: "Overall", genericText: "Prize up to ₹ 1 Lakh" }
    ],
    registerLink: '/register/shortfilm',
    buttonText: 'Register Now',
    formId: 'shortfilm',
  }
  // {
  //   id: "cricket",
  //   title: "Blind Cricket",
  //   accent: "Tournament",
  //   description: "Promoting inclusive sportsmanship, teamwork, and resilience among visually impaired players.",
  //   image: cricketImage,
  //   details: [
  //     { label: 'Information', value: ['All participating teams receive cash prizes', 'Winner & Runner-up awarded trophies'] }
  //   ],
  //   timeline: [],
  //   prizes: [
  //     { category: "Overall", rewards: [{pos: "1st", val: "10000"}, {pos: "2nd", val: "5000"}] }
  //   ],
  //   registerLink: '/register/cricket',
  //   buttonText: 'Enquiry Now',
  //   formId: 'cricket'
  // },
  // {
  //   id: "chess",
  //   title: "Blind Chess",
  //   accent: "Competition",
  //   description: "Highlighting the intellectual strength, focus, and strategic thinking of visually impaired individuals.",
  //   image: chessImage,
  //   details: [
  //     { label: 'Information', value: ['Top performers receive trophies and cash prizes', 'All participants receive certificates'] }
  //   ],
  //   timeline: [],
  //   prizes: [
  //     { category: "Overall", rewards: [{pos: "1st", val: "3000"}, {pos: "2nd", val: "2000"}] }
  //   ],
  //   registerLink: '/register/chess',
  //   buttonText: 'Register will open soon',
  //   disabled: true,
  //   formId: 'chess'
  // }
];

// Prize accent colors per event index
const PRIZE_ACCENTS = [
  { bg: 'from-violet-600 to-indigo-500',  ring: 'ring-violet-300',  icon: 'text-yellow-300' },
  { bg: 'from-rose-500 to-pink-400',      ring: 'ring-rose-300',    icon: 'text-yellow-200' },
  { bg: 'from-amber-500 to-orange-400',   ring: 'ring-amber-300',   icon: 'text-white'      },
]

export default function AttendRegister() {
  const navigate = useNavigate()
  const [formSettings, setFormSettings] = useState([])

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/form-settings`)
      .then(res => res.json())
      .then(json => {
        if (json.success) setFormSettings(json.data)
      })
      .catch(console.error)
  }, [])

  const isFormClosed = (id) => {
    if (!id) return false
    const setting = formSettings.find(s => s.id === id)
    return setting && setting.is_open === false
  }

  const isBothInnovationClosed = (() => {
    if (formSettings.length === 0) return false
    const college = formSettings.find(s => s.id === 'innovation-college')
    const pwd = formSettings.find(s => s.id === 'innovation-pwd')
    return college && pwd && college.is_open === false && pwd.is_open === false
  })()

  return (
    <PageShell
      title="Register"
      subtitle="Choose an event below and complete your registration to be part of VYUGA – Inclusive Innovation Fest."
      heroPadding="pt-10 sm:pt-8 pb-0 sm:pb-0"
      compact={true}
      subtitleClass="text-slate-900"
    >
      <div className="flex flex-col gap-0 py-8 sm:py-12 max-w-6xl mx-auto px-4">
        {EVENT_DATA.map((event, idx) => {
          const isInnovationMain = event.id === 'innovation'
          const initiallyClosed = isInnovationMain ? isBothInnovationClosed : isFormClosed(event.formId)
          const closed = initiallyClosed || event.disabled
          const isShortFilm = event.id === 'shortfilm'
          const accent = PRIZE_ACCENTS[idx % PRIZE_ACCENTS.length]

          return (
            <motion.section
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6 }}
              className="py-10 lg:py-14 border-b border-slate-100 last:border-0"
            >
              {/* ── Event Header ── */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                <div>
                  <h2 className="font-hero text-3xl sm:text-4xl font-bold text-[#5BCB2B] tracking-tight leading-tight mb-1">
                    {event.title}
                  </h2>
                  <p className="font-serif text-lg italic text-brand-cyan/80">{event.accent}</p>
                </div>

                {/* Register buttons */}
                <div className="flex flex-wrap gap-3 items-center shrink-0">
                  {event.isExpandable ? (
                    <>
                      {event.tracks.map((track, tIdx) => {
                        const trackClosed = isFormClosed(track.id)
                        return (
                          <button
                            key={tIdx}
                            disabled={trackClosed}
                            onClick={() => navigate(track.link)}
                            className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-white transition-all shadow-md ${trackClosed ? 'bg-slate-300 cursor-not-allowed' : 'bg-[#5BCB2B] hover:bg-[#4eaa25] hover:scale-[1.02] hover:shadow-lg hover:shadow-[#5BCB2B]/20'}`}
                          >
                            {trackClosed ? 'Registration Closed' : `Register (${track.label})`}
                          </button>
                        )
                      })}
                    </>
                  ) : (
                    <button
                      disabled={closed}
                      onClick={() => navigate(event.registerLink)}
                      className={`group inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-white transition-all shadow-md ${closed ? 'bg-slate-300 cursor-not-allowed' : 'bg-[#5BCB2B] hover:bg-[#4eaa25] hover:scale-[1.02] hover:shadow-lg hover:shadow-[#5BCB2B]/20'}`}
                    >
                      {closed ? 'Registration Closed' : (event.buttonText || 'Register Now')}
                      {!closed && (
                        <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      )}
                    </button>
                  )}
                </div>
              </div>

              <p className="text-slate-600 text-base leading-relaxed mb-6 max-w-3xl">{event.description}</p>

              {/* ── Main Content Grid ── */}
              {isShortFilm ? (
                /* Short Film: compact single-page layout */
                <div className="flex flex-col gap-5">
                  {/* Details: 2x2 grid of sections */}
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {event.details.map((sec, sIdx) => {
                      const sectionColors = [
                        { border: 'border-sky-200',    bg: 'bg-sky-50',    title: 'text-sky-700',    dot: 'bg-sky-400'    },
                        { border: 'border-violet-200', bg: 'bg-violet-50', title: 'text-violet-700', dot: 'bg-violet-400' },
                        { border: 'border-emerald-200',bg: 'bg-emerald-50',title: 'text-emerald-700',dot: 'bg-emerald-500' },
                        { border: 'border-rose-200',   bg: 'bg-rose-50',   title: 'text-rose-700',   dot: 'bg-rose-400'  },
                      ]
                      const sc = sectionColors[sIdx % sectionColors.length]
                      return (
                        <div key={sIdx} className={`rounded-xl border ${sc.border} ${sc.bg} p-4 flex flex-col gap-2`}>
                          <h4 className={`font-bold text-xs uppercase tracking-widest ${sc.title} flex items-center gap-1.5 mb-1`}>
                            <span className={`inline-block w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                            {sec.label}
                          </h4>
                          <ul className="space-y-1.5">
                            {sec.value.map((val, vIdx) => (
                              <li key={vIdx} className="flex gap-2 text-xs text-slate-600 leading-snug">
                                <span className={`mt-1 w-1 h-1 rounded-full ${sc.dot} shrink-0`} />
                                <span>{val}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )
                    })}
                  </div>

                  {/* Timeline + Prize row */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    {/* Timeline */}
                    {event.timeline && event.timeline.length > 0 && (
                      <div className="bg-white border border-slate-200 rounded-2xl p-5 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-cyan to-[#5BCB2B]" />
                        <h4 className="font-bold text-slate-400 uppercase text-xs tracking-widest mb-4 flex items-center gap-2 mt-1">
                          <Calendar className="w-3.5 h-3.5 text-brand-cyan" /> Key Dates
                        </h4>
                        <ul className="space-y-3 border-l-2 border-[#5BCB2B]/30 ml-2 pl-4">
                          {event.timeline.map((step, sIdx) => (
                            <li key={sIdx} className="relative">
                              <div className={`absolute -left-[21px] top-1.5 h-2 w-2 rounded-full ring-2 ${/(open)/i.test(step.label) ? 'bg-[#5BCB2B] ring-[#5BCB2B]/20' : 'bg-white border-2 border-[#5BCB2B] ring-[#5BCB2B]/10'}`} />
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-600 font-bold mr-2">{step.label}</span>
                                <span className={`font-black uppercase tracking-wide ${/(open)/i.test(step.label) ? 'text-[#5BCB2B]' : 'text-slate-800'}`}>{step.date}</span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Prize Card */}
                    {event.prizes && event.prizes.length > 0 && (
                      <div className={`relative rounded-2xl bg-gradient-to-br ${accent.bg} p-5 overflow-hidden flex flex-col justify-center items-center text-center`}>
                        {/* Background glow */}
                        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
                        <Trophy className={`w-8 h-8 ${accent.icon} drop-shadow-lg mb-2 relative z-10`} />
                        <p className="text-white/70 uppercase text-[10px] tracking-widest font-bold mb-1 relative z-10">Prize Pool</p>
                        {event.prizes.map((pg, pIdx) => (
                          <p key={pIdx} className="text-white font-black text-2xl sm:text-3xl tracking-tight drop-shadow relative z-10">
                            {pg.genericText || pg.rewards?.map(r => `₹${r.val}`).join(' / ')}
                          </p>
                        ))}
                        <div className={`absolute -bottom-4 -right-4 w-24 h-24 rounded-full ${accent.ring} ring-[20px] opacity-20`} />
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Other events: standard 2-col layout */
                <div className="grid lg:grid-cols-12 gap-6 lg:gap-10">
                  {/* Left: details + image */}
                  <div className="lg:col-span-7 flex flex-col gap-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 flex flex-col gap-5">
                        {event.details.map((sec, sIdx) => (
                          <div key={sIdx}>
                            <h4 className="font-marker text-sm text-slate-800 tracking-wide mb-2 uppercase">{sec.label}</h4>
                            <ul className="space-y-1.5">
                              {sec.value.map((val, vIdx) => (
                                <li key={vIdx} className="flex gap-2 text-sm text-slate-600">
                                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#5BCB2B] shrink-0" />
                                  <span>{val}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>

                      {event.image && (
                        <div className="hidden sm:flex bg-slate-50 border border-slate-100 rounded-2xl p-4 justify-center items-center overflow-hidden group min-h-[160px]">
                          <img
                            src={event.image}
                            alt={event.title}
                            className={`object-contain drop-shadow-xl transition-transform duration-700 group-hover:scale-105 ${
                              event.id === 'innovation' ? 'h-40 md:h-52' : 'h-36 md:h-44'
                            }`}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Timeline + Prize */}
                  <div className="lg:col-span-5 flex flex-col gap-4">
                    {/* Timeline */}
                    {event.timeline && event.timeline.length > 0 && (
                      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-brand-cyan to-[#5BCB2B] opacity-80" />
                        <h4 className="font-bold text-slate-400 uppercase text-xs tracking-widest mb-4 flex items-center gap-2 mt-1">
                          <Calendar className="w-4 h-4 text-brand-cyan" /> Key Dates
                        </h4>
                        <ul className="space-y-4 border-l-2 border-[#5BCB2B]/30 ml-2 pl-4">
                          {event.timeline.map((step, sIdx) => (
                            <li key={sIdx} className="relative">
                              <div className={`absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full ring-2 ${/(open)/i.test(step.label) ? 'bg-[#5BCB2B] border border-white ring-[#5BCB2B]/20' : 'bg-white border-2 border-[#5BCB2B] ring-[#5BCB2B]/10'}`} />
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-600 font-bold whitespace-nowrap mr-2">{step.label}</span>
                                <span className={`font-black uppercase tracking-wide px-1 ${/(open)/i.test(step.label) ? 'text-[#5BCB2B]' : 'text-slate-800'}`}>{step.date}</span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* ── Attractive Prize Card ── */}
                    {event.prizes && event.prizes.length > 0 && (
                      <div className={`relative rounded-3xl bg-gradient-to-br ${accent.bg} p-6 overflow-hidden flex flex-col justify-center items-center text-center shadow-xl`}>
                        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
                        <Trophy className={`w-10 h-10 ${accent.icon} drop-shadow-lg mb-3 relative z-10`} />
                        <p className="text-white/70 uppercase text-[10px] tracking-widest font-bold mb-1.5 relative z-10">Prize Pool</p>
                        {event.prizes.map((pg, pIdx) => (
                          pg.genericText ? (
                            <p key={pIdx} className="text-white font-black text-2xl sm:text-3xl tracking-tight drop-shadow relative z-10">
                              {pg.genericText}
                            </p>
                          ) : (
                            <div key={pIdx} className="flex gap-3 flex-wrap justify-center relative z-10">
                              {pg.rewards?.map((r, rIdx) => (
                                <div key={rIdx} className="flex flex-col items-center bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                                  {r.pos === '1st' && <Crown className="w-4 h-4 text-yellow-300 mb-0.5" />}
                                  {r.pos === '2nd' && <Medal className="w-4 h-4 text-slate-200 mb-0.5" />}
                                  {r.pos === '3rd' && <Award className="w-4 h-4 text-amber-300 mb-0.5" />}
                                  <span className="text-white/70 text-[10px] font-bold uppercase">{r.pos}</span>
                                  <span className="text-white font-black text-lg">₹{r.val}</span>
                                </div>
                              ))}
                            </div>
                          )
                        ))}
                        <div className={`absolute -bottom-6 -right-6 w-32 h-32 rounded-full ${accent.ring} ring-[28px] opacity-20`} />
                        <div className="absolute -top-4 -left-4 w-20 h-20 rounded-full bg-white/10" />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.section>
          )
        })}
      </div>
    </PageShell>
  )
}

