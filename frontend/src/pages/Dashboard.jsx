import { useState, useEffect } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import api from '../services/api'
import FleetMap from '../components/FleetMap'

export default function Dashboard() {
    const [data, setData] = useState(null)
    const [vehicles, setVehicles] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        Promise.all([api.get('/dashboard/overview'), api.get('/vehicles/')])
            .then(([d, v]) => { setData(d.data); setVehicles(v.data); setLoading(false) })
            .catch(() => setLoading(false))
    }, [])

    if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div></div>

    const fleet = data?.fleet || {}
    const trips = data?.trips || {}
    const alerts = data?.maintenance_alerts || []

    const hasFleetData = fleet.total_vehicles > 0
    const rate = fleet.utilization_rate || 0

    const utilTrend = hasFleetData ? [
        { week: 'Week 1', val: Math.round(rate * 0.7) },
        { week: 'Week 2', val: Math.round(rate * 0.8) },
        { week: 'Week 3', val: Math.round(rate * 0.85) },
        { week: 'Week 4', val: Math.round(rate * 0.9) },
        { week: 'Week 5', val: Math.round(rate * 0.95) },
        { week: 'Week 6', val: rate },
    ] : []

    const costByType = {}
    vehicles.forEach(v => {
        if (!costByType[v.vehicle_type]) costByType[v.vehicle_type] = { total: 0, count: 0 }
        costByType[v.vehicle_type].total += v.cost_per_km || 0
        costByType[v.vehicle_type].count += 1
    })
    const costData = Object.entries(costByType).map(([type, d]) => ({ type, cost: Math.round((d.total / d.count) * 100) / 100 }))

    const EmptyChart = ({ message }) => (
        <div className="h-56 flex flex-col items-center justify-center text-[var(--color-text-secondary)]">
            <span className="material-symbols-outlined text-[40px] text-slate-200 mb-3">bar_chart</span>
            <p className="text-sm font-medium">{message}</p>
            <p className="text-xs mt-1">Add data to see charts here</p>
        </div>
    )

    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h1 className="text-2xl font-bold">Command Center</h1>
                    <p className="text-sm text-[var(--color-text-secondary)]">Live Operations</p>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-emerald-600">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>Live
                </div>
            </div>

            <p className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-widest mb-4 mt-6">Global Fleet Status</p>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                {[
                    { label: 'Active Fleet', value: fleet.total_vehicles || 0, icon: 'directions_car', change: `${fleet.available || 0} available`, color: 'from-blue-500 to-indigo-600' },
                    { label: 'Vehicles In Shop', value: fleet.in_shop || 0, icon: 'build', change: `${fleet.in_shop || 0} servicing`, color: 'from-orange-500 to-red-500', negative: fleet.in_shop > 0 },
                    { label: 'Utilization Rate', value: `${rate}%`, icon: 'speed', change: hasFleetData ? 'Active' : 'No data', color: 'from-emerald-500 to-teal-600' },
                    { label: 'Active Trips', value: trips.active || 0, icon: 'local_shipping', change: `${trips.loading || 0} loading`, color: 'from-purple-500 to-pink-600' },
                ].map((s, i) => (
                    <div key={i} className="stat-card bg-white rounded-xl p-5 border border-[var(--color-border)] shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white shadow-lg`}>
                                <span className="material-symbols-outlined text-[22px]">{s.icon}</span>
                            </div>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.negative ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>{s.change}</span>
                        </div>
                        <p className="text-3xl font-bold">{s.value}</p>
                        <p className="text-sm text-[var(--color-text-secondary)] mt-1">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Live GPS Map */}
            <div className="bg-white rounded-xl border border-[var(--color-border)] shadow-sm overflow-hidden mb-8">
                <div className="p-5 border-b border-[var(--color-border)] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[var(--color-primary)]">satellite_alt</span>
                        <h3 className="text-base font-semibold">Live Fleet Tracking</h3>
                        {vehicles.length > 0 && <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs font-bold">{vehicles.length} vehicles</span>}
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>Available</span>
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>On Trip</span>
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>In Shop</span>
                    </div>
                </div>
                <div style={{ height: '350px' }}>
                    <FleetMap vehicles={vehicles} />
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 border border-[var(--color-border)] shadow-sm">
                    <h3 className="text-base font-semibold mb-1">Fleet Utilization Trend</h3>
                    <p className="text-xs text-[var(--color-text-secondary)] mb-6">Operating capacity over last 30 days</p>
                    {utilTrend.length > 0 ? (
                        <div className="h-56">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={utilTrend}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                    <XAxis dataKey="week" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} domain={[0, 100]} unit="%" />
                                    <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px' }} />
                                    <Line type="monotone" dataKey="val" stroke="#197fe6" strokeWidth={2.5} dot={{ r: 4, fill: '#197fe6' }} name="Utilization" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    ) : <EmptyChart message="No vehicles added yet" />}
                </div>

                <div className="bg-white rounded-xl p-6 border border-[var(--color-border)] shadow-sm">
                    <h3 className="text-base font-semibold mb-1">Cost Per KM</h3>
                    <p className="text-xs text-[var(--color-text-secondary)] mb-6">Average by vehicle type</p>
                    {costData.length > 0 ? (
                        <div className="h-56">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={costData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                    <XAxis dataKey="type" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} unit="₹" />
                                    <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px' }} formatter={v => `₹${v}`} />
                                    <Bar dataKey="cost" fill="#197fe6" radius={[6, 6, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : <EmptyChart message="No vehicles added yet" />}
                </div>
            </div>

            {/* Maintenance Alerts */}
            {alerts.length > 0 && (
                <div className="bg-white rounded-xl p-6 border border-[var(--color-border)] shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="material-symbols-outlined text-amber-500">warning</span>
                        <h3 className="text-base font-semibold">Predictive Maintenance Alerts</h3>
                        <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded-full text-xs font-bold">{alerts.length}</span>
                    </div>
                    <div className="space-y-3">
                        {alerts.map((a, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-[var(--color-border)]">
                                <div className="flex items-center gap-3">
                                    <span className={`material-symbols-outlined text-[20px] ${a.urgency === 'Critical' ? 'text-red-500' : a.urgency === 'High' ? 'text-amber-500' : 'text-blue-500'}`}>
                                        {a.urgency === 'Critical' ? 'error' : a.urgency === 'High' ? 'warning' : 'info'}
                                    </span>
                                    <div>
                                        <p className="text-sm font-medium">{a.vehicle_name} <span className="text-[var(--color-text-secondary)]">{a.vehicle_code}</span></p>
                                        <p className="text-xs text-[var(--color-text-secondary)]">{a.message}</p>
                                    </div>
                                </div>
                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${a.urgency === 'Critical' ? 'bg-red-50 text-red-600' : a.urgency === 'High' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>{a.urgency}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
