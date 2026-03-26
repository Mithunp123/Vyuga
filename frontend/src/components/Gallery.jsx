import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const INTERVAL_MS = 4000

export default function Gallery() {
  const [images, setImages] = useState([])
  const [activeIdx, setActiveIdx] = useState(0)
  const [direction, setDirection] = useState(1) // 1 = forward, -1 = backward
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.1 })
  const thumbRefs = useRef([])
  const intervalRef = useRef(null)

  useEffect(() => {
    fetch(`${API_BASE}/api/gallery`)
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          setImages(json.data.map(img => ({
            src: `${API_BASE}${img.image_url}`,
            alt: img.title || 'Gallery image',
          })))
        }
      })
      .catch(console.error)
  }, [])

  const goTo = useCallback((idx, dir = 1) => {
    setDirection(dir)
    setActiveIdx(idx)
  }, [])

  const prev = useCallback(() => {
    setImages(imgs => {
      const newIdx = (activeIdx - 1 + imgs.length) % imgs.length
      goTo(newIdx, -1)
      return imgs
    })
  }, [activeIdx, goTo])

  const next = useCallback(() => {
    setImages(imgs => {
      const newIdx = (activeIdx + 1) % imgs.length
      goTo(newIdx, 1)
      return imgs
    })
  }, [activeIdx, goTo])

  // Auto-advance
  useEffect(() => {
    if (images.length < 2) return
    intervalRef.current = setInterval(() => {
      setActiveIdx(prev => {
        setDirection(1)
        return (prev + 1) % images.length
      })
    }, INTERVAL_MS)
    return () => clearInterval(intervalRef.current)
  }, [images.length])

  // Scroll active thumbnail into view
  useEffect(() => {
    if (thumbRefs.current[activeIdx]) {
      thumbRefs.current[activeIdx].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
    }
  }, [activeIdx])

  const variants = {
    enter: (dir) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
  }

  return (
    <section id="highlights" className="relative overflow-hidden bg-gradient-to-b from-white via-brand-cyan-light/10 to-white" ref={ref}>
      <div className="absolute inset-0 noise-overlay pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
        {/* Header */}
        <div className="mb-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 mb-3"
          >
            <div className="gradient-line w-12" />
            <span className="font-mono text-[11px] font-semibold tracking-[0.25em] text-brand-cyan">GALLERY</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <span className="block font-hero text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              ABILITY CARNIVAL
            </span>
            <span className="block font-impact text-3xl tracking-[0.1em] gradient-text sm:text-4xl">
              HIGHLIGHTS
            </span>
          </motion.h2>
        </div>

        {/* Gallery Content */}
        {images.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="text-center py-20"
          >
            <div className="mx-auto max-w-md">
              <div className="mb-6">
                <svg className="mx-auto h-16 w-16 text-brand-cyan/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-hero text-2xl font-bold text-slateate-900 mb-4">Gallery Coming Soon</h3>
              <p className="text-slate-600 leading-relaxed">
                Event photos and highlights will be uploaded here after the Ability Carnival concludes.
                Check back soon to see the amazing moments captured during the event!
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            {/* Main Slideshow */}
            <div className="relative w-full overflow-hidden rounded-2xl bg-slate-900 shadow-2xl" style={{ aspectRatio: '16/9', maxHeight: '340px' }}>
              <AnimatePresence custom={direction} mode="popLayout">
                <motion.img
                  key={activeIdx}
                  src={images[activeIdx]?.src}
                  alt={images[activeIdx]?.alt}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0 h-full w-full object-contain"
                  draggable={false}
                />
              </AnimatePresence>

              {/* Caption overlay */}
              {images[activeIdx]?.alt && images[activeIdx].alt !== 'Gallery image' && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/80 to-transparent px-6 py-5">
                  <p className="font-hero text-sm font-bold text-white">{images[activeIdx].alt}</p>
                  <p className="font-mono text-[10px] tracking-widest text-white/50 mt-0.5">
                    {String(activeIdx + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
                  </p>
                </div>
              )}

              {/* Progress bar */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/10">
                <motion.div
                  key={activeIdx}
                  className="h-full bg-brand-cyan"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: INTERVAL_MS / 1000, ease: 'linear' }}
                />
              </div>
            </div>

            {/* Prev / Next arrows + counter */}
            <div className="flex items-center justify-center gap-4 mt-5">
              <button
                onClick={() => { clearInterval(intervalRef.current); prev() }}
                className="flex items-center justify-center h-11 w-11 rounded-full border-2 border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-brand-cyan hover:text-brand-cyan hover:shadow-md"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              {/* Dot indicators */}
              <div className="flex items-center gap-1.5">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { clearInterval(intervalRef.current); goTo(i, i > activeIdx ? 1 : -1) }}
                    className={`rounded-full transition-all duration-300 ${i === activeIdx ? 'w-5 h-2 bg-brand-cyan' : 'w-2 h-2 bg-slate-300 hover:bg-slate-400'}`}
                    aria-label={`Go to image ${i + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={() => { clearInterval(intervalRef.current); next() }}
                className="flex items-center justify-center h-11 w-11 rounded-full border-2 border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-brand-cyan hover:text-brand-cyan hover:shadow-md"
                aria-label="Next image"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {/* Thumbnail strip */}
            <div className="mt-5 flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide snap-x">
              {images.map((img, i) => (
                <button
                  key={i}
                  ref={el => thumbRefs.current[i] = el}
                  onClick={() => { clearInterval(intervalRef.current); goTo(i, i > activeIdx ? 1 : -1) }}
                  className={`flex-shrink-0 snap-start overflow-hidden rounded-xl transition-all duration-300 ${
                    i === activeIdx
                      ? 'ring-2 ring-brand-cyan ring-offset-2 scale-[1.05] opacity-100'
                      : 'opacity-60 hover:opacity-85'
                  }`}
                  style={{ width: 100, height: 68 }}
                  aria-label={`View image ${i + 1}`}
                >
                  <img src={img.src} alt={img.alt} className="h-full w-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  )
}
