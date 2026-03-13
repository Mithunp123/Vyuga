import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { galleryImages } from '../data/homeData.js'

const _motion = motion

export default function Gallery() {
  const images = useMemo(() => galleryImages, [])
  const [activeIdx, setActiveIdx] = useState(null)

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
    <section id="highlights" className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        <motion.h2
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.45 }}
          className="font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl"
        >
          Conference Highlights Gallery
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.45, delay: 0.04 }}
          className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base"
        >
          Moments from keynotes, workshops, networking, and the exhibitor floor.
        </motion.p>

        <div className="mt-10 [column-gap:1.25rem] sm:[column-count:2] lg:[column-count:3]">
          {images.map((img, idx) => (
            <button
              key={`${img.src}-${idx}`}
              type="button"
              className="mb-5 block w-full break-inside-avoid overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-1"
              onClick={() => setActiveIdx(idx)}
              aria-label={`Open image: ${img.alt}`}
            >
              <div className="group relative overflow-hidden">
                <img
                  src={img.src}
                  alt={img.alt}
                  loading="lazy"
                  decoding="async"
                  className="h-auto w-full object-cover transition duration-500 group-hover:scale-110"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-80" />
                <div className="pointer-events-none absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-xs font-semibold text-white/95">{img.alt}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {active ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] grid place-items-center bg-black/70 p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Image preview"
            onClick={() => setActiveIdx(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.22 }}
              className="relative w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
                <p className="truncate text-sm font-semibold text-slate-900">{active.alt}</p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 hover:bg-slate-50"
                    onClick={() =>
                      setActiveIdx((v) => (v === null ? v : (v - 1 + images.length) % images.length))
                    }
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 hover:bg-slate-50"
                    onClick={() => setActiveIdx((v) => (v === null ? v : (v + 1) % images.length))}
                  >
                    Next
                  </button>
                  <button
                    type="button"
                    className="rounded-lg bg-brand-cyan px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#017F96]"
                    onClick={() => setActiveIdx(null)}
                  >
                    Close
                  </button>
                </div>
              </div>
              <div className="relative">
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

