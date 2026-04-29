import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Users, Video, Sparkles, Award } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';

const CYAN = '#0197B2';
const LIME = '#5BCB2B';

/* Award list item */
function AwardItem({ name, accent }) {
  return (
    <motion.div 
      whileHover={{ x: 4, background: `${accent}0d` }}
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 12, 
        padding: '14px 18px', 
        borderRadius: 16, 
        background: `${accent}08`, 
        border: `1.2px solid ${accent}15`,
        marginBottom: 12,
        boxShadow: `0 2px 8px ${accent}05`
      }}
    >
      <div style={{ 
        width: 32, 
        height: 32, 
        borderRadius: 10, 
        background: `${accent}15`, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: accent,
        flexShrink: 0
      }}>
        <Award size={18} strokeWidth={2.5} />
      </div>
      <span style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', letterSpacing: '-0.01em' }}>{name}</span>
    </motion.div>
  );
}

/* Spinning star for Jury */
function SpinningStar({ size = 52 }) {
  return (
    <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}>
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <defs><linearGradient id="starG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={CYAN} /><stop offset="100%" stopColor={LIME} />
        </linearGradient></defs>
        <path d="M32 4l5.6 17.2H56l-14.8 10.7 5.6 17.2L32 39.5 17.2 49.1l5.6-17.2L8 21.2h18.4z" fill="url(#starG)" />
      </svg>
    </motion.div>
  );
}

