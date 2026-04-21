import { useEffect, useRef, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('checking') // 'checking' | 'success' | 'pending'
  const verifyRequestedRef = useRef(false)
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

  // Razorpay sends these query params on callback
  const invoiceId   = searchParams.get('razorpay_invoice_id')
  const paymentId   = searchParams.get('razorpay_payment_id')
  const invoiceStatus = searchParams.get('razorpay_invoice_status') // 'paid' or 'partially_paid'

  useEffect(() => {
    async function verifyPayment() {
      // If Razorpay marked invoice as paid, show success immediately
      if (invoiceStatus === 'paid' || paymentId) {
        setStatus('success')
        
        // Call backend to ensure DB is updated and emails are sent immediately
        // (This acts as a solid fallback if the webhook is delayed or blocked)
        if (invoiceId && !verifyRequestedRef.current) {
          verifyRequestedRef.current = true
          try {
            const verifyRes = await fetch(`${API_BASE}/api/payment/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_invoice_id: invoiceId,
                razorpay_payment_id: paymentId
              })
            })
            if (!verifyRes.ok) {
              const msg = await verifyRes.text()
              console.error('Payment verify API failed:', verifyRes.status, msg)
            }
          } catch (error) {
            console.error('Failed to send verification to server:', error)
          }
        }
      } else {
        // Could be cancelled or still processing
        setStatus('pending')
      }
    }
    
    verifyPayment()
  }, [invoiceStatus, paymentId, invoiceId])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50 flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-slate-100 overflow-hidden"
      >
        {/* Header gradient banner */}
        <div className="h-2 bg-gradient-to-r from-[#0197B2] to-[#5BCB2B]" />

        <div className="p-10 text-center">
          {status === 'checking' && (
            <Loader2 className="mx-auto h-16 w-16 text-[#0197B2] animate-spin mb-6" />
          )}

          {status === 'success' && (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
              >
                <CheckCircle className="mx-auto h-20 w-20 text-[#5BCB2B] mb-6" strokeWidth={1.5} />
              </motion.div>
              <h1 className="text-3xl font-extrabold text-slate-800 mb-3">
                Payment Successful! 🎉
              </h1>
              <p className="text-slate-500 text-base mb-2">
                Your registration is now <strong className="text-[#5BCB2B]">confirmed</strong>.
              </p>
              <p className="text-slate-400 text-sm mb-8">
                A GST tax invoice with payment details will be sent to your registered email shortly.
              </p>

              {/* Details */}
              {paymentId && (
                <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 mb-8 text-left space-y-2">
                  {invoiceId && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Invoice ID</span>
                      <span className="font-mono text-slate-700 text-xs">{invoiceId}</span>
                    </div>
                  )}
                  {paymentId && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Payment ID</span>
                      <span className="font-mono text-slate-700 text-xs">{paymentId}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => navigate('/')}
                  className="rounded-full bg-gradient-to-r from-[#0197B2] to-[#5BCB2B] px-8 py-3 font-bold text-white shadow-md hover:opacity-90 transition-all hover:scale-105"
                >
                  Back to Home
                </button>
                <button
                  onClick={() => window.open('https://mail.google.com/mail/u/0/#inbox', '_blank', 'noopener,noreferrer')}
                  className="rounded-full border-2 border-slate-200 px-8 py-3 font-bold text-slate-600 hover:border-[#0197B2] hover:text-[#0197B2] transition-all"
                >
                  Open Mail
                </button>
              </div>
            </>
          )}

          {status === 'pending' && (
            <>
              <AlertCircle className="mx-auto h-16 w-16 text-amber-400 mb-6" strokeWidth={1.5} />
              <h1 className="text-2xl font-extrabold text-slate-800 mb-3">
                Payment Pending
              </h1>
              <p className="text-slate-500 text-sm mb-8">
                Your payment is being processed. If the amount was deducted from your account,
                your registration will be confirmed automatically within a few minutes and you'll receive a confirmation email.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => navigate('/')}
                  className="rounded-full bg-[#0197B2] px-8 py-3 font-bold text-white shadow-md hover:bg-[#01788e] transition-all"
                >
                  Back to Home
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-100 px-8 py-4 text-center">
          <p className="text-xs text-slate-400">
            Having issues? Email us at{' '}
            <a href="mailto:vyuga@nexyugainnovations.com" className="text-[#0197B2] hover:underline">
              vyuga@nexyugainnovations.com
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
