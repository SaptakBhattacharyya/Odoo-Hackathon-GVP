'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Search, Bell, TrendingUp, Truck, Wrench, Package, Zap, ArrowRight, Filter, Download } from 'lucide-react';

interface KPIs {
    active_fleet: number;
    maintenance_alerts: number;
    pending_cargo: number;
    total_vehicles: number;
    utilization_rate: number;
}

interface Trip {
    id: string;
    origin: string;
    destination: string;
    status: string;
    cargo_weight_kg: number;
    dispatched_at: string;
    created_at: string;
    vehicle: { license_plate: string; model: string; type: string } | null;
    driver: { name: string } | null;
}

interface DriverAlert {
    id: string;
    name: string;
    safety_score: number;
    license_expiry: string;
}

export default function DashboardPage() {
    const supabase = createClient();
    const [kpis, setKpis] = useState<KPIs | null>(null);
    const [trips, setTrips] = useState<Trip[]>([]);
    const [alerts, setAlerts] = useState<DriverAlert[]>([]);
    const [search, setSearch] = useState('');

    const fetchData = async () => {
        const { data: kpiData } = await supabase.rpc('get_dashboard_kpis');
        if (kpiData) setKpis(kpiData);

        const { data: tripData } = await supabase
            .from('trips')
            .select('*, vehicle:vehicles(license_plate, model, type), driver:drivers(name)')
            .order('created_at', { ascending: false })
            .limit(10);
        if (tripData) setTrips(tripData as unknown as Trip[]);

        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        const { data: alertData } = await supabase
            .from('drivers')
            .select('id, name, safety_score, license_expiry')
            .or(`safety_score.lt.60,license_expiry.lte.${thirtyDaysFromNow.toISOString().split('T')[0]}`)
            .order('safety_score', { ascending: true });
        if (alertData) setAlerts(alertData);
    };

    useEffect(() => {
        fetchData();
        const channel = supabase
            .channel('dashboard-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'trips' }, () => fetchData())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'vehicles' }, () => fetchData())
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, []);

    const statusConfig: Record<string, { bg: string; text: string; dot: string; label: string }> = {
        draft: { bg: 'bg-slate-700/50', text: 'text-slate-300', dot: '', label: 'Draft' },
        dispatched: { bg: 'bg-slate-700/50', text: 'text-slate-300', dot: '', label: 'Dispatched' },
        in_transit: { bg: 'bg-blue-500/10', text: 'text-blue-400', dot: 'bg-blue-500', label: 'In Transit' },
        completed: { bg: 'bg-green-500/10', text: 'text-green-400', dot: 'bg-green-500', label: 'Completed' },
        cancelled: { bg: 'bg-red-500/10', text: 'text-red-400', dot: '', label: 'Cancelled' },
    };

    const timeAgo = (date: string) => {
        if (!date) return '—';
        const diff = Date.now() - new Date(date).getTime();
        const hours = Math.floor(diff / 3600000);
        if (hours < 1) return `${Math.floor(diff / 60000)}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    };

    const filteredTrips = trips.filter(t =>
        !search || t.origin.toLowerCase().includes(search.toLowerCase()) ||
        t.destination.toLowerCase().includes(search.toLowerCase()) ||
        t.vehicle?.license_plate?.toLowerCase().includes(search.toLowerCase()) ||
        t.driver?.name?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <>
            {/* Top Bar */}
            <header className="h-16 border-b border-slate-800/40 flex items-center justify-between px-6 bg-[#050810]/40 backdrop-blur-md sticky top-0 z-30">
                <div className="flex items-center gap-4 flex-1">
                    <h1 className="text-xl font-bold tracking-tight hidden md:block text-slate-100">Command Center</h1>
                    <div className="h-6 w-px bg-slate-700/50 mx-2 hidden md:block" />
                    <div className="relative max-w-md w-full md:w-96 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5 group-focus-within:text-primary transition-colors" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                            placeholder="Search vehicle, driver, or trip..."
                        />
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button className="relative p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                        <Bell className="w-5 h-5" />
                        {alerts.length > 0 && <span className="absolute top-2 right-2 size-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-full animate-pulse" />}
                    </button>
                </div>
            </header>

            <div className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1 flex flex-col gap-6 min-w-0">
                        {/* KPI Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                            {[
                                { label: 'Active Fleet', value: kpis?.active_fleet ?? '—', color: 'blue', icon: Truck, trend: '+2', percent: kpis ? Math.round((kpis.active_fleet / Math.max(kpis.total_vehicles, 1)) * 100) : 0 },
                                { label: 'Maintenance', value: kpis?.maintenance_alerts ?? '—', color: 'amber', icon: Wrench, trend: 'Urgent', percent: kpis ? Math.round((kpis.maintenance_alerts / Math.max(kpis.total_vehicles, 1)) * 100) : 0 },
                                { label: 'Pending Cargo', value: kpis?.pending_cargo ?? '—', color: 'cyan', icon: Package, trend: 'Ready', percent: 45 },
                                { label: 'Utilization', value: `${kpis?.utilization_rate ?? 0}%`, color: 'green', icon: Zap, trend: 'Optimal', percent: kpis?.utilization_rate ?? 0 },
                            ].map((card) => {
                                const colorMap: Record<string, { border: string; glow: string; bg: string; text: string; bar: string }> = {
                                    blue: { border: 'border-blue-500/30', glow: 'shadow-[0_0_40px_-10px_rgba(59,130,246,0.3)]', bg: 'bg-blue-500/20', text: 'text-blue-100/90', bar: 'from-blue-600 via-blue-400 to-cyan-300' },
                                    amber: { border: 'border-amber-500/30', glow: 'shadow-[0_0_40px_-10px_rgba(245,158,11,0.3)]', bg: 'bg-amber-500/20', text: 'text-amber-100/90', bar: 'from-amber-600 via-amber-400 to-orange-400' },
                                    cyan: { border: 'border-cyan-500/30', glow: 'shadow-[0_0_40px_-10px_rgba(6,182,212,0.3)]', bg: 'bg-cyan-500/20', text: 'text-cyan-100/90', bar: 'from-cyan-600 via-cyan-400 to-teal-300' },
                                    green: { border: 'border-green-500/30', glow: 'shadow-[0_0_40px_-10px_rgba(16,185,129,0.3)]', bg: 'bg-green-500/20', text: 'text-green-100/90', bar: 'from-green-600 via-green-400 to-emerald-300' },
                                };
                                const c = colorMap[card.color];
                                return (
                                    <div key={card.label} className={`rounded-xl p-5 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300 bg-gradient-to-br from-[#0B1121]/80 to-[#0B1121]/60 ${c.border} ${c.glow}`}>
                                        <div className={`absolute -right-8 -top-8 w-40 h-40 ${c.bg} rounded-full blur-3xl`} />
                                        <div className="flex flex-col h-full justify-between relative z-10">
                                            <div className={`flex items-center gap-2 ${c.text} text-sm font-medium mb-2`}>
                                                <span className={`w-2 h-2 rounded-full ${c.bg} animate-pulse`} />
                                                {card.label}
                                            </div>
                                            <div className="flex items-end gap-3">
                                                <span className="text-3xl font-bold text-white tracking-tight">{card.value}</span>
                                                <span className={`text-xs font-medium mb-1.5 flex items-center ${c.bg} px-1.5 py-0.5 rounded ${c.border}`}>
                                                    {card.color === 'blue' && <TrendingUp className="w-3 h-3 mr-0.5" />}
                                                    {card.trend}
                                                </span>
                                            </div>
                                            <div className="w-full bg-slate-900/80 h-1.5 mt-4 rounded-full overflow-hidden border border-slate-700/30">
                                                <div className={`bg-gradient-to-r ${c.bar} h-full rounded-full`} style={{ width: `${card.percent}%` }} />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Live Trip Table */}
                        <div className="flex flex-col flex-1 glass-panel rounded-xl overflow-hidden min-h-[400px]">
                            <div className="px-6 py-4 border-b border-slate-700/40 flex items-center justify-between bg-slate-900/40">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-lg font-bold text-white tracking-tight">LIVE OPERATIONS</h3>
                                    <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-red-500/10 border border-red-500/20">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                                        </span>
                                        <span className="text-[10px] font-bold text-red-500 tracking-wider">LIVE</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-1.5 text-slate-400 hover:text-white rounded bg-slate-800/50 hover:bg-blue-600/20 border border-slate-700 transition-all">
                                        <Filter className="w-4 h-4" />
                                    </button>
                                    <button className="p-1.5 text-slate-400 hover:text-white rounded bg-slate-800/50 hover:bg-blue-600/20 border border-slate-700 transition-all">
                                        <Download className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="flex-1 overflow-x-auto">
                                <table className="w-full text-left text-sm whitespace-nowrap">
                                    <thead className="bg-slate-900/60 text-slate-400 font-medium uppercase text-xs tracking-wider border-b border-slate-700/30">
                                        <tr>
                                            <th className="px-6 py-3">Trip ID</th>
                                            <th className="px-6 py-3">Vehicle</th>
                                            <th className="px-6 py-3">Driver</th>
                                            <th className="px-6 py-3">Route</th>
                                            <th className="px-6 py-3">Cargo</th>
                                            <th className="px-6 py-3">Status</th>
                                            <th className="px-6 py-3 text-right">Time</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/40">
                                        {filteredTrips.map((trip) => {
                                            const sc = statusConfig[trip.status] || statusConfig.draft;
                                            return (
                                                <tr key={trip.id} className="hover:bg-gradient-to-r hover:from-blue-600/10 hover:to-transparent transition-colors group cursor-pointer">
                                                    <td className="px-6 py-4 font-mono text-primary font-medium">#{trip.id.slice(0, 8)}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <Truck className="w-4 h-4 text-slate-500" />
                                                            <span className="text-slate-200">{trip.vehicle?.license_plate || '—'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-300">{trip.driver?.name || '—'}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2 text-slate-400">
                                                            <span className="text-slate-300 font-medium">{trip.origin}</span>
                                                            <ArrowRight className="w-3 h-3 text-primary/70" />
                                                            <span className="text-slate-300 font-medium">{trip.destination}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-300">{trip.cargo_weight_kg} kg</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${sc.bg} ${sc.text} border border-current/20`}>
                                                            {sc.dot && <span className={`w-1.5 h-1.5 rounded-full ${sc.dot} animate-pulse`} />}
                                                            {sc.label}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-mono text-slate-300">{timeAgo(trip.dispatched_at || trip.created_at)}</td>
                                                </tr>
                                            );
                                        })}
                                        {filteredTrips.length === 0 && (
                                            <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-500">No trips found</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Alerts Panel */}
                    <div className="w-full lg:w-80 flex-shrink-0">
                        <div className="glass-panel p-5 rounded-xl flex flex-col bg-gradient-to-b from-[#0f172a] to-[#050810] border border-slate-700/50 relative overflow-hidden">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-white uppercase tracking-wider">Alerts</h2>
                                <span className="bg-slate-800 text-slate-400 text-xs px-2 py-1 rounded border border-slate-700/50">Live</span>
                            </div>
                            <div className="flex flex-col gap-4 overflow-y-auto pr-1 max-h-[500px]">
                                {alerts.map((alert) => {
                                    const isExpiring = new Date(alert.license_expiry) <= new Date(Date.now() + 30 * 86400000);
                                    const isLowScore = alert.safety_score < 60;
                                    return (
                                        <div key={alert.id} className={`border-l-2 p-4 rounded-r-lg cursor-pointer transition-all ${isLowScore ? 'bg-gradient-to-r from-red-500/10 to-transparent border-red-500' : 'bg-gradient-to-r from-amber-500/10 to-transparent border-amber-500'
                                            }`}>
                                            <div className="flex justify-between items-start mb-1">
                                                <span className={`text-xs font-bold uppercase tracking-wider ${isLowScore ? 'text-red-500' : 'text-amber-500'}`}>
                                                    {isLowScore ? 'High Priority' : 'Warning'}
                                                </span>
                                            </div>
                                            <h4 className="text-slate-200 font-semibold text-sm mb-1">{alert.name}</h4>
                                            <p className="text-xs text-slate-400">
                                                {isLowScore && `Safety score: ${alert.safety_score}/100`}
                                                {isExpiring && `License expires: ${new Date(alert.license_expiry).toLocaleDateString()}`}
                                            </p>
                                        </div>
                                    );
                                })}
                                {alerts.length === 0 && (
                                    <div className="text-center text-slate-500 py-8 text-sm">No active alerts</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
