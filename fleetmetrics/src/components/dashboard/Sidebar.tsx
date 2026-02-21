'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
    LayoutDashboard, Truck, MapPin, Wrench, Receipt, Users, BarChart3, LogOut, Menu, X, UserCheck
} from 'lucide-react';
import { useState, useEffect } from 'react';

const LOGO_URL = 'https://res.cloudinary.com/dcmio3bme/image/upload/v1771652478/Gemini_Generated_Image_gl9vkagl9vkagl9v-removebg-preview_aid7xj.png';

const allNavItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['manager', 'dispatcher', 'safety_officer', 'finance'] },
    { href: '/dashboard/vehicles', label: 'Fleet', icon: Truck, roles: ['manager', 'dispatcher', 'safety_officer'] },
    { href: '/dashboard/trips', label: 'Trips', icon: MapPin, roles: ['manager', 'dispatcher', 'safety_officer'] },
    { href: '/dashboard/drivers', label: 'Drivers', icon: Users, roles: ['manager', 'dispatcher', 'safety_officer'] },
    { href: '/dashboard/maintenance', label: 'Maintenance', icon: Wrench, roles: ['manager', 'dispatcher', 'safety_officer'] },
    { href: '/dashboard/expenses', label: 'Expenses', icon: Receipt, roles: ['manager', 'dispatcher', 'finance'] },
    { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3, roles: ['manager', 'finance'] },
    { href: '/dashboard/users', label: 'Users', icon: UserCheck, roles: ['manager'] },
];

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [user, setUser] = useState<{ name: string; role: string; email: string; avatar_url?: string | null } | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (authUser) {
                // Fetch from public.users for accurate role
                const { data: profile } = await supabase
                    .from('users')
                    .select('name, role, email, avatar_url')
                    .eq('id', authUser.id)
                    .single();

                if (profile) {
                    setUser({
                        name: profile.name || authUser.email?.split('@')[0] || 'User',
                        role: profile.role || 'dispatcher',
                        email: profile.email || authUser.email || '',
                        avatar_url: profile.avatar_url,
                    });
                } else {
                    setUser({
                        name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
                        role: authUser.user_metadata?.role || 'dispatcher',
                        email: authUser.email || '',
                    });
                }
            }
        };
        fetchUser();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    };

    const roleBadgeColor: Record<string, string> = {
        manager: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        dispatcher: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
        safety_officer: 'bg-green-500/20 text-green-400 border-green-500/30',
        finance: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    };

    // Filter nav items based on role
    const navItems = allNavItems.filter(item => {
        if (!user) return item.href === '/dashboard';
        return item.roles.includes(user.role);
    });

    const sidebarContent = (
        <>
            {/* Logo */}
            <div className="h-16 flex items-center justify-center lg:justify-start lg:px-5 border-b border-slate-800/40 bg-gradient-to-r from-blue-900/10 to-transparent flex-shrink-0">
                <img src={LOGO_URL} alt="FleetMetrics" className="h-10 w-auto" />
                <span className="hidden lg:block ml-2 font-bold text-lg tracking-wide bg-gradient-to-r from-white via-blue-100 to-slate-400 bg-clip-text text-transparent">
                    FleetMetrics
                </span>
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto py-6 flex flex-col gap-1 px-3">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all group ${isActive
                                ? 'bg-gradient-to-r from-primary/20 to-primary/5 border-l-2 border-primary text-blue-50 shadow-[0_0_20px_rgba(59,130,246,0.15)]'
                                : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
                                }`}
                        >
                            <item.icon className={`w-5 h-5 ${isActive ? 'text-primary drop-shadow-[0_0_12px_rgba(59,130,246,1)]' : 'group-hover:text-blue-400'}`} />
                            <span className="font-medium text-sm">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* User Info */}
            <div className="p-3 border-t border-slate-800/40 flex-shrink-0">
                {user && (
                    <div className="flex items-center gap-3 px-3 py-2 mb-2">
                        {user.avatar_url ? (
                            <img src={user.avatar_url} alt={user.name} className="w-9 h-9 rounded-full flex-shrink-0 border-2 border-primary/30" />
                        ) : (
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div className="hidden lg:block min-w-0">
                            <p className="text-sm font-medium text-white truncate">{user.name}</p>
                            <span className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border ${roleBadgeColor[user.role] || roleBadgeColor.dispatcher}`}>
                                {user.role.replace('_', ' ')}
                            </span>
                        </div>
                    </div>
                )}
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors group w-full"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="hidden lg:block font-medium text-sm">Logout</span>
                </button>
            </div>
        </>
    );

    return (
        <>
            {/* Mobile toggle */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-surface-dark rounded-lg border border-slate-700/50 text-slate-300">
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Mobile overlay */}
            {mobileOpen && (
                <div className="lg:hidden fixed inset-0 bg-black/60 z-30" onClick={() => setMobileOpen(false)} />
            )}

            {/* Mobile sidebar */}
            <aside className={`lg:hidden fixed top-0 left-0 h-full w-64 z-40 flex flex-col bg-[#050810]/95 backdrop-blur-xl border-r border-slate-800/40 transform transition-transform ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {sidebarContent}
            </aside>

            {/* Desktop sidebar */}
            <aside className="hidden lg:flex w-64 flex-col border-r border-slate-800/40 bg-[#050810]/60 backdrop-blur-xl flex-shrink-0 z-20 shadow-[5px_0_30px_rgba(0,0,0,0.5)]">
                {sidebarContent}
            </aside>
        </>
    );
}
