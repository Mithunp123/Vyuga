import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, CheckCircle, XCircle, RefreshCw, AlertTriangle, Eye } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function ErrorLogs() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedLog, setSelectedLog] = useState(null)
  
  // Check session storage on mount
  useEffect(() => {
    const storedAuth = sessionStorage.getItem('vyuga_dev_auth')
    if (storedAuth) {
      setPassword(storedAuth)
      setIsAuthenticated(true)
      fetchLogs(storedAuth)
    }
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      // Validate locally first (optional, but good UX)
      // Check against server endpoint
      const res = await fetch(`${API_BASE}/api/dev/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })
      
      const data = await res.json()
      
      if (data.success) {
        setIsAuthenticated(true)
        sessionStorage.setItem('vyuga_dev_auth', password)
        fetchLogs(password)
      } else {
        setError(data.message || 'Invalid password')
      }
    } catch (err) {
      setError('Connection error')
    } finally {
      setLoading(false)
    }
  }

  const fetchLogs = async (token) => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/dev/error-logs?limit=100`, {
        headers: { 'x-dev-auth': token }
      })
      const data = await res.json()
      if (data.success) {
        setLogs(data.data || [])
      } else {
        setError(data.message)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`${API_BASE}/api/dev/error-logs/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'x-dev-auth': password 
        },
        body: JSON.stringify({ status })
      })
      if (res.ok) {
        setLogs(logs.map(log => log.id === id ? { ...log, status } : log))
      }
    } catch (err) {
      console.error(err)
    }
  }

  const deleteLog = async (id) => {
    if (!window.confirm('Are you sure you want to delete this log?')) return
    
    try {
      const res = await fetch(`${API_BASE}/api/dev/error-logs/${id}`, {
        method: 'DELETE',
        headers: { 'x-dev-auth': password }
      })
      if (res.ok) {
        setLogs(logs.filter(log => log.id !== id))
        if (selectedLog?.id === id) setSelectedLog(null)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit'
    })
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-100"
        >
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-800">Developer Access</h1>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Access Code"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all text-center tracking-widest text-lg"
                maxLength={4}
              />
            </div>
            
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center font-medium">
                {error}
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Access Logs'}
            </button>
          </form>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-amber-500 h-6 w-6" />
            <h1 className="text-lg font-bold text-slate-800">System Error Logs</h1>
            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-mono">
              {logs.length} events
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => fetchLogs(password)}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={() => {
                sessionStorage.removeItem('vyuga_dev_auth')
                setIsAuthenticated(false)
                setPassword('')
              }}
              className="text-xs font-bold text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Logs Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase text-slate-500 font-semibold">
                <tr>
                  <th className="px-6 py-4">Time</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Source / Endpoint</th>
                  <th className="px-6 py-4">Message</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                      No error logs found. System is healthy!
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr 
                      key={log.id} 
                      className={`hover:bg-slate-50 transition-colors ${selectedLog?.id === log.id ? 'bg-blue-50/50' : ''}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-mono text-xs">
                        {formatDate(log.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                          ${log.status === 'checked' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                          {log.status || 'new'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded">
                          {log.error_type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-700">{log.method}</span>
                          <span className="text-slate-500 text-xs font-mono truncate max-w-[200px]" title={log.endpoint}>
                            {log.endpoint}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <p className="truncate text-slate-700 font-medium" title={log.message}>
                          {log.message}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedLog(log)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          
                          {log.status !== 'checked' ? (
                            <button
                              onClick={() => updateStatus(log.id, 'checked')}
                              className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                              title="Mark as Checked"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => updateStatus(log.id, 'new')}
                              className="p-1.5 text-green-600 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                              title="Mark as New"
                            >
                              <RefreshCw className="h-4 w-4" />
                            </button>
                          )}
                          
                          <button
                            onClick={() => deleteLog(log.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete Log"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Details Modal */}
      <AnimatePresence>
        {selectedLog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
            onClick={() => setSelectedLog(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-3xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-100"
            >
              <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between" style={{ background: 'linear-gradient(to right, #f8fafc, #fff)' }}>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-50 rounded-lg text-red-500">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">Error Diagnostics</h3>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">ID: {selectedLog.id.split('-')[0]}...</p>
                  </div>
                </div>
                <button onClick={() => setSelectedLog(null)} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                  <XCircle className="h-8 w-8" />
                </button>
              </div>
              
              <div className="p-8 overflow-y-auto custom-scrollbar bg-white">
                <div className="grid gap-8">
                  {/* Basic Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <p className="text-[10px] uppercase text-slate-400 font-bold tracking-widest mb-1.5">Timestamp</p>
                      <p className="font-mono text-sm font-semibold text-slate-700">{formatDate(selectedLog.created_at)}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <p className="text-[10px] uppercase text-slate-400 font-bold tracking-widest mb-1.5">Error Type</p>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-slate-200 text-slate-700 font-mono">
                        {selectedLog.error_type}
                      </span>
                    </div>
                  </div>

                  {/* Request Info */}
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                       <RefreshCw className="h-24 w-24" />
                    </div>
                    <p className="text-[10px] uppercase text-slate-400 font-bold tracking-widest mb-4">Request Context</p>
                    <div className="space-y-3 relative z-10">
                      <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 text-sm">
                        <span className="text-xs font-bold uppercase text-slate-500 min-w-[100px]">Endpoint</span>
                        <span className="font-mono bg-white px-2 py-1 rounded border border-slate-200 text-slate-700 font-semibold shadow-sm">
                          <span className="text-[#0197B2]">{selectedLog.method}</span> {selectedLog.endpoint}
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 text-sm">
                        <span className="text-xs font-bold uppercase text-slate-500 min-w-[100px]">Source</span>
                        <span className="text-slate-700 font-medium capitalize">{selectedLog.source}</span>
                      </div>
                      {selectedLog.ip_address && (
                        <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 text-sm">
                          <span className="text-xs font-bold uppercase text-slate-500 min-w-[100px]">IP Address</span>
                          <span className="font-mono text-slate-600 bg-slate-200/50 px-2 py-0.5 rounded">{selectedLog.ip_address}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Message & Stack */}
                  <div>
                    <p className="text-[10px] uppercase text-slate-400 font-bold tracking-widest mb-3">Error Message</p>
                    <div className="bg-red-50 p-5 rounded-2xl border border-red-100 text-red-700 font-mono text-sm break-words shadow-inner">
                      {selectedLog.message}
                    </div>
                  </div>

                  {selectedLog.stack && (
                    <div>
                      <p className="text-[10px] uppercase text-slate-400 font-bold tracking-widest mb-3">Stack Trace</p>
                      <div className="bg-slate-900 rounded-2xl p-1 shadow-inner overflow-hidden">
                        <pre className="text-slate-300 p-5 text-[11px] overflow-x-auto font-mono leading-relaxed custom-scrollbar max-h-60">
                          {selectedLog.stack}
                        </pre>
                      </div>
                    </div>
                  )}

                  {selectedLog.request_body && (
                    <div>
                      <p className="text-[10px] uppercase text-slate-400 font-bold tracking-widest mb-3">Request Body</p>
                      <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
                        <pre className="text-slate-600 p-5 text-xs overflow-x-auto font-mono">
                          {JSON.stringify(selectedLog.request_body, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="px-8 py-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-4">
                <button
                  onClick={() => {
                    deleteLog(selectedLog.id)
                    setSelectedLog(null)
                  }}
                  className="px-5 py-2.5 bg-white border-2 border-red-100 text-red-600 rounded-xl text-sm font-bold hover:bg-red-50 hover:border-red-200 transition-all shadow-sm"
                >
                  Delete Log
                </button>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="px-8 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
