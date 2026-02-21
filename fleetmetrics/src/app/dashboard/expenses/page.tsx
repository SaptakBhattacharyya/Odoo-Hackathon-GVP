'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Search, Plus, X, Receipt, CheckCircle, XCircle, Download } from 'lucide-react';
import { useUserRole } from '@/lib/hooks/useUserRole';

interface Expense {
    id: string; trip_id: string; driver_id: string; vehicle_id: string;
    fuel_cost: number; misc_cost: number; total_cost: number; fuel_liters: number;
    distance_km: number; category: string; status: string; notes: string; created_at: string;
    rejection_reason: string;
    trip: { origin: string; destination: string } | null;
    driver: { name: string } | null;
    vehicle: { license_plate: string } | null;
}

interface Trip { id: string; origin: string; destination: string; vehicle_id: string; driver_id: string; vehicle: { license_plate: string } | null; driver: { name: string } | null; }

export default function ExpensesPage() {
    const supabase = createClient();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [trips, setTrips] = useState<Trip[]>([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [showReject, setShowReject] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({ trip_id: '', fuel_cost: 0, misc_cost: 0, fuel_liters: 0, distance_km: 0, category: 'fuel', notes: '' });
    const { canWrite } = useUserRole();
    const canLogExpenses = canWrite('expenses');
    const canApproveExpenses = canWrite('expenses_approve');

    const fetchExpenses = async () => {
        let query = supabase.from('expenses').select('*, trip:trips(origin, destination), driver:drivers(name), vehicle:vehicles(license_plate)').order('created_at', { ascending: false });
        if (statusFilter !== 'all') query = query.eq('status', statusFilter);
        if (categoryFilter !== 'all') query = query.eq('category', categoryFilter);
        const { data } = await query;
        if (data) setExpenses(data as unknown as Expense[]);
    };

    const fetchTrips = async () => {
        const { data } = await supabase.from('trips').select('id, origin, destination, vehicle_id, driver_id, vehicle:vehicles(license_plate), driver:drivers(name)').in('status', ['completed', 'in_transit']);
        if (data) setTrips(data as unknown as Trip[]);
    };

    useEffect(() => { fetchExpenses(); fetchTrips(); }, [statusFilter, categoryFilter]);

    const filtered = expenses.filter(e => !search || e.driver?.name?.toLowerCase().includes(search.toLowerCase()) || e.vehicle?.license_plate?.toLowerCase().includes(search.toLowerCase()));

    const handleSave = async () => {
        setError(''); setLoading(true);
        const selectedTrip = trips.find(t => t.id === form.trip_id);
        try {
            const { error } = await supabase.from('expenses').insert([{
                ...form, status: 'pending',
                vehicle_id: selectedTrip?.vehicle_id || null,
                driver_id: selectedTrip?.driver_id || null,
            }]);
            if (error) throw error;
            setShowModal(false); setForm({ trip_id: '', fuel_cost: 0, misc_cost: 0, fuel_liters: 0, distance_km: 0, category: 'fuel', notes: '' }); fetchExpenses();
        } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Failed'); }
        finally { setLoading(false); }
    };

    const handleApprove = async (id: string) => {
        await supabase.from('expenses').update({ status: 'approved', approved_at: new Date().toISOString() }).eq('id', id);
        fetchExpenses();
    };

    const handleReject = async () => {
        if (!showReject) return;
        await supabase.from('expenses').update({ status: 'rejected', rejection_reason: rejectReason }).eq('id', showReject);
        setShowReject(null); setRejectReason(''); fetchExpenses();
    };

    const exportCSV = () => {
        const headers = 'ID,Vehicle,Driver,Category,Fuel Cost,Misc Cost,Total,Status,Date';
        const rows = expenses.map(e => `${e.id.slice(0, 8)},${e.vehicle?.license_plate || ''},${e.driver?.name || ''},${e.category},${e.fuel_cost},${e.misc_cost},${e.total_cost},${e.status},${new Date(e.created_at).toLocaleDateString()}`);
        const blob = new Blob([headers + '\n' + rows.join('\n')], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'expenses.csv'; a.click();
    };

    const statusColors: Record<string, string> = { pending: 'bg-amber-500/10 text-amber-400', approved: 'bg-green-500/10 text-green-400', rejected: 'bg-red-500/10 text-red-400' };
    const catColors: Record<string, string> = { fuel: 'bg-blue-500/10 text-blue-400', toll: 'bg-purple-500/10 text-purple-400', parking: 'bg-cyan-500/10 text-cyan-400', repair: 'bg-red-500/10 text-red-400', misc: 'bg-slate-700/50 text-slate-400' };

    const totalPending = expenses.filter(e => e.status === 'pending').reduce((s, e) => s + Number(e.total_cost), 0);
    const totalApproved = expenses.filter(e => e.status === 'approved').reduce((s, e) => s + Number(e.total_cost), 0);
    const totalFuel = expenses.filter(e => e.status === 'approved').reduce((s, e) => s + Number(e.fuel_cost), 0);
    const avgCost = expenses.length ? (expenses.reduce((s, e) => s + Number(e.total_cost), 0) / expenses.length).toFixed(0) : '0';

    return (
        <>
            <header className="h-16 border-b border-slate-800/40 flex items-center justify-between px-6 bg-[#050810]/40 backdrop-blur-md sticky top-0 z-30">
                <h1 className="text-xl font-bold text-slate-100">Expense & Fuel Logs</h1>
                <div className="flex gap-2">
                    <button onClick={exportCSV} className="flex items-center gap-2 px-3 py-2 bg-slate-800 text-slate-300 text-sm rounded-lg border border-slate-700 hover:bg-slate-700"><Download className="w-4 h-4" /> CSV</button>
                    {canLogExpenses && (
                        <button onClick={() => { setShowModal(true); setError(''); fetchTrips(); }} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-blue-600 text-white font-semibold text-sm rounded-lg shadow-lg shadow-blue-500/20"><Plus className="w-4 h-4" /> Log Expense</button>
                    )}
                </div>
            </header>

            <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="glass-panel rounded-xl p-4 border border-amber-500/20"><p className="text-xs text-slate-400 mb-1">Total Pending</p><p className="text-2xl font-bold text-amber-400">₹{totalPending.toLocaleString()}</p></div>
                    <div className="glass-panel rounded-xl p-4 border border-green-500/20"><p className="text-xs text-slate-400 mb-1">Total Approved</p><p className="text-2xl font-bold text-green-400">₹{totalApproved.toLocaleString()}</p></div>
                    <div className="glass-panel rounded-xl p-4 border border-blue-500/20"><p className="text-xs text-slate-400 mb-1">Total Fuel Spend</p><p className="text-2xl font-bold text-blue-400">₹{totalFuel.toLocaleString()}</p></div>
                    <div className="glass-panel rounded-xl p-4 border border-cyan-500/20"><p className="text-xs text-slate-400 mb-1">Avg Per Expense</p><p className="text-2xl font-bold text-cyan-400">₹{avgCost}</p></div>
                </div>

                <div className="flex flex-wrap gap-3 mb-6">
                    <div className="relative flex-1 min-w-[200px] max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                        <input value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary" placeholder="Search..." />
                    </div>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary">
                        <option value="all">All Status</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option>
                    </select>
                    <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary">
                        <option value="all">All Categories</option><option value="fuel">Fuel</option><option value="toll">Toll</option><option value="parking">Parking</option><option value="repair">Repair</option><option value="misc">Misc</option>
                    </select>
                </div>

                <div className="glass-panel rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-slate-900/60 text-slate-400 font-medium uppercase text-xs tracking-wider border-b border-slate-700/30">
                                <tr>
                                    <th className="px-6 py-3">ID</th><th className="px-6 py-3">Trip</th><th className="px-6 py-3">Vehicle</th><th className="px-6 py-3">Driver</th><th className="px-6 py-3">Category</th><th className="px-6 py-3">Fuel</th><th className="px-6 py-3">Misc</th><th className="px-6 py-3">Total</th><th className="px-6 py-3">Status</th><th className="px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/40">
                                {filtered.map(e => (
                                    <tr key={e.id} className="hover:bg-blue-600/5 transition-colors">
                                        <td className="px-6 py-4 font-mono text-primary text-xs">#{e.id.slice(0, 8)}</td>
                                        <td className="px-6 py-4 text-slate-300 text-xs">{e.trip ? `${e.trip.origin}→${e.trip.destination}` : '—'}</td>
                                        <td className="px-6 py-4 text-slate-300">{e.vehicle?.license_plate || '—'}</td>
                                        <td className="px-6 py-4 text-slate-300">{e.driver?.name || '—'}</td>
                                        <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${catColors[e.category] || catColors.misc}`}>{e.category}</span></td>
                                        <td className="px-6 py-4 text-slate-300">₹{Number(e.fuel_cost).toLocaleString()}</td>
                                        <td className="px-6 py-4 text-slate-300">₹{Number(e.misc_cost).toLocaleString()}</td>
                                        <td className="px-6 py-4 font-bold text-white">₹{Number(e.total_cost).toLocaleString()}</td>
                                        <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[e.status]}`}>{e.status}</span></td>
                                        <td className="px-6 py-4">
                                            {e.status === 'pending' && canApproveExpenses && (
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleApprove(e.id)} className="text-xs text-green-400 hover:text-green-300 font-medium">Approve</button>
                                                    <button onClick={() => setShowReject(e.id)} className="text-xs text-red-400 hover:text-red-300 font-medium">Reject</button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {filtered.length === 0 && <tr><td colSpan={10} className="px-6 py-12 text-center text-slate-500">No expenses found</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Log Expense Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-[#0B1121] border border-slate-700/50 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white">Log Expense</h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
                        </div>
                        {error && <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}
                        <div className="space-y-4">
                            <div><label className="text-xs text-slate-400 mb-1 block">Trip (optional)</label>
                                <select value={form.trip_id} onChange={e => setForm({ ...form, trip_id: e.target.value })} className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary">
                                    <option value="">No trip</option>
                                    {trips.map(t => <option key={t.id} value={t.id}>{t.origin}→{t.destination} ({t.vehicle?.license_plate})</option>)}
                                </select>
                            </div>
                            <div><label className="text-xs text-slate-400 mb-1 block">Category *</label>
                                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary">
                                    <option value="fuel">Fuel</option><option value="toll">Toll</option><option value="parking">Parking</option><option value="repair">Repair</option><option value="misc">Misc</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-xs text-slate-400 mb-1 block">Fuel Cost (₹)</label><input type="number" value={form.fuel_cost} onChange={e => setForm({ ...form, fuel_cost: Number(e.target.value) })} className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary" /></div>
                                <div><label className="text-xs text-slate-400 mb-1 block">Misc Cost (₹)</label><input type="number" value={form.misc_cost} onChange={e => setForm({ ...form, misc_cost: Number(e.target.value) })} className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary" /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-xs text-slate-400 mb-1 block">Fuel Liters</label><input type="number" value={form.fuel_liters} onChange={e => setForm({ ...form, fuel_liters: Number(e.target.value) })} className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary" /></div>
                                <div><label className="text-xs text-slate-400 mb-1 block">Distance (km)</label><input type="number" value={form.distance_km} onChange={e => setForm({ ...form, distance_km: Number(e.target.value) })} className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary" /></div>
                            </div>
                            <div><label className="text-xs text-slate-400 mb-1 block">Notes</label><textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary" /></div>
                            <div className="p-3 bg-slate-800/50 rounded-lg"><p className="text-xs text-slate-400">Total: <span className="text-white font-bold text-lg">₹{(form.fuel_cost + form.misc_cost).toLocaleString()}</span></p></div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={handleSave} disabled={loading} className="flex-1 bg-gradient-to-r from-primary to-blue-600 text-white font-semibold py-2.5 rounded-lg disabled:opacity-50">{loading ? 'Submitting...' : 'Submit for Approval'}</button>
                            <button onClick={() => setShowModal(false)} className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-lg">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showReject && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowReject(null)}>
                    <div className="bg-[#0B1121] border border-slate-700/50 rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-white mb-4">Reject Expense</h3>
                        <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Rejection reason..." rows={3} className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary mb-4" />
                        <div className="flex gap-3">
                            <button onClick={handleReject} className="flex-1 bg-red-600 text-white font-semibold py-2.5 rounded-lg">Reject</button>
                            <button onClick={() => setShowReject(null)} className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-lg">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
