import React from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, Lightbulb, Users, Video, School
} from 'lucide-react';
import Navbar from '../components/Navbar.jsx';

// Import high-quality trophy assets
import tropy1 from '../assets/images/tropy1.png';
import tropy2 from '../assets/images/tropy2.png';
import tropy3 from '../assets/images/tropy3.png';
import tropy4 from '../assets/images/tropy4.png';
import tropy5 from '../assets/images/tropy5.png';
import tropy6 from '../assets/images/tropy6.png';
import tropy7 from '../assets/images/tropy7.png';
import tropy8 from '../assets/images/tropy8.png';
import shortflim from '../assets/images/shortflim.png';
import child from '../assets/images/child.png';
import hand from '../assets/images/hand.png';
import event from '../assets/images/event.png';
import think from '../assets/images/think.png';

const CYAN = '#0197B2';
const LIME = '#5BCB2B';

/* Award list item - Vertical Badge Style */
function AwardItem({ name, accent, imgSrc, delay = 0 }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      whileHover={{ y: -6, background: `${accent}08`, borderColor: `${accent}44` }}
      style={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        textAlign: 'center',
        gap: 12, 
        padding: '20px 10px', 
        borderRadius: 24, 
        background: '#fff', 
        border: `1.5px solid ${accent}15`,
        position: 'relative',
        boxShadow: `0 8px 24px ${accent}08`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        minHeight: 175,
        justifyContent: 'center',
        width: '100%',
        maxWidth: 280,
        minWidth: 140
      }}
    >
      {/* Decorative background shape */}
      <div style={{ 
        position: 'absolute', 
        top: -6, 
        right: -6, 
        width: 32, 
        height: 32, 
        borderRadius: '50%', 
        background: `${accent}05`, 
        zIndex: 0 
      }} />

      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexShrink: 0,
        zIndex: 1,
        marginBottom: 8,
        minHeight: 100
      }}>
        <motion.img 
          src={imgSrc} 
          alt="award asset" 
          className="award-item-img"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
      <span className="award-item-text">{name}</span>
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
    <div className="awards-header-container">
      <div style={{ width: 48, height: 48, borderRadius: 16, background: `${accent}15`, border: `1.5px solid ${accent}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 4px 12px ${accent}15` }}>{icon}</div>
      <div className="awards-header-text">
        <p style={{ fontSize: 21, fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.01em' }}>{label}</p>
        {sublabel && <p style={{ fontSize: 12, color: accent, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', margin: '2px 0 0' }}>{sublabel}</p>}
      </div>
    </div>
  );
}

/* Card wrapper */
function AwardCard({ accent, children, style = {} }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.1 }} transition={{ duration: 0.6 }}
      className="award-card-responsive"
      style={{ background: `linear-gradient(180deg, #fff 0%, ${accent}02 100%)`, borderRadius: 28, border: `1.5px solid ${accent}15`, boxShadow: `0 16px 48px ${accent}08`, padding: '24px 16px', ...style }}
    >
      {children}
    </motion.div>
  );
}

/* Divider label */
function Divider({ label, accent }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '50px 0 28px' }}>
      <div style={{ height: 2, flex: 1, background: `linear-gradient(90deg, transparent, ${accent})`, borderRadius: 999, opacity: 0.4 }} />
      <span style={{ fontSize: 15, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.25em', color: accent, whiteSpace: 'nowrap' }}>{label}</span>
      <div style={{ height: 2, flex: 1, background: `linear-gradient(90deg, ${accent}, transparent)`, borderRadius: 999, opacity: 0.4 }} />
    </div>
  );
}

