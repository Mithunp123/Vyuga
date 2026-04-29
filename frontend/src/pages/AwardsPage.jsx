import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Users, Video, Sparkles, Award } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import trophy1 from '../assets/images/tropy1.png';
import trophy2 from '../assets/images/tropy2.png';
import trophy3 from '../assets/images/tropy3.png';

const CYAN = '#0197B2';
const LIME = '#5BCB2B';
const GOLD = '#F59E0B';
const SILVER = '#94A3B8';
const CYAN_LIGHT = '#e0f6fa';
const LIME_LIGHT = '#e8f9de';

/* Animated trophy image */
function TrophyImg({ src, size = 90, delay = 0 }) {
  return (
    <motion.img
      src={src}
      alt="trophy"
      width={size}
      height={size}
      style={{ objectFit: 'contain', filter: `drop-shadow(0 8px 20px ${GOLD}88)` }}
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay }}
    />
  );
}

/* Silver Medal SVG */
function SilverMedal({ size = 52 }) {
  return (
    <motion.div animate={{ rotate: [-5, 5, -5] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      style={{ filter: `drop-shadow(0 4px 10px ${SILVER}66)` }}>
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <defs><linearGradient id="sG2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E2E8F0" /><stop offset="50%" stopColor="#94A3B8" /><stop offset="100%" stopColor="#64748B" />
        </linearGradient></defs>
        <line x1="28" y1="4" x2="22" y2="24" stroke="#94A3B8" strokeWidth="4" strokeLinecap="round" />
        <line x1="36" y1="4" x2="42" y2="24" stroke="#94A3B8" strokeWidth="4" strokeLinecap="round" />
        <circle cx="32" cy="40" r="18" fill="url(#sG2)" />
        <motion.circle cx="32" cy="40" r="11" fill="white" opacity="0.15" animate={{ r: [10, 13, 10] }} transition={{ duration: 2, repeat: Infinity }} />
        <text x="32" y="46" textAnchor="middle" fontSize="15" fontWeight="bold" fill="white" fontFamily="sans-serif">2</text>
      </svg>
    </motion.div>
  );
}

/* Heart / People's Favorite */
function FavHeart({ size = 46, color = CYAN }) {
  return (
    <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.8, repeat: Infinity }}>
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <path d="M32 54C32 54 8 38 8 22C8 14 14 8 22 10C26 11 30 14 32 18C34 14 38 11 42 10C50 8 56 14 56 22C56 38 32 54 32 54Z" fill={color} />
        <path d="M22 24 Q28 18 34 24" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
      </svg>
    </motion.div>
  );
}

/* Spinning star for Jury */
function SpinningStar({ size = 52 }) {
  return (
    <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}>
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <defs><linearGradient id="starG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FCD34D" /><stop offset="100%" stopColor="#D97706" />
        </linearGradient></defs>
        <path d="M32 4l5.6 17.2H56l-14.8 10.7 5.6 17.2L32 39.5 17.2 49.1l5.6-17.2L8 21.2h18.4z" fill="url(#starG)" />
      </svg>
    </motion.div>
  );
}

