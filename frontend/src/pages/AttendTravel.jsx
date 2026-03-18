import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plane, Train, Bus, MapPin, ChevronRight, ArrowRight } from 'lucide-react'
import PageShell from './PageShell.jsx'

const STEP_DELAY = 0.1

function StepCard({ number, title, children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="flex gap-4"
    >
      <div className="flex flex-col items-center">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-md"
          style={{ background: 'linear-gradient(135deg, #0197B2, #5BCB2B)' }}>
          {number}
        </div>
        <div className="mt-1 w-px flex-1 bg-gradient-to-b from-brand-cyan/30 to-transparent" />
      </div>
      <div className="pb-8 flex-1">
        <p className="text-sm font-bold text-slate-900 mb-1">{title}</p>
        <div className="text-sm text-slate-600 leading-relaxed">{children}</div>
      </div>
    </motion.div>
  )
}

function TransportBadge({ icon: Icon, label }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
      <Icon className="h-3.5 w-3.5" style={{ color: '#0197B2' }} />
      {label}
    </span>
  )
}

function RouteLine({ segments }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 mt-2">
      {segments.map((seg, i) => {
        const isKSR = seg.includes('KSR')
        return (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-slate-300" />}
            <span className={[
              'rounded-lg px-2.5 py-1 text-xs font-semibold shadow-sm',
              isKSR 
                ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white border-2 border-cyan-400 ring-2 ring-cyan-300/50 font-bold'
                : 'bg-white border border-slate-200 text-slate-800'
            ].join(' ')}>
              {seg}
            </span>
          </span>
        )
      })}
    </div>
  )
}

