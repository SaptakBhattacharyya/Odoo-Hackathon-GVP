import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const utilizationData = [
    { name: 'Week 1', value: 82 }, { name: 'Week 2', value: 85 }, { name: 'Week 3', value: 79 },
    { name: 'Week 4', value: 88 }, { name: 'Week 5', value: 91 }, { name: 'Week 6', value: 87 },
]

const costData = [
    { type: 'Sedan', cost: 0.32 }, { type: 'Van', cost: 0.45 },
    { type: 'Truck', cost: 0.58 }, { type: 'Heavy', cost: 0.72 },
]

const alerts = [
    { type: 'warning', icon: 'warning', msg: 'Vehicle #245 — Oil change overdue by 3 days', time: '12 min ago' },
    { type: 'danger', icon: 'error', msg: 'Vehicle #118 — Engine temperature critical', time: '25 min ago' },
    { type: 'info', icon: 'info', msg: 'Driver Marcus J. — License expiring in 7 days', time: '1 hr ago' },
    { type: 'success', icon: 'check_circle', msg: 'Route optimization saved 14% fuel this week', time: '2 hr ago' },
]

const alertColors = {
    warning: 'text-amber-500 bg-amber-50',
    danger: 'text-red-500 bg-red-50',
    info: 'text-blue-500 bg-blue-50',
    success: 'text-emerald-500 bg-emerald-50',
}

export default function Dashboard() {
    const stats = [
        { label: 'Active Fleet', value: '142', icon: 'local_shipping', change: '+3', color: 'from-blue-500 to-indigo-600' },
        { label: 'Vehicles In Shop', value: '8', icon: 'build', change: '-2', color: 'from-amber-500 to-orange-600' },
        { label: 'Utilization Rate', value: '87%', icon: 'speed', change: '+5%', color: 'from-emerald-500 to-teal-600' },
        { label: 'Pending Cargo', value: '34', icon: 'inventory_2', change: '+12', color: 'from-purple-500 to-pink-600' },
    ]

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Command Center</h1>
                    <p className="text-sm text-[var(--color-text-secondary)] mt-1">Live Operations</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-xs font-medium">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                        Live
                    </span>
                </div>
            </div>

            {/* Global Fleet Status */}
            <div className="mb-2">
                <h2 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-4">Global Fleet Status</h2>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                {stats.map((stat, i) => (
                    <div key={i} className="stat-card bg-white rounded-xl p-5 border border-[var(--color-border)] shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-lg`}>
                                <span className="material-symbols-outlined text-[20px]">{stat.icon}</span>
                            </div>
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${stat.change.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                                }`}>
                                {stat.change}
                            </span>
                        </div>
                        <p className="text-3xl font-bold text-[var(--color-text-primary)]">{stat.value}</p>
                        <p className="text-sm text-[var(--color-text-secondary)] mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Utilization Trend */}
                <div className="bg-white rounded-xl p-6 border border-[var(--color-border)] shadow-sm">
                    <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-1">Fleet Utilization Trend</h3>
                    <p className="text-xs text-[var(--color-text-secondary)] mb-6">Operating capacity over last 30 days</p>
                    <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={utilizationData}>
                                <defs>
                                    <linearGradient id="colorUtil" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#197fe6" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#197fe6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} domain={[70, 100]} />
                                <Tooltip
                                    contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px' }}
                                />
                                <Area type="monotone" dataKey="value" stroke="#197fe6" strokeWidth={2.5} fill="url(#colorUtil)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Cost Per KM */}
                <div className="bg-white rounded-xl p-6 border border-[var(--color-border)] shadow-sm">
                    <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-1">Cost Per KM</h3>
                    <p className="text-xs text-[var(--color-text-secondary)] mb-6">Average by vehicle type</p>
                    <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={costData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="type" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} unit="$" />
                                <Tooltip
                                    contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px' }}
                                    formatter={(value) => [`$${value}`, 'Cost/KM']}
                                />
                                <Bar dataKey="cost" fill="#197fe6" radius={[6, 6, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Recent Alerts */}
            <div className="bg-white rounded-xl p-6 border border-[var(--color-border)] shadow-sm">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-base font-semibold text-[var(--color-text-primary)]">Recent Alerts</h3>
                    <button className="text-xs text-[var(--color-primary)] font-medium hover:underline">View All</button>
                </div>
                <div className="space-y-3">
                    {alerts.map((alert, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${alertColors[alert.type]}`}>
                                <span className="material-symbols-outlined text-[18px]">{alert.icon}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-[var(--color-text-primary)]">{alert.msg}</p>
                                <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{alert.time}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
