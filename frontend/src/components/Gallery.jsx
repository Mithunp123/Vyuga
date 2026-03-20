import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView } from 'framer-motion'
import { galleryImages } from '../data/homeData.js'
import { ChevronLeft, ChevronRight, X as XIcon } from 'lucide-react'

export default function Gallery() {
  const images = useMemo(() => galleryImages, [])
  const [activeIdx, setActiveIdx] = useState(null)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.1 })

  useEffect(() => {
    if (activeIdx === null) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setActiveIdx(null)
      if (e.key === 'ArrowRight') setActiveIdx((v) => (v === null ? v : (v + 1) % images.length))
      if (e.key === 'ArrowLeft')
        setActiveIdx((v) => (v === null ? v : (v - 1 + images.length) % images.length))
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [activeIdx, images.length])

  const active = activeIdx === null ? null : images[activeIdx]

  return (
    <section id="highlights" className="relative overflow-hidden bg-gradient-to-b from-white via-brand-cyan-light/10 to-white" ref={ref}>
      {/* Noise */}
      <div className="absolute inset-0 noise-overlay pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2"
            >
              <div className="gradient-line w-12" />
              <span className="font-mono text-[11px] font-semibold tracking-[0.25em] text-brand-cyan">
                GALLERY
              </span>
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
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="max-w-xs text-sm leading-relaxed text-slate-500"
          >
            Images from the event will be uploaded here after the Ability Carnival concludes.
          </motion.p>
        </div>

        {/* Gallery Content */}
        <div className="mt-14">
          {images.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-center py-20"
            >
              <div className="mx-auto max-w-md">
                <div className="mb-6">
                  <svg 
                    className="mx-auto h-16 w-16 text-brand-cyan/30" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={1.5} 
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                    />
                  </svg>
                </div>
                <h3 className="font-hero text-2xl font-bold text-slate-900 mb-4">
                  Gallery Coming Soon
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Event photos and highlights will be uploaded here after the Ability Carnival concludes. 
                  Check back soon to see the amazing moments captured during the event!
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="[column-gap:1rem] sm:[column-count:2] lg:[column-count:3]">
              {images.map((img, idx) => (
                <motion.button
                  key={`${img.src}-${idx}`}
                  initial={{ opacity: 0, y: 40 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.7, delay: 0.1 + idx * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  type="button"
                  className="mb-4 block w-full break-inside-avoid overflow-hidden rounded-2xl text-left transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-brand-cyan/10"
                  onClick={() => setActiveIdx(idx)}
                  aria-label={`Open image: ${img.alt}`}
                >
                  <div className="group relative overflow-hidden">
                    <img
                      src={img.src}
                      alt={img.alt}
                      loading="lazy"
                      decoding="async"
                      className="h-auto w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                    <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                      <p className="font-mono text-[10px] tracking-widest text-white/60">
                        {String(idx + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
                      </p>
                      <p className="mt-1 font-hero text-sm font-bold text-white">{img.alt}</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {active ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] grid place-items-center bg-slate-900/90 p-4 backdrop-blur-xl"
            role="dialog"
            aria-modal="true"
            aria-label="Image preview"
            onClick={() => setActiveIdx(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.92 }}
              transition={{ duration: 0.4, type: 'spring', stiffness: 100 }}
              className="relative w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
                <p className="truncate font-hero text-sm font-bold text-slate-900">{active.alt}</p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-slate-600 transition hover:bg-slate-100"
                    onClick={() =>
                      setActiveIdx((v) => (v === null ? v : (v - 1 + images.length) % images.length))
                    }
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-slate-600 transition hover:bg-slate-100"
                    onClick={() => setActiveIdx((v) => (v === null ? v : (v + 1) % images.length))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="shimmer-btn rounded-xl px-3.5 py-2 text-white transition hover:opacity-90"
                    onClick={() => setActiveIdx(null)}
                  >
                    <XIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="bg-slate-50">
                <img
                  src={active.src}
                  alt={active.alt}
                  className="max-h-[75vh] w-full object-contain"
                  loading="eager"
                  decoding="async"
                />
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  )
}

