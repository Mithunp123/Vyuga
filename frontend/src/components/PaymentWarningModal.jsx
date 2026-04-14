import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'

export default function PaymentWarningModal({ isOpen, onProceed, onCancel }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-white p-8 text-center shadow-2xl"
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
              <AlertTriangle className="h-8 w-8 text-amber-500" />
            </div>
            <h3 className="mb-2 font-display text-xl font-bold text-slate-900">Payment Processing</h3>
            <p className="mb-6 text-sm text-slate-500">
              Please do not refresh or close this tab while the payment is processing. After a successful payment, please wait for the page to redirect back to our site.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={onProceed}
                className="w-full rounded-full bg-[#0197B2] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#01788e]"
              >
                OK, Proceed to Payment
              </button>
              <button
                onClick={onCancel}
                className="w-full rounded-full border border-slate-300 px-6 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
