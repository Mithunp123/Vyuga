import { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'

const DEFAULT_SETTINGS = {
  fontSize: 100,       // percent (80 / 100 / 115 / 130 / 150)
  highContrast: false,
  darkMode: false,
  grayscale: false,
  largeLinks: false,
  highlightLinks: false,
  dyslexiaFont: false,
  letterSpacing: false,
  lineHeight: false,
  reduceMotion: false,
  hideImages: false,
  readingGuide: false,
  tts: false,           // click-to-speak
  textAlign: 'default', // 'default' | 'left' | 'center'
  cursor: 'default',   // 'default' | 'large' | 'white'
}

const FONT_STEPS = [80, 90, 100, 110, 120, 130, 150]

export default function AccessibilityWidget() {
  const [open, setOpen] = useState(false)
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('a11y-settings')
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS
    } catch {
      return DEFAULT_SETTINGS
    }
  })
  const [guideY, setGuideY] = useState(200)
  const [speaking, setSpeaking] = useState(false)
  const [spokenText, setSpokenText] = useState('')
  const [voices, setVoices] = useState([])
  const [selectedVoice, setSelectedVoice] = useState('')
  const voicesRef = useRef([])

  // Load available voices — browsers fire voiceschanged asynchronously
  useEffect(() => {
    function loadVoices() {
      const all = window.speechSynthesis.getVoices()
      if (!all.length) return

      // Preferred voice name substrings, ordered best → acceptable
      // Neural / natural voices from Google, Microsoft, Apple
      const preferred = [
        'Google US English',
        'Google UK English Female',
        'Microsoft Aria',
        'Microsoft Jenny',
        'Microsoft Zira',
        'Samantha',          // macOS
        'Karen',             // macOS AU
        'Moira',             // macOS IE
        'Tessa',             // macOS ZA
        'Victoria',          // macOS
        'Alex',              // macOS
      ]

      // Score each voice
      const scored = all.map((v) => {
        let score = 0
        preferred.forEach((name, i) => {
          if (v.name.toLowerCase().includes(name.toLowerCase())) {
            score = preferred.length - i + 10  // higher = better
          }
        })
        // Boost voices with 'natural', 'neural', 'online' in name
        if (/natural|neural|online/i.test(v.name)) score += 5
        // Prefer en-US / en-GB
        if (v.lang === 'en-US') score += 3
        if (v.lang === 'en-GB') score += 2
        if (v.lang.startsWith('en')) score += 1
        return { voice: v, score }
      })

      scored.sort((a, b) => b.score - a.score)
      const sorted = scored.map((s) => s.voice)
      voicesRef.current = sorted
      setVoices(sorted)
      setSelectedVoice((prev) => prev || sorted[0]?.name || '')
    }

    loadVoices()
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices)
    return () => window.speechSynthesis.removeEventListener('voiceschanged', loadVoices)
  }, [])

  // Persist settings
  useEffect(() => {
    localStorage.setItem('a11y-settings', JSON.stringify(settings))
  }, [settings])

  // Apply all settings to <html>
  useEffect(() => {
    const root = document.documentElement

    // Font size
    root.style.fontSize = `${settings.fontSize}%`

    // CSS classes
    const classMap = {
      'a11y-high-contrast': settings.highContrast,
      'a11y-dark': settings.darkMode,
      'a11y-grayscale': settings.grayscale,
      'a11y-large-links': settings.largeLinks,
      'a11y-highlight-links': settings.highlightLinks,
      'a11y-dyslexia': settings.dyslexiaFont,
      'a11y-letter-spacing': settings.letterSpacing,
      'a11y-line-height': settings.lineHeight,
      'a11y-reduce-motion': settings.reduceMotion,
      'a11y-hide-images': settings.hideImages,
      'a11y-align-left': settings.textAlign === 'left',
      'a11y-align-center': settings.textAlign === 'center',
      'a11y-cursor-large': settings.cursor === 'large',
      'a11y-cursor-white': settings.cursor === 'white',
    }
    Object.entries(classMap).forEach(([cls, active]) => {
      root.classList.toggle(cls, active)
    })
  }, [settings])

  // Reading guide mouse tracking
  useEffect(() => {
    if (!settings.readingGuide) return
    const handler = (e) => setGuideY(e.clientY)
    window.addEventListener('mousemove', handler)
    return () => window.removeEventListener('mousemove', handler)
  }, [settings.readingGuide])

  // Text-to-speech: click any text element to speak it
  useEffect(() => {
    if (!settings.tts) {
      window.speechSynthesis && window.speechSynthesis.cancel()
      setSpeaking(false)
      setSpokenText('')
      document.documentElement.classList.remove('a11y-tts-mode')
      return
    }
    document.documentElement.classList.add('a11y-tts-mode')

    function getTextFromTarget(el) {
      // Walk up to find a meaningful text container
      const candidates = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'li', 'td', 'th', 'label', 'span', 'a', 'button', 'div']
      let node = el
      while (node && node !== document.body) {
        const tag = node.tagName?.toLowerCase()
        if (candidates.includes(tag)) {
          const text = node.innerText?.trim()
          if (text && text.length > 1) return text
        }
        node = node.parentElement
      }
      return null
    }

    function handleClick(e) {
      // Ignore clicks inside the widget panel/fab
      if (e.target.closest('.a11y-fab, .a11y-panel')) return
      const text = getTextFromTarget(e.target)
      if (!text) return
      window.speechSynthesis.cancel()
      const utt = new SpeechSynthesisUtterance(text)

      // Pick the chosen voice or best available
      const allVoices = voicesRef.current
      const picked =
        allVoices.find((v) => v.name === selectedVoice) ||
        allVoices[0] ||
        null
      if (picked) utt.voice = picked
      utt.lang   = picked?.lang || 'en-US'

      // Human-like prosody: moderate pace, slight warmth in pitch
      utt.rate   = 0.88   // slightly slower than default → clearer, less robotic
      utt.pitch  = 1.05   // slightly above monotone centre
      utt.volume = 1

      utt.onstart = () => { setSpeaking(true); setSpokenText(text.length > 60 ? text.slice(0, 60) + '\u2026' : text) }
      utt.onend   = () => { setSpeaking(false); setSpokenText('') }
      utt.onerror = () => { setSpeaking(false); setSpokenText('') }
      window.speechSynthesis.speak(utt)
    }

    document.addEventListener('click', handleClick, true)
    return () => {
      document.removeEventListener('click', handleClick, true)
      window.speechSynthesis.cancel()
      document.documentElement.classList.remove('a11y-tts-mode')
      setSpeaking(false)
      setSpokenText('')
    }
  }, [settings.tts, selectedVoice])

  const toggle = useCallback((key) => {
    setSettings((s) => ({ ...s, [key]: !s[key] }))
  }, [])

  const set = useCallback((key, value) => {
    setSettings((s) => ({ ...s, [key]: value }))
  }, [])

  const increaseFontSize = () => {
    const idx = FONT_STEPS.indexOf(settings.fontSize)
    if (idx < FONT_STEPS.length - 1) set('fontSize', FONT_STEPS[idx + 1])
  }

  const decreaseFontSize = () => {
    const idx = FONT_STEPS.indexOf(settings.fontSize)
    if (idx > 0) set('fontSize', FONT_STEPS[idx - 1])
  }

  const resetAll = () => {
    setSettings(DEFAULT_SETTINGS)
    document.documentElement.style.fontSize = ''
  }

  const activeCount = [
    settings.fontSize !== 100,
    settings.highContrast, settings.darkMode, settings.grayscale,
    settings.largeLinks, settings.highlightLinks, settings.dyslexiaFont,
    settings.letterSpacing, settings.lineHeight, settings.reduceMotion,
    settings.hideImages, settings.readingGuide, settings.tts,
    settings.textAlign !== 'default', settings.cursor !== 'default',
  ].filter(Boolean).length

  return createPortal(
    <>
      {/* TTS speaking indicator */}
      {speaking && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] bg-white rounded-full shadow-lg border border-gray-100 px-6 py-3 flex items-center gap-4 animate-bounce-in">
          <span className="a11y-tts-wave flex items-center h-5" aria-hidden="true">
            <span /><span /><span /><span /><span />
          </span>
          <span className="text-gray-700 font-medium text-sm truncate max-w-[200px] sm:max-w-xs">{spokenText}</span>
          <button
            className="text-red-500 hover:text-red-600 transition-colors p-1"
            onClick={() => { window.speechSynthesis.cancel(); setSpeaking(false); setSpokenText('') }}
            aria-label="Stop speech"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h12v12H6z"/></svg>
          </button>
        </div>
      )}

      {/* Reading guide bar */}
      {settings.readingGuide && (
        <div
          style={{
            position: 'fixed',
            top: guideY - 24,
            left: 0,
            width: '100%',
            height: 48,
            background: 'rgba(255, 255, 0, 0.15)',
            borderTop: '2px solid rgba(255, 215, 0, 0.8)',
            borderBottom: '2px solid rgba(255, 215, 0, 0.8)',
            pointerEvents: 'none',
            zIndex: 9998,
            transition: 'top 0.05s linear',
          }}
        />
      )}

      {/* Floating trigger button */}
      <button
        className="fixed bottom-6 right-6 z-[9998] w-14 h-14 bg-gradient-to-br from-primary to-primary-dark text-white rounded-full shadow-[0_8px_20px_rgba(91,203,43,0.3)] flex items-center justify-center text-3xl hover:scale-110 transition-transform duration-300 focus:outline-none focus:ring-4 focus:ring-primary/40 group"
        aria-label="Open accessibility options"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        title="Accessibility Options"
      >
        <span aria-hidden="true" className="group-hover:animate-wiggle">♿</span>
        {activeCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-secondary text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
            {activeCount}
          </span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div 
           className="fixed bottom-24 right-6 z-[9999] w-[340px] max-h-[75vh] bg-white rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] border border-gray-100 flex flex-col overflow-hidden animate-pop-up origin-bottom-right"
           role="dialog" 
           aria-label="Accessibility Settings"
        >
          {/* Header */}
          <div className="bg-gray-50/80 backdrop-blur-md border-b border-gray-100 px-5 py-4 flex items-center justify-between sticky top-0 z-10">
            <span className="font-heading font-bold text-gray-800 text-lg flex items-center gap-2">
              <span className="text-primary text-xl">⚙️</span> Accessibility
            </span>
            <div className="flex items-center gap-2">
              <button 
                className="text-xs font-semibold text-secondary hover:text-secondary-dark px-3 py-1.5 rounded-full hover:bg-secondary/10 transition-colors" 
                onClick={resetAll} 
                title="Reset all settings"
              >
                Reset
              </button>
              <button 
                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-200 transition-colors" 
                onClick={() => setOpen(false)} 
                aria-label="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
          </div>

          <div className="p-5 overflow-y-auto overflow-x-hidden flex-1 space-y-6 custom-scrollbar block">

            {/* ── Font Size ── */}
            <div>
              <div className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Text Size</div>
              <div className="flex items-center justify-between bg-gray-50 rounded-2xl p-2 border border-gray-100">
                <button
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white text-gray-700 font-bold shadow-sm border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  onClick={decreaseFontSize}
                  disabled={settings.fontSize <= FONT_STEPS[0]}
                  aria-label="Decrease font size"
                >
                  A–
                </button>
                <div className="font-bold text-primary px-4 bg-white py-1.5 rounded-lg shadow-inner">{settings.fontSize}%</div>
                <button
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white text-gray-700 font-bold shadow-sm border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  onClick={increaseFontSize}
                  disabled={settings.fontSize >= FONT_STEPS[FONT_STEPS.length - 1]}
                  aria-label="Increase font size"
                >
                  A+
                </button>
              </div>
            </div>

            {/* ── Colour & Vision ── */}
            <div>
              <div className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Colour & Vision</div>
              <div className="grid grid-cols-2 gap-2">
                <ToggleItem label="High Contrast" icon="◑" active={settings.highContrast} onToggle={() => toggle('highContrast')} />
                <ToggleItem label="Dark Mode" icon="🌙" active={settings.darkMode} onToggle={() => toggle('darkMode')} />
                <ToggleItem label="Grayscale" icon="⬛" active={settings.grayscale} onToggle={() => toggle('grayscale')} />
                <ToggleItem label="Hide Images" icon="🚫" active={settings.hideImages} onToggle={() => toggle('hideImages')} />
              </div>
            </div>

            {/* ── Links ── */}
            <div>
              <div className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Links</div>
              <div className="grid grid-cols-2 gap-2">
                <ToggleItem label="Highlight Links" icon="🔗" active={settings.highlightLinks} onToggle={() => toggle('highlightLinks')} />
                <ToggleItem label="Larger Links" icon="🔍" active={settings.largeLinks} onToggle={() => toggle('largeLinks')} />
              </div>
            </div>

            {/* ── Typography ── */}
            <div>
              <div className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Typography</div>
              <div className="grid grid-cols-2 gap-2">
                <ToggleItem label="Dyslexia Font" icon="Aa" active={settings.dyslexiaFont} onToggle={() => toggle('dyslexiaFont')} />
                <ToggleItem label="Letter Spacing" icon="⇤⇥" active={settings.letterSpacing} onToggle={() => toggle('letterSpacing')} />
                <ToggleItem label="Line Height" icon="↕️" active={settings.lineHeight} onToggle={() => toggle('lineHeight')} />
              </div>
            </div>

            {/* ── Text Alignment ── */}
            <div>
              <div className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Text Alignment</div>
              <div className="flex bg-gray-50 rounded-2xl p-1 border border-gray-100">
                {[['default', '≡', 'Default'], ['left', '≡ L', 'Left align'], ['center', '≡ C', 'Center align']].map(([val, icon, label]) => (
                  <button
                    key={val}
                    className={`flex-1 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${settings.textAlign === val ? 'bg-white text-secondary shadow-sm ring-1 ring-gray-200' : 'text-gray-500 hover:text-gray-800'}`}
                    onClick={() => set('textAlign', val)}
                    aria-label={label}
                    title={label}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Cursor ── */}
            <div>
              <div className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Cursor</div>
              <div className="flex bg-gray-50 rounded-2xl p-1 border border-gray-100">
                {[['default', '↖', 'Default cursor'], ['large', '↖+', 'Large cursor'], ['white', '↖○', 'White cursor']].map(([val, icon, label]) => (
                  <button
                    key={val}
                    className={`flex-1 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${settings.cursor === val ? 'bg-white text-secondary shadow-sm ring-1 ring-gray-200' : 'text-gray-500 hover:text-gray-800'}`}
                    onClick={() => set('cursor', val)}
                    aria-label={label}
                    title={label}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Navigation & Motion ── */}
            <div>
              <div className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Navigation & Motion</div>
              <div className="grid grid-cols-2 gap-2">
                <ToggleItem label="Reduce Motion" icon="🛑" active={settings.reduceMotion} onToggle={() => toggle('reduceMotion')} />
                <ToggleItem label="Reading Guide" icon="📏" active={settings.readingGuide} onToggle={() => toggle('readingGuide')} />
              </div>
            </div>

            {/* ── Text to Speech ── */}
            <div>
              <div className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Text to Speech</div>
              <ToggleItem
                label={settings.tts ? 'Click any text to hear it spoken aloud' : 'Click to Speak'}
                icon="🔊"
                active={settings.tts}
                onToggle={() => toggle('tts')}
                fullWidth
              />
              {settings.tts && (
                <div className="mt-3 p-3 bg-secondary/10 rounded-xl border border-secondary/20">
                  <p className="text-xs text-secondary-dark font-medium mb-2 flex items-center gap-1">
                    <span className="text-base animate-pulse">🔊</span> Click any sentence on the page
                  </p>
                  {voices.length > 0 && (
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1 block">Voice</label>
                      <select
                        className="w-full text-xs p-2 rounded-lg border border-gray-200 bg-white text-gray-700 outline-none focus:ring-2 focus:ring-secondary/50"
                        value={selectedVoice}
                        onChange={(e) => setSelectedVoice(e.target.value)}
                      >
                        {voices.map((v) => (
                          <option key={v.name} value={v.name}>
                            {v.name} ({v.lang})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </>,
    document.body
  )
}

function ToggleItem({ label, icon, active, onToggle, fullWidth }) {
  return (
    <button
      className={`relative group flex items-start gap-3 p-3 rounded-2xl text-left border transition-all duration-300 ${
        active 
          ? 'bg-primary/10 border-primary shadow-[0_4px_12px_rgba(91,203,43,0.15)] ring-1 ring-primary' 
          : 'bg-white border-gray-100 hover:border-primary/40 hover:bg-gray-50 hover:shadow-sm'
      } ${fullWidth ? 'w-full' : 'w-full'}`}
      onClick={onToggle}
      aria-pressed={active}
      title={label}
    >
      <div className={`text-xl flex-shrink-0 transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
        {icon}
      </div>
      <div className="flex-1 mt-0.5">
        <div className={`text-xs font-bold leading-tight ${active ? 'text-primary-dark' : 'text-gray-700'}`}>
          {label}
        </div>
      </div>
      
      {/* Switch Mockup */}
      <div className={`mt-0.5 relative w-7 h-4 rounded-full transition-colors duration-300 flex-shrink-0 ${active ? 'bg-primary' : 'bg-gray-200 group-hover:bg-gray-300'}`}>
        <div className={`absolute top-0.5 left-0.5 bg-white w-3 h-3 rounded-full transition-transform duration-300 shadow-sm ${active ? 'translate-x-3' : 'translate-x-0'}`} />
      </div>
    </button>
  )
}
