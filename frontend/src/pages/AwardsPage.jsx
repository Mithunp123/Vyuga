import React from 'react';
import { motion } from 'framer-motion';
import { 
  Lightbulb, Users, Video, Sparkles, Award, Trophy, 
  Medal, Star, Crown, Target, Heart, Palette, 
  Clapperboard, BookOpen, Eye, TrendingUp, ShieldCheck,
  Zap, Rocket, Gift, Gem, Flame, Ghost
} from 'lucide-react';
import Navbar from '../components/Navbar.jsx';

// Import high-quality trophy assets
import tropy1 from '../assets/images/tropy1.png';
import tropy2 from '../assets/images/tropy2.png';
import tropy3 from '../assets/images/tropy3.png';

const CYAN = '#0197B2';
const LIME = '#5BCB2B';

/* Award list item - Vertical Badge Style */
function AwardItem({ name, accent, icon: Icon = Award, imgSrc, delay = 0 }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      whileHover={{ y: -5, background: `${accent}08`, borderColor: `${accent}44` }}
      style={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        textAlign: 'center',
        gap: 12, 
        padding: '24px 16px', 
        borderRadius: 24, 
        background: '#fff', 
        border: `1.5px solid ${accent}15`,
        position: 'relative',
        boxShadow: `0 8px 24px ${accent}08`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        minHeight: 140,
        justifyContent: 'center'
      }}
    >
      {/* Decorative background shape */}
      <div style={{ 
        position: 'absolute', 
        top: -10, 
        right: -10, 
        width: 40, 
        height: 40, 
        borderRadius: '50%', 
        background: `${accent}0a`, 
        zIndex: 0 
      }} />

      <div style={{ 
        width: 56, 
        height: 56, 
        borderRadius: 18, 
        background: `linear-gradient(135deg, ${accent}15 0%, ${accent}08 100%)`, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: accent,
        flexShrink: 0,
        boxShadow: `0 6px 16px ${accent}15`,
        zIndex: 1
      }}>
        {imgSrc ? (
          <motion.img 
            src={imgSrc} 
            alt="trophy" 
            style={{ width: 38, height: 38, objectFit: 'contain', filter: `drop-shadow(0 4px 6px ${accent}44)` }} 
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        ) : (
          <Icon size={28} strokeWidth={2.2} />
        )}
      </div>
      <span style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', lineHeight: 1.3, zIndex: 1 }}>{name}</span>
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
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28, justifyContent: 'center' }}>
      <div style={{ width: 52, height: 52, borderRadius: 18, background: `${accent}15`, border: `1.5px solid ${accent}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 6px 16px ${accent}15` }}>{icon}</div>
      <div style={{ textAlign: 'left' }}>
        <p style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.01em' }}>{label}</p>
        {sublabel && <p style={{ fontSize: 10, color: accent, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.16em', margin: '3px 0 0' }}>{sublabel}</p>}
      </div>
    </div>
  );
}

/* Card wrapper */
function AwardCard({ accent, children, style = {} }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.55 }}
      style={{ background: `linear-gradient(180deg, #fff 0%, ${accent}03 100%)`, borderRadius: 32, border: `1.5px solid ${accent}15`, boxShadow: `0 16px 48px ${accent}0a`, padding: '40px 32px', ...style }}
    >
      {children}
    </motion.div>
  );
}

/* Divider label */
function Divider({ label, accent }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '60px 0 32px' }}>
      <div style={{ height: 2, flex: 1, background: `linear-gradient(90deg, transparent, ${accent})`, borderRadius: 999, opacity: 0.4 }} />
      <span style={{ fontSize: 13, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.28em', color: accent, whiteSpace: 'nowrap' }}>{label}</span>
      <div style={{ height: 2, flex: 1, background: `linear-gradient(90deg, ${accent}, transparent)`, borderRadius: 999, opacity: 0.4 }} />
    </div>
  );
}

