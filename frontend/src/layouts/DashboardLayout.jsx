import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'

const navItems = [
    { path: '/', label: 'Dashboard', icon: 'dashboard' },
    { path: '/fleet', label: 'Fleet', icon: 'directions_car' },
    { path: '/dispatch', label: 'Dispatch', icon: 'map' },
    { path: '/maintenance', label: 'Maintenance', icon: 'build' },
    { path: '/expenses', label: 'Expenses', icon: 'account_balance_wallet' },
    { path: '/drivers', label: 'Drivers', icon: 'group' },
    { path: '/analytics', label: 'Analytics', icon: 'bar_chart' },
]

export default function DashboardLayout() {
    const navigate = useNavigate()
    const [collapsed, setCollapsed] = useState(false)

    return (
        <div className="flex h-screen overflow-hidden bg-[var(--color-surface)]">
            {/* Sidebar */}
            <aside className={`${collapsed ? 'w-20' : 'w-64'} bg-[var(--color-sidebar)] text-white flex flex-col transition-all duration-300 ease-in-out flex-shrink-0`}>
                {/* Logo */}
                <div className="flex items-center gap-3 px-5 py-6 border-b border-white/10">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/20">
                        FF
                    </div>
                    {!collapsed && (
                        <div className="slide-in">
                            <h1 className="text-lg font-bold tracking-tight">FleetFlow</h1>
                            <p className="text-[11px] text-slate-400 -mt-0.5">Admin Console</p>
                        </div>
                    )}
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    {navItems.map(item => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === '/'}
                            className={({ isActive }) =>
                                `sidebar-link flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                    ? 'bg-[var(--color-primary)] text-white shadow-lg shadow-blue-500/25'
                                    : 'text-slate-300 hover:bg-[var(--color-sidebar-hover)] hover:text-white'
                                }`
                            }
                        >
                            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                            {!collapsed && <span>{item.label}</span>}
                        </NavLink>
                    ))}
                </nav>

                {/* User */}
                <div className="border-t border-white/10 px-4 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-white text-sm font-bold">
                            AM
                        </div>
                        {!collapsed && (
                            <div className="slide-in">
                                <p className="text-sm font-medium text-white">Alex Morgan</p>
                                <p className="text-xs text-slate-400">Fleet Manager</p>
                            </div>
                        )}
                    </div>
                    {!collapsed && (
                        <button
                            onClick={() => navigate('/login')}
                            className="mt-3 w-full flex items-center gap-2 text-xs text-slate-400 hover:text-red-400 transition-colors py-1.5 px-1 rounded-md hover:bg-white/5"
                        >
                            <span className="material-symbols-outlined text-[16px]">logout</span>
                            Log Out
                        </button>
                    )}
                </div>

                {/* Collapse toggle */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="border-t border-white/10 py-3 text-slate-400 hover:text-white transition-colors flex items-center justify-center"
                >
                    <span className="material-symbols-outlined text-[18px]">
                        {collapsed ? 'chevron_right' : 'chevron_left'}
                    </span>
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                {/* Top bar */}
                <div className="sticky top-0 z-10 glass border-b border-[var(--color-border)] px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                            <input
                                type="text"
                                placeholder="Search vehicles, drivers, trips..."
                                className="pl-10 pr-4 py-2 bg-white border border-[var(--color-border)] rounded-lg text-sm w-80 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors">
                            <span className="material-symbols-outlined text-slate-500 text-[20px]">notifications</span>
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>
                        <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
                            <span className="material-symbols-outlined text-slate-500 text-[20px]">settings</span>
                        </button>
                    </div>
                </div>

                {/* Page content */}
                <div className="p-8 fade-in">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}
