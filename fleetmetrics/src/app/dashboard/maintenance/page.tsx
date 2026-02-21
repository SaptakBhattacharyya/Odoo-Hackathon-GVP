'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Search, Plus, X, Wrench, AlertTriangle, CheckCircle } from 'lucide-react';
import { useUserRole } from '@/lib/hooks/useUserRole';

interface MaintenanceLog {
    id: string; vehicle_id: string; issue_title: string; description: string; severity: string;
    cost: number; status: string; scheduled_date: string; resolved_date: string;
    technician_name: string; workshop_name: string; created_at: string;
    vehicle: { license_plate: string; model: string } | null;
}

interface Vehicle { id: string; license_plate: string; model: string; status: string; }

const emptyForm = { vehicle_id: '', issue_title: '', description: '', severity: 'medium', cost: 0, scheduled_date: '', technician_name: '', workshop_name: '' };

export default function MaintenancePage() {
    const supabase = createClient();
    const [logs, setLogs] = useState<MaintenanceLog[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [severityFilter, setSeverityFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { canWrite } = useUserRole();
    const canEditMaintenance = canWrite('maintenance');

    const fetchLogs = async () => {
        let query = supabase.from('maintenance_logs').select('*, vehicle:vehicles(license_plate, model)').order('created_at', { ascending: false });
        if (statusFilter !== 'all') query = query.eq('status', statusFilter);
        if (severityFilter !== 'all') query = query.eq('severity', severityFilter);
        const { data } = await query;
        if (data) setLogs(data as unknown as MaintenanceLog[]);
    };

    const fetchVehicles = async () => {
        const { data } = await supabase.from('vehicles').select('id, license_plate, model, status').neq('status', 'retired');
        if (data) setVehicles(data);
    };

    useEffect(() => { fetchLogs(); fetchVehicles(); }, [statusFilter, severityFilter]);

    const filtered = logs.filter(l => !search || l.issue_title.toLowerCase().includes(search.toLowerCase()) || l.vehicle?.license_plate?.toLowerCase().includes(search.toLowerCase()));

    const handleSave = async () => {
        setError(''); setLoading(true);
        try {
            if (editId) {
                const { error } = await supabase.from('maintenance_logs').update(form).eq('id', editId);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('maintenance_logs').insert([{ ...form, status: 'open' }]);
                if (error) throw error;
            }
            setShowModal(false); setForm(emptyForm); setEditId(null); fetchLogs(); fetchVehicles();
        } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Failed'); }
        finally { setLoading(false); }
    };

    const handleResolve = async (id: string) => {
        await supabase.from('maintenance_logs').update({ status: 'resolved', resolved_date: new Date().toISOString().split('T')[0] }).eq('id', id);
        fetchLogs(); fetchVehicles();
    };

    const handleProgress = async (id: string) => {
        await supabase.from('maintenance_logs').update({ status: 'in_progress' }).eq('id', id);
        fetchLogs();
    };

    const severityColors: Record<string, string> = { low: 'bg-blue-500/10 text-blue-400', medium: 'bg-amber-500/10 text-amber-400', high: 'bg-orange-500/10 text-orange-400', critical: 'bg-red-500/10 text-red-400' };
    const statusColors: Record<string, string> = { open: 'bg-red-500/10 text-red-400', in_progress: 'bg-amber-500/10 text-amber-400', resolved: 'bg-green-500/10 text-green-400' };

    const openCount = logs.filter(l => l.status === 'open').length;
    const inShopCount = vehicles.filter(v => v.status === 'in_shop').length;
    const totalCost = logs.reduce((s, l) => s + Number(l.cost), 0);

    return (
        <>
            <header className="h-16 border-b border-slate-800/40 flex items-center justify-between px-6 bg-[#050810]/40 backdrop-blur-md sticky top-0 z-30">
                <h1 className="text-xl font-bold text-slate-100">Maintenance & Service</h1>
                {canEditMaintenance && (
                    <button onClick={() => { setForm(emptyForm); setEditId(null); setShowModal(true); setError(''); fetchVehicles(); }} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-blue-600 text-white font-semibold text-sm rounded-lg shadow-lg shadow-blue-500/20">
                        <Plus className="w-4 h-4" /> Log Maintenance
                    </button>
                )}
            </header>

            <div className="p-6">
                {/* Summary */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="glass-panel rounded-xl p-4 border border-red-500/20"><p className="text-xs text-slate-400 mb-1">Open Logs</p><p className="text-2xl font-bold text-red-400">{openCount}</p></div>
                    <div className="glass-panel rounded-xl p-4 border border-amber-500/20"><p className="text-xs text-slate-400 mb-1">Vehicles In Shop</p><p className="text-2xl font-bold text-amber-400">{inShopCount}</p></div>
                    <div className="glass-panel rounded-xl p-4 border border-cyan-500/20"><p className="text-xs text-slate-400 mb-1">Total Cost</p><p className="text-2xl font-bold text-cyan-400">₹{totalCost.toLocaleString()}</p></div>
                </div>

                <div className="flex flex-wrap gap-3 mb-6">
                    <div className="relative flex-1 min-w-[200px] max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                        <input value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary" placeholder="Search..." />
                    </div>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary">
                        <option value="all">All Status</option><option value="open">Open</option><option value="in_progress">In Progress</option><option value="resolved">Resolved</option>
                    </select>
                    <select value={severityFilter} onChange={e => setSeverityFilter(e.target.value)} className="bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary">
                        <option value="all">All Severity</option><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option>
                    </select>
                </div>

                <div className="glass-panel rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-slate-900/60 text-slate-400 font-medium uppercase text-xs tracking-wider border-b border-slate-700/30">
                                <tr>
                                    <th className="px-6 py-3">Vehicle</th><th className="px-6 py-3">Issue</th><th className="px-6 py-3">Severity</th><th className="px-6 py-3">Cost</th><th className="px-6 py-3">Status</th><th className="px-6 py-3">Date</th><th className="px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/40">
                                {filtered.map(l => (
                                    <tr key={l.id} className="hover:bg-blue-600/5 transition-colors">
                                        <td className="px-6 py-4 text-slate-300">{l.vehicle?.license_plate || '—'} <span className="text-xs text-slate-500">{l.vehicle?.model}</span></td>
                                        <td className="px-6 py-4 text-white font-medium">{l.issue_title}</td>
                                        <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${severityColors[l.severity]}`}>{l.severity}</span></td>
                                        <td className="px-6 py-4 text-slate-300">₹{Number(l.cost).toLocaleString()}</td>
                                        <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[l.status]}`}>{l.status.replace('_', ' ')}</span></td>
                                        <td className="px-6 py-4 text-slate-400 text-xs">{new Date(l.created_at).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">
                                            {canEditMaintenance && (
                                                <div className="flex gap-2">
                                                    {l.status === 'open' && <button onClick={() => handleProgress(l.id)} className="text-xs text-amber-400">Start</button>}
                                                    {l.status !== 'resolved' && <button onClick={() => handleResolve(l.id)} className="text-xs text-green-400">Resolve</button>}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {filtered.length === 0 && <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-500">No logs found</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-[#0B1121] border border-slate-700/50 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white">Log Maintenance</h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
                        </div>
                        {error && <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}
                        <div className="space-y-4">
                            <div><label className="text-xs text-slate-400 mb-1 block">Vehicle *</label>
                                <select value={form.vehicle_id} onChange={e => setForm({ ...form, vehicle_id: e.target.value })} className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary">
                                    <option value="">Select vehicle...</option>
                                    {vehicles.map(v => <option key={v.id} value={v.id}>{v.license_plate} — {v.model}</option>)}
                                </select>
                            </div>
                            <div><label className="text-xs text-slate-400 mb-1 block">Issue Title *</label><input value={form.issue_title} onChange={e => setForm({ ...form, issue_title: e.target.value })} className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary" /></div>
                            <div><label className="text-xs text-slate-400 mb-1 block">Description</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary" /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-xs text-slate-400 mb-1 block">Severity *</label>
                                    <select value={form.severity} onChange={e => setForm({ ...form, severity: e.target.value })} className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary">
                                        <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option>
                                    </select>
                                </div>
                                <div><label className="text-xs text-slate-400 mb-1 block">Cost (₹)</label><input type="number" value={form.cost} onChange={e => setForm({ ...form, cost: Number(e.target.value) })} className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary" /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-xs text-slate-400 mb-1 block">Technician</label><input value={form.technician_name} onChange={e => setForm({ ...form, technician_name: e.target.value })} className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary" /></div>
                                <div><label className="text-xs text-slate-400 mb-1 block">Workshop</label><input value={form.workshop_name} onChange={e => setForm({ ...form, workshop_name: e.target.value })} className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary" /></div>
                            </div>
                            <div><label className="text-xs text-slate-400 mb-1 block">Scheduled Date</label><input type="date" value={form.scheduled_date} onChange={e => setForm({ ...form, scheduled_date: e.target.value })} className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary" /></div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={handleSave} disabled={loading} className="flex-1 bg-gradient-to-r from-primary to-blue-600 text-white font-semibold py-2.5 rounded-lg disabled:opacity-50">{loading ? 'Saving...' : 'Create Log'}</button>
                            <button onClick={() => setShowModal(false)} className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-lg">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
