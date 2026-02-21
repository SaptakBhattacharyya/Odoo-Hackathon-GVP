import { useState, useEffect, useMemo } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts'
import api from '../services/api'
import Modal from '../components/Modal'
import { useToast } from '../components/Toast'

const COLORS = ['#197fe6', '#22c55e', '#f59e0b', '#8b5cf6', '#ef4444']
const etc = { Fuel: 'bg-blue-50 text-blue-600', Maintenance: 'bg-emerald-50 text-emerald-600', Tolls: 'bg-amber-50 text-amber-600', Insurance: 'bg-purple-50 text-purple-600', Other: 'bg-slate-100 text-slate-600' }

export default function ExpenseFuel() {
    const [expenses, setExpenses] = useState([])
    const [stats, setStats] = useState({})
    const [breakdown, setBreakdown] = useState([])
    const [loading, setLoading] = useState(true)
    const [showAdd, setShowAdd] = useState(false)
    const toast = useToast()

    const [form, setForm] = useState({ expense_type: 'Fuel', amount: '', description: '', vehicle_id: '', liters: '' })

    const fetchData = () => {
        Promise.all([api.get('/expenses/'), api.get('/expenses/stats'), api.get('/expenses/breakdown')])
            .then(([e, s, b]) => { setExpenses(e.data); setStats(s.data); setBreakdown(b.data); setLoading(false) })
            .catch(() => setLoading(false))
    }
    useEffect(() => { fetchData() }, [])

    const handleAdd = async () => {
        try {
            await api.post('/expenses/', { ...form, amount: +form.amount || 0, vehicle_id: +form.vehicle_id || null, liters: +form.liters || null })
            toast('Expense entry added!')
            setShowAdd(false)
            setForm({ expense_type: 'Fuel', amount: '', description: '', vehicle_id: '', liters: '' })
            fetchData()
        } catch (e) { toast(e.response?.data?.detail || 'Failed', 'error') }
    }

    const pieData = breakdown.map(b => ({ name: b.type, value: b.total }))
    const fuelExpenses = expenses.filter(e => e.expense_type === 'Fuel' && e.liters)
    const fuelEfficiency = fuelExpenses.map((e, i) => ({ entry: `Fill ${i + 1}`, liters: e.liters, ppl: +(e.amount / (e.liters || 1)).toFixed(2) }))

    if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div></div>

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold">Expense & Fuel Analytics</h1>
                    <p className="text-sm text-[var(--color-text-secondary)] mt-1">Track costs, fuel efficiency, and budget utilization</p>
                </div>
                <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                    <span className="material-symbols-outlined text-[18px]">add</span>Add Entry
                </button>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-5 mb-8">
                {[
                    { label: 'Total Expenses', value: `₹${stats.total_amount?.toLocaleString('en-IN')}`, icon: 'payments', color: 'from-blue-500 to-indigo-600' },
                    { label: 'Entries', value: stats.total_entries, icon: 'receipt_long', color: 'from-emerald-500 to-teal-600' },
                    { label: 'Avg Per Entry', value: `₹${stats.avg_amount?.toFixed(0)}`, icon: 'trending_up', color: 'from-purple-500 to-pink-600' },
                    { label: 'Fuel Entries', value: fuelExpenses.length, icon: 'local_gas_station', color: 'from-amber-500 to-orange-600' },
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

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 border border-[var(--color-border)] shadow-sm">
                    <h3 className="text-base font-semibold mb-1">Cost Breakdown</h3>
                    <p className="text-xs text-[var(--color-text-secondary)] mb-4">By category</p>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                                    {pieData.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip formatter={v => `₹${v.toLocaleString('en-IN')}`} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 border border-[var(--color-border)] shadow-sm">
                    <h3 className="text-base font-semibold mb-1">Fuel Price Per Liter</h3>
                    <p className="text-xs text-[var(--color-text-secondary)] mb-4">By fill-up</p>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={fuelEfficiency}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="entry" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} unit="₹" />
                                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px' }} />
                                <Line type="monotone" dataKey="ppl" stroke="#22c55e" strokeWidth={2.5} dot={{ r: 4, fill: '#22c55e' }} name="₹/Liter" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Expense Table */}
            <div className="bg-white rounded-xl border border-[var(--color-border)] shadow-sm overflow-hidden">
                <div className="p-6 border-b border-[var(--color-border)]"><h3 className="text-base font-semibold">Expense Log</h3></div>
                <table className="w-full">
                    <thead><tr className="border-b border-[var(--color-border)] bg-slate-50/50">
                        {['Type', 'Amount', 'Description', 'Vehicle', 'Liters', 'Date'].map(h => <th key={h} className="text-left p-4 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">{h}</th>)}
                    </tr></thead>
                    <tbody>{expenses.map(e => (
                        <tr key={e.id} className="border-b border-[var(--color-border)] hover:bg-slate-50/50 transition-colors">
                            <td className="p-4"><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${etc[e.expense_type]}`}>{e.expense_type}</span></td>
                            <td className="p-4 text-sm font-semibold">₹{e.amount?.toLocaleString('en-IN')}</td>
                            <td className="p-4 text-sm text-[var(--color-text-secondary)]">{e.description || '—'}</td>
                            <td className="p-4 text-sm">{e.vehicle_id || '—'}</td>
                            <td className="p-4 text-sm">{e.liters ? `${e.liters}L` : '—'}</td>
                            <td className="p-4 text-sm text-[var(--color-text-secondary)]">{e.created_at ? new Date(e.created_at).toLocaleDateString() : '—'}</td>
                        </tr>
                    ))}</tbody>
                </table>
            </div>

            {/* Add Entry Modal */}
            <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Expense Entry">
                <div className="space-y-4">
                    <div><label className="block text-sm font-medium mb-1">Expense Type</label>
                        <select value={form.expense_type} onChange={e => setForm({ ...form, expense_type: e.target.value })} className="w-full px-3 py-2.5 border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20">
                            {['Fuel', 'Maintenance', 'Tolls', 'Insurance', 'Other'].map(t => <option key={t}>{t}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium mb-1">Amount (₹) *</label><input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="w-full px-3 py-2.5 border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20" placeholder="0.00" /></div>
                        {form.expense_type === 'Fuel' && <div><label className="block text-sm font-medium mb-1">Liters</label><input type="number" value={form.liters} onChange={e => setForm({ ...form, liters: e.target.value })} className="w-full px-3 py-2.5 border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20" /></div>}
                    </div>
                    <div><label className="block text-sm font-medium mb-1">Description</label><input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2.5 border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20" placeholder="e.g. Diesel refuel at Indian Oil, Toll at NH-48" /></div>
                    <div><label className="block text-sm font-medium mb-1">Vehicle ID</label><input type="number" value={form.vehicle_id} onChange={e => setForm({ ...form, vehicle_id: e.target.value })} className="w-full px-3 py-2.5 border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20" placeholder="e.g. 1" /></div>
                    <div className="flex gap-3 pt-2">
                        <button onClick={() => setShowAdd(false)} className="flex-1 py-2.5 rounded-xl border border-[var(--color-border)] text-sm font-medium hover:bg-slate-50 transition-all">Cancel</button>
                        <button onClick={handleAdd} disabled={!form.amount} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white text-sm font-semibold shadow-lg shadow-blue-500/25 disabled:opacity-50 hover:shadow-xl transition-all">Add Entry</button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
