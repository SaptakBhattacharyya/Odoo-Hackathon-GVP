import { useState, useEffect } from 'react'
import api from '../services/api'
import Modal from '../components/Modal'
import { useToast } from '../components/Toast'

const stc = { Loading: 'bg-amber-50 text-amber-600', 'In Transit': 'bg-blue-50 text-blue-600', Delivered: 'bg-emerald-50 text-emerald-600', Cancelled: 'bg-red-50 text-red-600' }
const pc = { Normal: 'bg-slate-100 text-slate-600', High: 'bg-amber-50 text-amber-600', Urgent: 'bg-red-50 text-red-600' }

export default function TripDispatcher() {
    const [trips, setTrips] = useState([])
    const [loading, setLoading] = useState(true)
    const [showCreate, setShowCreate] = useState(false)
    const [vehicleSuggestions, setVehicleSuggestions] = useState([])
    const [driverSuggestions, setDriverSuggestions] = useState([])
    const toast = useToast()

    const [form, setForm] = useState({ origin: '', destination: '', cargo_description: '', weight_lbs: '', priority: 'Normal', driver_id: null, vehicle_id: null })

    const fetchTrips = () => {
        api.get('/trips/').then(r => { setTrips(r.data); setLoading(false) }).catch(() => setLoading(false))
    }
    useEffect(() => { fetchTrips() }, [])

    const openCreate = async () => {
        setShowCreate(true)
        try {
            const [v, d] = await Promise.all([api.get('/trips/suggestions/vehicles?weight_lbs=3000'), api.get('/trips/suggestions/drivers')])
            setVehicleSuggestions(v.data)
            setDriverSuggestions(d.data)
        } catch { }
    }

    const fetchSuggestions = async (weight) => {
        try {
            const r = await api.get(`/trips/suggestions/vehicles?weight_lbs=${weight || 0}`)
            setVehicleSuggestions(r.data)
        } catch { }
    }

    const handleCreate = async () => {
        try {
            await api.post('/trips/', { ...form, weight_lbs: +form.weight_lbs || 0 })
            toast('Trip dispatched successfully!')
            setShowCreate(false)
            setForm({ origin: '', destination: '', cargo_description: '', weight_lbs: '', priority: 'Normal', driver_id: null, vehicle_id: null })
            fetchTrips()
        } catch (e) { toast(e.response?.data?.detail || 'Failed to create trip', 'error') }
    }

    const handleStatusUpdate = async (id, status) => {
        try {
            await api.patch(`/trips/${id}`, { status })
            toast(`Trip marked as ${status}`)
            fetchTrips()
        } catch { toast('Failed to update', 'error') }
    }

    if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div></div>

    const active = trips.filter(t => t.status === 'In Transit' || t.status === 'Loading')
    const completed = trips.filter(t => t.status === 'Delivered')

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold">Trip Dispatcher</h1>
                    <p className="text-sm text-[var(--color-text-secondary)] mt-1">Plan routes, assign vehicles, and dispatch trips</p>
                </div>
                <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                    <span className="material-symbols-outlined text-[18px]">add</span>Dispatch Trip
                </button>
            </div>

            {/* Active Trips */}
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-blue-500">local_shipping</span>
                    <h2 className="text-base font-semibold">Active Trips</h2>
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">{active.length}</span>
                </div>
                {active.length === 0 ? (
                    <p className="text-sm text-[var(--color-text-secondary)] py-8 text-center bg-white rounded-xl border border-[var(--color-border)]">No active trips. Dispatch a new one!</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {active.map(t => (
                            <div key={t.id} className="stat-card bg-white rounded-xl p-5 border border-[var(--color-border)] shadow-sm">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-bold text-[var(--color-primary)]">{t.trip_id}</span>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${pc[t.priority]}`}>{t.priority}</span>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${stc[t.status]}`}>{t.status}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mb-3 text-sm">
                                    <span className="material-symbols-outlined text-emerald-500 text-[16px]">location_on</span>
                                    <span className="font-medium">{t.origin}</span>
                                    <span className="material-symbols-outlined text-slate-300 text-[16px]">arrow_forward</span>
                                    <span className="font-medium">{t.destination}</span>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-[var(--color-text-secondary)] mb-3">
                                    {t.driver_name && <span>🧑 {t.driver_name}</span>}
                                    {t.vehicle_name && <span>🚛 {t.vehicle_name}</span>}
                                    {t.eta && <span>⏱ ETA: {t.eta}</span>}
                                </div>
                                <div className="flex gap-2">
                                    {t.status === 'Loading' && <button onClick={() => handleStatusUpdate(t.id, 'In Transit')} className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-medium hover:bg-blue-100 transition-all">Start Transit</button>}
                                    {t.status === 'In Transit' && <button onClick={() => handleStatusUpdate(t.id, 'Delivered')} className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 text-xs font-medium hover:bg-emerald-100 transition-all">Mark Delivered</button>}
                                    <button onClick={() => handleStatusUpdate(t.id, 'Cancelled')} className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100 transition-all">Cancel</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Completed */}
            {completed.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <span className="material-symbols-outlined text-emerald-500">check_circle</span>
                        <h2 className="text-base font-semibold">Completed</h2>
                    </div>
                    <div className="bg-white rounded-xl border border-[var(--color-border)] shadow-sm overflow-hidden">
                        <table className="w-full">
                            <thead><tr className="border-b border-[var(--color-border)] bg-slate-50/50">
                                {['Trip ID', 'Route', 'Cargo', 'Driver', 'Vehicle', 'Status'].map(h => <th key={h} className="text-left p-4 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">{h}</th>)}
                            </tr></thead>
                            <tbody>{completed.map(t => (
                                <tr key={t.id} className="border-b border-[var(--color-border)] hover:bg-slate-50/50 transition-colors">
                                    <td className="p-4 text-sm font-bold text-[var(--color-primary)]">{t.trip_id}</td>
                                    <td className="p-4 text-sm">{t.origin} → {t.destination}</td>
                                    <td className="p-4 text-sm text-[var(--color-text-secondary)]">{t.cargo_description || '—'}</td>
                                    <td className="p-4 text-sm">{t.driver_name || '—'}</td>
                                    <td className="p-4 text-sm">{t.vehicle_name || '—'}</td>
                                    <td className="p-4"><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${stc[t.status]}`}>{t.status}</span></td>
                                </tr>
                            ))}</tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Create Trip Modal */}
            <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Dispatch New Trip" width="max-w-2xl">
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium mb-1">Origin *</label><input value={form.origin} onChange={e => setForm({ ...form, origin: e.target.value })} className="w-full px-3 py-2.5 border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]" placeholder="e.g. Mumbai, MH" /></div>
                        <div><label className="block text-sm font-medium mb-1">Destination *</label><input value={form.destination} onChange={e => setForm({ ...form, destination: e.target.value })} className="w-full px-3 py-2.5 border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]" placeholder="e.g. Delhi, DL" /></div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div><label className="block text-sm font-medium mb-1">Cargo</label><input value={form.cargo_description} onChange={e => setForm({ ...form, cargo_description: e.target.value })} className="w-full px-3 py-2.5 border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20" placeholder="e.g. Textiles, Spices" /></div>
                        <div><label className="block text-sm font-medium mb-1">Weight (kg)</label><input type="number" value={form.weight_lbs} onChange={e => { setForm({ ...form, weight_lbs: e.target.value }); fetchSuggestions(e.target.value) }} className="w-full px-3 py-2.5 border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20" /></div>
                        <div><label className="block text-sm font-medium mb-1">Priority</label>
                            <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className="w-full px-3 py-2.5 border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20">
                                {['Normal', 'High', 'Urgent'].map(p => <option key={p}>{p}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Smart Suggestions */}
                    {vehicleSuggestions.length > 0 && (
                        <div>
                            <p className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2 flex items-center gap-1"><span className="material-symbols-outlined text-[14px] text-amber-500">auto_awesome</span>AI Vehicle Suggestions</p>
                            <div className="grid grid-cols-3 gap-2">
                                {vehicleSuggestions.map(v => (
                                    <button key={v.vehicle_id} onClick={() => setForm({ ...form, vehicle_id: v.vehicle_id })} className={`p-3 rounded-lg text-left text-xs border-2 transition-all ${form.vehicle_id === v.vehicle_id ? 'border-[var(--color-primary)] bg-blue-50' : 'border-[var(--color-border)] hover:border-slate-300'}`}>
                                        <p className="font-semibold">{v.name}</p>
                                        <p className="text-[var(--color-text-secondary)]">{v.vehicle_code} • {v.vehicle_type}</p>
                                        <p className="mt-1 text-emerald-600 font-bold">Score: {v.match_score}%</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {driverSuggestions.length > 0 && (
                        <div>
                            <p className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2 flex items-center gap-1"><span className="material-symbols-outlined text-[14px] text-amber-500">auto_awesome</span>AI Driver Suggestions</p>
                            <div className="grid grid-cols-3 gap-2">
                                {driverSuggestions.map(d => (
                                    <button key={d.driver_id} onClick={() => setForm({ ...form, driver_id: d.driver_id })} className={`p-3 rounded-lg text-left text-xs border-2 transition-all ${form.driver_id === d.driver_id ? 'border-[var(--color-primary)] bg-blue-50' : 'border-[var(--color-border)] hover:border-slate-300'}`}>
                                        <p className="font-semibold">{d.name}</p>
                                        <p className="text-[var(--color-text-secondary)]">Safety: {d.safety_score} • Trips: {d.total_trips}</p>
                                        <p className="mt-1 text-emerald-600 font-bold">Score: {d.match_score}%</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button onClick={() => setShowCreate(false)} className="flex-1 py-2.5 rounded-xl border border-[var(--color-border)] text-sm font-medium hover:bg-slate-50 transition-all">Cancel</button>
                        <button onClick={handleCreate} disabled={!form.origin || !form.destination} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white text-sm font-semibold shadow-lg shadow-blue-500/25 disabled:opacity-50 hover:shadow-xl transition-all">Dispatch Trip</button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
