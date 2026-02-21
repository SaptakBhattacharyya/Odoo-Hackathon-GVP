'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Search, UserCheck, UserX, Shield, Clock, CheckCircle, XCircle, AlertTriangle, Settings } from 'lucide-react';

interface UserProfile {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar_url: string | null;
    is_approved: boolean;
    is_active: boolean;
    created_at: string;
}

export default function UsersPage() {
    const supabase = createClient();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [roleFilter, setRoleFilter] = useState('all');
    const [loading, setLoading] = useState(false);
    const [editRole, setEditRole] = useState<{ id: string; role: string } | null>(null);

    const fetchUsers = async () => {
        let query = supabase.from('users').select('*').order('created_at', { ascending: false });
        if (statusFilter === 'pending') query = query.eq('is_approved', false);
        if (statusFilter === 'approved') query = query.eq('is_approved', true);
        if (statusFilter === 'inactive') query = query.eq('is_active', false);
        if (roleFilter !== 'all') query = query.eq('role', roleFilter);
        const { data } = await query;
        if (data) setUsers(data);
    };

    useEffect(() => { fetchUsers(); }, [statusFilter, roleFilter]);

    const filtered = users.filter(u =>
        !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
    );

    const handleApprove = async (userId: string) => {
        setLoading(true);
        await supabase.from('users').update({ is_approved: true }).eq('id', userId);
        await fetchUsers();
        setLoading(false);
    };

    const handleReject = async (userId: string) => {
        if (!confirm('Reject and remove this user registration? This will delete their account record.')) return;
        setLoading(true);
        await supabase.from('users').delete().eq('id', userId);
        await fetchUsers();
        setLoading(false);
    };

    const handleToggleActive = async (userId: string, currentActive: boolean) => {
        await supabase.from('users').update({ is_active: !currentActive }).eq('id', userId);
        fetchUsers();
    };

    const handleChangeRole = async (userId: string, newRole: string) => {
        await supabase.from('users').update({ role: newRole }).eq('id', userId);
        setEditRole(null);
        fetchUsers();
    };

    const pendingCount = users.filter(u => !u.is_approved).length;
    const activeCount = users.filter(u => u.is_approved && u.is_active).length;
    const totalCount = users.length;

    const roleBadgeColor: Record<string, string> = {
        manager: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        dispatcher: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
        safety_officer: 'bg-green-500/10 text-green-400 border-green-500/20',
        finance: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    };

    return (
        <>
            <header className="h-16 border-b border-slate-800/40 flex items-center justify-between px-6 bg-[#050810]/40 backdrop-blur-md sticky top-0 z-30">
                <div className="flex items-center gap-3">
                    <h1 className="text-xl font-bold text-slate-100">User Management</h1>
                    {pendingCount > 0 && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse">
                            {pendingCount} Pending
                        </span>
                    )}
                </div>
            </header>

            <div className="p-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="glass-panel rounded-xl p-4 border border-blue-500/20">
                        <p className="text-xs text-slate-400 mb-1">Total Users</p>
                        <p className="text-2xl font-bold text-blue-400">{totalCount}</p>
                    </div>
                    <div className="glass-panel rounded-xl p-4 border border-green-500/20">
                        <p className="text-xs text-slate-400 mb-1">Active</p>
                        <p className="text-2xl font-bold text-green-400">{activeCount}</p>
                    </div>
                    <div className={`glass-panel rounded-xl p-4 border ${pendingCount > 0 ? 'border-amber-500/20' : 'border-slate-700/20'}`}>
                        <p className="text-xs text-slate-400 mb-1">Pending Approval</p>
                        <p className={`text-2xl font-bold ${pendingCount > 0 ? 'text-amber-400' : 'text-slate-500'}`}>{pendingCount}</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3 mb-6">
                    <div className="relative flex-1 min-w-[200px] max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                        <input value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary" placeholder="Search by name or email..." />
                    </div>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary">
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="inactive">Inactive</option>
                    </select>
                    <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary">
                        <option value="all">All Roles</option>
                        <option value="manager">Manager</option>
                        <option value="dispatcher">Dispatcher</option>
                        <option value="safety_officer">Safety Officer</option>
                        <option value="finance">Finance</option>
                    </select>
                </div>

                {/* Users Table */}
                <div className="glass-panel rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-slate-900/60 text-slate-400 font-medium uppercase text-xs tracking-wider border-b border-slate-700/30">
                                <tr>
                                    <th className="px-6 py-3">User</th>
                                    <th className="px-6 py-3">Email</th>
                                    <th className="px-6 py-3">Role</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Joined</th>
                                    <th className="px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/40">
                                {filtered.map(u => (
                                    <tr key={u.id} className={`hover:bg-blue-600/5 transition-colors ${!u.is_approved ? 'bg-amber-500/5' : ''}`}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {u.avatar_url ? (
                                                    <img src={u.avatar_url} alt={u.name} className="w-9 h-9 rounded-full border-2 border-primary/30" />
                                                ) : (
                                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                                                        {u.name.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <span className="text-white font-medium">{u.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-400 text-xs">{u.email}</td>
                                        <td className="px-6 py-4">
                                            {editRole?.id === u.id ? (
                                                <select
                                                    value={editRole.role}
                                                    onChange={e => setEditRole({ ...editRole, role: e.target.value })}
                                                    onBlur={() => handleChangeRole(u.id, editRole.role)}
                                                    autoFocus
                                                    className="bg-slate-900/60 border border-primary rounded px-2 py-1 text-xs text-white focus:outline-none"
                                                >
                                                    <option value="manager">Manager</option>
                                                    <option value="dispatcher">Dispatcher</option>
                                                    <option value="safety_officer">Safety Officer</option>
                                                    <option value="finance">Finance</option>
                                                </select>
                                            ) : (
                                                <button
                                                    onClick={() => setEditRole({ id: u.id, role: u.role })}
                                                    className={`px-2.5 py-1 rounded-full text-xs font-medium border cursor-pointer hover:opacity-80 transition-opacity ${roleBadgeColor[u.role] || 'bg-slate-700/50 text-slate-400'}`}
                                                    title="Click to change role"
                                                >
                                                    {u.role.replace('_', ' ')}
                                                </button>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {!u.is_approved ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                                    <Clock className="w-3 h-3" />
                                                    Pending
                                                </span>
                                            ) : !u.is_active ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                                                    <XCircle className="w-3 h-3" />
                                                    Inactive
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                                                    <CheckCircle className="w-3 h-3" />
                                                    Active
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-slate-400 text-xs">
                                            {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {!u.is_approved && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApprove(u.id)}
                                                            disabled={loading}
                                                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-600/20 text-green-400 hover:bg-green-600/30 border border-green-500/20 transition-all disabled:opacity-50"
                                                        >
                                                            <UserCheck className="w-3.5 h-3.5" />
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(u.id)}
                                                            disabled={loading}
                                                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-500/20 transition-all disabled:opacity-50"
                                                        >
                                                            <UserX className="w-3.5 h-3.5" />
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                                {u.is_approved && (
                                                    <button
                                                        onClick={() => handleToggleActive(u.id, u.is_active)}
                                                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${u.is_active
                                                            ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-500/20'
                                                            : 'bg-green-600/20 text-green-400 hover:bg-green-600/30 border border-green-500/20'
                                                            }`}
                                                    >
                                                        {u.is_active ? (
                                                            <><XCircle className="w-3.5 h-3.5" /> Deactivate</>
                                                        ) : (
                                                            <><CheckCircle className="w-3.5 h-3.5" /> Activate</>
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filtered.length === 0 && (
                                    <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">No users found</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}
