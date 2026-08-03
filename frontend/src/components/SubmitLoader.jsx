import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

import v from '../assets/logo/1.png'
import y from '../assets/logo/2.png'
import u from '../assets/logo/3.png'
import g from '../assets/logo/4.png'
import a from '../assets/logo/5.png'

const letters = [v, y, u, g, a]
const labels = ['V', 'Y', 'U', 'G', 'A']

const defaultMessages = [
  'Preparing your submission…',
  'Almost there…',
  'Validating your details…',
  'Connecting to server…',
  'Hang tight…',
]

export default function SubmitLoader({ visible, customMessages }) {
  const [msgIdx, setMsgIdx] = useState(0)
  const [dots, setDots] = useState('')
  const activeMessages = customMessages || defaultMessages

  useEffect(() => {
    if (!visible) return
    setMsgIdx(0)
    setDots('')
    const msgTimer = setInterval(() => setMsgIdx(i => (i + 1) % activeMessages.length), 2800)
    const dotTimer = setInterval(() => setDots(d => (d.length >= 3 ? '' : d + '.')), 500)
    return () => { clearInterval(msgTimer); clearInterval(dotTimer) }
  }, [visible, activeMessages])

  if (!visible) return null

  return createPortal(
    <div className="submit-loader-overlay">
      <div className="submit-loader-card">
        {/* Letter images */}
        <div className="submit-loader-letters">
          {letters.map((src, i) => (
            <div key={i} className="submit-loader-letter-wrap" style={{ animationDelay: `${i * 0.15}s` }}>
              <img
                src={src}
                alt={labels[i]}
                className="submit-loader-letter"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
              {/* Glow ring under each letter */}
              <div className="submit-loader-glow" style={{ animationDelay: `${i * 0.15}s` }} />
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="submit-loader-bar-track">
          <div className="submit-loader-bar-fill" />
        </div>

        {/* Rotating message */}
        <p className="submit-loader-msg">{activeMessages[msgIdx]}{dots}</p>
      </div>
    </div>,
    document.body
  )
}
