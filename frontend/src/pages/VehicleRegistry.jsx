import { useState, useEffect } from 'react'
import api from '../services/api'
import Modal from '../components/Modal'
import { useToast } from '../components/Toast'

const stc = { Available: 'bg-emerald-50 text-emerald-600', 'On Trip': 'bg-blue-50 text-blue-600', 'In Shop': 'bg-amber-50 text-amber-600' }

export default function VehicleRegistry() {
    const [vehicles, setVehicles] = useState([])
    const [stats, setStats] = useState({})
    const [loading, setLoading] = useState(true)
    const [showAdd, setShowAdd] = useState(false)
    const [filter, setFilter] = useState('')
    const [menuId, setMenuId] = useState(null)
    const toast = useToast()

    const [form, setForm] = useState({ name: '', vehicle_type: 'Van', license_plate: '', max_capacity_lbs: '', volume_ft3: '', cost_per_km: '' })

    const fetchData = () => {
        Promise.all([api.get('/vehicles/'), api.get('/vehicles/stats')]).then(([v, s]) => {
            setVehicles(v.data)
            setStats(s.data)
            setLoading(false)
        }).catch(() => setLoading(false))
    }

    useEffect(() => { fetchData() }, [])

    const handleAdd = async () => {
        try {
            await api.post('/vehicles/', { ...form, max_capacity_lbs: +form.max_capacity_lbs || 0, volume_ft3: +form.volume_ft3 || 0, cost_per_km: +form.cost_per_km || 0 })
            toast('Vehicle added successfully!')
            setShowAdd(false)
            setForm({ name: '', vehicle_type: 'Van', license_plate: '', max_capacity_lbs: '', volume_ft3: '', cost_per_km: '' })
            fetchData()
        } catch (e) { toast(e.response?.data?.detail || 'Failed to add vehicle', 'error') }
    }

    const handleDelete = async (id) => {
        try {
            await api.delete(`/vehicles/${id}`)
            toast('Vehicle deleted')
            setMenuId(null)
            fetchData()
        } catch (e) { toast(e.response?.data?.detail || 'Cannot delete', 'error') }
    }

    const handleStatusChange = async (id, status) => {
        try {
            await api.patch(`/vehicles/${id}`, { status })
            toast(`Status updated to ${status}`)
            setMenuId(null)
            fetchData()
        } catch (e) { toast('Failed to update', 'error') }
    }

    const filtered = vehicles.filter(v => !filter || v.status === filter)

    if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div></div>

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold">Vehicle Registry & Assets</h1>
                    <p className="text-sm text-[var(--color-text-secondary)] mt-1">Monitor and manage your entire vehicle fleet</p>
                </div>
                <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                    <span className="material-symbols-outlined text-[18px]">add</span>Add Vehicle
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-5 mb-6">
                {[
                    { label: 'Total Fleet', value: stats.total, icon: 'directions_car', color: 'from-blue-500 to-indigo-600' },
                    { label: 'Available', value: stats.available, icon: 'check_circle', color: 'from-emerald-500 to-teal-600' },
                    { label: 'On Trip', value: stats.on_trip, icon: 'local_shipping', color: 'from-violet-500 to-purple-600' },
                    { label: 'In Shop', value: stats.in_shop, icon: 'build', color: 'from-amber-500 to-orange-600' },
                ].map((s, i) => (
                    <div key={i} className="stat-card bg-white rounded-xl p-5 border border-[var(--color-border)] shadow-sm">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white shadow-lg mb-3`}>
                            <span className="material-symbols-outlined text-[20px]">{s.icon}</span>
                        </div>
                        <p className="text-2xl font-bold">{s.value}</p>
                        <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Filter */}
            <div className="flex gap-2 mb-4">
                {['', 'Available', 'On Trip', 'In Shop'].map(f => (
                    <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === f ? 'bg-[var(--color-primary)] text-white shadow' : 'bg-white border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-slate-50'}`}>
                        {f || 'All'}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-[var(--color-border)] shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead><tr className="border-b border-[var(--color-border)] bg-slate-50/50">
                        {['Vehicle', 'Type', 'License', 'Status', 'Fuel', 'Mileage', 'Capacity', ''].map(h => <th key={h} className="text-left p-4 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">{h}</th>)}
                    </tr></thead>
                    <tbody>{filtered.map(v => (
                        <tr key={v.id} className="border-b border-[var(--color-border)] hover:bg-slate-50/50 transition-colors">
                            <td className="p-4"><p className="text-sm font-medium">{v.name}</p><p className="text-xs text-[var(--color-text-secondary)]">{v.vehicle_id}</p></td>
                            <td className="p-4 text-sm">{v.vehicle_type}</td>
                            <td className="p-4 text-sm font-mono text-[var(--color-text-secondary)]">{v.license_plate}</td>
                            <td className="p-4"><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${stc[v.status]}`}>{v.status}</span></td>
                            <td className="p-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${v.fuel_level > 50 ? 'bg-emerald-500' : v.fuel_level > 20 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${v.fuel_level}%` }}></div></div>
                                    <span className="text-xs text-[var(--color-text-secondary)]">{v.fuel_level}%</span>
                                </div>
                            </td>
                            <td className="p-4 text-sm text-[var(--color-text-secondary)]">{v.mileage?.toLocaleString('en-IN')} km</td>
                            <td className="p-4 text-sm">{v.max_capacity_lbs?.toLocaleString('en-IN')} kg</td>
                            <td className="p-4 relative">
                                <button onClick={() => setMenuId(menuId === v.id ? null : v.id)} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                                    <span className="material-symbols-outlined text-slate-400 text-[18px]">more_vert</span>
                                </button>
                                {menuId === v.id && (
                                    <div className="absolute right-4 top-12 bg-white rounded-xl shadow-xl border border-[var(--color-border)] py-1 z-20 w-44 animate-modal">
                                        {['Available', 'On Trip', 'In Shop'].filter(s => s !== v.status).map(s => (
                                            <button key={s} onClick={() => handleStatusChange(v.id, s)} className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 transition-colors flex items-center gap-2">
                                                <span className={`w-2 h-2 rounded-full ${s === 'Available' ? 'bg-emerald-500' : s === 'On Trip' ? 'bg-blue-500' : 'bg-amber-500'}`}></span>Set {s}
                                            </button>
                                        ))}
                                        <div className="border-t border-[var(--color-border)] my-1"></div>
                                        <button onClick={() => handleDelete(v.id)} className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[16px]">delete</span>Delete
                                        </button>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}</tbody>
                </table>
                <div className="p-4 border-t border-[var(--color-border)] text-sm text-[var(--color-text-secondary)]">Showing {filtered.length} of {vehicles.length} vehicles</div>
            </div>

            {/* Add Vehicle Modal */}
            <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add New Vehicle">
                <div className="space-y-4">
                    <div><label className="block text-sm font-medium mb-1">Vehicle Name *</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2.5 border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]" placeholder="e.g. Tata Ace, Ashok Leyland" /></div>
                    <div><label className="block text-sm font-medium mb-1">Type *</label>
                        <select value={form.vehicle_type} onChange={e => setForm({ ...form, vehicle_type: e.target.value })} className="w-full px-3 py-2.5 border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20">
                            {['Sedan', 'Van', 'Truck', 'Pickup', 'Heavy', 'Auto', 'Tempo'].map(t => <option key={t}>{t}</option>)}
                        </select>
                    </div>
                    <div><label className="block text-sm font-medium mb-1">License Plate *</label><input value={form.license_plate} onChange={e => setForm({ ...form, license_plate: e.target.value })} className="w-full px-3 py-2.5 border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20" placeholder="e.g. MH-12-AB-1234" /></div>
                    <div className="grid grid-cols-3 gap-3">
                        <div><label className="block text-sm font-medium mb-1">Capacity (kg)</label><input type="number" value={form.max_capacity_lbs} onChange={e => setForm({ ...form, max_capacity_lbs: e.target.value })} className="w-full px-3 py-2.5 border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20" /></div>
                        <div><label className="block text-sm font-medium mb-1">Volume (m³)</label><input type="number" value={form.volume_ft3} onChange={e => setForm({ ...form, volume_ft3: e.target.value })} className="w-full px-3 py-2.5 border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20" /></div>
                        <div><label className="block text-sm font-medium mb-1">Cost/km (₹)</label><input type="number" step="0.01" value={form.cost_per_km} onChange={e => setForm({ ...form, cost_per_km: e.target.value })} className="w-full px-3 py-2.5 border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20" /></div>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button onClick={() => setShowAdd(false)} className="flex-1 py-2.5 rounded-xl border border-[var(--color-border)] text-sm font-medium hover:bg-slate-50 transition-all">Cancel</button>
                        <button onClick={handleAdd} disabled={!form.name || !form.license_plate} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white text-sm font-semibold shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl transition-all">Add Vehicle</button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
