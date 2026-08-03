import React, { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Search, Clock } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function AdminCertificateView({ token }) {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all') // all, sent, failed

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/admin/certificate-logs/all`, {
        headers: { 'x-admin-token': token }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to fetch certificate logs')
      setLogs(data.logs || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      (log.recipient_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.recipient_email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.team_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.registration_id || '').toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === 'all' || log.status === filterStatus

    return matchesSearch && matchesStatus
  })

  const sentCount = logs.filter(l => l.status === 'sent').length
  const failedCount = logs.filter(l => l.status === 'failed').length
  const totalCount = logs.length

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col gap-2">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Generated</p>
          <p className="text-4xl font-extrabold text-slate-800">{totalCount}</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl shadow-sm flex flex-col gap-2">
          <p className="text-sm font-bold text-emerald-600 uppercase tracking-wider">Successfully Sent</p>
          <p className="text-4xl font-extrabold text-emerald-700">{sentCount}</p>
        </div>
        <div className="bg-rose-50 border border-rose-200 p-6 rounded-2xl shadow-sm flex flex-col gap-2">
          <p className="text-sm font-bold text-rose-600 uppercase tracking-wider">Failed / Errors</p>
          <p className="text-4xl font-extrabold text-rose-700">{failedCount}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex gap-2">
          {['all', 'sent', 'failed'].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all capitalize ${
                filterStatus === s 
                  ? 'bg-slate-800 text-white shadow-md' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, or team..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0197B2]/30 focus:border-[#0197B2] transition"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 font-medium animate-pulse">
            Fetching Certificate Logs...
          </div>
        ) : error ? (
          <div className="p-12 text-center text-rose-500 font-medium">
            {error}
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-500 font-medium">
            No certificate logs found matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Participant & Role</th>
                  <th className="px-6 py-4">Event & Position</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Sent At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log, i) => (
                  <tr key={log.id || i} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-800">{log.recipient_name}</p>
                      <p className="text-xs text-slate-500">{log.recipient_email}</p>
                      {log.team_name && <p className="text-[10px] text-slate-400 mt-1 uppercase font-semibold">{log.team_name}</p>}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-slate-700 capitalize">{log.event_type.replace('-', ' ')}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#0197B2]/10 text-[#0197B2] border border-[#0197B2]/20">
                        {log.position_title || 'Participant'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {log.status === 'sent' ? (
                        <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full w-max border border-emerald-200">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span className="text-xs font-bold">Sent</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full w-max border border-rose-200" title={log.error_message}>
                          <XCircle className="w-3.5 h-3.5" />
                          <span className="text-xs font-bold">Failed</span>
                        </div>
                      )}
                      {log.error_message && (
                        <p className="text-[10px] text-rose-500 mt-1 max-w-[200px] truncate">{log.error_message}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-500">
                      {log.sent_at ? new Date(log.sent_at).toLocaleString() : 'N/A'}
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
