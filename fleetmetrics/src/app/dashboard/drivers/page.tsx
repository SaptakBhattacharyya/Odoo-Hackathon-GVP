'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Search, Plus, X, Users, Shield } from 'lucide-react';
import { useUserRole } from '@/lib/hooks/useUserRole';

interface Driver {
    id: string; name: string; email: string; phone: string; license_number: string; license_class: string;
    license_expiry: string; status: string; safety_score: number; total_trips: number; completed_trips: number;
    cancelled_trips: number; total_accidents: number; total_complaints: number; hire_date: string; notes: string;
}

const emptyDriver = { name: '', email: '', phone: '', license_number: '', license_class: 'C', license_expiry: '', status: 'on_duty', hire_date: '', notes: '' };

export default function DriversPage() {
    const supabase = createClient();
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [form, setForm] = useState(emptyDriver);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { canWrite } = useUserRole();
    const canEditDrivers = canWrite('drivers');

    const fetchDrivers = async () => {
        let query = supabase.from('drivers').select('*').order('name');
        if (statusFilter !== 'all') query = query.eq('status', statusFilter);
        const { data } = await query;
        if (data) setDrivers(data);
    };

    useEffect(() => { fetchDrivers(); }, [statusFilter]);

    const filtered = drivers.filter(d => !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.license_number.toLowerCase().includes(search.toLowerCase()));

    const handleSave = async () => {
        setError(''); setLoading(true);
        try {
            if (editId) {
                const { error } = await supabase.from('drivers').update(form).eq('id', editId);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('drivers').insert([form]);
                if (error) throw error;
            }
            setShowModal(false); setForm(emptyDriver); setEditId(null); fetchDrivers();
        } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Failed to save'); }
        finally { setLoading(false); }
    };

    const toggleStatus = async (id: string, current: string) => {
        const newStatus = current === 'suspended' ? 'on_duty' : 'suspended';
        await supabase.from('drivers').update({ status: newStatus }).eq('id', id);
        fetchDrivers();
    };

    const scoreColor = (score: number) => {
        if (score >= 90) return 'text-green-400';
        if (score >= 75) return 'text-blue-400';
        if (score >= 60) return 'text-amber-400';
        return 'text-red-400';
    };

    const scoreBg = (score: number) => {
        if (score >= 90) return 'bg-green-500';
        if (score >= 75) return 'bg-blue-500';
        if (score >= 60) return 'bg-amber-500';
        return 'bg-red-500';
    };

    const statusColors: Record<string, string> = {
        on_duty: 'bg-green-500/10 text-green-400', on_break: 'bg-amber-500/10 text-amber-400',
        busy: 'bg-blue-500/10 text-blue-400', suspended: 'bg-red-500/10 text-red-400',
    };

    const totalActive = drivers.filter(d => d.status !== 'suspended').length;
    const atRisk = drivers.filter(d => d.safety_score < 60).length;
    const expiringLicenses = drivers.filter(d => { const days = (new Date(d.license_expiry).getTime() - Date.now()) / 86400000; return days > 0 && days < 30; }).length;
    const avgScore = drivers.length ? (drivers.reduce((s, d) => s + Number(d.safety_score), 0) / drivers.length).toFixed(1) : '0';

    return (
        <>
            <header className="h-16 border-b border-slate-800/40 flex items-center justify-between px-6 bg-[#050810]/40 backdrop-blur-md sticky top-0 z-30">
                <h1 className="text-xl font-bold text-slate-100">Driver Performance & Safety</h1>
                {canEditDrivers && (
                    <button onClick={() => { setForm(emptyDriver); setEditId(null); setShowModal(true); setError(''); }} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-blue-600 text-white font-semibold text-sm rounded-lg shadow-lg shadow-blue-500/20">
                        <Plus className="w-4 h-4" /> Add Driver
                    </button>
                )}
            </header>

            <div className="p-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {[
                        { label: 'Active Drivers', value: totalActive, color: 'blue' },
                        { label: 'At Risk', value: atRisk, color: atRisk > 0 ? 'red' : 'green' },
                        { label: 'Expiring Licenses', value: expiringLicenses, color: expiringLicenses > 0 ? 'amber' : 'green' },
                        { label: 'Avg Safety Score', value: avgScore, color: 'cyan' },
                    ].map(c => (
                        <div key={c.label} className={`glass-panel rounded-xl p-4 border border-${c.color}-500/20`}>
                            <p className="text-xs text-slate-400 mb-1">{c.label}</p>
                            <p className={`text-2xl font-bold text-${c.color}-400`}>{c.value}</p>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3 mb-6">
                    <div className="relative flex-1 min-w-[200px] max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                        <input value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary" placeholder="Search name or license..." />
                    </div>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary">
                        <option value="all">All Status</option>
                        <option value="on_duty">On Duty</option>
                        <option value="on_break">On Break</option>
                        <option value="busy">Busy</option>
                        <option value="suspended">Suspended</option>
                    </select>
                </div>

                {/* Table */}
                <div className="glass-panel rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-slate-900/60 text-slate-400 font-medium uppercase text-xs tracking-wider border-b border-slate-700/30">
                                <tr>
                                    <th className="px-6 py-3">Driver</th>
                                    <th className="px-6 py-3">License</th>
                                    <th className="px-6 py-3">Class</th>
                                    <th className="px-6 py-3">Expiry</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Trips</th>
                                    <th className="px-6 py-3">Safety Score</th>
                                    <th className="px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/40">
                                {filtered.map(d => {
                                    const licDays = Math.ceil((new Date(d.license_expiry).getTime() - Date.now()) / 86400000);
                                    const completion = d.total_trips > 0 ? Math.round((d.completed_trips / d.total_trips) * 100) : 100;
                                    return (
                                        <tr key={d.id} className="hover:bg-blue-600/5 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white text-sm font-bold">{d.name.charAt(0)}</div>
                                                    <div>
                                                        <p className="text-white font-medium">{d.name}</p>
                                                        <p className="text-xs text-slate-500">{d.email || d.phone || '—'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-slate-300 text-xs">{d.license_number}</td>
                                            <td className="px-6 py-4"><span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400">Class {d.license_class}</span></td>
                                            <td className="px-6 py-4"><span className={`text-xs ${licDays < 0 ? 'text-red-400 font-bold' : licDays < 30 ? 'text-amber-400' : 'text-slate-400'}`}>{new Date(d.license_expiry).toLocaleDateString()}</span></td>
                                            <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[d.status]}`}>{d.status.replace('_', ' ')}</span></td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-slate-300">{d.completed_trips}/{d.total_trips}</span>
                                                    <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                        <div className="h-full bg-primary rounded-full" style={{ width: `${completion}%` }} />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className={`font-bold ${scoreColor(Number(d.safety_score))}`}>{Number(d.safety_score).toFixed(1)}</span>
                                                    <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                        <div className={`h-full rounded-full ${scoreBg(Number(d.safety_score))}`} style={{ width: `${d.safety_score}%` }} />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {canEditDrivers && (
                                                    <div className="flex gap-2">
                                                        <button onClick={() => { setForm(d as unknown as typeof emptyDriver); setEditId(d.id); setShowModal(true); setError(''); }} className="text-xs text-primary hover:text-blue-300">Edit</button>
                                                        <button onClick={() => toggleStatus(d.id, d.status)} className={`text-xs ${d.status === 'suspended' ? 'text-green-400' : 'text-red-400'}`}>{d.status === 'suspended' ? 'Activate' : 'Suspend'}</button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filtered.length === 0 && <tr><td colSpan={8} className="px-6 py-12 text-center text-slate-500">No drivers found</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-[#0B1121] border border-slate-700/50 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white">{editId ? 'Edit Driver' : 'Add New Driver'}</h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
                        </div>
                        {error && <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}
                        <div className="space-y-4">
                            <div><label className="text-xs text-slate-400 mb-1 block">Full Name *</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary" /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-xs text-slate-400 mb-1 block">Email</label><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary" /></div>
                                <div><label className="text-xs text-slate-400 mb-1 block">Phone</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary" /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-xs text-slate-400 mb-1 block">License Number *</label><input value={form.license_number} onChange={e => setForm({ ...form, license_number: e.target.value })} className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary" /></div>
                                <div><label className="text-xs text-slate-400 mb-1 block">License Class *</label>
                                    <select value={form.license_class} onChange={e => setForm({ ...form, license_class: e.target.value })} className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary">
                                        <option value="B">B</option><option value="C">C</option><option value="D">D</option><option value="E">E</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-xs text-slate-400 mb-1 block">License Expiry *</label><input type="date" value={form.license_expiry} onChange={e => setForm({ ...form, license_expiry: e.target.value })} className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary" /></div>
                                <div><label className="text-xs text-slate-400 mb-1 block">Hire Date</label><input type="date" value={form.hire_date} onChange={e => setForm({ ...form, hire_date: e.target.value })} className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary" /></div>
                            </div>
                            <div><label className="text-xs text-slate-400 mb-1 block">Notes</label><textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary" /></div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={handleSave} disabled={loading} className="flex-1 bg-gradient-to-r from-primary to-blue-600 text-white font-semibold py-2.5 rounded-lg disabled:opacity-50">{loading ? 'Saving...' : 'Save'}</button>
                            <button onClick={() => setShowModal(false)} className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-lg">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