export default function AwardsPage() {
  return (
    <div style={{ background: '#ffffff', minHeight: '100vh' }}>
      <Navbar />

      <div style={{ paddingTop: 80, maxWidth: 1200, margin: '0 auto', padding: '80px 20px 100px' }}>

        {/* Page title */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: 70 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 22px', borderRadius: 999, background: `${CYAN}12`, border: `1px solid ${CYAN}33`, color: CYAN, fontSize: 12, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 18 }}>
            <Sparkles size={12} /> Vyuga 2026
          </div>
          <h1 style={{ fontSize: 52, fontWeight: 900, margin: '0 0 14px', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            <span style={{ background: `linear-gradient(90deg, ${CYAN}, ${LIME})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              National Ability Awards
            </span>
          </h1>
          <div style={{ height: 7, width: 100, background: `linear-gradient(90deg,${CYAN},${LIME})`, borderRadius: 999, margin: '0 auto 20px' }} />
          <p style={{ color: '#64748b', fontSize: 18, margin: '0 0 40px', fontWeight: 500 }}>Celebrating inclusivity, innovation & outstanding talent</p>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            style={{ 
              padding: '28px 56px', 
              borderRadius: 32, 
              background: `linear-gradient(135deg, ${CYAN}0a 0%, ${LIME}0a 100%)`, 
              border: `2px dashed ${CYAN}33`,
              display: 'inline-block',
              maxWidth: '750px',
              boxShadow: `0 12px 40px ${CYAN}0a`
            }}
          >
            <p style={{ color: '#0f172a', fontSize: 24, fontWeight: 800, margin: '0 0 8px' }}>Attractive Recognitions, Gifts & Trophies</p>
            <p style={{ color: '#475569', fontSize: 16, margin: 0, fontWeight: 500, lineHeight: 1.6 }}>
              Participate and stand a chance to win amazing rewards across all events at VYUGA!
            </p>
          </motion.div>
        </motion.div>

        {/* ── INNOVATION FEST ── */}
        <Divider label="Inclusive Innovation Fest" accent={CYAN} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 32, alignItems: 'stretch' }}>

          {/* By S.A — LEFT */}
          <AwardCard accent={LIME}>
            <SectionHeader label="By Specially Abled" sublabel="Innovation Category" icon={<Lightbulb size={26} color={LIME} />} accent={LIME} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <AwardItem name="Ability Innovation Champion" accent={LIME} imgSrc={tropy1} delay={0.1} />
              <AwardItem name="Emerging Ability Innovator" accent={LIME} imgSrc={tropy2} delay={0.2} />
            </div>
          </AwardCard>

          {/* Jury Special Mention — CENTER */}
          <AwardCard accent={CYAN} style={{ width: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '40px 32px' }}>
            <SpinningStar size={90} />
            <p style={{ fontSize: 14, fontWeight: 800, color: CYAN, textTransform: 'uppercase', letterSpacing: '0.18em', margin: '16px 0 10px' }}>Jury Special Mention</p>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 28px', fontWeight: 600, lineHeight: 1.5 }}>Promising Future Innovation Award<br />on Innovation Fest</p>
            <div style={{ padding: '20px 24px', borderRadius: 24, background: `${CYAN}14`, border: `1.5px solid ${CYAN}44`, width: '100%', boxShadow: `0 6px 16px ${CYAN}12` }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>Jury Special Mention Award</span>
            </div>
            <div style={{ marginTop: 24, padding: '10px 28px', borderRadius: 999, background: `linear-gradient(90deg, ${CYAN}, ${LIME})`, boxShadow: `0 8px 24px ${CYAN}44` }}>
              <span style={{ fontSize: 12, fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Special Award</span>
            </div>
          </AwardCard>

          {/* For S.A — RIGHT */}
          <AwardCard accent={CYAN}>
            <SectionHeader label="For Specially Abled" sublabel="Innovation Category" icon={<Lightbulb size={26} color={CYAN} />} accent={CYAN} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <AwardItem name="Impact Innovator Icon" accent={CYAN} imgSrc={tropy1} delay={0.1} />
              <AwardItem name="Emerging Inclusive Innovator" accent={CYAN} imgSrc={tropy2} delay={0.2} />
            </div>
          </AwardCard>
        </div>

        {/* ── SPECIAL TALENT HUNT ── */}
        <Divider label="Special Talent Hunt" accent={LIME} />
        <AwardCard accent={LIME} style={{ maxWidth: 900, margin: '0 auto' }}>
          <SectionHeader label="Special Talent Hunt" sublabel="Ability Showcase" icon={<Users size={26} color={LIME} />} accent={LIME} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 20 }}>
            <AwardItem name="Shining Ability Icon" accent={LIME} imgSrc={tropy1} delay={0.1} />
            <AwardItem name="Rising Ability Performer" accent={LIME} imgSrc={tropy2} delay={0.2} />
            <AwardItem name="People's Favorite" accent={LIME} icon={Heart} delay={0.3} />
            <AwardItem name="Most Creative Talent" accent={LIME} icon={Palette} delay={0.4} />
          </div>
        </AwardCard>

        {/* ── SHORT FILM CONTEST ── */}
        <Divider label="Short Film Contest — Inclusivity Theme" accent={CYAN} />
        <AwardCard accent={CYAN} style={{ maxWidth: 900, margin: '0 auto' }}>
          <SectionHeader label="Short Film Contest" sublabel="Inclusivity Theme" icon={<Video size={26} color={CYAN} />} accent={CYAN} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 20 }}>
            <AwardItem name="Best Director — Inclusion Lens" accent={CYAN} imgSrc={tropy1} delay={0.1} />
            <AwardItem name="Impact Story Award" accent={CYAN} imgSrc={tropy3} delay={0.2} />
            <AwardItem name="People's Favorite" accent={CYAN} icon={Heart} delay={0.3} />
            <AwardItem name="Best Visual Storytelling" accent={CYAN} icon={Eye} delay={0.4} />
          </div>
        </AwardCard>

        <div style={{ textAlign: 'center', marginTop: 100 }}>
          <p style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.45em', textTransform: 'uppercase', color: '#cbd5e1', margin: 0 }}>
            Vyuga 2026 • Ability Beyond Limits
          </p>
        </div>
      </div>
    </div>
  );
}
