import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const monthlyData = [
    { month: 'Sep', fuel: 3200, maintenance: 1800, tolls: 400, insurance: 1200 },
    { month: 'Oct', fuel: 3800, maintenance: 2200, tolls: 500, insurance: 1200 },
    { month: 'Nov', fuel: 3500, maintenance: 1500, tolls: 350, insurance: 1200 },
    { month: 'Dec', fuel: 4100, maintenance: 2800, tolls: 600, insurance: 1200 },
    { month: 'Jan', fuel: 3900, maintenance: 1900, tolls: 450, insurance: 1200 },
    { month: 'Feb', fuel: 4250, maintenance: 2100, tolls: 520, insurance: 1200 },
]

const fuelEfficiency = [
    { month: 'Sep', mpg: 7.8 }, { month: 'Oct', mpg: 8.1 }, { month: 'Nov', mpg: 8.3 },
    { month: 'Dec', mpg: 7.9 }, { month: 'Jan', mpg: 8.6 }, { month: 'Feb', mpg: 8.5 },
]

const breakdown = [
    { name: 'Fuel', value: 4250, color: '#197fe6' },
    { name: 'Maintenance', value: 2100, color: '#f59e0b' },
    { name: 'Insurance', value: 1200, color: '#8b5cf6' },
    { name: 'Tolls', value: 520, color: '#06b6d4' },
]

const logs = [
    { date: 'Feb 20', vehicle: 'Ford Transit #402', type: 'Fuel', amount: '$185.00', liters: '65 L', driver: 'Marcus J.' },
    { date: 'Feb 19', vehicle: 'Chevy Express #118', type: 'Maintenance', amount: '$450.00', liters: '—', driver: 'Sarah D.' },
    { date: 'Feb 19', vehicle: 'Ram ProMaster #205', type: 'Fuel', amount: '$210.00', liters: '74 L', driver: 'Michael C.' },
    { date: 'Feb 18', vehicle: 'Mercedes Sprinter #551', type: 'Tolls', amount: '$32.50', liters: '—', driver: 'Jessica W.' },
]

const tc = { Fuel: 'bg-blue-50 text-blue-600', Maintenance: 'bg-amber-50 text-amber-600', Tolls: 'bg-cyan-50 text-cyan-600', Insurance: 'bg-purple-50 text-purple-600' }

export default function ExpenseFuel() {
    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold">Expense & Fuel Logging</h1>
                <p className="text-sm text-[var(--color-text-secondary)] mt-1">Track operational costs, fuel efficiency, and maintenance across your fleet.</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
                {[
                    { label: 'Total Spend (This Month)', value: '$12,450.00', icon: 'payments', change: '+8.2%', color: 'from-blue-500 to-indigo-600' },
                    { label: 'Avg Fuel Efficiency', value: '8.5 km/L', icon: 'local_gas_station', change: '+3.1%', color: 'from-emerald-500 to-teal-600' },
                    { label: 'Total Fuel Volume', value: '4,250 L', icon: 'water_drop', change: '+12%', color: 'from-amber-500 to-orange-600' },
                ].map((s, i) => (
                    <div key={i} className="stat-card bg-white rounded-xl p-5 border border-[var(--color-border)] shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white shadow-lg`}>
                                <span className="material-symbols-outlined text-[20px]">{s.icon}</span>
                            </div>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">{s.change}</span>
                        </div>
                        <p className="text-2xl font-bold">{s.value}</p>
                        <p className="text-sm text-[var(--color-text-secondary)] mt-1">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 border border-[var(--color-border)] shadow-sm">
                    <h3 className="text-base font-semibold mb-1">Monthly Expense Breakdown</h3>
                    <p className="text-xs text-[var(--color-text-secondary)] mb-6">By category, last 6 months</p>
                    <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v / 1000}k`} />
                                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px' }} />
                                <Bar dataKey="fuel" fill="#197fe6" stackId="a" radius={[0, 0, 0, 0]} />
                                <Bar dataKey="maintenance" fill="#f59e0b" stackId="a" />
                                <Bar dataKey="tolls" fill="#06b6d4" stackId="a" />
                                <Bar dataKey="insurance" fill="#8b5cf6" stackId="a" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 border border-[var(--color-border)] shadow-sm">
                    <h3 className="text-base font-semibold mb-1">Fuel Efficiency Trend</h3>
                    <p className="text-xs text-[var(--color-text-secondary)] mb-6">Average km/L over last 6 months</p>
                    <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={fuelEfficiency}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} domain={[7, 9]} />
                                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px' }} />
                                <Line type="monotone" dataKey="mpg" stroke="#22c55e" strokeWidth={2.5} dot={{ r: 4, fill: '#22c55e' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Expense Log */}
            <div className="bg-white rounded-xl border border-[var(--color-border)] shadow-sm overflow-hidden">
                <div className="p-6 border-b border-[var(--color-border)] flex items-center justify-between">
                    <h3 className="text-base font-semibold">Recent Expense Log</h3>
                    <button className="px-4 py-2 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white rounded-lg text-xs font-semibold shadow-lg shadow-blue-500/25">+ Add Entry</button>
                </div>
                <table className="w-full">
                    <thead><tr className="border-b border-[var(--color-border)] bg-slate-50/50">
                        {['Date', 'Vehicle', 'Type', 'Amount', 'Liters', 'Driver'].map(h => <th key={h} className="text-left p-4 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">{h}</th>)}
                    </tr></thead>
                    <tbody>{logs.map((l, i) => (
                        <tr key={i} className="border-b border-[var(--color-border)] hover:bg-slate-50/50 transition-colors">
                            <td className="p-4 text-sm text-[var(--color-text-secondary)]">{l.date}</td>
                            <td className="p-4 text-sm font-medium">{l.vehicle}</td>
                            <td className="p-4"><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${tc[l.type]}`}>{l.type}</span></td>
                            <td className="p-4 text-sm font-semibold">{l.amount}</td>
                            <td className="p-4 text-sm text-[var(--color-text-secondary)]">{l.liters}</td>
                            <td className="p-4 text-sm">{l.driver}</td>
                        </tr>
                    ))}</tbody>
                </table>
            </div>
        </div>
    )
}