/* Section header */
function SectionHeader({ label, sublabel, icon, accent }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
      <div style={{ width: 44, height: 44, borderRadius: 14, background: `${accent}15`, border: `1.5px solid ${accent}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icon}</div>
      <div>
        <p style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', margin: 0 }}>{label}</p>
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
      style={{ background: '#fff', borderRadius: 24, border: `1.5px solid ${accent}25`, boxShadow: `0 8px 30px ${accent}0a`, padding: '28px 24px', ...style }}
    >
      {children}
    </motion.div>
  );
}

/* Divider label */
function Divider({ label, accent }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '48px 0 24px' }}>
      <div style={{ height: 2, flex: 1, background: `linear-gradient(90deg, transparent, ${accent})`, borderRadius: 999 }} />
      <span style={{ fontSize: 12, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.22em', color: accent, whiteSpace: 'nowrap' }}>{label}</span>
      <div style={{ height: 2, flex: 1, background: `linear-gradient(90deg, ${accent}, transparent)`, borderRadius: 999 }} />
    </div>
  );
}

export default function AwardsPage() {
  return (
    <div style={{ background: '#ffffff', minHeight: '100vh' }}>
      <Navbar />

      <div style={{ paddingTop: 80, maxWidth: 1100, margin: '0 auto', padding: '80px 20px 60px' }}>

        {/* Page title */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: 50 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 18px', borderRadius: 999, background: `${CYAN}12`, border: `1px solid ${CYAN}33`, color: CYAN, fontSize: 11, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 16 }}>
            <Sparkles size={11} /> Vyuga 2026
          </div>
          <h1 style={{ fontSize: 42, fontWeight: 900, margin: '0 0 10px', letterSpacing: '-0.02em' }}>
            <span style={{ background: `linear-gradient(90deg, ${CYAN}, ${LIME})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              National Ability Awards
            </span>
          </h1>
          <div style={{ height: 5, width: 80, background: `linear-gradient(90deg,${CYAN},${LIME})`, borderRadius: 999, margin: '0 auto 12px' }} />
          <p style={{ color: '#64748b', fontSize: 16, margin: '0 0 24px', fontWeight: 500 }}>Celebrating inclusivity, innovation & outstanding talent</p>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            style={{ 
              padding: '20px 40px', 
              borderRadius: 24, 
              background: `linear-gradient(135deg, ${CYAN}08 0%, ${LIME}08 100%)`, 
              border: `1.5px dashed ${CYAN}33`,
              display: 'inline-block',
              maxWidth: '650px'
            }}
          >
            <p style={{ color: '#0f172a', fontSize: 20, fontWeight: 800, margin: '0 0 6px' }}>Attractive Cash Prizes, Gifts & Trophies</p>
            <p style={{ color: '#475569', fontSize: 15, margin: 0, fontWeight: 500, lineHeight: 1.6 }}>
              Participate and stand a chance to win amazing rewards across all events at VYUGA!
            </p>
          </motion.div>
        </motion.div>

        {/* ── INNOVATION FEST ── */}
        <Divider label="Inclusive Innovation Fest" accent={CYAN} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 24, alignItems: 'stretch' }}>

          {/* By S.A — LEFT */}
          <AwardCard accent={LIME}>
            <SectionHeader label="By Specially Abled" sublabel="Innovation Category" icon={<Lightbulb size={22} color={LIME} />} accent={LIME} />
            <AwardItem name="Ability Innovation Champion" accent={LIME} />
            <AwardItem name="Emerging Ability Innovator" accent={LIME} />
          </AwardCard>

          {/* Jury Special Mention — CENTER */}
          <AwardCard accent={CYAN} style={{ width: 260, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '32px 24px' }}>
            <SpinningStar size={80} />
            <p style={{ fontSize: 12, fontWeight: 800, color: CYAN, textTransform: 'uppercase', letterSpacing: '0.16em', margin: '12px 0 6px' }}>Jury Special Mention</p>
            <p style={{ fontSize: 11, color: '#64748b', margin: '0 0 18px', fontWeight: 600, lineHeight: 1.5 }}>Promising Future Innovation Award<br />on Innovation Fest</p>
            <div style={{ padding: '14px 18px', borderRadius: 16, background: `${CYAN}12`, border: `1.5px solid ${CYAN}33`, width: '100%' }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>Jury Special Mention Award</span>
            </div>
            <div style={{ marginTop: 16, padding: '6px 20px', borderRadius: 999, background: `linear-gradient(90deg, ${CYAN}, ${LIME})`, boxShadow: `0 4px 14px ${CYAN}33` }}>
              <span style={{ fontSize: 10, fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Special Award</span>
            </div>
          </AwardCard>

          {/* For S.A — RIGHT */}
          <AwardCard accent={CYAN}>
            <SectionHeader label="For Specially Abled" sublabel="Innovation Category" icon={<Lightbulb size={22} color={CYAN} />} accent={CYAN} />
            <AwardItem name="Impact Innovator Icon" accent={CYAN} />
            <AwardItem name="Emerging Inclusive Innovator" accent={CYAN} />
          </AwardCard>
        </div>

        {/* ── SPECIAL TALENT HUNT ── */}
        <Divider label="Special Talent Hunt" accent={LIME} />
        <AwardCard accent={LIME} style={{ maxWidth: 800, margin: '0 auto' }}>
          <SectionHeader label="Special Talent Hunt" sublabel="Ability Showcase" icon={<Users size={22} color={LIME} />} accent={LIME} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <AwardItem name="Shining Ability Icon" accent={LIME} />
              <AwardItem name="Rising Ability Performer" accent={LIME} />
            </div>
            <div>
              <AwardItem name="People's Favorite" accent={LIME} />
              <AwardItem name="Most Creative Talent" accent={LIME} />
            </div>
          </div>
        </AwardCard>

        {/* ── SHORT FILM CONTEST ── */}
        <Divider label="Short Film Contest — Inclusivity Theme" accent={CYAN} />
        <AwardCard accent={CYAN} style={{ maxWidth: 800, margin: '0 auto' }}>
          <SectionHeader label="Short Film Contest" sublabel="Inclusivity Theme" icon={<Video size={22} color={CYAN} />} accent={CYAN} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <AwardItem name="Best Director — Inclusion Lens" accent={CYAN} />
              <AwardItem name="Impact Story Award" accent={CYAN} />
            </div>
            <div>
              <AwardItem name="People's Favorite" accent={CYAN} />
              <AwardItem name="Best Visual Storytelling" accent={CYAN} />
            </div>
          </div>
        </AwardCard>

        <div style={{ textAlign: 'center', marginTop: 60 }}>
          <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#94a3b8', margin: 0 }}>
            Vyuga 2026 • Ability Beyond Limits
          </p>
        </div>
      </div>
    </div>
  );
}
