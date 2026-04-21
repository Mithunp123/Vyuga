import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'

export default function PaymentWarningModal({ isOpen, onProceed, onCancel, fee, gstFee, totalFee }) {
  const baseAmount = Number.isFinite(Number(fee)) ? Number(fee) : 0
  const gstAmount = Number.isFinite(Number(gstFee)) ? Number(gstFee) : 0
  const finalAmount = Number.isFinite(Number(totalFee)) ? Number(totalFee) : baseAmount + gstAmount

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
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <AlertTriangle className="h-8 w-8 text-[#0197B2]" />
            </div>
            <h3 className="mb-2 font-display text-xl font-bold text-slate-900">Payment Summary</h3>
            
            {(baseAmount > 0 || gstAmount > 0 || finalAmount > 0) && (
              <div className="mb-6 rounded-xl border border-slate-100 bg-slate-50 p-4 text-left">
                <div className="flex justify-between text-sm text-slate-600 mb-2">
                  <span>Base Amount</span>
                  <span className="font-medium">₹{baseAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600 mb-3 border-b border-slate-200 pb-3">
                  <span>GST (18%)</span>
                  <span className="font-medium">₹{gstAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-slate-900">
                  <span>Total Amount</span>
                  <span className="text-[#0197B2]">₹{finalAmount.toFixed(2)}</span>
                </div>
              </div>
            )}

            <p className="mb-6 text-xs text-slate-500">
              Please do not refresh or close this tab while the payment is processing.
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
