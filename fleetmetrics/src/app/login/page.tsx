'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Shield, HeadsetIcon, Wallet, Settings, Mail, Lock, ArrowRight, Eye, EyeOff, User, Loader2, CheckCircle } from 'lucide-react';

const LOGO_URL = 'https://res.cloudinary.com/dcmio3bme/image/upload/v1771652478/Gemini_Generated_Image_gl9vkagl9vkagl9v-removebg-preview_aid7xj.png';
const HERO_BG = 'https://images.unsplash.com/photo-1592861956120-e524fc739696?q=80&w=2940&auto=format&fit=crop';

const roles = [
    { value: 'manager', label: 'Manager', icon: Settings, description: 'Full admin access' },
    { value: 'dispatcher', label: 'Dispatch', icon: HeadsetIcon, description: 'Trip operations' },
    { value: 'safety_officer', label: 'Safety', icon: Shield, description: 'Driver oversight' },
    { value: 'finance', label: 'Finance', icon: Wallet, description: 'Analytics & expenses' },
];

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [selectedRole, setSelectedRole] = useState('manager');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [registrationSuccess, setRegistrationSuccess] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
            if (authError) throw authError;

            // Check if user is approved
            if (authData.user) {
                const { data: profile } = await supabase
                    .from('users')
                    .select('is_approved, role')
                    .eq('id', authData.user.id)
                    .single();

                if (profile && !profile.is_approved) {
                    router.push('/pending-approval');
                    router.refresh();
                    return;
                }
            }

            router.push('/dashboard');
            router.refresh();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { name, role: selectedRole },
                },
            });
            if (authError) throw authError;

            //Login Screen Logic with google auth and Manager Approval
            if (authData.user) {
                const { data: profile } = await supabase
                    .from('users')
                    .select('is_approved')
                    .eq('id', authData.user.id)
                    .single();

                if (profile?.is_approved) {
                    router.push('/dashboard');
                    router.refresh();
                    return;
                }
            }

            // Show success message for pending approval
            setRegistrationSuccess(true);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleOAuth = async () => {
        // Store selected role in localStorage for the callback to use
        localStorage.setItem('oauth_role', selectedRole);
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback?role=${selectedRole}`,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                },
            },
        });
    };

    if (registrationSuccess) {
        return (
            <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <div className="glass-card rounded-2xl p-8 shadow-2xl relative overflow-hidden text-center">
                        <div className="absolute -top-[100px] -right-[100px] w-[200px] h-[200px] bg-green-500/20 blur-[80px] rounded-full pointer-events-none" />
                        <div className="relative z-10">
                            <div className="flex justify-center mb-6">
                                <img src={LOGO_URL} alt="FleetMetrics" className="h-16 w-auto" />
                            </div>
                            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                                <CheckCircle className="w-8 h-8 text-green-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
                                Registration Submitted!
                            </h2>
                            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                                Your account has been created with the <span className="text-primary font-semibold">{roles.find(r => r.value === selectedRole)?.label}</span> role.
                                A manager will review and approve your registration.
                            </p>
                            <button
                                onClick={() => { setRegistrationSuccess(false); setIsLogin(true); }}
                                className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/20 transition-all"
                            >
                                Back to Login
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen w-full flex-row bg-[#0A0F1E]">
            {/* Left Panel - Hero */}
            <div className="hidden lg:flex w-5/12 xl:w-1/2 flex-col justify-between relative bg-[#060912] overflow-hidden p-12 text-white">
                <div className="absolute inset-0 z-0 opacity-40 mix-blend-overlay">
                    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${HERO_BG})` }} />
                </div>
                <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#0A0F1E]/90 to-[#0A0F1E]/40" />

                <div className="relative z-10 flex flex-col h-full justify-between">
                    <div className="flex items-center">
                        <img src={LOGO_URL} alt="FleetMetrics Logo" className="h-28 w-auto" />
                    </div>

                    <div className="flex flex-col gap-8 max-w-lg">
                        <h1 className="font-heading text-4xl xl:text-5xl font-bold leading-[1.1] tracking-tight text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
                            Global Supply Chain Solutions{' '}
                            <span className="text-primary">Deliver Your Promise, Globally</span>.
                        </h1>
                        <p className="text-lg text-slate-300 font-light leading-relaxed">
                            Experience the future of fleet management with real-time telematics, predictive maintenance, and global route optimization.
                        </p>

                        <div className="mt-4 flex flex-col gap-5">
                            {[
                                { icon: 'satellite_alt', title: 'Real-time Telematics', desc: 'Track assets with millisecond precision' },
                                { icon: 'insights', title: 'Predictive Analytics', desc: 'AI-driven maintenance forecasting' },
                                { icon: 'security', title: 'Compliance & Safety', desc: 'Automated reporting and monitoring' },
                            ].map((f) => (
                                <div key={f.icon} className="flex items-center gap-4">
                                    <div className="flex size-10 items-center justify-center rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 text-primary">
                                        <span className="material-symbols-outlined text-xl">{f.icon}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-white text-sm">{f.title}</span>
                                        <span className="text-xs text-slate-400">{f.desc}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="text-xs text-slate-500 font-medium">© 2026 FleetMetrics Systems Inc.</div>
                </div>
            </div>

            {/* Right Panel - Auth Form */}
            <div className="w-full lg:w-7/12 xl:w-1/2 flex flex-col items-center justify-center p-4 sm:p-8 md:p-12 relative">
                {/* Mobile Logo */}
                <div className="lg:hidden absolute top-6 left-6 flex items-center mb-8">
                    <img src={LOGO_URL} alt="FleetMetrics Logo" className="h-20 w-auto" />
                </div>

                <div className="w-full max-w-[540px]">
                    <div className="glass-card rounded-2xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
                        <div className="absolute -top-[100px] -right-[100px] w-[200px] h-[200px] bg-primary/20 blur-[80px] rounded-full pointer-events-none" />

                        {/* Header & Tabs */}
                        <div className="flex flex-col gap-6 mb-8">
                            <div>
                                <h2 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
                                    {isLogin ? 'Welcome Back' : 'Create Account'}
                                </h2>
                                <p className="text-slate-400 text-sm">
                                    {isLogin ? 'Enter your credentials to access your dashboard.' : 'Register to get started with FleetMetrics.'}
                                </p>
                            </div>

                            {/* Tabs */}
                            <div className="flex p-1 bg-black/20 rounded-xl border border-white/5">
                                <button
                                    onClick={() => { setIsLogin(true); setError(''); }}
                                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${isLogin ? 'bg-primary text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                                >
                                    Login
                                </button>
                                <button
                                    onClick={() => { setIsLogin(false); setError(''); }}
                                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${!isLogin ? 'bg-primary text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                                >
                                    Register
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <form className="flex flex-col gap-6" onSubmit={isLogin ? handleLogin : handleRegister}>
                            {/* Role Selector */}
                            <div className="space-y-3">
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Select Role</span>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {roles.map((role) => (
                                        <label key={role.value} className="cursor-pointer group">
                                            <input
                                                type="radio"
                                                name="role"
                                                value={role.value}
                                                checked={selectedRole === role.value}
                                                onChange={(e) => setSelectedRole(e.target.value)}
                                                className="peer sr-only"
                                            />
                                            <div className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all h-24
                        ${selectedRole === role.value
                                                    ? 'border-primary bg-primary/10 text-primary'
                                                    : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'
                                                }`}
                                            >
                                                <role.icon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                                <span className="text-xs font-medium">{role.label}</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Name (Register only) */}
                            {!isLogin && (
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-primary transition-colors">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Full Name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        className="block w-full pl-11 pr-4 py-3 bg-[#050810]/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm font-medium"
                                    />
                                </div>
                            )}

                            {/* Email */}
                            <div className="space-y-4 mt-2">
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-primary transition-colors">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="email"
                                        placeholder="name@company.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="block w-full pl-11 pr-4 py-3 bg-[#050810]/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm font-medium"
                                    />
                                </div>

                                {/* Password */}
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-primary transition-colors">
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="block w-full pl-11 pr-12 py-3 bg-[#050810]/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm font-medium"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>

                                {/* Confirm Password (Register only) */}
                                {!isLogin && (
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-primary transition-colors">
                                            <Lock className="w-5 h-5" />
                                        </div>
                                        <input
                                            type="password"
                                            placeholder="Confirm password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            className="block w-full pl-11 pr-4 py-3 bg-[#050810]/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm font-medium"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Remember me / Forgot */}
                            {isLogin && (
                                <div className="flex items-center justify-between text-sm">
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input type="checkbox" className="rounded border-white/20 bg-white/5 text-primary focus:ring-primary/50 focus:ring-offset-0 w-4 h-4" />
                                        <span className="text-slate-400 group-hover:text-slate-300 transition-colors">Remember me</span>
                                    </label>
                                    <a className="text-primary hover:text-blue-400 font-medium transition-colors" href="#">Forgot password?</a>
                                </div>
                            )}

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        {isLogin ? 'Sign In' : 'Create Account'}
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>

                            {/* Divider */}
                            <div className="relative flex py-1 items-center">
                                <div className="flex-grow border-t border-white/10" />
                                <span className="flex-shrink-0 mx-4 text-slate-500 text-xs uppercase tracking-wider">Or continue with</span>
                                <div className="flex-grow border-t border-white/10" />
                            </div>

                            {/* Google Sign In */}
                            <button
                                type="button"
                                onClick={handleGoogleOAuth}
                                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-3 group"
                            >
                                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24">
                                    <path d="M23.766 12.2764C23.766 11.4607 23.6999 10.6406 23.5588 9.83807H12.24V14.4591H18.7217C18.4528 15.9494 17.5885 17.2678 16.323 18.1056V21.1039H20.19C22.4608 19.0139 23.766 15.9274 23.766 12.2764Z" fill="#4285F4" />
                                    <path d="M12.2401 24.0008C15.4766 24.0008 18.2059 22.9382 20.1945 21.1039L16.3275 18.1055C15.2517 18.8375 13.8627 19.252 12.2445 19.252C9.11388 19.252 6.45946 17.1399 5.50705 14.3003H1.5166V17.3912C3.55371 21.4434 7.7029 24.0008 12.2401 24.0008Z" fill="#34A853" />
                                    <path d="M5.50253 14.3003C5.00236 12.8099 5.00236 11.1961 5.50253 9.70575V6.61481H1.51649C-0.18551 10.0056 -0.18551 14.0004 1.51649 17.3912L5.50253 14.3003Z" fill="#FBBC05" />
                                    <path d="M12.2401 4.74966C13.9509 4.7232 15.6044 5.36697 16.8434 6.54867L20.2695 3.12262C18.1001 1.0855 15.2208 -0.034466 12.2401 0.000808666C7.7029 0.000808666 3.55371 2.55822 1.5166 6.61481L5.50264 9.70575C6.45064 6.86173 9.10947 4.74966 12.2401 4.74966Z" fill="#EA4335" />
                                </svg>
                                <span className="text-sm">Sign in with Google</span>
                            </button>
                        </form>
                    </div>

                    {/* Bottom Links */}
                    <div className="mt-8 text-center space-y-2">
                        <p className="text-slate-500 text-sm">
                            {isLogin ? "Don't have an account? " : 'Already have an account? '}
                            <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="text-primary hover:text-white font-medium transition-colors">
                                {isLogin ? 'Register Now' : 'Sign In'}
                            </button>
                        </p>
                        <div className="flex justify-center gap-6 text-xs text-slate-600">
                            <a className="hover:text-slate-400 transition-colors" href="#">Privacy Policy</a>
                            <a className="hover:text-slate-400 transition-colors" href="#">Terms of Service</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