/* Podium 2 slots: runner-up left, winner center */
function Podium2({ winner, runnerUp }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 16, paddingTop: 8 }}>
      {/* Runner-up */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, width: 160 }}>
        <TrophyImg src={trophy2} size={70} delay={0.2} />
        <div style={{ width: '100%', padding: '10px', borderRadius: '12px 12px 0 0', background: `${SILVER}14`, border: `1.5px solid ${SILVER}44`, textAlign: 'center', minHeight: 80, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
          <span style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: SILVER }}>Runner-up</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#334155', lineHeight: 1.3 }}>{runnerUp}</span>
        </div>
        <div style={{ width: '100%', height: 28, background: `${SILVER}33`, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 15, fontWeight: 900, color: SILVER }}>2</span>
        </div>
      </div>

      {/* Winner */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, width: 190 }}>
        <TrophyImg src={trophy1} size={90} delay={0} />
        <div style={{ width: '100%', padding: '14px 10px', borderRadius: '12px 12px 0 0', background: `${GOLD}18`, border: `2px solid ${GOLD}55`, textAlign: 'center', minHeight: 110, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: `0 -6px 24px ${GOLD}22` }}>
          <div style={{ padding: '3px 14px', borderRadius: 999, background: GOLD }}>
            <span style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#fff' }}>Winner</span>
          </div>
          <span style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', lineHeight: 1.3 }}>{winner}</span>
        </div>
        <div style={{ width: '100%', height: 48, background: `linear-gradient(to bottom, ${GOLD}, #b45309)`, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 14px ${GOLD}44` }}>
          <span style={{ fontSize: 22, fontWeight: 900, color: '#fff' }}>1</span>
        </div>
      </div>
    </div>
  );
}

/* Podium 3 slots: runner-up left, winner center, favorite right */
function Podium3({ winner, runnerUp, favorite, accent }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 14, paddingTop: 8 }}>
      {/* Runner-up */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, width: 155 }}>
        <TrophyImg src={trophy2} size={64} delay={0.2} />
        <div style={{ width: '100%', padding: '10px', borderRadius: '12px 12px 0 0', background: `${SILVER}14`, border: `1.5px solid ${SILVER}44`, textAlign: 'center', minHeight: 76, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
          <span style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: SILVER }}>Runner-up</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#334155', lineHeight: 1.3 }}>{runnerUp}</span>
        </div>
        <div style={{ width: '100%', height: 26, background: `${SILVER}33`, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 14, fontWeight: 900, color: SILVER }}>2</span>
        </div>
      </div>

      {/* Winner */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, width: 186 }}>
        <TrophyImg src={trophy1} size={88} delay={0} />
        <div style={{ width: '100%', padding: '12px 10px', borderRadius: '12px 12px 0 0', background: `${GOLD}18`, border: `2px solid ${GOLD}55`, textAlign: 'center', minHeight: 106, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 7, boxShadow: `0 -6px 20px ${GOLD}22` }}>
          <div style={{ padding: '3px 12px', borderRadius: 999, background: GOLD }}>
            <span style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#fff' }}>Winner</span>
          </div>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', lineHeight: 1.3 }}>{winner}</span>
        </div>
        <div style={{ width: '100%', height: 44, background: `linear-gradient(to bottom, ${GOLD}, #b45309)`, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 14px ${GOLD}44` }}>
          <span style={{ fontSize: 20, fontWeight: 900, color: '#fff' }}>1</span>
        </div>
      </div>

      {/* Favorite */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, width: 155 }}>
        <TrophyImg src={trophy3} size={58} delay={0.4} />
        <div style={{ width: '100%', padding: '10px', borderRadius: '12px 12px 0 0', background: `${accent}14`, border: `1.5px solid ${accent}44`, textAlign: 'center', minHeight: 58, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
          <span style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: accent }}>People's Favorite</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#334155', lineHeight: 1.3 }}>{favorite}</span>
        </div>
        <div style={{ width: '100%', height: 14, background: `${accent}33`, borderRadius: 5 }} />
      </div>
    </div>
  );
}

