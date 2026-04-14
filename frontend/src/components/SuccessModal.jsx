import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function SuccessModal({ isOpen, onClose, title, message, nextAction }) {
  const navigate = useNavigate()

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-white p-8 text-center shadow-2xl"
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="mb-2 font-display text-xl font-bold text-slate-900">{title}</h3>
            <p className="mb-6 text-sm text-slate-500">{message}</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  onClose()
                  navigate('/')
                }}
                className="w-full rounded-full bg-[#0197B2] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#01788e]"
              >
                OK
              </button>
              {nextAction && (
                <button
                  onClick={() => {
                    onClose()
                    navigate(nextAction.path)
                  }}
                  className="w-full rounded-full border border-[#0197B2] px-6 py-2.5 text-sm font-bold text-[#0197B2] transition hover:bg-[#0197B2]/5"
                >
                  {nextAction.label}
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
