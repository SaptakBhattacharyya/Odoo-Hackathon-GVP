import { useState, useEffect } from 'react'
import api from '../services/api'

const stc = { Active: 'bg-emerald-50 text-emerald-600', 'On Leave': 'bg-amber-50 text-amber-600', Suspended: 'bg-red-50 text-red-600' }

export default function DriverPerformance() {
    const [drivers, setDrivers] = useState([])
    const [stats, setStats] = useState({})
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        Promise.all([api.get('/drivers/'), api.get('/drivers/stats')])
            .then(([d, s]) => { setDrivers(d.data); setStats(s.data); setLoading(false) })
            .catch(() => setLoading(false))
    }, [])

    if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div></div>

    const getSafetyColor = (s) => s >= 90 ? 'text-emerald-600' : s >= 75 ? 'text-amber-500' : 'text-red-500'
    const getSafetyBg = (s) => s >= 90 ? 'bg-emerald-500' : s >= 75 ? 'bg-amber-500' : 'bg-red-500'

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold">Driver Performance & Safety</h1>
                <p className="text-sm text-[var(--color-text-secondary)] mt-1">Monitor driver metrics, safety scores, and compliance</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-5 mb-8">
                {[
                    { label: 'Total Drivers', value: stats.total, icon: 'group', color: 'from-blue-500 to-indigo-600' },
                    { label: 'Active', value: stats.active, icon: 'person', color: 'from-emerald-500 to-teal-600' },
                    { label: 'Avg Safety Score', value: stats.avg_safety_score?.toFixed(1), icon: 'shield', color: 'from-purple-500 to-pink-600' },
                    { label: 'On Leave', value: stats.on_leave, icon: 'event_busy', color: 'from-amber-500 to-orange-600' },
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

            {/* Driver Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {drivers.map(d => (
                    <div key={d.id} className="stat-card bg-white rounded-xl p-5 border border-[var(--color-border)] shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                                {d.name?.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold">{d.name}</p>
                                <p className="text-xs text-[var(--color-text-secondary)]">{d.driver_id}</p>
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${stc[d.status]}`}>{d.status}</span>
                        </div>

                        {/* Safety Score Ring */}
                        <div className="flex items-center gap-4 mb-4">
                            <div className="relative w-16 h-16">
                                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" className={getSafetyBg(d.safety_score).replace('bg-', 'stroke-')} stroke={d.safety_score >= 90 ? '#22c55e' : d.safety_score >= 75 ? '#f59e0b' : '#ef4444'} strokeWidth="3" strokeDasharray={`${d.safety_score}, 100`} strokeLinecap="round" />
                                </svg>
                                <span className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-sm font-bold ${getSafetyColor(d.safety_score)}`}>{d.safety_score}</span>
                            </div>
                            <div className="flex-1 space-y-2">
                                <div className="flex justify-between text-xs"><span className="text-[var(--color-text-secondary)]">Trips</span><span className="font-semibold">{d.total_trips}</span></div>
                                <div className="flex justify-between text-xs"><span className="text-[var(--color-text-secondary)]">Violations</span><span className={`font-semibold ${d.violations > 2 ? 'text-red-500' : ''}`}>{d.violations}</span></div>
                                <div className="flex justify-between text-xs"><span className="text-[var(--color-text-secondary)]">License</span><span className={`font-semibold ${d.license_valid ? 'text-emerald-600' : 'text-red-500'}`}>{d.license_valid ? 'Valid' : 'Expired'}</span></div>
                            </div>
                        </div>

                        <div className="text-xs text-[var(--color-text-secondary)] flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">phone</span>{d.phone || 'N/A'}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