/* Section header */
function SectionHeader({ label, sublabel, icon, accent }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
      <div style={{ width: 42, height: 42, borderRadius: 14, background: `${accent}15`, border: `1.5px solid ${accent}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icon}</div>
      <div>
        <p style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>{label}</p>
        {sublabel && <p style={{ fontSize: 10, color: accent, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', margin: '2px 0 0' }}>{sublabel}</p>}
      </div>
    </div>
  );
}

/* Card wrapper */
function AwardCard({ accent, children, style = {} }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.55 }}
      style={{ background: '#fff', borderRadius: 24, border: `1.5px solid ${accent}30`, boxShadow: `0 6px 32px ${accent}14`, padding: '26px 24px', ...style }}
    >
      {children}
    </motion.div>
  );
}

/* Divider label */
function Divider({ label, accent }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '32px 0 20px' }}>
      <div style={{ height: 2, flex: 1, background: `linear-gradient(90deg, transparent, ${accent})`, borderRadius: 999 }} />
      <span style={{ fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.22em', color: accent, whiteSpace: 'nowrap' }}>{label}</span>
      <div style={{ height: 2, flex: 1, background: `linear-gradient(90deg, ${accent}, transparent)`, borderRadius: 999 }} />
    </div>
  );
}

export default function AwardsPage() {
  return (
    <div style={{ background: '#ffffff', minHeight: '100vh' }}>
      <Navbar />

      <div style={{ paddingTop: 80, maxWidth: 1160, margin: '0 auto', padding: '80px 20px 48px' }}>

        {/* Page title */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 16px', borderRadius: 999, background: `${CYAN}15`, border: `1px solid ${CYAN}44`, color: CYAN, fontSize: 10, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 12 }}>
            <Sparkles size={10} /> Vyuga 2026
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 900, margin: '0 0 8px' }}>
            <span style={{ background: `linear-gradient(90deg, ${CYAN}, ${LIME})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              National Ability Awards
            </span>
          </h1>
          <div style={{ height: 4, width: 72, background: `linear-gradient(90deg,${CYAN},${LIME})`, borderRadius: 999, margin: '0 auto 10px' }} />
          <p style={{ color: '#64748b', fontSize: 14, margin: '0 0 20px', fontWeight: 500 }}>Celebrating inclusivity, innovation & outstanding talent</p>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            style={{ 
              padding: '16px 32px', 
              borderRadius: 20, 
              background: `linear-gradient(135deg, ${CYAN}0a 0%, ${LIME}0a 100%)`, 
              border: `1.5px dashed ${CYAN}33`,
              display: 'inline-block',
              maxWidth: '600px'
            }}
          >
            <p style={{ color: '#0f172a', fontSize: 18, fontWeight: 800, margin: '0 0 6px' }}>Attractive Cash Prizes, Gifts & Trophies</p>
            <p style={{ color: '#475569', fontSize: 14, margin: 0, fontWeight: 500, lineHeight: 1.5 }}>
              Participate and stand a chance to win amazing rewards across all events at VYUGA!
            </p>
          </motion.div>
        </motion.div>

        {/* ── INNOVATION FEST ── */}
        <Divider label="Inclusive Innovation Fest" accent={CYAN} />

        {/* 3-column: By | Jury | For */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 18, alignItems: 'start' }}>

          {/* By S.A — LEFT */}
          <AwardCard accent={LIME}>
            <SectionHeader label="By Specially Abled" sublabel="Innovation Category" icon={<Lightbulb size={20} color={LIME} />} accent={LIME} />
            <Podium2 winner="Ability Innovation Champion" runnerUp="Emerging Ability Innovator" />
          </AwardCard>

          {/* Jury Special Mention — CENTER */}
          <AwardCard accent={GOLD} style={{ minWidth: 220, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '28px 20px' }}>
            <SpinningStar size={72} />
            <p style={{ fontSize: 11, fontWeight: 800, color: GOLD, textTransform: 'uppercase', letterSpacing: '0.16em', margin: '8px 0 4px' }}>Jury Special Mention</p>
            <p style={{ fontSize: 10, color: '#64748b', margin: '0 0 14px', fontWeight: 600, lineHeight: 1.5 }}>Best Performance Award<br />on Innovation Fest</p>
            <div style={{ padding: '12px 16px', borderRadius: 14, background: `${GOLD}14`, border: `1.5px solid ${GOLD}44`, width: '100%' }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>Jury Special Mention Award</span>
            </div>
            <div style={{ marginTop: 12, padding: '5px 16px', borderRadius: 999, background: `linear-gradient(90deg,${GOLD},#b45309)`, boxShadow: `0 3px 12px ${GOLD}44` }}>
              <span style={{ fontSize: 9, fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Special Award</span>
            </div>
          </AwardCard>

          {/* For S.A — RIGHT */}
          <AwardCard accent={CYAN}>
            <SectionHeader label="For Specially Abled" sublabel="Innovation Category" icon={<Lightbulb size={20} color={CYAN} />} accent={CYAN} />
            <Podium2 winner="Impact Innovator Icon" runnerUp="Emerging Inclusive Innovator" />
          </AwardCard>
        </div>

        {/* ── SPECIAL TALENT HUNT ── */}
        <Divider label="Special Talent Hunt" accent={LIME} />
        <AwardCard accent={LIME}>
          <SectionHeader label="Special Talent Hunt" sublabel="Ability Showcase" icon={<Users size={20} color={LIME} />} accent={LIME} />
          <Podium3 winner="Shining Ability Icon" runnerUp="Rising Ability Performer" favorite="People's Favorite" accent={LIME} />
        </AwardCard>

        {/* ── SHORT FILM CONTEST ── */}
        <Divider label="Short Film Contest — Inclusivity Theme" accent={CYAN} />
        <AwardCard accent={CYAN}>
          <SectionHeader label="Short Film Contest" sublabel="Inclusivity Theme" icon={<Video size={20} color={CYAN} />} accent={CYAN} />
          <Podium3 winner="Best Director — Inclusion Lens" runnerUp="Impact Story Award" favorite="People's Favorite" accent={CYAN} />
        </AwardCard>

        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#cbd5e1', margin: 0 }}>
            Vyuga 2026 • Ability Beyond Limits
          </p>
        </div>
      </div>
    </div>
  );
}
