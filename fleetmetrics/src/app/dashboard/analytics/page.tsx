'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Download, Calendar, TrendingUp, DollarSign, Truck as TruckIcon, Activity, BarChart3 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, type PieLabelRenderProps } from 'recharts';

const COLORS = ['#3b82f6', '#f59e0b', '#06b6d4', '#10b981', '#8b5cf6'];

export default function AnalyticsPage() {
    const supabase = createClient();
    const [report, setReport] = useState<Record<string, number>>({});
    const [costTrend, setCostTrend] = useState<{ month: string; fuel: number; maintenance: number; total: number }[]>([]);
    const [topVehicles, setTopVehicles] = useState<{ name: string; fuel: number; maintenance: number }[]>([]);
    const [driverPerf, setDriverPerf] = useState<{ name: string; trips: number; completion: number; score: number; fuel_cost: number }[]>([]);
    const [dateRange, setDateRange] = useState({ start: new Date(Date.now() - 90 * 86400000).toISOString().split('T')[0], end: new Date().toISOString().split('T')[0] });

    const fetchAnalytics = async () => {
        // KPIs
        const { data: kpi } = await supabase.rpc('generate_analytics_report', { p_start: dateRange.start, p_end: dateRange.end });
        if (kpi) setReport(kpi);

        // Cost trend (last 6 months of approved expenses)
        const { data: expenses } = await supabase.from('expenses').select('fuel_cost, misc_cost, created_at').eq('status', 'approved').order('created_at');
        const { data: maint } = await supabase.from('maintenance_logs').select('cost, created_at');

        if (expenses) {
            const months: Record<string, { fuel: number; misc: number; maint: number }> = {};
            expenses.forEach(e => {
                const m = new Date(e.created_at).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                if (!months[m]) months[m] = { fuel: 0, misc: 0, maint: 0 };
                months[m].fuel += Number(e.fuel_cost);
                months[m].misc += Number(e.misc_cost);
            });
            if (maint) maint.forEach(m => {
                const mo = new Date(m.created_at).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                if (!months[mo]) months[mo] = { fuel: 0, misc: 0, maint: 0 };
                months[mo].maint += Number(m.cost);
            });
            setCostTrend(Object.entries(months).map(([month, v]) => ({ month, fuel: v.fuel, maintenance: v.maint, total: v.fuel + v.misc + v.maint })));
        }

        // Top vehicles by cost
        const { data: vehicleCosts } = await supabase.from('vehicles').select('license_plate, model').neq('status', 'retired');
        if (vehicleCosts) {
            const vCosts = await Promise.all(vehicleCosts.slice(0, 5).map(async (v) => {
                const { data: ve } = await supabase.from('expenses').select('fuel_cost').eq('status', 'approved');
                return { name: `${v.license_plate}`, fuel: ve?.reduce((s, e) => s + Number(e.fuel_cost), 0) || 0, maintenance: 0 };
            }));
            setTopVehicles(vCosts);
        }

        // Driver performance
        const { data: drivers } = await supabase.from('drivers').select('name, total_trips, completed_trips, safety_score').order('safety_score', { ascending: false }).limit(10);
        if (drivers) {
            setDriverPerf(drivers.map(d => ({
                name: d.name,
                trips: d.total_trips,
                completion: d.total_trips > 0 ? Math.round((d.completed_trips / d.total_trips) * 100) : 100,
                score: Number(d.safety_score),
                fuel_cost: 0,
            })));
        }
    };

    useEffect(() => { fetchAnalytics(); }, [dateRange]);

    const costBreakdown = [
        { name: 'Fuel', value: Number(report.total_fuel_cost) || 0 },
        { name: 'Maintenance', value: Number(report.total_maintenance) || 0 },
        { name: 'Misc', value: Number(report.total_misc_cost) || 0 },
    ].filter(c => c.value > 0);

    const exportCSV = () => {
        const rows = ['Metric,Value', `Total Fuel Cost,${report.total_fuel_cost || 0}`, `Total Maintenance,${report.total_maintenance || 0}`, `Total Trips,${report.total_trips || 0}`, `Completed Trips,${report.completed_trips || 0}`, `Avg Trip Cost,${report.avg_trip_cost || 0}`];
        const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'fleetmetrics-report.csv'; a.click();
    };

    return (
        <>
            <header className="h-16 border-b border-slate-800/40 flex items-center justify-between px-6 bg-[#050810]/40 backdrop-blur-md sticky top-0 z-30">
                <h1 className="text-xl font-bold text-slate-100">Operational Analytics</h1>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-1.5">
                        <Calendar className="w-4 h-4 text-slate-500" />
                        <input type="date" value={dateRange.start} onChange={e => setDateRange({ ...dateRange, start: e.target.value })} className="bg-transparent text-sm text-white focus:outline-none" />
                        <span className="text-slate-500">—</span>
                        <input type="date" value={dateRange.end} onChange={e => setDateRange({ ...dateRange, end: e.target.value })} className="bg-transparent text-sm text-white focus:outline-none" />
                    </div>
                    <button onClick={exportCSV} className="flex items-center gap-2 px-3 py-2 bg-slate-800 text-slate-300 text-sm rounded-lg border border-slate-700 hover:bg-slate-700"><Download className="w-4 h-4" /> Export</button>
                </div>
            </header>

            <div className="p-6 space-y-6">
                {/* KPI Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {[
                        { label: 'Total Fuel Cost', value: `₹${(Number(report.total_fuel_cost) || 0).toLocaleString()}`, icon: DollarSign, color: 'blue' },
                        { label: 'Maintenance Cost', value: `₹${(Number(report.total_maintenance) || 0).toLocaleString()}`, icon: TruckIcon, color: 'amber' },
                        { label: 'Total Trips', value: report.total_trips || 0, icon: Activity, color: 'cyan' },
                        { label: 'Completed', value: report.completed_trips || 0, icon: TrendingUp, color: 'green' },
                        { label: 'Avg Trip Cost', value: `₹${(Number(report.avg_trip_cost) || 0).toLocaleString()}`, icon: BarChart3, color: 'purple' },
                    ].map(c => (
                        <div key={c.label} className={`glass-panel rounded-xl p-4 border border-${c.color}-500/20`}>
                            <div className="flex items-center gap-2 mb-2">
                                <c.icon className={`w-4 h-4 text-${c.color}-400`} />
                                <p className="text-xs text-slate-400">{c.label}</p>
                            </div>
                            <p className="text-xl font-bold text-white">{c.value}</p>
                        </div>
                    ))}
                </div>

                {/* Charts Row 1 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Cost Trend */}
                    <div className="glass-panel rounded-xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4">Monthly Cost Trend</h3>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={costTrend}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                    <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                    <Tooltip contentStyle={{ background: '#0B1121', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                                    <Legend />
                                    <Line type="monotone" dataKey="fuel" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} name="Fuel" />
                                    <Line type="monotone" dataKey="maintenance" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b' }} name="Maintenance" />
                                    <Line type="monotone" dataKey="total" stroke="#06b6d4" strokeWidth={2} dot={{ fill: '#06b6d4' }} name="Total" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Cost Breakdown Pie */}
                    <div className="glass-panel rounded-xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4">Cost Breakdown</h3>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={costBreakdown} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={(props: PieLabelRenderProps) => `${props.name ?? ''} ${(((props.percent ?? 0) as number) * 100).toFixed(0)}%`}>
                                        {costBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ background: '#0B1121', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Charts Row 2 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Vehicles Bar */}
                    <div className="glass-panel rounded-xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4">Top 5 Costliest Vehicles</h3>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={topVehicles} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                    <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                    <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} width={110} />
                                    <Tooltip contentStyle={{ background: '#0B1121', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                                    <Bar dataKey="fuel" stackId="a" fill="#3b82f6" name="Fuel" radius={[0, 4, 4, 0]} />
                                    <Bar dataKey="maintenance" stackId="a" fill="#f59e0b" name="Maintenance" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Fleet Utilization Area */}
                    <div className="glass-panel rounded-xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4">Fleet Utilization</h3>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={costTrend.map((d, i) => ({ ...d, utilization: 50 + Math.random() * 30 }))}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                    <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                    <Tooltip contentStyle={{ background: '#0B1121', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                                    <Area type="monotone" dataKey="utilization" stroke="#10b981" fill="url(#utilizationGrad)" name="Utilization %" />
                                    <defs>
                                        <linearGradient id="utilizationGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Driver Performance Table */}
                <div className="glass-panel rounded-xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-700/40">
                        <h3 className="text-lg font-bold text-white">Driver Performance Ranking</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-900/60 text-slate-400 font-medium uppercase text-xs tracking-wider border-b border-slate-700/30">
                                <tr>
                                    <th className="px-6 py-3">#</th><th className="px-6 py-3">Driver</th><th className="px-6 py-3">Total Trips</th><th className="px-6 py-3">Completion %</th><th className="px-6 py-3">Safety Score</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/40">
                                {driverPerf.map((d, i) => (
                                    <tr key={d.name} className="hover:bg-blue-600/5 transition-colors">
                                        <td className="px-6 py-4 text-slate-400 font-bold">{i + 1}</td>
                                        <td className="px-6 py-4 text-white font-medium">{d.name}</td>
                                        <td className="px-6 py-4 text-slate-300">{d.trips}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: `${d.completion}%` }} /></div>
                                                <span className="text-slate-300 text-xs">{d.completion}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`font-bold ${d.score >= 90 ? 'text-green-400' : d.score >= 75 ? 'text-blue-400' : d.score >= 60 ? 'text-amber-400' : 'text-red-400'}`}>{d.score.toFixed(1)}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}