export default function AwardsPage() {
  return (
    <div style={{ background: '#ffffff', minHeight: '100vh' }}>
      <Navbar />

      <style>{`
        .awards-grid-innovation {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          align-items: stretch;
        }
        .awards-grid-4col {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          justify-content: center;
          width: 100%;
        }
        .awards-title {
          font-size: 52px;
          font-weight: 900;
          margin: 0 0 14px;
          letter-spacing: -0.03em;
          line-height: 1.1;
        }
        .awards-subtitle {
          color: #64748b;
          font-size: 18px;
          margin: 0 0 40px;
          font-weight: 500;
        }
        .awards-recognitions {
          padding: 28px 56px;
          border-radius: 32px;
          background: linear-gradient(135deg, ${CYAN}0a 0%, ${LIME}0a 100%);
          border: 2px dashed ${CYAN}33%;
          display: inline-block;
          max-width: 750px;
          box-shadow: 0 12px 40px ${CYAN}0a;
        }
        .awards-recognitions-title {
          color: #0f172a;
          font-size: 24px;
          font-weight: 800;
          margin: 0 0 8px;
        }
        .awards-recognitions-text {
          color: #475569;
          font-size: 16px;
          margin: 0;
          font-weight: 500;
          line-height: 1.6;
        }

        .award-item-img {
          width: 105px;
          height: 105px;
          object-fit: contain;
        }
        .award-item-text {
          font-size: 13px;
          font-weight: 800;
          color: #0f172a;
          line-height: 1.3;
          z-index: 1;
          padding: 0 4px;
        }

        .awards-header-container {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
          justify-content: center;
        }
        .awards-header-text {
          text-align: left;
        }

        .award-card-responsive {
          width: 100%;
          box-sizing: border-box;
        }
        .award-item-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          width: 100%;
          justify-items: center;
        }

        @media (max-width: 1024px) {
          .awards-grid-innovation {
            grid-template-columns: 1fr;
            gap: 24px;
          }
        }

        @media (max-width: 768px) {
          .awards-title {
            font-size: 32px;
          }
          .awards-subtitle {
            font-size: 16px;
            margin-bottom: 30px;
          }
          .awards-recognitions {
            padding: 24px 20px;
            width: 100%;
          }
          .awards-recognitions-title {
            font-size: 20px;
          }
          .award-item-img {
            width: 85px;
            height: 85px;
          }
          .awards-header-container {
            flex-direction: column;
            text-align: center;
          }
          .awards-header-text {
            text-align: center;
          }
          .award-card-responsive {
            padding: 24px 12px !important;
          }
        }

        @media (max-width: 480px) {
          .awards-grid-4col {
            gap: 12px;
          }
          .award-item-grid {
            gap: 8px;
          }
          .awards-title {
            font-size: 28px;
          }
          .award-item-text {
            font-size: 11px;
          }
          .award-item-img {
            width: 70px;
            height: 70px;
          }
        }
      `}</style>

      <div style={{ paddingTop: 80, maxWidth: 1250, margin: '0 auto', padding: '60px 16px 100px' }}>

        {/* Page title */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: 70 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 22px', borderRadius: 999, background: `${CYAN}12`, border: `1px solid ${CYAN}33`, color: CYAN, fontSize: 12, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 18 }}>
            <Sparkles size={12} /> Vyuga 2026
          </div>
          <h1 className="awards-title">
            <span style={{ background: `linear-gradient(90deg, ${CYAN}, ${LIME})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              National Ability Awards
            </span>
          </h1>
          <div style={{ height: 7, width: 100, background: `linear-gradient(90deg,${CYAN},${LIME})`, borderRadius: 999, margin: '0 auto 20px' }} />
          <p className="awards-subtitle">Celebrating inclusivity, innovation & outstanding talent</p>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="awards-recognitions"
          >
            <p className="awards-recognitions-title">Attractive Recognitions, Gifts & Trophies</p>
            <p className="awards-recognitions-text">
              Participate and stand a chance to win amazing rewards across all events at VYUGA!
            </p>
          </motion.div>
        </motion.div>

        {/* ── INNOVATION FEST ── */}
        <Divider label="Inclusive Innovation Fest" accent={CYAN} />

        <div className="awards-grid-innovation">

          {/* For Specially Abled — LEFT */}
          <AwardCard accent={LIME}>
            <SectionHeader label="For Specially Abled" sublabel="Innovation Category" icon={<Lightbulb size={24} color={LIME} />} accent={LIME} />
            <div className="award-item-grid">
              <AwardItem name="Ability Innovation Champion" accent={LIME} imgSrc={tropy1} delay={0.1} />
              <AwardItem name="Emerging Ability Innovator" accent={LIME} imgSrc={tropy4} delay={0.2} />
            </div>
          </AwardCard>

          {/* Jury Special Mention — RIGHT */}
          <AwardCard accent={CYAN} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '24px 12px', justifyContent: 'center' }}>
            <SpinningStar size={85} />
            <p style={{ fontSize: 14, fontWeight: 800, color: CYAN, textTransform: 'uppercase', letterSpacing: '0.18em', margin: '16px 0 10px' }}>Jury Special Mention</p>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 24px', fontWeight: 600, lineHeight: 1.5 }}>Promising Future Innovation Award<br />on Innovation Fest</p>
            <div style={{ padding: '20px 24px', borderRadius: 24, background: `${CYAN}14`, border: `1.5px solid ${CYAN}44`, width: '100%', boxShadow: `0 6px 16px ${CYAN}12` }}>
              <span style={{ fontSize: 17, fontWeight: 900, color: '#0f172a' }}>Jury Special Mention Award</span>
            </div>
            <div style={{ marginTop: 24, padding: '10px 28px', borderRadius: 999, background: `linear-gradient(90deg, ${CYAN}, ${LIME})`, boxShadow: `0 8px 24px ${CYAN}44` }}>
              <span style={{ fontSize: 12, fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Special Award</span>
            </div>
          </AwardCard>

          {/* By Specially Abled — commented out */}
          {/* <AwardCard accent={CYAN}>
            <SectionHeader label="By Specially Abled" sublabel="Innovation Category" icon={<Lightbulb size={24} color={CYAN} />} accent={CYAN} />
            <div className="award-item-grid">
              <AwardItem name="Impact Innovator Icon" accent={CYAN} imgSrc={tropy5} delay={0.1} />
              <AwardItem name="Emerging Inclusive Innovator" accent={CYAN} imgSrc={tropy6} delay={0.2} />
            </div>
          </AwardCard> */}
        </div>

        {/* ── SPECIAL TALENT HUNT ── */}
        <Divider label="Special Talent Hunt" accent={LIME} />
        <AwardCard accent={LIME} style={{ maxWidth: 1100, margin: '0 auto' }}>
          <SectionHeader label="Special Talent Hunt" sublabel="Ability Showcase" icon={<Users size={24} color={LIME} />} accent={LIME} />
          <div className="awards-grid-4col">
            <AwardItem name="Shining Ability Icon" accent={LIME} imgSrc={tropy7} delay={0.1} />
            <AwardItem name="Rising Ability Performer" accent={LIME} imgSrc={child} delay={0.2} />
            <AwardItem name="People's Favorite" accent={LIME} imgSrc={hand} delay={0.3} />
          </div>
        </AwardCard>

        {/* ── SHORT FILM CONTEST ── */}
        <Divider label="Short Film Contest" accent={CYAN} />
        <AwardCard accent={CYAN} style={{ maxWidth: 1100, margin: '0 auto' }}>
          <SectionHeader label="Short Film Contest" sublabel="Inclusivity Theme" icon={<Video size={24} color={CYAN} />} accent={CYAN} />
          <div className="awards-grid-4col">
            <AwardItem name="Best Director — Inclusion Lens" accent={CYAN} imgSrc={shortflim} delay={0.1} />
            <AwardItem name="Impact Story Award" accent={CYAN} imgSrc={tropy3} delay={0.2} />
            <AwardItem name="People's Favorite" accent={CYAN} imgSrc={hand} delay={0.3} />
          </div>
        </AwardCard>

        {/* ── BEST SCHOOL AWARD ── */}
        <Divider label="Best School Award" accent={LIME} />
        <AwardCard accent={LIME} style={{ maxWidth: 1100, margin: '0 auto' }}>
          <SectionHeader
            label="Best School Award"
            sublabel="Most Nominations of Children"
            icon={<School size={24} color={LIME} />}
            accent={LIME}
          />
          <p style={{ textAlign: 'center', fontSize: 14, color: '#475569', fontWeight: 600, marginBottom: 28, lineHeight: 1.7 }}>
            Recognising the schools that champion inclusion by nominating the highest number of
            talented children to Vyuga 2026. A celebration of the institutions that believe every
            child deserves a stage.
          </p>
          <div className="awards-grid-4col">
            <AwardItem name="Champion School — Most Nominations" accent={LIME} imgSrc={tropy4} delay={0.1} />
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
