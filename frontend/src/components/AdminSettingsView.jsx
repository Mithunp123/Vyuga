import { useState, useEffect } from 'react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function AdminSettingsView({ token }) {
  const [settings, setSettings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE}/api/form-settings`)
      const json = await res.json()
      if (!json.success) throw new Error(json.message)
      setSettings(json.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const toggleSetting = async (id, currentValue) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/form-settings/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token
        },
        body: JSON.stringify({ is_open: !currentValue })
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.message)
      
      setSettings(prev => prev.map(s => s.id === id ? { ...s, is_open: !currentValue } : s))
    } catch (err) {
      alert(`Failed to update setting: ${err.message}`)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-32 bg-white rounded-3xl shadow-sm border-2 border-slate-100">
      <div className="h-10 w-10 rounded-full border-4 animate-spin mr-4" style={{ borderColor: '#e0f6fa', borderTopColor: '#0197B2' }} />
      <span className="text-base font-semibold text-slate-600">Loading settings...</span>
    </div>
  )

  if (error) return (
    <div className="py-20 text-center bg-white rounded-3xl shadow-sm border-2 border-slate-100">
      <p className="text-red-600 text-base font-semibold mb-4">{error}</p>
      <button onClick={fetchSettings} className="rounded-full px-6 py-2.5 text-sm font-bold transition-all text-white shadow-md hover:shadow-lg hover:scale-105" style={{ backgroundColor: '#0197B2' }}>
        Try Again
      </button>
    </div>
  )

  return (
    <div className="max-w-4xl pt-6 pb-20">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Form Registration Controls</h2>
      <div className="space-y-4">
        {settings.map(s => (
          <div key={s.id} className="bg-white border-2 border-slate-100 rounded-2xl p-6 flex flex-col sm:flex-row shadow-sm justify-between items-start sm:items-center hover:shadow-md transition duration-300">
            <div>
              <h3 className="text-lg font-bold text-slate-800 tracking-wide">{s.name}</h3>
              <p className="text-sm text-slate-500 mt-1 uppercase tracking-wider font-semibold">
                Status: <span style={{ color: s.is_open ? '#16a34a' : '#dc2626' }}>{s.is_open ? 'OPEN' : 'LOCKED (CLOSED)'}</span>
              </p>
            </div>
            <button
              onClick={() => toggleSetting(s.id, s.is_open)}
              aria-label={`Toggle ${s.name} registration status`}
              className={`mt-4 sm:mt-0 relative inline-flex h-8 w-14 items-center rounded-full transition-colors cursor-pointer ${s.is_open ? 'bg-[#5BCB2B]' : 'bg-slate-300 hover:bg-slate-400'}`}
            >
              <span className={`inline-block h-6 w-6 transform bg-white rounded-full transition-transform shadow-md ${s.is_open ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>
        ))}
        {settings.length === 0 && (
           <div className="p-8 text-center text-slate-500 bg-white border-2 border-slate-100 rounded-3xl">No configuration variables tracked in database. Execute schema setup.</div>
        )}
      </div>
    </div>
  )
}
