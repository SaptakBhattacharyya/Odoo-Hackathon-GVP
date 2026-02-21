'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Search, Plus, X, MapPin, ArrowRight, CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { useUserRole } from '@/lib/hooks/useUserRole';

interface Vehicle { id: string; license_plate: string; model: string; type: string; capacity_kg: number; status: string; }
interface Driver { id: string; name: string; license_number: string; license_class: string; license_expiry: string; status: string; }
interface Trip {
    id: string; vehicle_id: string; driver_id: string; origin: string; destination: string; cargo_weight_kg: number;
    cargo_description: string; status: string; fuel_estimate: number; distance_km: number; dispatched_at: string;
    completed_at: string; cancelled_at: string; cancellation_reason: string; created_at: string; notes: string;
    vehicle: { license_plate: string; model: string; type: string } | null;
    driver: { name: string; license_class: string } | null;
}

export default function TripsPage() {
    const supabase = createClient();
    const [trips, setTrips] = useState<Trip[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showCreate, setShowCreate] = useState(false);
    const [showComplete, setShowComplete] = useState<string | null>(null);
    const [showCancel, setShowCancel] = useState<string | null>(null);
    const [odometerEnd, setOdometerEnd] = useState('');
    const [cancelReason, setCancelReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({ vehicle_id: '', driver_id: '', origin: '', destination: '', cargo_weight_kg: 0, cargo_description: '', fuel_estimate: 0, notes: '' });
    const { canWrite } = useUserRole();
    const canEditTrips = canWrite('trips');

    const fetchTrips = async () => {
        let query = supabase.from('trips').select('*, vehicle:vehicles(license_plate, model, type), driver:drivers(name, license_class)').order('created_at', { ascending: false });
        if (statusFilter !== 'all') query = query.eq('status', statusFilter);
        const { data } = await query;
        if (data) setTrips(data as unknown as Trip[]);
    };

    const fetchOptions = async () => {
        const { data: v } = await supabase.from('vehicles').select('id, license_plate, model, type, capacity_kg, status').eq('status', 'available');
        if (v) setVehicles(v);
        const { data: d } = await supabase.from('drivers').select('id, name, license_number, license_class, license_expiry, status').eq('status', 'on_duty');
        if (d) setDrivers(d);
    };

    useEffect(() => { fetchTrips(); fetchOptions(); }, [statusFilter]);

    const handleCreate = async () => {
        setError(''); setLoading(true);
        try {
            const { error } = await supabase.from('trips').insert([{ ...form, status: 'draft' }]);
            if (error) throw error;
            setShowCreate(false);
            setForm({ vehicle_id: '', driver_id: '', origin: '', destination: '', cargo_weight_kg: 0, cargo_description: '', fuel_estimate: 0, notes: '' });
            fetchTrips(); fetchOptions();
        } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Failed'); }
        finally { setLoading(false); }
    };

    const handleDispatch = async (tripId: string) => {
        setLoading(true);
        try {
            const { data } = await supabase.rpc('dispatch_trip', { p_trip_id: tripId });
            if (data && !data.success) throw new Error(data.error);
            fetchTrips(); fetchOptions();
        } catch (err: unknown) { alert(err instanceof Error ? err.message : 'Dispatch failed'); }
        finally { setLoading(false); }
    };

    const handleComplete = async () => {
        if (!showComplete || !odometerEnd) return;
        setLoading(true);
        try {
            const { data } = await supabase.rpc('complete_trip', { p_trip_id: showComplete, p_odometer_end: Number(odometerEnd) });
            if (data && !data.success) throw new Error(data.error);
            setShowComplete(null); setOdometerEnd('');
            fetchTrips(); fetchOptions();
        } catch (err: unknown) { alert(err instanceof Error ? err.message : 'Complete failed'); }
        finally { setLoading(false); }
    };

    const handleCancel = async () => {
        if (!showCancel || !cancelReason) return;
        setLoading(true);
        try {
            const { data } = await supabase.rpc('cancel_trip', { p_trip_id: showCancel, p_reason: cancelReason });
            if (data && !data.success) throw new Error(data.error);
            setShowCancel(null); setCancelReason('');
            fetchTrips(); fetchOptions();
        } catch (err: unknown) { alert(err instanceof Error ? err.message : 'Cancel failed'); }
        finally { setLoading(false); }
    };

    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
        draft: { bg: 'bg-slate-700/50', text: 'text-slate-300', label: 'Draft' },
        dispatched: { bg: 'bg-blue-500/10', text: 'text-blue-400', label: 'Dispatched' },
        in_transit: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', label: 'In Transit' },
        completed: { bg: 'bg-green-500/10', text: 'text-green-400', label: 'Completed' },
        cancelled: { bg: 'bg-red-500/10', text: 'text-red-400', label: 'Cancelled' },
    };

    const filtered = trips.filter(t => !search || t.origin.toLowerCase().includes(search.toLowerCase()) || t.destination.toLowerCase().includes(search.toLowerCase()) || t.vehicle?.license_plate?.toLowerCase().includes(search.toLowerCase()) || t.driver?.name?.toLowerCase().includes(search.toLowerCase()));

    return (
        <>
            <header className="h-16 border-b border-slate-800/40 flex items-center justify-between px-6 bg-[#050810]/40 backdrop-blur-md sticky top-0 z-30">
                <h1 className="text-xl font-bold text-slate-100">Trip Dispatcher</h1>
                {canEditTrips && (
                    <button onClick={() => { setShowCreate(true); setError(''); fetchOptions(); }} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-blue-600 text-white font-semibold text-sm rounded-lg shadow-lg shadow-blue-500/20">
                        <Plus className="w-4 h-4" /> Create Trip
                    </button>
                )}
            </header>

            <div className="p-6">
                <div className="flex flex-wrap gap-3 mb-6">
                    <div className="relative flex-1 min-w-[200px] max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                        <input value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary" placeholder="Search trips..." />
                    </div>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary">
                        <option value="all">All Status</option>
                        <option value="draft">Draft</option>
                        <option value="dispatched">Dispatched</option>
                        <option value="in_transit">In Transit</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>

                <div className="glass-panel rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-slate-900/60 text-slate-400 font-medium uppercase text-xs tracking-wider border-b border-slate-700/30">
                                <tr>
                                    <th className="px-6 py-3">Trip ID</th>
                                    <th className="px-6 py-3">Vehicle</th>
                                    <th className="px-6 py-3">Driver</th>
                                    <th className="px-6 py-3">Route</th>
                                    <th className="px-6 py-3">Cargo</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/40">
                                {filtered.map(t => {
                                    const sc = statusConfig[t.status] || statusConfig.draft;
                                    return (
                                        <tr key={t.id} className="hover:bg-blue-600/5 transition-colors">
                                            <td className="px-6 py-4 font-mono text-primary">#{t.id.slice(0, 8)}</td>
                                            <td className="px-6 py-4 text-slate-300">{t.vehicle?.license_plate || '—'} <span className="text-slate-500 text-xs">{t.vehicle?.model}</span></td>
                                            <td className="px-6 py-4 text-slate-300">{t.driver?.name || '—'}</td>
                                            <td className="px-6 py-4"><span className="text-slate-300">{t.origin}</span> <ArrowRight className="inline w-3 h-3 text-primary/70 mx-1" /> <span className="text-slate-300">{t.destination}</span></td>
                                            <td className="px-6 py-4 text-slate-300">{t.cargo_weight_kg} kg</td>
                                            <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${sc.bg} ${sc.text}`}>{sc.label}</span></td>
                                            <td className="px-6 py-4">
                                                {canEditTrips && (
                                                    <div className="flex gap-2">
                                                        {t.status === 'draft' && <button onClick={() => handleDispatch(t.id)} className="text-xs text-green-400 hover:text-green-300 font-medium">Dispatch</button>}
                                                        {['dispatched', 'in_transit'].includes(t.status) && <button onClick={() => setShowComplete(t.id)} className="text-xs text-blue-400 hover:text-blue-300 font-medium">Complete</button>}
                                                        {!['completed', 'cancelled'].includes(t.status) && <button onClick={() => setShowCancel(t.id)} className="text-xs text-red-400 hover:text-red-300 font-medium">Cancel</button>}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filtered.length === 0 && <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-500">No trips found</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Create Trip Modal */}
            {showCreate && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
                    <div className="bg-[#0B1121] border border-slate-700/50 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white">Create New Trip</h3>
                            <button onClick={() => setShowCreate(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
                        </div>
                        {error && <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-slate-400 mb-1 block">Vehicle *</label>
                                <select value={form.vehicle_id} onChange={e => setForm({ ...form, vehicle_id: e.target.value })} className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary">
                                    <option value="">Select vehicle...</option>
                                    {vehicles.map(v => <option key={v.id} value={v.id}>{v.license_plate} — {v.model} ({v.type}) — {v.capacity_kg}kg</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 mb-1 block">Driver *</label>
                                <select value={form.driver_id} onChange={e => setForm({ ...form, driver_id: e.target.value })} className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary">
                                    <option value="">Select driver...</option>
                                    {drivers.map(d => <option key={d.id} value={d.id}>{d.name} — Class {d.license_class} (exp: {d.license_expiry})</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-xs text-slate-400 mb-1 block">Origin *</label><input value={form.origin} onChange={e => setForm({ ...form, origin: e.target.value })} className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary" /></div>
                                <div><label className="text-xs text-slate-400 mb-1 block">Destination *</label><input value={form.destination} onChange={e => setForm({ ...form, destination: e.target.value })} className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary" /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-xs text-slate-400 mb-1 block">Cargo Weight (kg) *</label><input type="number" value={form.cargo_weight_kg} onChange={e => setForm({ ...form, cargo_weight_kg: Number(e.target.value) })} className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary" /></div>
                                <div><label className="text-xs text-slate-400 mb-1 block">Fuel Estimate ($)</label><input type="number" value={form.fuel_estimate} onChange={e => setForm({ ...form, fuel_estimate: Number(e.target.value) })} className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary" /></div>
                            </div>
                            <div><label className="text-xs text-slate-400 mb-1 block">Cargo Description</label><input value={form.cargo_description} onChange={e => setForm({ ...form, cargo_description: e.target.value })} className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary" /></div>
                            <div><label className="text-xs text-slate-400 mb-1 block">Notes</label><textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary" /></div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={handleCreate} disabled={loading} className="flex-1 bg-gradient-to-r from-primary to-blue-600 text-white font-semibold py-2.5 rounded-lg disabled:opacity-50">{loading ? 'Creating...' : 'Save as Draft'}</button>
                            <button onClick={() => setShowCreate(false)} className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-lg">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Complete Modal */}
            {showComplete && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowComplete(null)}>
                    <div className="bg-[#0B1121] border border-slate-700/50 rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-white mb-4">Complete Trip</h3>
                        <label className="text-xs text-slate-400 mb-1 block">Final Odometer Reading (km) *</label>
                        <input type="number" value={odometerEnd} onChange={e => setOdometerEnd(e.target.value)} className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary mb-4" />
                        <div className="flex gap-3">
                            <button onClick={handleComplete} disabled={loading} className="flex-1 bg-green-600 hover:bg-green-500 text-white font-semibold py-2.5 rounded-lg disabled:opacity-50">{loading ? 'Completing...' : 'Mark Complete'}</button>
                            <button onClick={() => setShowComplete(null)} className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-lg">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancel Modal */}
            {showCancel && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowCancel(null)}>
                    <div className="bg-[#0B1121] border border-slate-700/50 rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-white mb-4">Cancel Trip</h3>
                        <label className="text-xs text-slate-400 mb-1 block">Cancellation Reason *</label>
                        <textarea value={cancelReason} onChange={e => setCancelReason(e.target.value)} rows={3} className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary mb-4" />
                        <div className="flex gap-3">
                            <button onClick={handleCancel} disabled={loading} className="flex-1 bg-red-600 hover:bg-red-500 text-white font-semibold py-2.5 rounded-lg disabled:opacity-50">{loading ? 'Cancelling...' : 'Cancel Trip'}</button>
                            <button onClick={() => setShowCancel(null)} className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-lg">Back</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
