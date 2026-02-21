const drivers = [
    { name: 'Marcus Johnson', score: 95, trips: 234, status: 'Active', license: 'Valid', licenseExp: 'Dec 2027', avatar: 'MJ', violations: 0 },
    { name: 'Sarah Davis', score: 92, trips: 198, status: 'Active', license: 'Valid', licenseExp: 'Mar 2027', avatar: 'SD', violations: 1 },
    { name: 'Michael Chen', score: 88, trips: 312, status: 'Active', license: 'Valid', licenseExp: 'Aug 2026', avatar: 'MC', violations: 2 },
    { name: 'Jessica Wong', score: 91, trips: 156, status: 'Active', license: 'Valid', licenseExp: 'Nov 2027', avatar: 'JW', violations: 0 },
    { name: 'David Miller', score: 78, trips: 267, status: 'Active', license: 'Expiring', licenseExp: 'Mar 2026', avatar: 'DM', violations: 4 },
    { name: 'James Wilson', score: 85, trips: 189, status: 'On Leave', license: 'Valid', licenseExp: 'Jul 2027', avatar: 'JW', violations: 1 },
    { name: 'Amanda Lee', score: 93, trips: 145, status: 'Active', license: 'Valid', licenseExp: 'Sep 2027', avatar: 'AL', violations: 0 },
    { name: 'Robert Taylor', score: 72, trips: 301, status: 'Active', license: 'Expired', licenseExp: 'Jan 2026', avatar: 'RT', violations: 6 },
]

const lc = { Valid: 'bg-emerald-50 text-emerald-600', Expiring: 'bg-amber-50 text-amber-600', Expired: 'bg-red-50 text-red-600' }
const stc = { Active: 'bg-emerald-50 text-emerald-600', 'On Leave': 'bg-slate-100 text-slate-600' }

function ScoreBadge({ score }) {
    const color = score >= 90 ? 'text-emerald-500' : score >= 80 ? 'text-blue-500' : score >= 70 ? 'text-amber-500' : 'text-red-500'
    const bg = score >= 90 ? 'bg-emerald-50' : score >= 80 ? 'bg-blue-50' : score >= 70 ? 'bg-amber-50' : 'bg-red-50'
    return <span className={`${bg} ${color} px-3 py-1 rounded-full text-sm font-bold`}>{score}</span>
}

export default function DriverPerformance() {
    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold">Driver Performance & Safety</h1>
                    <p className="text-sm text-[var(--color-text-secondary)] mt-1">Monitor compliance, safety scores, and license status.</p>
                </div>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                    <span className="material-symbols-outlined text-[18px]">person_add</span>Add Driver
                </button>
            </div>

            {/* KPI */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-5 mb-8">
                {[
                    { label: 'Total Drivers', value: '142', icon: 'group', color: 'from-blue-500 to-indigo-600' },
                    { label: 'Avg Safety Score', value: '88.5', icon: 'shield', color: 'from-emerald-500 to-teal-600' },
                    { label: 'Active Drivers', value: '118', icon: 'person', color: 'from-violet-500 to-purple-600' },
                    { label: 'Expired Licenses', value: '3', icon: 'warning', color: 'from-red-500 to-rose-600' },
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

            {/* Driver Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                {drivers.map((d, i) => (
                    <div key={i} className="stat-card bg-white rounded-xl p-5 border border-[var(--color-border)] shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-slate-600 font-bold text-sm">
                                {d.avatar}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold truncate">{d.name}</p>
                                <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${stc[d.status]}`}>{d.status}</span>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-[var(--color-text-secondary)]">Safety Score</span>
                                <ScoreBadge score={d.score} />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-[var(--color-text-secondary)]">Trips</span>
                                <span className="text-sm font-medium">{d.trips}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-[var(--color-text-secondary)]">License</span>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${lc[d.license]}`}>{d.license} • {d.licenseExp}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-[var(--color-text-secondary)]">Violations</span>
                                <span className={`text-sm font-medium ${d.violations > 3 ? 'text-red-500' : d.violations > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>{d.violations}</span>
                            </div>
                        </div>
                        <button className="w-full mt-4 py-2 rounded-lg border border-[var(--color-border)] text-xs font-medium text-[var(--color-text-secondary)] hover:bg-slate-50 transition-all">
                            View Profile
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}
