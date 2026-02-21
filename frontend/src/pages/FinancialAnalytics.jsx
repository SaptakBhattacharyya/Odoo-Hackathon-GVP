import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

const roiData = [
    { cls: 'Sedan', roi: 125 }, { cls: 'Van', roi: 140 }, { cls: 'Truck', roi: 115 },
    { cls: 'Pickup', roi: 108 }, { cls: 'Heavy', roi: 95 },
]

const costBreakdown = [
    { name: 'Fuel', value: 42, color: '#197fe6' },
    { name: 'Maintenance', value: 25, color: '#f59e0b' },
    { name: 'Insurance', value: 18, color: '#8b5cf6' },
    { name: 'Tolls & Fees', value: 8, color: '#06b6d4' },
    { name: 'Other', value: 7, color: '#64748b' },
]

const fuelTrend = [
    { month: 'Sep', mpg: 7.2 }, { month: 'Oct', mpg: 7.8 }, { month: 'Nov', mpg: 8.1 },
    { month: 'Dec', mpg: 7.9 }, { month: 'Jan', mpg: 8.4 }, { month: 'Feb', mpg: 8.5 },
]

const transactions = [
    { date: 'Feb 20', desc: 'Fuel Purchase — Ford Transit #402', category: 'Fuel', amount: '-$185.00' },
    { date: 'Feb 19', desc: 'Brake Service — Ram ProMaster #205', category: 'Maintenance', amount: '-$850.00' },
    { date: 'Feb 18', desc: 'Insurance Premium — Q1 2026', category: 'Insurance', amount: '-$4,200.00' },
    { date: 'Feb 17', desc: 'Toll Reimbursement — Route I-95', category: 'Tolls', amount: '-$32.50' },
    { date: 'Feb 16', desc: 'New Tire Set — Volvo FH #801', category: 'Maintenance', amount: '-$1,200.00' },
]

const cc = { Fuel: 'bg-blue-50 text-blue-600', Maintenance: 'bg-amber-50 text-amber-600', Insurance: 'bg-purple-50 text-purple-600', Tolls: 'bg-cyan-50 text-cyan-600' }

export default function FinancialAnalytics() {
    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold">Financial Analytics & Reports</h1>
                    <p className="text-sm text-[var(--color-text-secondary)] mt-1">Comprehensive view of fleet ROI, operational costs, and fuel efficiency trends.</p>
                </div>
                <button className="flex items-center gap-2 px-5 py-2.5 border border-[var(--color-border)] bg-white text-[var(--color-text-primary)] rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all shadow-sm">
                    <span className="material-symbols-outlined text-[18px]">download</span>Export Report
                </button>
            </div>

            {/* KPI */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-5 mb-8">
                {[
                    { label: 'Total Revenue', value: '$1.24M', sub: 'vs. $1.1M last month', icon: 'trending_up', change: '+12.7%', color: 'from-blue-500 to-indigo-600' },
                    { label: 'Fleet ROI', value: '115%', sub: 'Target: 110%', icon: 'show_chart', change: '+5%', color: 'from-emerald-500 to-teal-600' },
                    { label: 'Avg Fuel Efficiency', value: '8.5 MPG', sub: 'Last 30 days average', icon: 'local_gas_station', change: '+3.1%', color: 'from-amber-500 to-orange-600' },
                    { label: 'Maintenance Cost', value: '$32k', sub: 'Monthly spend', icon: 'build', change: '-4.2%', color: 'from-purple-500 to-pink-600' },
                ].map((s, i) => (
                    <div key={i} className="stat-card bg-white rounded-xl p-5 border border-[var(--color-border)] shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white shadow-lg`}>
                                <span className="material-symbols-outlined text-[20px]">{s.icon}</span>
                            </div>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.change.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>{s.change}</span>
                        </div>
                        <p className="text-2xl font-bold">{s.value}</p>
                        <p className="text-xs text-[var(--color-text-secondary)] mt-1">{s.sub}</p>
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* ROI */}
                <div className="bg-white rounded-xl p-6 border border-[var(--color-border)] shadow-sm">
                    <h3 className="text-base font-semibold mb-1">Return on Investment by Vehicle Class</h3>
                    <p className="text-xs text-[var(--color-text-secondary)] mb-6">Percentage ROI per class</p>
                    <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={roiData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="cls" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} unit="%" />
                                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px' }} />
                                <Bar dataKey="roi" fill="#197fe6" radius={[6, 6, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Cost Breakdown Pie */}
                <div className="bg-white rounded-xl p-6 border border-[var(--color-border)] shadow-sm">
                    <h3 className="text-base font-semibold mb-1">Cost Breakdown</h3>
                    <p className="text-xs text-[var(--color-text-secondary)] mb-6">Distribution of operational costs</p>
                    <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={costBreakdown} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                                    {costBreakdown.map((e, i) => <Cell key={i} fill={e.color} />)}
                                </Pie>
                                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px' }} formatter={v => `${v}%`} />
                                <Legend wrapperStyle={{ fontSize: '12px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Fuel Efficiency + Transactions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 border border-[var(--color-border)] shadow-sm">
                    <h3 className="text-base font-semibold mb-1">Fuel Efficiency Trend</h3>
                    <p className="text-xs text-[var(--color-text-secondary)] mb-6">Average MPG over the last 6 months</p>
                    <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={fuelTrend}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} domain={[6, 10]} />
                                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px' }} />
                                <Line type="monotone" dataKey="mpg" stroke="#22c55e" strokeWidth={2.5} dot={{ r: 4, fill: '#22c55e' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-[var(--color-border)] shadow-sm">
                    <h3 className="text-base font-semibold mb-5">Recent Transactions</h3>
                    <div className="space-y-3">
                        {transactions.map((t, i) => (
                            <div key={i} className="flex items-center justify-between py-3 border-b border-[var(--color-border)] last:border-0">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{t.desc}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs text-[var(--color-text-secondary)]">{t.date}</span>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${cc[t.category] || 'bg-slate-100 text-slate-600'}`}>{t.category}</span>
                                    </div>
                                </div>
                                <span className="text-sm font-semibold text-red-500 ml-4">{t.amount}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
