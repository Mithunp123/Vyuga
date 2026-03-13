import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { navLinks } from '../data/homeData.js'
import { Clock, Mail, MapPin, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'

function SocialIcon({ label, href, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex h-10 w-10 items-center justify-center border-b border-white/10 text-white/40 transition-all hover:text-brand-cyan hover:border-brand-cyan/30 hover:-translate-y-0.5"
      aria-label={label}
    >
      {children}
    </a>
  )
}

/* Scroll-driven text color: dim → white */
function ScrollWhiteText({ children, className = '', as = 'span' }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'center center'] })
  const color = useTransform(scrollYProgress, [0, 0.8], ['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.9)'])
  const Tag = motion[as] || motion.span
  return (
    <Tag ref={ref} style={{ color }} className={className}>
      {children}
    </Tag>
  )
}

export default function Footer() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start center'] })
  const watermarkOpacity = useTransform(scrollYProgress, [0, 0.8], [0.03, 0.25])
  const watermarkY = useTransform(scrollYProgress, [0, 0.8], [40, 0])
  const textOpacity = useTransform(scrollYProgress, [0, 0.4], [0.35, 1])

  return (
    <footer ref={ref} className="relative bg-slate-950 text-white overflow-hidden">
      <div className="absolute inset-0 dot-grid opacity-10" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 h-96 w-[800px] rounded-full bg-brand-cyan/5 blur-[150px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 pt-24 pb-10 sm:px-6">
        {/* Giant watermark — scroll-reveal white text */}
        <motion.div style={{ opacity: watermarkOpacity, y: watermarkY }} className="mb-16 overflow-hidden">
          <span className="block font-impact text-[14vw] leading-[0.85] tracking-[0.12em] text-white select-none sm:text-[9vw]">
            VYUGA
          </span>
        </motion.div>

        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="flex items-baseline gap-3">
              <span className="font-hero text-xl font-extrabold tracking-[0.15em] text-glow-cyan">
                VYUGA
              </span>
              <span className="font-marker text-lg text-brand-lime">2026</span>
            </div>
            <motion.p style={{ opacity: textOpacity }} className="mt-5 max-w-md font-serif text-sm italic leading-relaxed text-white">
              A global conference dedicated to accessibility in design, tech, and
              innovation. Learn from industry leaders and participate in hands-on workshops.
            </motion.p>

            <motion.div style={{ opacity: textOpacity }} className="mt-7 space-y-3 text-sm text-white">
              {[
                { Icon: Clock, text: '10 am – 5 pm (Monday to Friday)' },
                { Icon: Phone, text: '+91 98710 93651' },
                { Icon: Mail, text: 'info@vyuga.in' },
                { Icon: MapPin, text: 'Assistive Tech Lab, IIT Delhi' },
              ].map(({ Icon, text }) => (
                <p key={text} className="flex items-center gap-3">
                  <Icon className="h-4 w-4 text-brand-cyan/60" />
                  {text}
                </p>
              ))}
            </motion.div>

            <div className="mt-7 flex items-center gap-4">
              <SocialIcon label="LinkedIn" href="https://www.linkedin.com/">
                <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                  <path fill="currentColor" d="M20.447 20.452h-3.554v-5.569c0-1.328-.026-3.036-1.852-3.036-1.853 0-2.136 1.445-2.136 2.939v5.666H9.35V9h3.414v1.561h.046c.477-.9 1.637-1.852 3.37-1.852 3.601 0 4.267 2.37 4.267 5.455v6.288zM5.337 7.433A2.062 2.062 0 0 1 3.27 5.37a2.065 2.065 0 1 1 4.13 0c0 1.138-.924 2.063-2.063 2.063zM6.812 20.452H3.862V9h2.95v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.727v20.545C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.273V1.727C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </SocialIcon>
              <SocialIcon label="Instagram" href="https://www.instagram.com/">
                <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                  <path fill="currentColor" d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9A5.5 5.5 0 0 1 16.5 22h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm9 2h-9A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm6.2-.9a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0Z" />
                </svg>
              </SocialIcon>
              <SocialIcon label="X" href="https://x.com/">
                <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                  <path fill="currentColor" d="M18.9 2H22l-6.78 7.75L23 22h-6.78l-5.31-6.92L4.8 22H2l7.35-8.4L1 2h6.92l4.8 6.3L18.9 2Zm-1.2 18h1.68L7.1 3.9H5.3L17.7 20Z" />
                </svg>
              </SocialIcon>
            </div>
          </div>

          <div className="grid gap-10 sm:grid-cols-2 lg:col-span-3 lg:block">
            <div>
              <p className="font-marker text-xs text-brand-cyan">Quick links</p>
              <ul className="mt-5 grid gap-3">
                {navLinks.map((l) => (
                  <li key={l.to}>
                    <ScrollWhiteText className="text-sm transition hover:text-brand-cyan">
                      <Link to={l.to}>{l.label}</Link>
                    </ScrollWhiteText>
                  </li>
                ))}
                <li>
                  <ScrollWhiteText className="text-sm transition hover:text-brand-cyan">
                    <a href="/#highlights">Highlights</a>
                  </ScrollWhiteText>
                </li>
              </ul>
            </div>

            <div className="lg:mt-10">
              <p className="font-marker text-xs text-brand-lime">Policies</p>
              <ul className="mt-5 grid gap-3">
                <li><ScrollWhiteText className="text-sm">Cancellation & Refund</ScrollWhiteText></li>
                <li><ScrollWhiteText className="text-sm">Privacy Policy</ScrollWhiteText></li>
                <li><ScrollWhiteText className="text-sm">Terms & Conditions</ScrollWhiteText></li>
              </ul>
            </div>
          </div>

          <div className="lg:col-span-4">
            <p className="font-marker text-xs text-brand-cyan">Venue directions</p>
            <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
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

        <motion.div style={{ opacity: textOpacity }} className="mt-14 flex flex-col gap-3 border-t border-white/5 pt-7 text-xs text-white sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono tracking-wider">Copyright · All rights reserved · Vyuga 2026</p>
          <p className="font-serif italic">Assistive Tech Lab, IIT Delhi</p>
        </motion.div>
      </div>
    </footer>
  )
}

