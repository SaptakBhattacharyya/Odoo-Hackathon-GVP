import { useState, useEffect } from 'react'
import api from '../services/api'
import Modal from '../components/Modal'
import { useToast } from '../components/Toast'

const sts = { 'In Progress': 'bg-blue-50 text-blue-600', Completed: 'bg-emerald-50 text-emerald-600', Scheduled: 'bg-amber-50 text-amber-600' }
const prc = { High: 'bg-red-50 text-red-600', Medium: 'bg-amber-50 text-amber-600', Low: 'bg-emerald-50 text-emerald-600' }

export default function Maintenance() {
    const [records, setRecords] = useState([])
    const [inShop, setInShop] = useState([])
    const [predictions, setPredictions] = useState([])
    const [stats, setStats] = useState({})
    const [loading, setLoading] = useState(true)
    const [showSchedule, setShowSchedule] = useState(false)
    const toast = useToast()

    const [form, setForm] = useState({ vehicle_id: '', vehicle_name: '', vehicle_code: '', service_type: '', description: '', priority: 'Medium', cost: '', mechanic: '', service_date: '' })

    const fetchData = () => {
        Promise.all([api.get('/maintenance/'), api.get('/maintenance/in-shop'), api.get('/maintenance/predictions'), api.get('/maintenance/stats')])
            .then(([r, s, p, st]) => { setRecords(r.data); setInShop(s.data); setPredictions(p.data); setStats(st.data); setLoading(false) })
            .catch(() => setLoading(false))
    }
    useEffect(() => { fetchData() }, [])

    const handleSchedule = async () => {
        try {
            await api.post('/maintenance/', { ...form, vehicle_id: +form.vehicle_id || 1, cost: +form.cost || 0 })
            toast('Service scheduled successfully!')
            setShowSchedule(false)
            setForm({ vehicle_id: '', vehicle_name: '', vehicle_code: '', service_type: '', description: '', priority: 'Medium', cost: '', mechanic: '', service_date: '' })
            fetchData()
        } catch (e) { toast(e.response?.data?.detail || 'Failed to schedule', 'error') }
    }

    const handleProgress = async (id, progress, status) => {
        try {
            await api.patch(`/maintenance/${id}`, { progress, status })
            toast('Record updated')
            fetchData()
        } catch { toast('Failed to update', 'error') }
    }

    if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div></div>

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold">Maintenance & Service Logs</h1>
                    <p className="text-sm text-[var(--color-text-secondary)] mt-1">Track repairs, schedule services, and manage vehicle health</p>
                </div>
                <button onClick={() => setShowSchedule(true)} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                    <span className="material-symbols-outlined text-[18px]">add</span>Schedule Service
                </button>
            </div>

            {/* In Shop */}
            {inShop.length > 0 && (
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="material-symbols-outlined text-amber-500">garage_home</span>
                        <h2 className="text-base font-semibold">Currently In Shop</h2>
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full text-xs font-medium">{inShop.length} Vehicles</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {inShop.map(v => (
                            <div key={v.id} className="stat-card bg-white rounded-xl p-5 border border-[var(--color-border)] shadow-sm">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center"><span className="material-symbols-outlined text-slate-500 text-[20px]">directions_car</span></div>
                                        <div><p className="text-sm font-semibold">{v.vehicle_name}</p><p className="text-xs text-[var(--color-text-secondary)]">ID: {v.vehicle_code}</p></div>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${prc[v.priority]}`}>{v.priority}</span>
                                </div>
                                <p className="text-sm text-[var(--color-text-secondary)] mb-3">{v.service_type}</p>
                                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-[var(--color-primary)] rounded-full transition-all" style={{ width: `${v.progress}%` }}></div></div>
                                <div className="flex items-center justify-between mt-1.5">
                                    <p className="text-xs text-[var(--color-text-secondary)]">{v.progress}% complete</p>
                                    <button onClick={() => handleProgress(v.id, 100, 'Completed')} className="text-xs text-emerald-600 font-medium hover:underline">Mark Done</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Predictions */}
            {predictions.length > 0 && (
                <div className="mb-8 bg-white rounded-xl p-6 border border-[var(--color-border)] shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="material-symbols-outlined text-purple-500">auto_awesome</span>
                        <h3 className="text-base font-semibold">AI Predictive Alerts</h3>
                        <span className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full text-xs font-bold">{predictions.length}</span>
                    </div>
                    <div className="space-y-2">
                        {predictions.slice(0, 5).map((a, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-[var(--color-border)]">
                                <div className="flex items-center gap-3">
                                    <span className={`material-symbols-outlined text-[18px] ${a.urgency === 'Critical' ? 'text-red-500' : a.urgency === 'High' ? 'text-amber-500' : 'text-blue-500'}`}>{a.urgency === 'Critical' ? 'error' : 'warning'}</span>
                                    <div><p className="text-sm font-medium">{a.vehicle_name} <span className="text-[var(--color-text-secondary)]">{a.vehicle_code}</span></p><p className="text-xs text-[var(--color-text-secondary)]">{a.message}</p></div>
                                </div>
                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${a.urgency === 'Critical' ? 'bg-red-50 text-red-600' : a.urgency === 'High' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>{a.urgency}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Overview */}
                <div className="bg-white rounded-xl p-6 border border-[var(--color-border)] shadow-sm">
                    <h3 className="text-base font-semibold mb-4">Maintenance Overview</h3>
                    <div className="space-y-4">
                        {[
                            { label: 'Total Records', value: stats.total },
                            { label: 'In Progress', value: stats.in_progress },
                            { label: 'Completed', value: stats.completed },
                            { label: 'Total Cost', value: `$${stats.total_cost?.toLocaleString()}` },
                        ].map((s, i) => (
                            <div key={i} className="flex justify-between text-sm">
                                <span className="text-[var(--color-text-secondary)]">{s.label}</span>
                                <span className="font-semibold">{s.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* History */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-[var(--color-border)] shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-[var(--color-border)]"><h3 className="text-base font-semibold">Service History Log</h3></div>
                    <table className="w-full">
                        <thead><tr className="border-b border-[var(--color-border)] bg-slate-50/50">
                            {['Vehicle', 'Service', 'Date', 'Cost', 'Status', 'Mechanic'].map(h => <th key={h} className="text-left p-4 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">{h}</th>)}
                        </tr></thead>
                        <tbody>{records.map(r => (
                            <tr key={r.id} className="border-b border-[var(--color-border)] hover:bg-slate-50/50 transition-colors">
                                <td className="p-4"><p className="text-sm font-medium">{r.vehicle_name}</p><p className="text-xs text-[var(--color-text-secondary)]">{r.vehicle_code}</p></td>
                                <td className="p-4 text-sm">{r.service_type}</td>
                                <td className="p-4 text-sm text-[var(--color-text-secondary)]">{r.service_date || '—'}</td>
                                <td className="p-4 text-sm font-medium">${r.cost?.toLocaleString()}</td>
                                <td className="p-4"><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${sts[r.status]}`}>{r.status}</span></td>
                                <td className="p-4 text-sm text-[var(--color-text-secondary)]">{r.mechanic || '—'}</td>
                            </tr>
                        ))}</tbody>
                    </table>
                </div>
            </div>

            {/* Schedule Modal */}
            <Modal open={showSchedule} onClose={() => setShowSchedule(false)} title="Schedule Service">
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium mb-1">Vehicle Name *</label><input value={form.vehicle_name} onChange={e => setForm({ ...form, vehicle_name: e.target.value })} className="w-full px-3 py-2.5 border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]" placeholder="e.g. Ford Transit" /></div>
                        <div><label className="block text-sm font-medium mb-1">Vehicle Code</label><input value={form.vehicle_code} onChange={e => setForm({ ...form, vehicle_code: e.target.value })} className="w-full px-3 py-2.5 border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20" placeholder="e.g. #402" /></div>
                    </div>
                    <div><label className="block text-sm font-medium mb-1">Service Type *</label><input value={form.service_type} onChange={e => setForm({ ...form, service_type: e.target.value })} className="w-full px-3 py-2.5 border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20" placeholder="e.g. Oil Change & Rotation" /></div>
                    <div className="grid grid-cols-3 gap-3">
                        <div><label className="block text-sm font-medium mb-1">Priority</label>
                            <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className="w-full px-3 py-2.5 border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20">
                                {['Low', 'Medium', 'High'].map(p => <option key={p}>{p}</option>)}
                            </select>
                        </div>
                        <div><label className="block text-sm font-medium mb-1">Cost ($)</label><input type="number" value={form.cost} onChange={e => setForm({ ...form, cost: e.target.value })} className="w-full px-3 py-2.5 border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20" /></div>
                        <div><label className="block text-sm font-medium mb-1">Date</label><input value={form.service_date} onChange={e => setForm({ ...form, service_date: e.target.value })} className="w-full px-3 py-2.5 border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20" placeholder="Feb 22, 2026" /></div>
                    </div>
                    <div><label className="block text-sm font-medium mb-1">Mechanic</label><input value={form.mechanic} onChange={e => setForm({ ...form, mechanic: e.target.value })} className="w-full px-3 py-2.5 border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20" placeholder="e.g. John Smith" /></div>
                    <div className="flex gap-3 pt-2">
                        <button onClick={() => setShowSchedule(false)} className="flex-1 py-2.5 rounded-xl border border-[var(--color-border)] text-sm font-medium hover:bg-slate-50 transition-all">Cancel</button>
                        <button onClick={handleSchedule} disabled={!form.vehicle_name || !form.service_type} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white text-sm font-semibold shadow-lg shadow-blue-500/25 disabled:opacity-50 hover:shadow-xl transition-all">Schedule Service</button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
