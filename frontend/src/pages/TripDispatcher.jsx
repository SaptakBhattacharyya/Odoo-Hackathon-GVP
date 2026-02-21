import { useState } from 'react'

const suggestions = [
    { name: 'Ford Transit', cap: '5,000 lbs', vol: '480 ft³' },
    { name: 'Isuzu N-Series', cap: '8,000 lbs', vol: '900 ft³' },
    { name: 'Mercedes Sprinter', cap: '6,200 lbs', vol: '530 ft³' },
]

const trips = [
    { id: 'TR-1024', origin: 'Los Angeles, CA', dest: 'San Francisco, CA', driver: 'Marcus Johnson', vehicle: 'Ford Transit #402', status: 'In Transit', eta: '3h 45m' },
    { id: 'TR-1023', origin: 'Houston, TX', dest: 'Dallas, TX', driver: 'Sarah Davis', vehicle: 'Chevy Express #118', status: 'Delivered', eta: '—' },
    { id: 'TR-1022', origin: 'Chicago, IL', dest: 'Milwaukee, WI', driver: 'Michael Chen', vehicle: 'Ram ProMaster #205', status: 'Loading', eta: '5h 20m' },
]

const sc = { 'In Transit': 'bg-blue-50 text-blue-600', 'Delivered': 'bg-emerald-50 text-emerald-600', 'Loading': 'bg-amber-50 text-amber-600' }

export default function TripDispatcher() {
    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold">Trip Dispatcher</h1>
                <p className="text-sm text-[var(--color-text-secondary)] mt-1">Create and manage shipment trips</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-[var(--color-border)] shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                            <span className="material-symbols-outlined text-[20px]">local_shipping</span>
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold">Create New Trip</h2>
                            <p className="text-xs text-[var(--color-text-secondary)]">Fill in the details to dispatch a new shipment.</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {['Origin', 'Destination', 'Cargo Description', 'Weight (lbs)'].map(l => (
                            <div key={l}>
                                <label className="block text-sm font-medium mb-1.5">{l}</label>
                                <input type="text" placeholder={`Enter ${l.toLowerCase()}`} className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]" />
                            </div>
                        ))}
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Assign Driver</label>
                            <select className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20">
                                <option>Select a driver</option><option>Marcus Johnson</option><option>Sarah Davis</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Departure Date</label>
                            <input type="date" className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20" />
                        </div>
                    </div>
                    <div className="flex gap-3 mt-6">
                        <button className="px-6 py-2.5 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all">Dispatch Trip</button>
                        <button className="px-6 py-2.5 border border-[var(--color-border)] text-[var(--color-text-secondary)] rounded-xl text-sm font-medium hover:bg-slate-50 transition-all">Save Draft</button>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 border border-[var(--color-border)] shadow-sm">
                    <div className="flex items-center gap-2 mb-5">
                        <span className="material-symbols-outlined text-amber-500 text-[20px]">bolt</span>
                        <h3 className="text-base font-semibold">Smart Suggestions</h3>
                    </div>
                    <div className="space-y-3">
                        {suggestions.map((s, i) => (
                            <button key={i} className="w-full p-4 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:shadow-md transition-all text-left group">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[var(--color-primary)] group-hover:bg-[var(--color-primary)] group-hover:text-white transition-all">
                                        <span className="material-symbols-outlined text-[20px]">local_shipping</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold">{s.name}</p>
                                        <p className="text-xs text-[var(--color-text-secondary)]">Max Cap: {s.cap} • Vol: {s.vol}</p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            <div className="bg-white rounded-xl border border-[var(--color-border)] shadow-sm overflow-hidden">
                <div className="p-6 border-b border-[var(--color-border)]"><h3 className="text-base font-semibold">Recent Trips</h3></div>
                <table className="w-full">
                    <thead><tr className="border-b border-[var(--color-border)] bg-slate-50/50">
                        {['Trip ID', 'Route', 'Driver', 'Vehicle', 'Status', 'ETA'].map(h => <th key={h} className="text-left p-4 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">{h}</th>)}
                    </tr></thead>
                    <tbody>{trips.map((t, i) => (
                        <tr key={i} className="border-b border-[var(--color-border)] hover:bg-slate-50/50 transition-colors">
                            <td className="p-4 text-sm font-medium text-[var(--color-primary)]">{t.id}</td>
                            <td className="p-4 text-sm">{t.origin} → {t.dest}</td>
                            <td className="p-4 text-sm">{t.driver}</td>
                            <td className="p-4 text-sm text-[var(--color-text-secondary)]">{t.vehicle}</td>
                            <td className="p-4"><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${sc[t.status]}`}>{t.status}</span></td>
                            <td className="p-4 text-sm text-[var(--color-text-secondary)]">{t.eta}</td>
                        </tr>
                    ))}</tbody>
                </table>
            </div>
        </div>
    )
}
