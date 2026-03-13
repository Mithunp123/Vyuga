import { useEffect, useRef, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { ChevronDown, Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

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
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 transition-colors hover:text-brand-cyan"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {label}
        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 top-full z-50 mt-3 w-[260px] overflow-hidden rounded-2xl border border-brand-cyan/10 bg-white/80 shadow-2xl shadow-brand-cyan/10 backdrop-blur-xl"
          >
            <div className="py-2">
              {items.map((it) => (
                <Link
                  key={it.to}
                  to={it.to}
                  onClick={() => setOpen(false)}
                  className="group flex items-center gap-3 px-5 py-3 text-sm font-medium text-slate-600 transition-all hover:bg-brand-cyan/5 hover:text-brand-cyan"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-cyan/40 transition-all group-hover:bg-brand-cyan group-hover:scale-125" />
                  {it.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const navItemClass = ({ isActive }) =>
  [
    'text-sm font-semibold transition-all duration-300 relative py-1',
    isActive
      ? 'text-brand-cyan'
      : 'text-slate-600 hover:text-brand-cyan',
    isActive
      ? 'after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:rounded-full after:bg-gradient-to-r after:from-brand-cyan after:to-brand-lime'
      : '',
  ].join(' ')

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [projectsOpen, setProjectsOpen] = useState(false)
  const [attendOpen, setAttendOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 50)
      if (projectsOpen) setProjectsOpen(false)
      if (attendOpen) setAttendOpen(false)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [projectsOpen, attendOpen])

  return (
    <header
      className={[
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        scrolled
          ? 'glass shadow-lg shadow-brand-cyan/5'
          : 'bg-transparent',
      ].join(' ')}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <Link to="/" className="group inline-flex items-center gap-2.5">
          <span className="font-hero text-xl font-extrabold tracking-[0.18em] text-brand-cyan transition-all group-hover:tracking-[0.22em]">
            EMPOWER
          </span>
          <span className="rounded-full bg-gradient-to-r from-brand-lime/20 to-brand-lime/10 px-2.5 py-1 font-impact text-sm tracking-widest text-brand-lime ring-1 ring-brand-lime/20 transition-all group-hover:shadow-md group-hover:shadow-brand-lime/10">
            2025
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary">
          <NavLink to="/" className={navItemClass} end>Home</NavLink>
          <NavLink to="/program" className={navItemClass}>Program</NavLink>
          <DesktopDropdown
            label="Attend"
            items={attendItems}
            open={attendOpen}
            setOpen={(v) => { setAttendOpen(v); if (v) setProjectsOpen(false) }}
          />
          <DesktopDropdown
            label="Projects"
            items={projectsItems}
            open={projectsOpen}
            setOpen={(v) => { setProjectsOpen(v); if (v) setAttendOpen(false) }}
          />
          <NavLink to="/exhibitors" className={navItemClass}>Exhibitors</NavLink>
          <NavLink to="/sponsors" className={navItemClass}>Sponsors</NavLink>
          <NavLink to="/about" className={navItemClass}>About</NavLink>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/attend/register"
            className="hidden items-center justify-center overflow-hidden rounded-full px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand-cyan/15 transition-all hover:shadow-brand-cyan/25 hover:scale-[1.04] focus:outline-none focus:ring-4 focus:ring-brand-cyan/15 md:inline-flex shimmer-btn"
          >
            Register Now
          </Link>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-xl border border-brand-cyan/15 bg-white/60 p-2.5 text-slate-700 backdrop-blur transition-all hover:bg-white hover:shadow-md md:hidden"
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden md:hidden"
          >
            <div className="mx-auto max-w-7xl px-4 pb-4 sm:px-6">
              <div className="rounded-2xl border border-brand-cyan/10 bg-white/80 p-3 shadow-2xl shadow-brand-cyan/5 backdrop-blur-xl">
                <div className="grid gap-0.5">
                  {[
                    { to: '/', label: 'Home', end: true },
                    { to: '/program', label: 'Program' },
                    { to: '/about', label: 'About' },
                    { to: '/speakers', label: 'Speakers' },
                    { to: '/sponsors', label: 'Sponsors' },
                    { to: '/exhibitors', label: 'Exhibitors' },
                  ].map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-brand-cyan/5 hover:text-brand-cyan"
                      onClick={() => setMobileOpen(false)}
                    >
                      {item.label}
                    </NavLink>
                  ))}

                  <div className="my-2 h-px bg-gradient-to-r from-transparent via-brand-cyan/15 to-transparent" />
                  <p className="px-4 py-1 text-[10px] font-bold tracking-[0.2em] text-brand-cyan">ATTEND</p>
                  {attendItems.map((it) => (
                    <Link key={it.to} to={it.to} className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-500 hover:bg-brand-cyan/5 hover:text-brand-cyan" onClick={() => setMobileOpen(false)}>{it.label}</Link>
                  ))}

                  <div className="my-2 h-px bg-gradient-to-r from-transparent via-brand-lime/15 to-transparent" />
                  <p className="px-4 py-1 text-[10px] font-bold tracking-[0.2em] text-brand-lime">PROJECTS</p>
                  {projectsItems.map((it) => (
                    <Link key={it.to} to={it.to} className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-500 hover:bg-brand-lime/5 hover:text-brand-lime" onClick={() => setMobileOpen(false)}>{it.label}</Link>
                  ))}

                  <div className="mt-3 px-1">
                    <Link to="/attend/register" className="inline-flex w-full items-center justify-center overflow-hidden rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand-cyan/15 shimmer-btn" onClick={() => setMobileOpen(false)}>
                      Register Now
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

