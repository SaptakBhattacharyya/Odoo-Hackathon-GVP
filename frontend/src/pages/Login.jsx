import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, ROLE_LABELS } from '../context/AuthContext'

const roles = [
    { id: 'admin', username: 'admin', password: 'admin123', label: 'Administrator', desc: 'Full system access', icon: 'admin_panel_settings', color: 'from-blue-500 to-indigo-600' },
    { id: 'manager', username: 'manager', password: 'manager123', label: 'Fleet Manager', desc: 'Vehicle & driver management', icon: 'local_shipping', color: 'from-emerald-500 to-teal-600' },
    { id: 'dispatcher', username: 'dispatcher', password: 'dispatch123', label: 'Dispatcher', desc: 'Trip & route planning', icon: 'map', color: 'from-amber-500 to-orange-600' },
    { id: 'driver', username: 'driver', password: 'driver123', label: 'Driver', desc: 'View assigned routes', icon: 'steering_wheel_heat', color: 'from-purple-500 to-pink-600' },
]

export default function Login() {
    const [selectedRole, setSelectedRole] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const navigate = useNavigate()
    const { login } = useAuth()

    const handleLogin = async () => {
        if (!selectedRole) return
        setLoading(true)
        setError('')
        try {
            const role = roles.find(r => r.id === selectedRole)
            await login(role.username, role.password)
            navigate('/')
        } catch (err) {
            setError(err.response?.data?.detail || 'Login failed. Is the backend running?')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex">
            {/* Left panel - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[var(--color-sidebar)] via-slate-800 to-indigo-950 relative overflow-hidden items-center justify-center p-12">
                {/* Background decorations */}
                <div className="absolute inset-0">
                    <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-32 right-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
                    <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-cyan-500/5 rounded-full blur-2xl"></div>
                </div>

                <div className="relative z-10 max-w-lg">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-white font-bold text-xl shadow-2xl shadow-blue-500/30">
                            FF
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white tracking-tight">FleetFlow</h1>
                            <p className="text-blue-300 text-sm">Smart Fleet Management</p>
                        </div>
                    </div>

                    <h2 className="text-4xl font-bold text-white leading-tight mb-6">
                        Manage your entire fleet from one
                        <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent"> command center</span>
                    </h2>
                    <p className="text-slate-300 text-lg leading-relaxed">
                        Track vehicles, optimize routes, monitor performance, and reduce costs — all in real time.
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-6 mt-12">
                        <div className="text-center">
                            <p className="text-3xl font-bold text-white">142</p>
                            <p className="text-sm text-slate-400 mt-1">Active Vehicles</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-white">87%</p>
                            <p className="text-sm text-slate-400 mt-1">Utilization</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-white">24/7</p>
                            <p className="text-sm text-slate-400 mt-1">Monitoring</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right panel - Login form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-white font-bold text-sm shadow-lg">
                            FF
                        </div>
                        <h1 className="text-xl font-bold text-[var(--color-text-primary)]">FleetFlow</h1>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Welcome back</h2>
                        <p className="text-[var(--color-text-secondary)] mt-2">Choose your role to continue</p>
                        <p className="text-xs text-slate-400 mt-1">Each role has different page access and permissions.</p>
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">error</span>
                            {error}
                        </div>
                    )}

                    {/* Role selection */}
                    <div className="space-y-3 mb-8">
                        {roles.map(role => (
                            <button
                                key={role.id}
                                onClick={() => setSelectedRole(role.id)}
                                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-left ${selectedRole === role.id
                                    ? 'border-[var(--color-primary)] bg-blue-50 shadow-lg shadow-blue-500/10'
                                    : 'border-[var(--color-border)] bg-white hover:border-slate-300 hover:shadow-md'
                                    }`}
                            >
                                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center text-white shadow-lg`}>
                                    <span className="material-symbols-outlined text-[22px]">{role.icon}</span>
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-[var(--color-text-primary)] text-sm">{role.label}</p>
                                    <p className="text-xs text-[var(--color-text-secondary)]">{role.desc}</p>
                                </div>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selectedRole === role.id ? 'border-[var(--color-primary)] bg-[var(--color-primary)]' : 'border-slate-300'
                                    }`}>
                                    {selectedRole === role.id && (
                                        <span className="material-symbols-outlined text-white text-[14px]">check</span>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Sign in button */}
                    <button
                        onClick={handleLogin}
                        disabled={!selectedRole || loading}
                        className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${selectedRole
                            ? 'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 active:translate-y-0'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            }`}
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-[18px]">login</span>
                                Continue to Dashboard
                            </>
                        )}
                    </button>

                    {/* Divider */}
                    <div className="flex items-center gap-4 my-6">
                        <div className="flex-1 h-px bg-[var(--color-border)]"></div>
                        <span className="text-xs text-[var(--color-text-secondary)]">or</span>
                        <div className="flex-1 h-px bg-[var(--color-border)]"></div>
                    </div>

                    {/* Google sign-in */}
                    <button className="w-full py-3 rounded-xl font-medium text-sm border-2 border-[var(--color-border)] bg-white hover:bg-slate-50 transition-all text-[var(--color-text-primary)] flex items-center justify-center gap-3 hover:shadow-md">
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Sign in with Google
                    </button>

                    <p className="text-center text-xs text-[var(--color-text-secondary)] mt-6">
                        By continuing, you agree to FleetFlow's{' '}
                        <a href="#" className="text-[var(--color-primary)] hover:underline">Terms of Service</a> and{' '}
                        <a href="#" className="text-[var(--color-primary)] hover:underline">Privacy Policy</a>.
                    </p>
                </div>
            </div>
        </div>
    )
}
