import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.message || 'Invalid password')
      sessionStorage.setItem('vyuga_admin_token', json.token)
      navigate('/vyuga-admin/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #e0f6fa 0%, #ffffff 50%, #e8f9de 100%)' }}>
      {/* Blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full opacity-30" style={{ background: '#0197B2', filter: 'blur(80px)' }} />
        <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full opacity-20" style={{ background: '#5BCB2B', filter: 'blur(80px)' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="rounded-2xl shadow-2xl overflow-hidden bg-white">
          {/* Header */}
          <div className="px-8 py-8 text-center" style={{ background: 'linear-gradient(135deg, #0197B2 0%, #5BCB2B 100%)' }}>
            <img src="/logo.png" alt="VYUGA" className="h-12 mx-auto mb-3" onError={(e) => { e.target.style.display = 'none' }} />
            <h1 className="text-2xl font-extrabold text-white tracking-tight font-display">Admin Portal</h1>
            <p className="text-white/75 text-sm mt-1">VYUGA 2026 – Event Management</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 py-8 space-y-5">
            <div>
              <label className="block text-xs font-bold tracking-widest text-slate-500 uppercase mb-2">Admin Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter admin password"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 transition"
                style={{ '--tw-ring-color': '#0197B2' }}
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl py-3 text-sm font-bold text-white transition-opacity disabled:opacity-60"
              style={{ backgroundColor: '#0197B2' }}
            >
              {loading ? 'Verifying…' : 'Login →'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
