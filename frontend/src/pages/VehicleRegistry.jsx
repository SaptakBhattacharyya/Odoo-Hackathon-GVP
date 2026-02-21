import { useState } from 'react'

const vehicles = [
    { id: 'VH-001', name: 'Ford Transit', type: 'Van', plate: 'CA-4521-XY', status: 'Available', driver: 'Marcus Johnson', fuel: 78, mileage: '45,200 km' },
    { id: 'VH-002', name: 'Chevy Express', type: 'Van', plate: 'NY-8834-AB', status: 'On Trip', driver: 'Sarah Davis', fuel: 45, mileage: '62,100 km' },
    { id: 'VH-003', name: 'Ram ProMaster', type: 'Van', plate: 'TX-1192-CD', status: 'In Shop', driver: '—', fuel: 12, mileage: '78,500 km' },
    { id: 'VH-004', name: 'Mercedes Sprinter', type: 'Van', plate: 'FL-5567-EF', status: 'Available', driver: 'Michael Chen', fuel: 92, mileage: '31,800 km' },
    { id: 'VH-005', name: 'Isuzu N-Series', type: 'Truck', plate: 'IL-2245-GH', status: 'On Trip', driver: 'Jessica Wong', fuel: 55, mileage: '89,400 km' },
    { id: 'VH-006', name: 'Ford F-150', type: 'Pickup', plate: 'CA-7781-IJ', status: 'Available', driver: 'David Miller', fuel: 88, mileage: '22,300 km' },
    { id: 'VH-007', name: 'Toyota Hilux', type: 'Pickup', plate: 'WA-3319-KL', status: 'On Trip', driver: 'James Wilson', fuel: 33, mileage: '56,700 km' },
    { id: 'VH-008', name: 'Volvo FH', type: 'Heavy', plate: 'OR-9948-MN', status: 'Available', driver: 'Amanda Lee', fuel: 71, mileage: '112,000 km' },
    { id: 'VH-009', name: 'Kenworth T680', type: 'Heavy', plate: 'NV-6621-OP', status: 'In Shop', driver: '—', fuel: 5, mileage: '145,600 km' },
    { id: 'VH-010', name: 'Freightliner M2', type: 'Truck', plate: 'AZ-4477-QR', status: 'Available', driver: 'Robert Taylor', fuel: 64, mileage: '67,900 km' },
]

const statusColor = {
    'Available': 'bg-emerald-50 text-emerald-600',
    'On Trip': 'bg-blue-50 text-blue-600',
    'In Shop': 'bg-amber-50 text-amber-600',
}

export default function VehicleRegistry() {
    const [filter, setFilter] = useState('All')
    const [page, setPage] = useState(1)

    const filtered = filter === 'All' ? vehicles : vehicles.filter(v => v.status === filter)
    const counts = { All: vehicles.length, Available: vehicles.filter(v => v.status === 'Available').length, 'On Trip': vehicles.filter(v => v.status === 'On Trip').length, 'In Shop': vehicles.filter(v => v.status === 'In Shop').length }

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Vehicle Registry</h1>
                    <p className="text-sm text-[var(--color-text-secondary)] mt-1">Manage and track all fleet assets</p>
                </div>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    Add Vehicle
                </button>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
                {[
                    { label: 'Total Vehicles', value: '142', icon: 'directions_car', trend: '+2 this week', color: 'from-blue-500 to-indigo-600' },
                    { label: 'Available', value: '85', icon: 'check_circle', color: 'from-emerald-500 to-teal-600' },
                    { label: 'On Trip', value: '45', icon: 'route', color: 'from-violet-500 to-purple-600' },
                    { label: 'In Shop', value: '12', icon: 'build', color: 'from-amber-500 to-orange-600' },
                ].map((s, i) => (
                    <div key={i} className="stat-card bg-white rounded-xl p-5 border border-[var(--color-border)] shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white shadow-lg`}>
                                <span className="material-symbols-outlined text-[20px]">{s.icon}</span>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-[var(--color-text-primary)]">{s.value}</p>
                                <p className="text-xs text-[var(--color-text-secondary)]">{s.label}</p>
                            </div>
                        </div>
                        {s.trend && <p className="text-xs text-emerald-500 mt-2 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">trending_up</span>{s.trend}</p>}
                    </div>
                ))}
            </div>

            {/* Filter tabs */}
            <div className="flex items-center gap-2 mb-6">
                {Object.keys(counts).map(key => (
                    <button
                        key={key}
                        onClick={() => setFilter(key)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === key
                                ? 'bg-[var(--color-primary)] text-white shadow-md'
                                : 'bg-white text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:bg-slate-50'
                            }`}
                    >
                        {key} ({counts[key]})
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-[var(--color-border)] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[var(--color-border)] bg-slate-50/50">
                                <th className="text-left p-4 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Vehicle</th>
                                <th className="text-left p-4 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Plate</th>
                                <th className="text-left p-4 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Type</th>
                                <th className="text-left p-4 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Status</th>
                                <th className="text-left p-4 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Driver</th>
                                <th className="text-left p-4 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Fuel</th>
                                <th className="text-left p-4 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Mileage</th>
                                <th className="text-left p-4 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((v, i) => (
                                <tr key={i} className="border-b border-[var(--color-border)] hover:bg-slate-50/50 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-slate-500 text-[18px]">directions_car</span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-[var(--color-text-primary)]">{v.name}</p>
                                                <p className="text-xs text-[var(--color-text-secondary)]">{v.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-[var(--color-text-primary)] font-mono">{v.plate}</td>
                                    <td className="p-4 text-sm text-[var(--color-text-secondary)]">{v.type}</td>
                                    <td className="p-4">
                                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusColor[v.status]}`}>
                                            {v.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-[var(--color-text-primary)]">{v.driver}</td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div className={`h-full rounded-full ${v.fuel > 60 ? 'bg-emerald-500' : v.fuel > 30 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${v.fuel}%` }}></div>
                                            </div>
                                            <span className="text-xs text-[var(--color-text-secondary)]">{v.fuel}%</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-[var(--color-text-secondary)]">{v.mileage}</td>
                                    <td className="p-4">
                                        <button className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                                            <span className="material-symbols-outlined text-slate-400 text-[18px]">more_vert</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between p-4 border-t border-[var(--color-border)]">
                    <p className="text-sm text-[var(--color-text-secondary)]">Showing 1 to {filtered.length} of 142 results</p>
                    <div className="flex items-center gap-1">
                        <button className="px-3 py-1.5 rounded-lg text-sm text-[var(--color-text-secondary)] hover:bg-slate-100 transition-colors">Previous</button>
                        {[1, 2, 3, '...', 14].map((p, i) => (
                            <button key={i} className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${p === page ? 'bg-[var(--color-primary)] text-white' : 'text-[var(--color-text-secondary)] hover:bg-slate-100'}`} onClick={() => typeof p === 'number' && setPage(p)}>
                                {p}
                            </button>
                        ))}
                        <button className="px-3 py-1.5 rounded-lg text-sm text-[var(--color-text-secondary)] hover:bg-slate-100 transition-colors">Next</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
