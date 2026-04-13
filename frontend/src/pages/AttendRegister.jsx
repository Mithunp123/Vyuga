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
      { category: "Overall", genericText: "Prize up to ₹1 Lakh (both included)" }
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
      { category: "Overall", genericText: "Prize up to ₹50 Thousand" }
    ],
    registerLink: '/register/talent-student',
    buttonText: 'Register Now',
    formId: 'talent-student'
  },
  {
    id: "shortfilm",
    title: "Short Film Contest",
    accent: "Cinematic Showcase",
    description: "Showcase your filmmaking skills by submitting impactful short films centered around inclusivity, accessibility, and empowerment.",
    image: shortFilmImage,
    details: [
      { label: 'Eligibility', value: ['Open to everyone', 'Team max 3 members', 'Short films must be related to the inclusivity theme'] }
    ],
    timeline: [
      { label: "Application Open", date: "14/04/2026" },
      { label: "Application Close", date: "20/05/2026" },
      { label: "Finalist Announcement", date: "05/06/2026" }
    ],
    prizes: [
      { category: "Overall", genericText: "Prize up to ₹50 Thousand" }
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
      <div className="flex flex-col gap-12 sm:gap-24 py-8 sm:py-16 max-w-6xl mx-auto px-4">
        {EVENT_DATA.map((event, idx) => {
          const isInnovationMain = event.id === 'innovation';
          const initiallyClosed = isInnovationMain ? isBothInnovationClosed : isFormClosed(event.formId);
          const closed = initiallyClosed || event.disabled;
          
          return (
            <motion.section 
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="py-12 lg:py-16 flex flex-col justify-center border-b border-slate-100 last:border-0"
            >
              <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
                
                {/* Left Side: Information */}
                <div className="lg:col-span-7 flex flex-col gap-6 relative">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div>
                      <h2 className="font-hero text-4xl sm:text-5xl font-bold text-[#5BCB2B] tracking-tight leading-tight mb-2">
                        {event.title}
                      </h2>
                      <p className="font-serif text-xl italic text-brand-cyan-light/90">
                        {event.accent}
                      </p>
                    </div>

                    {/* Actions natively placed next to title */}
                    <div className="flex flex-wrap gap-3 items-center z-10 shrink-0 mt-2 md:mt-1">
                      {event.isExpandable ? (
                        <>
                          {event.tracks.map((track, tIdx) => {
                            const trackClosed = isFormClosed(track.id);
                            return (
                              <button
                                key={tIdx}
                                disabled={trackClosed}
                                onClick={() => navigate(track.link)}
                                className={`rounded-full px-6 py-3 text-[14px] font-bold text-white transition-all shadow-md ${trackClosed ? 'bg-slate-300 cursor-not-allowed shadow-none' : 'bg-[#0197B2] hover:bg-[#01788e] hover:shadow-lg hover:-translate-y-0.5'}`}
                              >
                                {trackClosed ? 'Closed' : `Register (${track.label})`}
                              </button>
                            )
                          })}
                        </>
                      ) : (
                        <button
                          disabled={closed}
                          onClick={() => navigate(event.registerLink)}
                          className={`group inline-flex items-center gap-2 rounded-full px-6 py-3 text-[14px] font-bold text-white transition-all shadow-md ${closed ? 'bg-slate-300 cursor-not-allowed shadow-none' : 'bg-[#5BCB2B] hover:bg-[#4eaa25] hover:scale-[1.02] hover:shadow-lg hover:shadow-[#5BCB2B]/20'}`}
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
                  
                  <p className="text-slate-600 text-lg leading-relaxed">
                    {event.description}
                  </p>

                  <div className="grid sm:grid-cols-2 gap-4 mt-2">
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 flex flex-col gap-6">
                      {event.details.map((sec, sIdx) => (
                        <div key={sIdx}>
                          <h4 className="font-marker text-sm text-slate-800 tracking-wide mb-3 uppercase">{sec.label}</h4>
                          <ul className="space-y-2">
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

                    {/* Image embedded seamlessly beside details */}
                    {event.image && (
                      <div className="hidden sm:flex bg-slate-50 border border-slate-100 rounded-2xl p-4 justify-center items-center relative overflow-hidden group min-h-[160px]">
                        <img src={event.image} alt={event.title} className={`object-contain drop-shadow-xl transition-transform duration-700 group-hover:scale-105 ${
                          event.id === 'shortfilm' ? 'h-36 md:h-48 scale-110' :
                          event.id === 'innovation' ? 'h-40 md:h-56' :
                          'h-36 md:h-48'
                        }`} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Side: Timeline and Prizes Panel */}
                <div className="lg:col-span-5 w-full bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-brand-cyan to-[#5BCB2B] opacity-80" />
                  
                  <div className="space-y-8 mt-2">
                    {event.timeline && event.timeline.length > 0 && (
                      <div>
                        <h4 className="font-bold text-slate-400 uppercase text-xs tracking-widest mb-4 flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-brand-cyan" /> Key Dates
                        </h4>
                        <ul className="space-y-4 border-l-2 border-[#5BCB2B]/30 ml-2 pl-4">
                          {event.timeline.map((step, sIdx) => (
                            <li key={sIdx} className="relative">
                              <div className={`absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full ring-2 ${/(open)/i.test(step.label) ? 'bg-[#5BCB2B] border border-white ring-[#5BCB2B]/20' : 'bg-white border-2 border-[#5BCB2B] ring-[#5BCB2B]/10'}`} />
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-600 font-bold whitespace-nowrap mr-2">{step.label}</span>
                                <span className={`font-black text-right border-b border-dashed border-slate-200 uppercase tracking-wide px-1 ${/(open)/i.test(step.label) ? 'text-[#5BCB2B]' : 'text-slate-800'}`}>
                                  {step.date}
                                </span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {event.prizes && event.prizes.length > 0 && (
                      <div>
                        <h4 className="font-bold text-slate-400 uppercase text-xs tracking-widest mb-4 flex items-center gap-2">
                          <Trophy className="w-4 h-4 text-[#5BCB2B]" /> Prize Pool
                        </h4>
                        <div className="space-y-5">
                          {event.prizes.map((prizeGrp, pIdx) => (
                            <div key={pIdx}>
                              {prizeGrp.category !== "Overall" && (
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                                  {prizeGrp.category}
                                </span>
                              )}
                              {prizeGrp.genericText ? (
                                <div className="flex items-center justify-center w-full py-5 bg-[#5BCB2B]/10 rounded-2xl border border-[#5BCB2B]/20 px-3 text-center shadow-inner">
                                  <span className="font-extrabold text-[#5BCB2B] tracking-wide text-lg sm:text-xl uppercase drop-shadow-sm flex items-center justify-center gap-2.5">
                                     <Trophy className="w-5 h-5 text-yellow-500" />
                                     {prizeGrp.genericText}
                                  </span>
                                </div>
                              ) : (
                                <div className="flex flex-row flex-wrap items-center justify-center gap-3 w-full py-4 bg-slate-50/50 rounded-2xl border border-slate-100 px-3">
                                  {(() => {
                                    const first = prizeGrp.rewards.find(r => r.pos === "1st");
                                    if (!first) return null;
                                    return (
                                      <div className="flex flex-col items-center gap-0.5 bg-white px-5 py-2 rounded-xl border border-slate-100 shadow-sm flex-1 min-w-[90px]">
                                        <div className="flex items-center gap-1">
                                          <Crown className="w-5 h-5 text-yellow-500 drop-shadow-sm" />
                                          <span className="font-bold text-slate-500 text-xs whitespace-nowrap">
                                            Winner
                                          </span>
                                        </div>
                                        <span className="font-black text-[#5BCB2B] tracking-wide text-lg mt-0.5">₹{first.val}</span>
                                      </div>
                                    )
                                  })()}
                                  
                                  {(() => {
                                    const second = prizeGrp.rewards.find(r => r.pos === "2nd");
                                    if (!second) return null;
                                    return (
                                      <div className="flex flex-col items-center gap-0.5 bg-white px-5 py-2 rounded-xl border border-slate-100 shadow-sm flex-1 min-w-[90px]">
                                        <div className="flex items-center gap-1">
                                          <Medal className="w-4 h-4 text-slate-400 drop-shadow-sm" />
                                          <span className="font-bold text-slate-500 text-xs whitespace-nowrap">
                                            Runner
                                          </span>
                                        </div>
                                        <span className="font-black text-slate-800 tracking-wide text-lg mt-0.5">₹{second.val}</span>
                                      </div>
                                    );
                                  })()}
                                  
                                  {(() => {
                                    const third = prizeGrp.rewards.find(r => r.pos === "3rd");
                                    if (!third) return null;
                                    return (
                                      <div className="flex flex-col items-center gap-0.5 bg-white px-5 py-2 rounded-xl border border-slate-100 shadow-sm flex-1 min-w-[90px]">
                                        <div className="flex items-center gap-1">
                                          <Award className="w-4 h-4 text-amber-600 drop-shadow-sm" />
                                          <span className="font-bold text-slate-500 text-xs whitespace-nowrap">
                                            Runner Up
                                          </span>
                                        </div>
                                        <span className="font-black text-slate-800 tracking-wide text-lg mt-0.5">₹{third.val}</span>
                                      </div>
                                    );
                                  })()}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </motion.section>
          );
        })}
      </div>
    </PageShell>
  )
}
