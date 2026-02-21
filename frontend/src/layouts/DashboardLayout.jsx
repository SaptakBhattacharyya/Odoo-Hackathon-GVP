import { Outlet, NavLink, useNavigate, Navigate, useLocation } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { useAuth, ROLE_LABELS } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import api from '../services/api'

const allNavItems = [
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
    const location = useLocation()
    const [collapsed, setCollapsed] = useState(false)
    const [showNotif, setShowNotif] = useState(false)
    const [showSettings, setShowSettings] = useState(false)
    const [alerts, setAlerts] = useState([])
    const notifRef = useRef()
    const settingsRef = useRef()
    const { user, logout, isAuthenticated, hasAccess } = useAuth()
    const { dark, toggle } = useTheme()

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    useEffect(() => {
        api.get('/maintenance/predictions').then(r => setAlerts(r.data)).catch(() => { })
    }, [])

    useEffect(() => {
        const handler = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false)
            if (settingsRef.current && !settingsRef.current.contains(e.target)) setShowSettings(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const navItems = allNavItems.filter(item => hasAccess(item.path))
    const initials = user?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'
    const roleLabel = ROLE_LABELS[user?.role] || user?.role

    const handleLogout = () => { logout(); navigate('/login') }

    // PDF Export — prints the current page content
    const handleExportPDF = () => {
        const pageName = allNavItems.find(n => n.path === location.pathname)?.label || 'Report'
        const printArea = document.querySelector('.fade-in')
        if (!printArea) return

        const win = window.open('', '_blank')
        win.document.write(`
            <html>
            <head>
                <title>FleetFlow — ${pageName} Report</title>
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: 'Inter', sans-serif; padding: 40px; color: #0f172a; }
                    .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #e2e8f0; }
                    .header h1 { font-size: 24px; background: linear-gradient(135deg, #197fe6, #6366f1); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
                    .header p { font-size: 12px; color: #64748b; }
                    .meta { font-size: 11px; color: #94a3b8; margin-bottom: 20px; }
                    table { border-collapse: collapse; width: 100%; }
                    th, td { text-align: left; padding: 10px; font-size: 13px; border-bottom: 1px solid #e2e8f0; }
                    th { font-weight: 600; color: #64748b; text-transform: uppercase; font-size: 11px; }
                    @media print { .no-print { display: none; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <div><h1>FleetFlow</h1><p>${pageName} Report</p></div>
                    <div style="text-align:right"><p style="font-size:12px;font-weight:600;">${user?.full_name}</p><p style="font-size:11px;color:#64748b">${roleLabel} • ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p></div>
                </div>
                <div class="meta">Generated on ${new Date().toLocaleString()} • FleetFlow Fleet Management System</div>
                ${printArea.innerHTML}
                <script>
                    // Clean up non-printable elements
                    document.querySelectorAll('button, .leaflet-container, canvas, svg').forEach(el => el.remove());
                    window.onload = () => { window.print(); window.close(); };
                </script>
            </body>
            </html>
        `)
        win.document.close()
    }

    return (
        <div className="flex h-screen overflow-hidden bg-[var(--color-surface)]">
            {/* Sidebar */}
            <aside className={`${collapsed ? 'w-20' : 'w-64'} bg-[var(--color-sidebar)] text-white flex flex-col transition-all duration-300 ease-in-out flex-shrink-0`}>
                <div className="flex items-center gap-3 px-5 py-6 border-b border-white/10">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/20">
                        FF
                    </div>
                    {!collapsed && (
                        <div className="slide-in">
                            <h1 className="text-lg font-bold tracking-tight">FleetFlow</h1>
                            <p className="text-[11px] text-slate-400 -mt-0.5">{roleLabel} Console</p>
                        </div>
                    )}
                </div>

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

                <div className="border-t border-white/10 px-4 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-white text-sm font-bold">
                            {initials}
                        </div>
                        {!collapsed && (
                            <div className="slide-in flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">{user?.full_name}</p>
                                <p className="text-xs text-slate-400">{roleLabel}</p>
                            </div>
                        )}
                    </div>
                    {!collapsed && (
                        <button onClick={handleLogout} className="mt-3 w-full flex items-center gap-2 text-xs text-slate-400 hover:text-red-400 transition-colors py-1.5 px-1 rounded-md hover:bg-white/5">
                            <span className="material-symbols-outlined text-[16px]">logout</span>Log Out
                        </button>
                    )}
                </div>

                <button onClick={() => setCollapsed(!collapsed)} className="border-t border-white/10 py-3 text-slate-400 hover:text-white transition-colors flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px]">{collapsed ? 'chevron_right' : 'chevron_left'}</span>
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <div className="sticky top-0 z-10 glass border-b border-[var(--color-border)] px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                            <input type="text" placeholder="Search vehicles, drivers, trips..." className="pl-10 pr-4 py-2 bg-white border border-[var(--color-border)] rounded-lg text-sm w-80 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all" />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-100">{roleLabel}</span>

                        {/* PDF Export */}
                        <button onClick={handleExportPDF} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group" title="Export as PDF">
                            <span className="material-symbols-outlined text-slate-500 group-hover:text-[var(--color-primary)] text-[20px] transition-colors">picture_as_pdf</span>
                        </button>

                        {/* Dark Mode Toggle */}
                        <button onClick={toggle} className="theme-toggle p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title={dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
                            <span className="material-symbols-outlined text-slate-500 text-[20px]">
                                {dark ? 'light_mode' : 'dark_mode'}
                            </span>
                        </button>

                        {/* Notifications */}
                        <div className="relative" ref={notifRef}>
                            <button onClick={() => { setShowNotif(!showNotif); setShowSettings(false) }} className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                <span className="material-symbols-outlined text-slate-500 text-[20px]">notifications</span>
                                {alerts.length > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>}
                            </button>
                            {showNotif && (
                                <div className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-2xl border border-[var(--color-border)] z-50 animate-modal">
                                    <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between">
                                        <h3 className="font-semibold text-sm">Notifications</h3>
                                        <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded-full text-xs font-bold">{alerts.length}</span>
                                    </div>
                                    <div className="max-h-64 overflow-y-auto">
                                        {alerts.length === 0 ? (
                                            <p className="p-4 text-sm text-[var(--color-text-secondary)] text-center">No notifications</p>
                                        ) : alerts.slice(0, 6).map((a, i) => (
                                            <div key={i} className="px-4 py-3 border-b border-[var(--color-border)] hover:bg-slate-50 transition-colors cursor-pointer">
                                                <div className="flex items-start gap-2">
                                                    <span className={`material-symbols-outlined text-[16px] mt-0.5 ${a.urgency === 'Critical' ? 'text-red-500' : 'text-amber-500'}`}>
                                                        {a.urgency === 'Critical' ? 'error' : 'warning'}
                                                    </span>
                                                    <div>
                                                        <p className="text-sm font-medium">{a.vehicle_name}</p>
                                                        <p className="text-xs text-[var(--color-text-secondary)]">{a.message}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-3 border-t border-[var(--color-border)]">
                                        <button onClick={() => { navigate('/maintenance'); setShowNotif(false) }} className="w-full text-center text-xs text-[var(--color-primary)] font-medium hover:underline">View All Maintenance Alerts</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Settings */}
                        <div className="relative" ref={settingsRef}>
                            <button onClick={() => { setShowSettings(!showSettings); setShowNotif(false) }} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                <span className="material-symbols-outlined text-slate-500 text-[20px]">settings</span>
                            </button>
                            {showSettings && (
                                <div className="absolute right-0 top-12 w-64 bg-white rounded-xl shadow-2xl border border-[var(--color-border)] z-50 animate-modal">
                                    <div className="p-4 border-b border-[var(--color-border)]"><h3 className="font-semibold text-sm">Settings</h3></div>
                                    <div className="p-2">
                                        <div className="px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-3">
                                            <span className="material-symbols-outlined text-slate-400 text-[18px]">person</span>
                                            <div><p className="text-sm font-medium">Profile</p><p className="text-xs text-[var(--color-text-secondary)]">{user?.email}</p></div>
                                        </div>
                                        <div onClick={toggle} className="px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-3">
                                            <span className="material-symbols-outlined text-slate-400 text-[18px]">{dark ? 'light_mode' : 'dark_mode'}</span>
                                            <div><p className="text-sm font-medium">Theme</p><p className="text-xs text-[var(--color-text-secondary)]">{dark ? 'Dark Mode' : 'Light Mode'}</p></div>
                                        </div>
                                        <div className="px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-3">
                                            <span className="material-symbols-outlined text-slate-400 text-[18px]">security</span>
                                            <div><p className="text-sm font-medium">Security</p><p className="text-xs text-[var(--color-text-secondary)]">Password, 2FA</p></div>
                                        </div>
                                        <div className="px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-3">
                                            <span className="material-symbols-outlined text-slate-400 text-[18px]">api</span>
                                            <div><p className="text-sm font-medium">API Status</p><p className="text-xs text-emerald-600 font-medium">Connected</p></div>
                                        </div>
                                        <div className="border-t border-[var(--color-border)] mt-1 pt-1">
                                            <button onClick={handleLogout} className="w-full px-3 py-2.5 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-3 text-red-600">
                                                <span className="material-symbols-outlined text-[18px]">logout</span>
                                                <span className="text-sm font-medium">Sign Out</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-8 fade-in">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}
