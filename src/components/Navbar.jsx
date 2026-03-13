import { useEffect, useRef, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { ChevronDown, Menu, X } from 'lucide-react'

const projectsItems = [
  { label: 'Schedule', to: '/projects/schedule' },
  { label: 'Workshops', to: '/projects/workshops' },
  { label: 'Keynote Speakers', to: '/projects/keynotes' },
  { label: 'Speakers', to: '/projects/speakers' },
  { label: 'Call for Paper', to: '/projects/call-for-paper' },
  { label: 'Student Design Challenge', to: '/projects/student-design-challenge' },
]

const attendItems = [
  { label: 'Register', to: '/attend/register' },
  { label: 'Accommodation', to: '/attend/accommodation' },
  { label: 'Travel Information', to: '/attend/travel-information' },
]

function useOnClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) return
      handler(event)
    }
    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener)
    return () => {
      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }
  }, [ref, handler])
}

function DesktopDropdown({ label, items, open, setOpen }) {
  const wrapRef = useRef(null)
  useOnClickOutside(wrapRef, () => setOpen(false))

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-800 hover:text-slate-950"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {label}
        <ChevronDown className="h-4 w-4" />
      </button>

      {open ? (
        <div className="absolute left-0 top-full z-50 mt-3 w-[260px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
          <div className="py-2">
            {items.map((it) => (
              <Link
                key={it.to}
                to={it.to}
                onClick={() => setOpen(false)}
                className="block px-5 py-3 text-sm font-medium text-slate-900 hover:bg-slate-50"
              >
                {it.label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

const navItemClass = ({ isActive }) =>
  [
    'text-sm font-medium transition',
    isActive ? 'text-brand-cyan' : 'text-slate-800 hover:text-slate-950',
  ].join(' ')

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [projectsOpen, setProjectsOpen] = useState(false)
  const [attendOpen, setAttendOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      if (projectsOpen) setProjectsOpen(false)
      if (attendOpen) setAttendOpen(false)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [projectsOpen, attendOpen])

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <Link to="/" className="inline-flex items-center gap-2">
          <span className="font-display text-lg font-extrabold tracking-[0.18em] text-brand-cyan">
            EMPOWER
          </span>
          <span className="rounded-full bg-brand-lime/15 px-2.5 py-1 text-[11px] font-semibold text-brand-lime">
            2025
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary">
          <NavLink to="/" className={navItemClass} end>
            Home
          </NavLink>
          <NavLink to="/program" className={navItemClass}>
            Program
          </NavLink>
          <DesktopDropdown
            label="Attend"
            items={attendItems}
            open={attendOpen}
            setOpen={(v) => {
              setAttendOpen(v)
              if (v) setProjectsOpen(false)
            }}
          />
          <DesktopDropdown
            label="Projects"
            items={projectsItems}
            open={projectsOpen}
            setOpen={(v) => {
              setProjectsOpen(v)
              if (v) setAttendOpen(false)
            }}
          />
          <NavLink to="/exhibitors" className={navItemClass}>
            Exhibitors
          </NavLink>
          <NavLink to="/sponsors" className={navItemClass}>
            Sponsors
          </NavLink>
          <NavLink to="/about" className={navItemClass}>
            About
          </NavLink>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/attend/register"
            className="hidden rounded-lg bg-[#5BCB2B] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4FB423] focus:outline-none focus:ring-4 focus:ring-[#5BCB2B]/25 md:inline-flex"
          >
            Register
          </Link>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-2 text-slate-900 hover:bg-slate-50 md:hidden"
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="md:hidden">
          <div className="mx-auto max-w-7xl px-4 pb-4 sm:px-6">
            <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
              <div className="grid">
                <NavLink to="/" className="rounded-lg px-3 py-2 text-sm font-medium" end>
                  Home
                </NavLink>
                <NavLink to="/program" className="rounded-lg px-3 py-2 text-sm font-medium">
                  Program
                </NavLink>
                <NavLink to="/about" className="rounded-lg px-3 py-2 text-sm font-medium">
                  About
                </NavLink>
                <NavLink to="/speakers" className="rounded-lg px-3 py-2 text-sm font-medium">
                  Speakers
                </NavLink>
                <NavLink to="/sponsors" className="rounded-lg px-3 py-2 text-sm font-medium">
                  Sponsors
                </NavLink>
                <NavLink to="/exhibitors" className="rounded-lg px-3 py-2 text-sm font-medium">
                  Exhibitors
                </NavLink>

                <div className="my-2 h-px bg-slate-200" />
                <p className="px-3 py-1 text-xs font-semibold tracking-widest text-slate-500">
                  ATTEND
                </p>
                {attendItems.map((it) => (
                  <Link
                    key={it.to}
                    to={it.to}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
                    onClick={() => setMobileOpen(false)}
                  >
                    {it.label}
                  </Link>
                ))}

                <div className="my-2 h-px bg-slate-200" />
                <p className="px-3 py-1 text-xs font-semibold tracking-widest text-slate-500">
                  PROJECTS
                </p>
                {projectsItems.map((it) => (
                  <Link
                    key={it.to}
                    to={it.to}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
                    onClick={() => setMobileOpen(false)}
                  >
                    {it.label}
                  </Link>
                ))}

                <div className="mt-2 px-2">
                  <Link
                    to="/attend/register"
                    className="mt-1 inline-flex w-full items-center justify-center rounded-lg bg-[#5BCB2B] px-4 py-2 text-sm font-semibold text-white hover:bg-[#4FB423] focus:outline-none focus:ring-4 focus:ring-[#5BCB2B]/25"
                    onClick={() => setMobileOpen(false)}
                  >
                    Register
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  )
}

