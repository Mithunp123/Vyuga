import { navLinks } from '../data/homeData.js'
import { Clock, Mail, MapPin, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'

function SocialIcon({ label, href, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
      aria-label={label}
    >
      {children}
    </a>
  )
}

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="font-display text-lg font-extrabold tracking-[0.18em] text-brand-cyan">
              EMPOWER
            </p>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-600">
              Empower 2025 is a global conference dedicated to accessibility in design, tech, and
              innovation. Learn from industry leaders and participate in hands-on workshops.
            </p>

            <div className="mt-6 grid gap-3 text-sm text-slate-700">
              <p className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand-cyan/10 text-brand-cyan">
                  <Clock className="h-4 w-4" />
                </span>
                10 am – 5 pm (Monday to Friday)
              </p>
              <p className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand-cyan/10 text-brand-cyan">
                  <Phone className="h-4 w-4" />
                </span>
                +91 98710 93651
              </p>
              <p className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand-cyan/10 text-brand-cyan">
                  <Mail className="h-4 w-4" />
                </span>
                info@empowerconference.in
              </p>
              <p className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand-cyan/10 text-brand-cyan">
                  <MapPin className="h-4 w-4" />
                </span>
                Assistive Tech Lab, IIT Delhi
              </p>
            </div>

            <div className="mt-7 flex items-center gap-3">
              <SocialIcon label="LinkedIn" href="https://www.linkedin.com/">
                <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M20.447 20.452h-3.554v-5.569c0-1.328-.026-3.036-1.852-3.036-1.853 0-2.136 1.445-2.136 2.939v5.666H9.35V9h3.414v1.561h.046c.477-.9 1.637-1.852 3.37-1.852 3.601 0 4.267 2.37 4.267 5.455v6.288zM5.337 7.433A2.062 2.062 0 0 1 3.27 5.37a2.065 2.065 0 1 1 4.13 0c0 1.138-.924 2.063-2.063 2.063zM6.812 20.452H3.862V9h2.95v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.727v20.545C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.273V1.727C24 .774 23.2 0 22.222 0h.003z"
                  />
                </svg>
              </SocialIcon>
              <SocialIcon label="Instagram" href="https://www.instagram.com/">
                <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9A5.5 5.5 0 0 1 16.5 22h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm9 2h-9A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm6.2-.9a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0Z"
                  />
                </svg>
              </SocialIcon>
              <SocialIcon label="X" href="https://x.com/">
                <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M18.9 2H22l-6.78 7.75L23 22h-6.78l-5.31-6.92L4.8 22H2l7.35-8.4L1 2h6.92l4.8 6.3L18.9 2Zm-1.2 18h1.68L7.1 3.9H5.3L17.7 20Z"
                  />
                </svg>
              </SocialIcon>
            </div>
          </div>

          <div className="grid gap-10 sm:grid-cols-2 lg:col-span-3 lg:block">
            <div>
              <p className="text-sm font-extrabold tracking-widest text-slate-900">QUICK LINKS</p>
              <ul className="mt-4 grid gap-2">
                {navLinks.map((l) => (
                  <li key={l.to}>
                    <Link
                      to={l.to}
                      className="text-sm font-semibold text-slate-700 transition hover:text-slate-900"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <a
                    href="/#highlights"
                    className="text-sm font-semibold text-slate-700 transition hover:text-slate-900"
                  >
                    Highlights
                  </a>
                </li>
              </ul>
            </div>

            <div className="lg:mt-10">
              <p className="text-sm font-extrabold tracking-widest text-slate-900">POLICIES</p>
              <ul className="mt-4 grid gap-2">
                <li>
                  <a
                    href="#"
                    className="text-sm font-semibold text-slate-700 transition hover:text-slate-900"
                  >
                    Cancellation & Refund
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm font-semibold text-slate-700 transition hover:text-slate-900"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm font-semibold text-slate-700 transition hover:text-slate-900"
                  >
                    Terms & Conditions
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="lg:col-span-4">
            <p className="text-sm font-extrabold tracking-widest text-slate-900">VENUE DIRECTIONS</p>
            <div className="mt-4 overflow-hidden rounded-3xl border border-slate-200 bg-white">
              <iframe
                title="IIT Delhi Map"
                className="h-[280px] w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src="https://www.google.com/maps?q=Indian%20Institute%20of%20Technology%20Delhi&output=embed"
              />
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-slate-200 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>Copyright · All rights reserved · Empower 2025</p>
          <p>Assistive Tech Lab, IIT Delhi</p>
        </div>
      </div>
    </footer>
  )
}

