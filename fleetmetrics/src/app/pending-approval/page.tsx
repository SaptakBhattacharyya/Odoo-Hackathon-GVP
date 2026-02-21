'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Clock, RefreshCw, LogOut, Shield } from 'lucide-react';

const LOGO_URL = 'https://res.cloudinary.com/dcmio3bme/image/upload/v1771652478/Gemini_Generated_Image_gl9vkagl9vkagl9v-removebg-preview_aid7xj.png';

export default function PendingApprovalPage() {
    const supabase = createClient();
    const router = useRouter();
    const [checking, setChecking] = useState(false);
    const [message, setMessage] = useState('');

    const handleCheckStatus = async () => {
        setChecking(true);
        setMessage('');
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            const { data } = await supabase
                .from('users')
                .select('is_approved')
                .eq('id', user.id)
                .single();

            if (data?.is_approved) {
                router.push('/dashboard');
                router.refresh();
            } else {
                setMessage('Your account is still pending approval. Please wait for a manager to approve your registration.');
            }
        } catch {
            setMessage('Unable to check status. Please try again.');
        } finally {
            setChecking(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    };

    return (
        <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="glass-card rounded-2xl p-8 shadow-2xl relative overflow-hidden text-center">
                    <div className="absolute -top-[100px] -right-[100px] w-[200px] h-[200px] bg-amber-500/20 blur-[80px] rounded-full pointer-events-none" />

                    <div className="relative z-10">
                        <div className="flex justify-center mb-6">
                            <img src={LOGO_URL} alt="FleetMetrics" className="h-16 w-auto" />
                        </div>

                        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                            <Clock className="w-8 h-8 text-amber-400 animate-pulse" />
                        </div>

                        <h1 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
                            Awaiting Approval
                        </h1>
                        <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                            Your registration has been submitted successfully. A manager will review and approve your account shortly.
                        </p>

                        {message && (
                            <div className="mb-6 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm">
                                {message}
                            </div>
                        )}

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleCheckStatus}
                                disabled={checking}
                                className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                <RefreshCw className={`w-5 h-5 ${checking ? 'animate-spin' : ''}`} />
                                {checking ? 'Checking...' : 'Check Approval Status'}
                            </button>

                            <button
                                onClick={handleLogout}
                                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                            >
                                <LogOut className="w-5 h-5" />
                                Sign Out
                            </button>
                        </div>

                        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-500">
                            <Shield className="w-4 h-4" />
                            <span>Your data is secure while awaiting approval</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
