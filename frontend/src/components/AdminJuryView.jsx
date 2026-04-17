import React, { useState, useEffect } from 'react'
import { Trash2, UserPlus, FileSignature, CheckCircle } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function AdminJuryView({ token }) {
  const [juries, setJuries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [newUsername, setNewUsername] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newName, setNewName] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newOrganization, setNewOrganization] = useState('')
  const [newDesignation, setNewDesignation] = useState('')

  // Stats State
  const [stats, setStats] = useState({})

  // Allocation State
  const [allocJuryId, setAllocJuryId] = useState('')
  const [allocEvent, setAllocEvent] = useState('')
  const [allocCount, setAllocCount] = useState('')
  const [allocSuccess, setAllocSuccess] = useState('')
  const [allocError, setAllocError] = useState('')

  const TABS = [
    { id: 'innovation-college', label: 'Innovation (For Specially Abled)' },
    { id: 'innovation-pwd',     label: 'Innovation (By Specially Abled)' },
    { id: 'talent-student',     label: 'Talent Utsav – Nominations' },
    { id: 'shortfilm',          label: 'Short Film Contest' },
  ]

  const fetchJuriesAndStats = async () => {
    setLoading(true)
    setError(null)
    try {
      const [juryRes, statsRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/jury`, { headers: { 'x-admin-token': token } }),
        fetch(`${API_BASE}/api/admin/jury/stats`, { headers: { 'x-admin-token': token } })
      ])
      
      const juryData = await juryRes.json()
      const statsData = await statsRes.json()
      
      if (!juryRes.ok) throw new Error(juryData.message || 'Failed to fetch juries')
      if (!statsRes.ok) throw new Error(statsData.message || 'Failed to fetch stats')
      
      setJuries(juryData.data || [])
      setStats(statsData.data || {})
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) fetchJuriesAndStats()
  }, [token])

  const handleCreateJury = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch(`${API_BASE}/api/admin/jury`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token
        },
        body: JSON.stringify({ 
          username: newUsername, 
          password: newPassword,
          name: newName,
          phone: newPhone,
          organization: newOrganization,
          designation: newDesignation
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to create jury')
      setNewUsername('')
      setNewPassword('')
      setNewName('')
      setNewPhone('')
      setNewOrganization('')
      setNewDesignation('')
      fetchJuriesAndStats()
    } catch (err) {
      alert(err.message)
    }
  }

  const handleDeleteJury = async (id) => {
    if (!window.confirm('Are you sure you want to delete this Jury?')) return
    try {
      const res = await fetch(`${API_BASE}/api/admin/jury/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-token': token }
      })
      if (!res.ok) throw new Error('Failed to delete jury')
      fetchJuriesAndStats()
    } catch (err) {
      alert(err.message)
    }
  }

  const handleAllocate = async (e) => {
    e.preventDefault()
    setAllocSuccess('')
    setAllocError('')
    if (!allocJuryId || !allocEvent || !allocCount) return

    try {
      const res = await fetch(`${API_BASE}/api/admin/jury/allocate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token
        },
        body: JSON.stringify({
          juryId: allocJuryId,
          eventType: allocEvent,
          count: allocCount
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Allocation failed')
      setAllocSuccess(data.message)
      setAllocCount('')
      fetchJuriesAndStats()
    } catch (err) {
      setAllocError(err.message)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
      
      {/* Event Stats Summary */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800 mb-6 px-1">Registrations Overview</h2>
        {loading && Object.keys(stats).length === 0 ? (
          <p className="text-slate-500 text-sm">Loading stats...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {TABS.map(tab => {
              const s = stats[tab.id] || { total: 0, allocated: 0, unassigned: 0 }
              return (
                <div key={tab.id} className="rounded-xl border border-slate-100 bg-slate-50 p-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-12 h-12 bg-[#0197B2] opacity-5 rounded-bl-full"></div>
                  <h3 className="font-bold text-slate-800 text-sm mb-3 h-10 line-clamp-2">{tab.label}</h3>
                  <div className="space-y-2 mt-auto text-xs">
                    <div className="flex justify-between items-center bg-white px-3 py-1.5 rounded-lg border border-slate-100 shadow-sm">
                      <span className="text-slate-500 font-medium">Total</span>
                      <span className="font-bold text-slate-800 text-sm">{s.total}</span>
                    </div>
                    <div className="flex justify-between items-center bg-white px-3 py-1.5 rounded-lg border border-emerald-100 shadow-sm">
                      <span className="text-emerald-600 font-medium">Allocated</span>
                      <span className="font-bold text-emerald-700 text-sm">{s.allocated}</span>
                    </div>
                    <div className="flex justify-between items-center bg-white px-3 py-1.5 rounded-lg border border-amber-100 shadow-sm">
                      <span className="text-amber-600 font-medium">Yet to Assign</span>
                      <span className="font-bold text-amber-700 text-sm">{s.unassigned}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Create Jury Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
            <div className="p-2.5 bg-cyan-50 rounded-xl">
              <UserPlus className="h-5 w-5 text-cyan-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Create Jury Account</h2>
              <p className="text-sm text-slate-500">Provide login credentials for evaluators</p>
            </div>
          </div>

          <form onSubmit={handleCreateJury} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Username</label>
              <input
                type="text"
                required
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition-colors focus:border-cyan-500"
                placeholder="e.g., jury_innovation_1"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
              <input
                type="text"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition-colors focus:border-cyan-500"
                placeholder="Secure password"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Name</label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition-colors focus:border-cyan-500"
                placeholder="Jury's Full Name"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="tel"
                required
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value.replace(/\D/g, ''))}
                maxLength="10"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition-colors focus:border-cyan-500"
                placeholder="10-digit mobile number"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Organization</label>
              <input
                type="text"
                required
                value={newOrganization}
                onChange={(e) => setNewOrganization(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition-colors focus:border-cyan-500"
                placeholder="E.g. XYZ Corp"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Designation</label>
              <input
                type="text"
                required
                value={newDesignation}
                onChange={(e) => setNewDesignation(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition-colors focus:border-cyan-500"
                placeholder="E.g. Senior Adjudicator"
              />
            </div>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-slate-800 hover:shadow-lg focus:ring-4 focus:ring-slate-900/20"
            >
              <UserPlus className="h-4 w-4" />
              Create Jury
            </button>
          </form>
        </div>

        {/* Allocate Registrations Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
            <div className="p-2.5 bg-emerald-50 rounded-xl">
              <FileSignature className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Allocate Registrations</h2>
              <p className="text-sm text-slate-500">Assign unassigned registrations to a jury</p>
            </div>
          </div>

          <form onSubmit={handleAllocate} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Select Jury</label>
              <select
                required
                value={allocJuryId}
                onChange={(e) => setAllocJuryId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition-colors focus:border-emerald-500"
              >
                <option value="">— Select a Jury —</option>
                {juries.map(j => (
                  <option key={j.id} value={j.id}>{j.username}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Select Event Category</label>
              <select
                required
                value={allocEvent}
                onChange={(e) => setAllocEvent(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition-colors focus:border-emerald-500"
              >
                <option value="">— Select Event —</option>
                {TABS.map(t => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Number of Registrations to Assign</label>
              <input
                type="number"
                required
                min="1"
                max="100"
                value={allocCount}
                onChange={(e) => setAllocCount(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition-colors focus:border-emerald-500"
                placeholder="e.g., 10"
              />
            </div>
            {allocSuccess && (
              <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                <CheckCircle className="h-4 w-4" /> {allocSuccess}
              </div>
            )}
            {allocError && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
                {allocError}
              </div>
            )}
            <button
              type="submit"
              disabled={!juries.length}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-emerald-600 hover:shadow-lg focus:ring-4 focus:ring-emerald-500/20 disabled:opacity-50"
            >
              <FileSignature className="h-4 w-4" />
              Allocate
            </button>
          </form>
        </div>
      </div>

      {/* Juries List */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800 mb-6">Existing Jury Accounts</h2>
        {loading ? (
          <p className="text-slate-500 text-sm">Loading...</p>
        ) : error ? (
          <p className="text-red-500 text-sm">{error}</p>
        ) : juries.length === 0 ? (
          <p className="text-slate-500 text-sm">No jury accounts found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-slate-100">
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Username</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Details</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase flex-1">Allocations</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody>
                {juries.map(j => (
                  <tr key={j.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="px-4 py-4 text-sm font-medium text-slate-700">{j.username}</td>
                    <td className="px-4 py-4 text-sm font-semibold text-slate-800">{j.name || '—'}</td>
                    <td className="px-4 py-4 text-xs text-slate-600">
                      <div>{j.designation || '—'}</div>
                      <div className="text-slate-400">{j.organization || '—'}</div>
                      <div className="text-[#0197B2] font-medium mt-0.5">{j.phone || '—'}</div>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-500">
                      {j.allocations && Object.keys(j.allocations).length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(j.allocations).map(([event, count]) => {
                            const lbl = TABS.find(t => t.id === event)?.label || event
                            return (
                              <span key={event} className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800 border border-slate-200">
                                {lbl}: <strong className="ml-1 text-[#0197B2]">{count}</strong>
                              </span>
                            )
                          })}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-xs">None</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={() => handleDeleteJury(j.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Jury"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
