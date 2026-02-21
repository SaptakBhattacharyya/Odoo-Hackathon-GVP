'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Search, Plus, X, Truck, Filter } from 'lucide-react';
import { useUserRole } from '@/lib/hooks/useUserRole';

interface Vehicle {
    id: string;
    license_plate: string;
    model: string;
    make: string;
    year: number;
    type: string;
    capacity_kg: number;
    odometer_km: number;
    status: string;
    acquisition_cost: number;
    insurance_expiry: string;
    fuel_type: string;
    notes: string;
}

const emptyVehicle = { license_plate: '', model: '', make: '', year: 2024, type: 'truck', capacity_kg: 0, odometer_km: 0, acquisition_cost: 0, insurance_expiry: '', fuel_type: 'diesel', notes: '' };

export default function VehiclesPage() {
    const supabase = createClient();
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [form, setForm] = useState(emptyVehicle);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { canWrite } = useUserRole();
    const canEditVehicles = canWrite('vehicles');

    const fetchVehicles = async () => {
        let query = supabase.from('vehicles').select('*').neq('status', 'retired').order('license_plate');
        if (statusFilter !== 'all') query = query.eq('status', statusFilter);
        if (typeFilter !== 'all') query = query.eq('type', typeFilter);
        const { data } = await query;
        if (data) setVehicles(data);
    };

    useEffect(() => { fetchVehicles(); }, [statusFilter, typeFilter]);

    const filtered = vehicles.filter(v =>
        !search || v.license_plate.toLowerCase().includes(search.toLowerCase()) || v.model.toLowerCase().includes(search.toLowerCase()) || (v.make || '').toLowerCase().includes(search.toLowerCase())
    );

    const handleSave = async () => {
        setError('');
        setLoading(true);
        try {
            if (editId) {
                const { error } = await supabase.from('vehicles').update(form).eq('id', editId);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('vehicles').insert([form]);
                if (error) throw error;
            }
            setShowModal(false);
            setForm(emptyVehicle);
            setEditId(null);
            fetchVehicles();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to save');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Retire this vehicle?')) return;
        await supabase.from('vehicles').update({ status: 'retired' }).eq('id', id);
        fetchVehicles();
    };

    const statusColors: Record<string, string> = {
        available: 'bg-green-500/10 text-green-400 border-green-500/20',
        on_trip: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        in_shop: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        retired: 'bg-slate-700/50 text-slate-400 border-slate-600',
    };

    const typeColors: Record<string, string> = {
        sedan: 'bg-purple-500/10 text-purple-400',
        van: 'bg-cyan-500/10 text-cyan-400',
        truck: 'bg-blue-500/10 text-blue-400',
        heavy_truck: 'bg-red-500/10 text-red-400',
    };

    return (
        <>
            <header className="h-16 border-b border-slate-800/40 flex items-center justify-between px-6 bg-[#050810]/40 backdrop-blur-md sticky top-0 z-30">
                <h1 className="text-xl font-bold text-slate-100">Vehicle Registry</h1>
                {canEditVehicles && (
                    <button onClick={() => { setForm(emptyVehicle); setEditId(null); setShowModal(true); setError(''); }} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-blue-600 text-white font-semibold text-sm rounded-lg shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all">
                        <Plus className="w-4 h-4" /> Add Vehicle
                    </button>
                )}
            </header>

            <div className="p-6">
                {/* Filters */}
                <div className="flex flex-wrap gap-3 mb-6">
                    <div className="relative flex-1 min-w-[200px] max-w-md group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                        <input value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary" placeholder="Search plate or model..." />
                    </div>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary">
                        <option value="all">All Status</option>
                        <option value="available">Available</option>
                        <option value="on_trip">On Trip</option>
                        <option value="in_shop">In Shop</option>
                    </select>
                    <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary">
                        <option value="all">All Types</option>
                        <option value="sedan">Sedan</option>
                        <option value="van">Van</option>
                        <option value="truck">Truck</option>
                        <option value="heavy_truck">Heavy Truck</option>
                    </select>
                </div>

                {/* Table */}
                <div className="glass-panel rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-slate-900/60 text-slate-400 font-medium uppercase text-xs tracking-wider border-b border-slate-700/30">
                                <tr>
                                    <th className="px-6 py-3">License Plate</th>
                                    <th className="px-6 py-3">Make & Model</th>
                                    <th className="px-6 py-3">Type</th>
                                    <th className="px-6 py-3">Capacity</th>
                                    <th className="px-6 py-3">Odometer</th>
                                    <th className="px-6 py-3">Year</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Insurance</th>
                                    <th className="px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/40">
                                {filtered.map(v => {
                                    const insuranceDays = v.insurance_expiry ? Math.ceil((new Date(v.insurance_expiry).getTime() - Date.now()) / 86400000) : null;
                                    return (
                                        <tr key={v.id} className="hover:bg-blue-600/5 transition-colors group">
                                            <td className="px-6 py-4 font-mono font-bold text-white">{v.license_plate}</td>
                                            <td className="px-6 py-4 text-slate-300">{v.make} {v.model}</td>
                                            <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColors[v.type]}`}>{v.type.replace('_', ' ')}</span></td>
                                            <td className="px-6 py-4 text-slate-300">{Number(v.capacity_kg).toLocaleString()} kg</td>
                                            <td className="px-6 py-4 text-slate-300">{Number(v.odometer_km).toLocaleString()} km</td>
                                            <td className="px-6 py-4 text-slate-300">{v.year}</td>
                                            <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors[v.status]}`}>{v.status.replace('_', ' ')}</span></td>
                                            <td className="px-6 py-4">
                                                <span className={`text-xs ${insuranceDays !== null && insuranceDays < 0 ? 'text-red-400' : insuranceDays !== null && insuranceDays < 30 ? 'text-amber-400' : 'text-slate-400'}`}>
                                                    {v.insurance_expiry ? new Date(v.insurance_expiry).toLocaleDateString() : '—'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {canEditVehicles && (
                                                    <div className="flex gap-2">
                                                        <button onClick={() => { setForm(v as unknown as typeof emptyVehicle); setEditId(v.id); setShowModal(true); setError(''); }} className="text-xs text-primary hover:text-blue-300">Edit</button>
                                                        <button onClick={() => handleDelete(v.id)} className="text-xs text-red-400 hover:text-red-300">Retire</button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filtered.length === 0 && <tr><td colSpan={9} className="px-6 py-12 text-center text-slate-500">No vehicles found</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-[#0B1121] border border-slate-700/50 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white">{editId ? 'Edit Vehicle' : 'Add New Vehicle'}</h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
                        </div>
                        {error && <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-slate-400 mb-1 block">License Plate *</label>
                                    <input value={form.license_plate} onChange={e => setForm({ ...form, license_plate: e.target.value.toUpperCase() })} className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary" />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-400 mb-1 block">Make</label>
                                    <input value={form.make} onChange={e => setForm({ ...form, make: e.target.value })} className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-slate-400 mb-1 block">Model *</label>
                                    <input value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary" />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-400 mb-1 block">Year</label>
                                    <input type="number" value={form.year} onChange={e => setForm({ ...form, year: Number(e.target.value) })} className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-slate-400 mb-1 block">Type *</label>
                                    <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary">
                                        <option value="sedan">Sedan</option>
                                        <option value="van">Van</option>
                                        <option value="truck">Truck</option>
                                        <option value="heavy_truck">Heavy Truck</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-400 mb-1 block">Fuel Type</label>
                                    <select value={form.fuel_type} onChange={e => setForm({ ...form, fuel_type: e.target.value })} className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary">
                                        <option value="diesel">Diesel</option>
                                        <option value="petrol">Petrol</option>
                                        <option value="electric">Electric</option>
                                        <option value="hybrid">Hybrid</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-slate-400 mb-1 block">Capacity (kg) *</label>
                                    <input type="number" value={form.capacity_kg} onChange={e => setForm({ ...form, capacity_kg: Number(e.target.value) })} className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary" />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-400 mb-1 block">Odometer (km)</label>
                                    <input type="number" value={form.odometer_km} onChange={e => setForm({ ...form, odometer_km: Number(e.target.value) })} className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-slate-400 mb-1 block">Acquisition Cost ($)</label>
                                    <input type="number" value={form.acquisition_cost} onChange={e => setForm({ ...form, acquisition_cost: Number(e.target.value) })} className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary" />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-400 mb-1 block">Insurance Expiry</label>
                                    <input type="date" value={form.insurance_expiry} onChange={e => setForm({ ...form, insurance_expiry: e.target.value })} className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 mb-1 block">Notes</label>
                                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary" />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={handleSave} disabled={loading} className="flex-1 bg-gradient-to-r from-primary to-blue-600 text-white font-semibold py-2.5 rounded-lg disabled:opacity-50">{loading ? 'Saving...' : 'Save'}</button>
                            <button onClick={() => setShowModal(false)} className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
