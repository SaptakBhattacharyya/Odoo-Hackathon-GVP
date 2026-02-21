const inShop = [
    { name: 'Ford Transit', issue: 'Transmission Repair', id: '#402', progress: 65, priority: 'High' },
    { name: 'Chevy Express', issue: 'Oil Change & Rotation', id: '#118', progress: 90, priority: 'Low' },
    { name: 'Ram ProMaster', issue: 'Brake Pad Replace', id: '#205', progress: 40, priority: 'Medium' },
]

const history = [
    { vehicle: 'Ford Transit', id: '#402', service: 'Transmission Repair', date: 'Feb 18, 2026', cost: '$2,450', status: 'In Progress', mechanic: 'John Smith' },
    { vehicle: 'Chevy Express', id: '#118', service: 'Oil Change & Rotation', date: 'Feb 17, 2026', cost: '$180', status: 'Completed', mechanic: 'Mike Brown' },
    { vehicle: 'Ram ProMaster', id: '#205', service: 'Brake Pad Replace', date: 'Feb 16, 2026', cost: '$850', status: 'In Progress', mechanic: 'Sarah Lee' },
    { vehicle: 'Mercedes Sprinter', id: '#551', service: 'Tire Replacement', date: 'Feb 15, 2026', cost: '$1,200', status: 'Completed', mechanic: 'John Smith' },
    { vehicle: 'Ford Transit', id: '#405', service: 'A/C Repair', date: 'Feb 14, 2026', cost: '$650', status: 'Scheduled', mechanic: 'Mike Brown' },
]

const sts = { 'In Progress': 'bg-blue-50 text-blue-600', 'Completed': 'bg-emerald-50 text-emerald-600', 'Scheduled': 'bg-amber-50 text-amber-600' }
const prc = { High: 'bg-red-50 text-red-600', Medium: 'bg-amber-50 text-amber-600', Low: 'bg-emerald-50 text-emerald-600' }

const upcoming = [
    { vehicle: 'Volvo FH #801', service: 'Full Inspection', date: 'Feb 22' },
    { vehicle: 'Kenworth T680 #303', service: 'Oil Change', date: 'Feb 23' },
    { vehicle: 'Ford F-150 #156', service: 'Tire Rotation', date: 'Feb 24' },
]

export default function Maintenance() {
    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold">Maintenance & Service Logs</h1>
                    <p className="text-sm text-[var(--color-text-secondary)] mt-1">Track repairs, schedule services, and manage vehicle health</p>
                </div>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                    <span className="material-symbols-outlined text-[18px]">add</span>Schedule Service
                </button>
            </div>

            {/* Currently In Shop */}
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-amber-500">garage_home</span>
                    <h2 className="text-base font-semibold">Currently In Shop</h2>
                    <span className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full text-xs font-medium">{inShop.length} Vehicles</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {inShop.map((v, i) => (
                        <div key={i} className="stat-card bg-white rounded-xl p-5 border border-[var(--color-border)] shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-slate-500 text-[20px]">directions_car</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold">{v.name}</p>
                                        <p className="text-xs text-[var(--color-text-secondary)]">ID: {v.id}</p>
                                    </div>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${prc[v.priority]}`}>{v.priority}</span>
                            </div>
                            <p className="text-sm text-[var(--color-text-secondary)] mb-3">{v.issue}</p>
                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-[var(--color-primary)] rounded-full transition-all" style={{ width: `${v.progress}%` }}></div>
                            </div>
                            <p className="text-xs text-[var(--color-text-secondary)] mt-1.5">{v.progress}% complete</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Overview */}
                <div className="bg-white rounded-xl p-6 border border-[var(--color-border)] shadow-sm">
                    <h3 className="text-base font-semibold mb-4">Maintenance Overview</h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-[var(--color-text-secondary)]">Monthly Budget</span>
                                <span className="font-medium">65%</span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-amber-500 rounded-full" style={{ width: '65%' }}></div>
                            </div>
                        </div>
                        <div className="pt-3 border-t border-[var(--color-border)]">
                            <p className="text-sm font-medium mb-2">Upcoming Services</p>
                            {upcoming.map((u, i) => (
                                <div key={i} className="flex items-center justify-between py-2 text-sm">
                                    <div>
                                        <p className="font-medium text-[var(--color-text-primary)]">{u.vehicle}</p>
                                        <p className="text-xs text-[var(--color-text-secondary)]">{u.service}</p>
                                    </div>
                                    <span className="text-xs text-[var(--color-text-secondary)]">{u.date}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Service History */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-[var(--color-border)] shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-[var(--color-border)]"><h3 className="text-base font-semibold">Service History Log</h3></div>
                    <table className="w-full">
                        <thead><tr className="border-b border-[var(--color-border)] bg-slate-50/50">
                            {['Vehicle', 'Service', 'Date', 'Cost', 'Status', 'Mechanic'].map(h => <th key={h} className="text-left p-4 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">{h}</th>)}
                        </tr></thead>
                        <tbody>{history.map((h, i) => (
                            <tr key={i} className="border-b border-[var(--color-border)] hover:bg-slate-50/50 transition-colors">
                                <td className="p-4"><p className="text-sm font-medium">{h.vehicle}</p><p className="text-xs text-[var(--color-text-secondary)]">ID: {h.id}</p></td>
                                <td className="p-4 text-sm">{h.service}</td>
                                <td className="p-4 text-sm text-[var(--color-text-secondary)]">{h.date}</td>
                                <td className="p-4 text-sm font-medium">{h.cost}</td>
                                <td className="p-4"><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${sts[h.status]}`}>{h.status}</span></td>
                                <td className="p-4 text-sm text-[var(--color-text-secondary)]">{h.mechanic}</td>
                            </tr>
                        ))}</tbody>
                    </table>
                    <div className="p-4 border-t border-[var(--color-border)] text-sm text-[var(--color-text-secondary)]">Showing 1-5 of 142 results</div>
                </div>
            </div>
        </div>
    )
}
