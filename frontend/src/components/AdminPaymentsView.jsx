import { useState, useEffect, useMemo } from 'react'
import { Search, Receipt } from 'lucide-react'
import SubmitLoader from './SubmitLoader.jsx'

const EVENT_TYPE_MAP = {
  'innovation-college': 'Innovation (For Specially Abled)',
  'innovation-pwd': 'Innovation (By Specially Abled)',
  'shortfilm': 'Short Film Contest',
  'cricket': 'Blind Cricket',
  'specialtalent': 'Special Talent Utsav',
  'talent-combined': 'Talent Utsav – Nominations',
  'chess': 'Blind Chess',
}

const getEventName = (key) => EVENT_TYPE_MAP[key] || key

export default function AdminPaymentsView({ token }) {
  const [loading, setLoading] = useState(true)
  const [payments, setPayments] = useState([])
  const [error, setError] = useState('')
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [search, setSearch] = useState('')

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

  useEffect(() => {
    async function fetchPayments() {
      try {
        const res = await fetch(`${API_BASE}/api/admin/payments`, {
          headers: { 'x-admin-token': token },
        })
        const json = await res.json()
        if (!json.success) throw new Error(json.message)
        setPayments(json.data || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchPayments()
  }, [token, API_BASE])

  // Summarize the payments by event type
  const groupedEvents = useMemo(() => {
    const map = {}
    payments.forEach(p => {
      const type = p.event_type || 'Unknown'
      if (!map[type]) {
        map[type] = { type, count: 0, successCount: 0, failedCount: 0, totalPaise: 0, totalGstPaise: 0, users: [] }
      }
      map[type].count++
      if (p.status === 'paid') {
        map[type].successCount++
        map[type].totalPaise += parseInt(p.amount || 0, 10)
        map[type].totalGstPaise += parseInt(p.gst_amount || 0, 10)
      } else {
        map[type].failedCount++
      }
      map[type].users.push(p)
    })
    return Object.values(map)
  }, [payments])

  // Overall GST total across all events
  const overallGstPaise = useMemo(() =>
    payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + parseInt(p.gst_amount || 0, 10), 0),
    [payments]
  )
  const overallRevenuePaise = useMemo(() =>
    payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + parseInt(p.amount || 0, 10), 0),
    [payments]
  )

  if (loading) return <div className="p-10"><SubmitLoader visible={true} /></div>
  if (error) return <div className="p-10 text-red-600 font-bold">Error: {error}</div>

  // Detailed view
  if (selectedEvent) {
    const list = selectedEvent.users.filter(u => {
      if (!search) return true
      const s = search.toLowerCase()
      return (u.payer_name?.toLowerCase().includes(s) || 
              u.payer_email?.toLowerCase().includes(s) || 
              u.payer_phone?.toLowerCase().includes(s) ||
              u.razorpay_payment_id?.toLowerCase().includes(s))
    })

    const detailGst   = list.filter(p => p.status === 'paid').reduce((sum, p) => sum + parseInt(p.gst_amount || 0, 10), 0)
    const detailTotal = list.filter(p => p.status === 'paid').reduce((sum, p) => sum + parseInt(p.amount || 0, 10), 0)

    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <button 
              onClick={() => { setSelectedEvent(null); setSearch(''); }}
              className="text-sm font-semibold text-slate-500 hover:text-slate-800 mb-2 inline-flex items-center gap-1"
            >
              ← Back to summary
            </button>
            <h2 className="text-xl font-bold text-slate-800">
              {getEventName(selectedEvent.type)} ({selectedEvent.count} Total)
            </h2>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search users or payment ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-[#0197B2]"
            />
          </div>
        </div>

        {/* GST Summary Strip for selected event */}
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[140px] bg-white rounded-xl border border-slate-200 px-5 py-3 shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Total Revenue</p>
            <p className="text-xl font-extrabold text-slate-900">₹{(detailTotal / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
          </div>
          <div className="flex-1 min-w-[140px] bg-[#f0fdf9] rounded-xl border border-teal-100 px-5 py-3 shadow-sm">
            <p className="text-[10px] font-bold text-teal-500 uppercase tracking-wider mb-0.5 flex items-center gap-1"><Receipt className="w-3 h-3" /> GST Collected</p>
            <p className="text-xl font-extrabold text-[#0197B2]">₹{(detailGst / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
            <p className="text-[10px] text-teal-400">CGST + SGST @ 9% each</p>
          </div>
          <div className="flex-1 min-w-[140px] bg-white rounded-xl border border-slate-200 px-5 py-3 shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Base (Excl. GST)</p>
            <p className="text-xl font-extrabold text-slate-900">₹{((detailTotal - detailGst) / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-semibold w-12">#</th>
                <th className="px-4 py-3 font-semibold">User Details</th>
                <th className="px-4 py-3 font-semibold">Contact</th>
                <th className="px-4 py-3 font-semibold w-28">Base Amt</th>
                <th className="px-4 py-3 font-semibold w-24">GST (18%)</th>
                <th className="px-4 py-3 font-semibold w-28">Total</th>
                <th className="px-4 py-3 font-semibold w-32">Receipt No.</th>
                <th className="px-4 py-3 font-semibold">Razorpay ID</th>
                <th className="px-4 py-3 font-semibold w-24">Status</th>
                <th className="px-4 py-3 font-semibold w-32">Date</th>
                <th className="px-4 py-3 font-semibold w-32">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {list.length === 0 ? (
                <tr><td colSpan={11} className="px-4 py-8 text-center text-slate-500">No matching payments found.</td></tr>
              ) : list.map((p, i) => {
                const gstAmt   = parseInt(p.gst_amount || 0, 10)
                const total    = parseInt(p.amount || 0, 10)
                const baseAmt  = p.base_amount ? parseInt(p.base_amount, 10) : (total - gstAmt)
                return (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-slate-500">{i + 1}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{p.payer_name || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="text-slate-800">{p.payer_email || '—'}</div>
                      <div className="text-xs text-slate-500">{p.payer_phone || '—'}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">₹{(baseAmt / 100).toFixed(2)}</td>
                    <td className="px-4 py-3 font-medium text-[#0197B2]">₹{(gstAmt / 100).toFixed(2)}</td>
                    <td className="px-4 py-3 font-bold text-green-600">₹{(total / 100).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded">
                        {p.invoice_number || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 font-mono bg-slate-100 rounded px-2 py-1 mx-4 my-2 inline-block">
                      {p.razorpay_payment_id || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${p.status === 'paid' ? 'bg-[#e8f9de] text-[#16a34a]' : 'bg-red-50 text-red-600'}`}>
                        {p.status || 'failed'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3">
                      {p.invoice_link ? (
                        <a
                          href={p.invoice_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-gradient-to-r from-[#0197B2] to-[#5BCB2B] text-white hover:shadow-md hover:scale-[1.03] transition-all duration-200 whitespace-nowrap"
                        >
                          View Invoice
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No invoice</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // Summary View
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">Event Payment Summary</h2>
      </div>

      {/* Overall GST Summary Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 px-6 py-4 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Total Revenue</p>
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
            ₹{(overallRevenuePaise / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
        </div>
        <div className="bg-gradient-to-br from-[#0197B2]/10 to-[#5BCB2B]/10 rounded-xl border border-teal-100 px-6 py-4 shadow-sm">
          <p className="text-[10px] font-bold text-[#0197B2] uppercase tracking-wider mb-0.5 flex items-center gap-1">
            <Receipt className="w-3 h-3" /> Total GST Collected
          </p>
          <div className="text-3xl font-extrabold text-[#0197B2] tracking-tight">
            ₹{(overallGstPaise / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">CGST + SGST @ 9% each</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 px-6 py-4 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Base Revenue (Excl. GST)</p>
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
            ₹{((overallRevenuePaise - overallGstPaise) / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {groupedEvents.map(ev => (
          <div 
            key={ev.type} 
            onClick={() => { setSelectedEvent(ev); setSearch(''); }}
            className="group cursor-pointer rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-[#0197B2]/50 transition-all block"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-slate-800 leading-tight pr-4 group-hover:text-[#0197B2] transition-colors">
                {getEventName(ev.type)}
              </h3>
              <div className="bg-[#e8f9de] text-[#16a34a] px-2 py-0.5 rounded text-xs font-bold whitespace-nowrap border border-green-100">
                {ev.successCount} Paid
              </div>
            </div>
            
            <div className="flex items-end justify-between mt-2">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Revenue</p>
                <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  ₹{(ev.totalPaise / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </div>
                <div className="text-[10px] text-[#0197B2] font-semibold mt-0.5 flex items-center gap-1">
                  <Receipt className="w-3 h-3" />
                  GST: ₹{(ev.totalGstPaise / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {ev.failedCount > 0 && (
                  <div className="text-right flex flex-col items-end">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Failed</span>
                    <span className="text-sm font-bold text-red-500">{ev.failedCount}</span>
                  </div>
                )}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[#0197B2] ml-1">
                  →
                </div>
              </div>
            </div>
          </div>
        ))}
        {groupedEvents.length === 0 && (
          <div className="col-span-full border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center text-slate-500 font-medium bg-slate-50">
            No payments recorded yet.
          </div>
        )}
      </div>
    </div>
  )
}