export default function AttendTravel() {
  const [transportMode, setTransportMode] = useState(null) // 'flight' | 'train' | 'bus'
  const [selectedFlight, setSelectedFlight] = useState(null) // 'covai' | 'salem'

  return (
    <PageShell
      title="Travel Information"
      subtitle="Plan your journey to VYUGA – Innovation Fest at KSR College of Technology, Tiruchengode."
    >
      <div className="max-w-4xl mx-auto space-y-10">

        {/* ── Destination Info ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl border border-brand-cyan/20 p-6 text-center"
          style={{ background: 'linear-gradient(135deg, #e0f6fa 0%, #f4fef0 100%)' }}
        >
          <MapPin className="mx-auto h-8 w-8 mb-3" style={{ color: '#0197B2' }} />
          <p className="text-lg font-bold text-slate-900">Final Destination: Namakkal</p>
          <p className="text-sm text-slate-600 mt-1">KSR Bus Stop, Tiruchengode</p>
          <p className="text-xs text-slate-500 mt-2">KSR College of Technology, Tiruchengode, Namakkal District, Tamil Nadu</p>
        </motion.div>

        {/* ── Step 1: Choose Transport Mode ── */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <p className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.2em] uppercase mb-3" style={{ color: '#0197B2' }}>
              <span className="h-px w-6 inline-block" style={{ background: '#0197B2' }} />
              Start Here
            </p>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Choose Your Mode of Transport</h2>
            <p className="text-sm text-slate-600 mb-6">Select how you'll be traveling to the event.</p>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { id: 'flight', icon: Plane, label: 'Flight', desc: 'Traveling by air', color: '#0197B2', bg: '#e0f6fa' },
              { id: 'train', icon: Train, label: 'Train', desc: 'Traveling by rail', color: '#5BCB2B', bg: '#f4fef0' },
              { id: 'bus', icon: Bus, label: 'Bus', desc: 'Traveling by road', color: '#f59e0b', bg: '#fef3c7' },
            ].map((opt, i) => {
              const isActive = transportMode === opt.id
              const Icon = opt.icon
              return (
                <motion.button
                  key={opt.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setTransportMode(opt.id)
                    setSelectedFlight(null) // Reset flight selection
                  }}
                  className={[
                    'text-center rounded-2xl border-2 p-6 transition-all',
                    isActive
                      ? 'border-2 shadow-lg ring-2 ring-offset-2'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md',
                  ].join(' ')}
                  style={{
                    borderColor: isActive ? opt.color : undefined,
                    background: isActive ? opt.bg : undefined,
                    ringColor: isActive ? opt.color + '40' : undefined,
                  }}
                >
                  <Icon className="h-8 w-8 mx-auto mb-3" style={{ color: isActive ? opt.color : '#94a3b8' }} />
                  <p className="text-lg font-bold text-slate-900">{opt.label}</p>
                  <p className="text-xs text-slate-500 mt-1">{opt.desc}</p>
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* ── Flight Routes ── */}
        <AnimatePresence mode="wait">
          {transportMode === 'flight' && (
            <motion.div
              key="flight-selection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
            >
              <h3 className="text-xl font-bold text-slate-900 mb-4">Choose Your Flight Destination</h3>
              <div className="grid gap-4 sm:grid-cols-2">
            {[
              { id: 'covai', city: 'Coimbatore (Covai)', code: 'CJB', desc: 'Coimbatore International Airport' },
              { id: 'salem', city: 'Salem', code: 'SLV', desc: 'Salem Airport' },
            ].map((opt, i) => {
              const isActive = selectedFlight === opt.id
              return (
                <motion.button
                  key={opt.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedFlight(opt.id)}
                  className={[
                    'text-left rounded-2xl border-2 p-5 transition-all',
                    isActive
                      ? 'border-[#0197B2] bg-[#e0f6fa] shadow-lg shadow-brand-cyan/15'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md',
                  ].join(' ')}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <Plane className="h-5 w-5 mb-2" style={{ color: isActive ? '#0197B2' : '#94a3b8' }} />
                      <p className="text-base font-bold text-slate-900">{opt.city}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{opt.desc}</p>
                    </div>
                    <span className={[
                      'rounded-lg px-2 py-1 text-xs font-bold',
                      isActive ? 'bg-[#0197B2] text-white' : 'bg-slate-100 text-slate-500'
                    ].join(' ')}>
                      {opt.code}
                    </span>
                  </div>
                </motion.button>
              )
            })}
          </div>
        </motion.div>
          )}
        </AnimatePresence>

        {/* ── Route Details ── */}
        <AnimatePresence mode="wait">
          {/* Train Routes */}
          {transportMode === 'train' && (
            <motion.div
              key="train-route"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-6">
                <Train className="h-5 w-5" style={{ color: '#5BCB2B' }} />
                <h3 className="text-lg font-bold text-slate-900">Train Route to VYUGA</h3>
              </div>

              <StepCard number={1} title="Board Train to Erode Junction" delay={0}>
                <p>Take a train to <strong>Erode Junction</strong> from your nearest railway station.</p>
                <p className="mt-2 text-xs text-slate-500">Major trains from Chennai, Bangalore, Coimbatore connect to Erode.</p>
              </StepCard>

              <StepCard number={2} title="Arrive at Erode Junction" delay={STEP_DELAY}>
                <p>Reach Erode Junction Railway Station.</p>
              </StepCard>

              <StepCard number={3} title="Travel Erode → Namakkal" delay={STEP_DELAY * 2}>
                <p className="mb-1">Take Bus from Erode Bus Stand:</p>
                <RouteLine segments={['Erode', 'KSR Stop', 'Tiruchengode', 'Namakkal']} />
                <p className="mt-2 text-xs text-slate-500">Regular buses available from Erode to Namakkal via Tiruchengode.</p>
              </StepCard>

              <StepCard number={4} title="Arrive at KSR Bus Stop" delay={STEP_DELAY * 3}>
                <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                  <p className="text-sm font-bold text-green-800">Get down at: KSR Bus Stop</p>
                  <p className="text-xs text-green-700 mt-0.5">KSR College of Technology, Tiruchengode</p>
                </div>
              </StepCard>
            </motion.div>
          )}

          {/* Bus Routes */}
          {transportMode === 'bus' && (
            <motion.div
              key="bus-route"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-6">
                <Bus className="h-5 w-5" style={{ color: '#f59e0b' }} />
                <h3 className="text-lg font-bold text-slate-900">Bus Route to VYUGA</h3>
              </div>

              <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-bold text-amber-900">Multiple Bus Options Available</p>
                <p className="text-xs text-amber-700 mt-1">Choose the route that best suits your starting location.</p>
              </div>

              <div className="space-y-6">
                {/* Option 1 */}
                <div className="rounded-xl border-2 border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm font-bold text-slate-900 mb-3">Option 1: Via Erode</p>
                  <StepCard number={1} title="Board bus to Erode" delay={0}>
                    <p>Take a bus to <strong>Erode</strong> from your city.</p>
                    <p className="mt-1 text-xs text-slate-500">Available from Chennai, Bangalore, Coimbatore, Salem, and other major cities.</p>
                  </StepCard>

                  <StepCard number={2} title="Travel Erode → Namakkal" delay={STEP_DELAY}>
                    <p className="mb-1">Board bus from Erode to Namakkal:</p>
                    <RouteLine segments={['Erode', 'KSR Stop', 'Tiruchengode', 'Namakkal']} />
                  </StepCard>

                  <StepCard number={3} title="Arrive at KSR Bus Stop" delay={STEP_DELAY * 2}>
                    <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                      <p className="text-sm font-bold text-green-800">Get down at: KSR Bus Stop</p>
                      <p className="text-xs text-green-700 mt-0.5">KSR College of Technology, Tiruchengode</p>
                    </div>
                  </StepCard>
                </div>

                {/* Option 2 */}
                <div className="rounded-xl border-2 border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm font-bold text-slate-900 mb-3">Option 2: Via Salem</p>
                  <StepCard number={1} title="Board bus to Salem" delay={0}>
                    <p>Take a bus to <strong>Salem</strong> from your city.</p>
                  </StepCard>

                  <StepCard number={2} title="Travel Salem → Tiruchengode" delay={STEP_DELAY}>
                    <p className="mb-1">Board bus from Salem to Erode (via Tiruchengode):</p>
                    <RouteLine segments={['Salem', 'Tiruchengode', 'KSR Stop', 'Erode']} />
                    <p className="mt-2 text-xs text-slate-500">Get down at KSR Bus Stop in Tiruchengode.</p>
                  </StepCard>

                  <StepCard number={3} title="Arrive at KSR Bus Stop" delay={STEP_DELAY * 2}>
                    <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                      <p className="text-sm font-bold text-green-800">Get down at: KSR Bus Stop</p>
                      <p className="text-xs text-green-700 mt-0.5">KSR College of Technology, Tiruchengode</p>
                    </div>
                  </StepCard>
                </div>

                {/* Option 3 */}
                <div className="rounded-xl border-2 border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm font-bold text-slate-900 mb-3">Option 3: Direct to Namakkal</p>
                  <StepCard number={1} title="Direct bus to Namakkal" delay={0}>
                    <p>If available, take a <strong>direct bus to Namakkal</strong>.</p>
                  </StepCard>

                  <StepCard number={2} title="Travel to Tiruchengode" delay={STEP_DELAY}>
                    <p className="mb-1">Get down at KSR Bus Stop:</p>
                    <RouteLine segments={['Your City', 'Namakkal', 'Tiruchengode', 'KSR Stop', 'Erode']} />
                  </StepCard>

                  <StepCard number={3} title="Arrive at KSR Bus Stop" delay={STEP_DELAY * 2}>
                    <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                      <p className="text-sm font-bold text-green-800">Get down at: KSR Bus Stop</p>
                      <p className="text-xs text-green-700 mt-0.5">KSR College of Technology, Tiruchengode</p>
                    </div>
                  </StepCard>
                </div>
              </div>
            </motion.div>
          )}

          {selectedFlight === 'covai' && transportMode === 'flight' && (
            <motion.div
              key="covai"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-6">
                <Plane className="h-5 w-5" style={{ color: '#0197B2' }} />
                <h3 className="text-lg font-bold text-slate-900">Route A — Via Coimbatore</h3>
              </div>

              <StepCard number={1} title="Flight lands at Coimbatore" delay={0}>
                <p>Arrive at Coimbatore International Airport (CJB).</p>
              </StepCard>

              <StepCard number={2} title="Travel Coimbatore → Erode" delay={STEP_DELAY}>
                <p className="mb-2">Choose your preferred transport:</p>
                <div className="flex gap-2">
                  <TransportBadge icon={Train} label="Train" />
                  <TransportBadge icon={Bus} label="Bus" />
                </div>
                <p className="mt-2 text-xs text-slate-500">Both options are available from Coimbatore to Erode.</p>
              </StepCard>

              <StepCard number={3} title="Travel Erode → Namakkal" delay={STEP_DELAY * 2}>
                <p className="mb-1">Take Bus from Erode:</p>
                <RouteLine segments={['Erode', 'KSR Stop', 'Tiruchengode', 'Namakkal']} />
              </StepCard>

              <StepCard number={4} title="Arrive at KSR Bus Stop" delay={STEP_DELAY * 3}>
                <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                  <p className="text-sm font-bold text-green-800">Bus stops at: KSR Bus Stop</p>
                  <p className="text-xs text-green-700 mt-0.5">KSR College of Technology, Tiruchengode</p>
                </div>
              </StepCard>
            </motion.div>
          )}

          {selectedFlight === 'salem' && transportMode === 'flight' && (
            <motion.div
              key="salem"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-6">
                <Plane className="h-5 w-5" style={{ color: '#0197B2' }} />
                <h3 className="text-lg font-bold text-slate-900">Route B — Via Salem</h3>
              </div>

              <StepCard number={1} title="Flight lands at Salem" delay={0}>
                <p>Arrive at Salem Airport (SLV).</p>
              </StepCard>

              <StepCard number={2} title="Travel Salem → Erode / Namakkal" delay={STEP_DELAY}>
                <p className="mb-2">Choose your preferred transport:</p>
                <div className="flex gap-2 mb-3">
                  <TransportBadge icon={Train} label="Train" />
                  <TransportBadge icon={Bus} label="Bus" />
                </div>

                <div className="space-y-3">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Option A — If Train</p>
                    <p className="text-sm text-slate-700">Take train from Salem to Erode, then bus onward.</p>
                    <RouteLine segments={['Salem (Train)', 'Erode', 'KSR Stop', 'Tiruchengode', 'Namakkal']} />
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Option B — If Bus</p>
                    <p className="text-sm text-slate-700">Take direct bus from Salem via Tiruchengode to Erode. Get off at KSR Bus Stop (Tiruchengode).</p>
                    <RouteLine segments={['Salem (Bus)', 'Tiruchengode', 'KSR Stop', 'Erode']} />
                  </div>
                </div>
              </StepCard>

              <StepCard number={3} title="Arrive at KSR Bus Stop" delay={STEP_DELAY * 2}>
                <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                  <p className="text-sm font-bold text-green-800">All buses stop at: KSR Bus Stop</p>
                  <p className="text-xs text-green-700 mt-0.5">KSR College of Technology, Tiruchengode</p>
                </div>
              </StepCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Route Flow Diagram - Only for flight mode ── */}
        {transportMode === 'flight' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <p className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.2em] uppercase mb-5" style={{ color: '#0197B2' }}>
            <span className="h-px w-6 inline-block" style={{ background: '#0197B2' }} />
            Route Overview
          </p>

          {/* Visual flow */}
          <div className="space-y-4">
            {/* Flight Landing */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ background: '#e0f6fa' }}>
                <Plane className="h-5 w-5" style={{ color: '#0197B2' }} />
              </div>
              <p className="text-sm font-bold text-slate-900">Flight Landing</p>
            </div>

            {/* Branch */}
            <div className="ml-5 border-l-2 border-slate-200 pl-8 space-y-6">
              {/* Covai Branch */}
              <div>
                <div className="relative">
                  <div className="absolute -left-[2.55rem] top-1.5 h-3 w-3 rounded-full border-2 border-brand-cyan bg-white" />
                  <p className="text-sm font-bold" style={{ color: '#0197B2' }}>Via Coimbatore (Covai)</p>
                </div>
                <div className="mt-2 ml-1 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <ArrowRight className="h-3 w-3 text-slate-400" />
                    <span>Train / Bus → <strong>Erode</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <ArrowRight className="h-3 w-3 text-slate-400" />
                    <span>Bus → KSR Stop → Tiruchengode → <strong>Namakkal</strong></span>
                  </div>
                </div>
              </div>

              {/* Salem Branch */}
              <div>
                <div className="relative">
                  <div className="absolute -left-[2.55rem] top-1.5 h-3 w-3 rounded-full border-2 border-brand-lime bg-white" />
                  <p className="text-sm font-bold" style={{ color: '#5BCB2B' }}>Via Salem</p>
                </div>
                <div className="mt-2 ml-1 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <ArrowRight className="h-3 w-3 text-slate-400" />
                    <span>Train → Erode → Bus → KSR Stop → Tiruchengode → <strong>Namakkal</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <ArrowRight className="h-3 w-3 text-slate-400" />
                    <span>Bus → Tiruchengode → KSR Stop → <strong>Erode</strong></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Destination */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ background: '#f0fdf4' }}>
                <MapPin className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-green-700">KSR Bus Stop, Tiruchengode</p>
                <p className="text-xs text-slate-500">Final Destination — Namakkal District</p>
              </div>
            </div>
          </div>
        </motion.div>
        )}

        {/* ── Key Info Cards ── */}
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: 'Final Destination', value: 'Namakkal', sub: 'Namakkal District, TN', color: '#0197B2', bg: '#e0f6fa' },
            { label: 'Important Stop', value: 'KSR Bus Stop', sub: 'Tiruchengode', color: '#16a34a', bg: '#f0fdf4' },
            { label: 'Common Route Point', value: 'Tiruchengode', sub: 'All routes pass through here', color: '#5BCB2B', bg: '#f4fef0' },
          ].map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 + i * 0.08 }}
              className="rounded-2xl border border-slate-200 p-5 text-center shadow-sm"
              style={{ background: card.bg }}
            >
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">{card.label}</p>
              <p className="text-lg font-extrabold" style={{ color: card.color }}>{card.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{card.sub}</p>
            </motion.div>
          ))}
        </div>

      </div>
    </PageShell>
  )
}
