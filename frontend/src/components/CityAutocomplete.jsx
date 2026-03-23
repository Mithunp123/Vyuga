import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin } from 'lucide-react'
import CITIES from '../data/cities.json'

export default function CityAutocomplete({ value, onChange, required, label = "City" }) {
  const [query, setQuery] = useState(value || '')
  const [isOpen, setIsOpen] = useState(false)
  const [filtered, setFiltered] = useState([])
  const wrapperRef = useRef(null)

  // Sync internal query with external value if it changes externally
  useEffect(() => {
    setQuery(value || '')
  }, [value])

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Filter cities efficiently
  useEffect(() => {
    if (!query) {
      setFiltered([])
      return
    }
    // Only show suggestions if query length >= 2
    if (query.length < 2) {
      setFiltered([])
      return
    }

    const lower = query.toLowerCase()
    // Limit to top 20 matches for performance
    const matches = CITIES.filter(c => c.toLowerCase().includes(lower)).slice(0, 20)
    setFiltered(matches)
  }, [query])

  const handleInputChange = (e) => {
    const val = e.target.value
    setQuery(val)
    onChange(val) // Propagate change immediately (allows custom values)
    setIsOpen(true)
  }

  const handleSelect = (city) => {
    setQuery(city)
    onChange(city)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={wrapperRef}>
      <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-brand-cyan">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <div className="relative">
        <input
          type="text"
          required={required}
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(query.length >= 2)}
          placeholder="Start typing city..."
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 pl-10 text-sm text-slate-800 focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-cyan/20 transition-all shadow-sm"
          autoComplete="off"
        />
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
      </div>

      <AnimatePresence>
        {isOpen && filtered.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-slate-100 bg-white shadow-xl py-1 custom-scrollbar"
          >
            {filtered.map((city) => (
              <li
                key={city}
                onClick={() => handleSelect(city)}
                className="cursor-pointer px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-brand-cyan transition-colors flex items-center gap-2"
              >
                <MapPin className="h-3.5 w-3.5 opacity-50" />
                {city}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}