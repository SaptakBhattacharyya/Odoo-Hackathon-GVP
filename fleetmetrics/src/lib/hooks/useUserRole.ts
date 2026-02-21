'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar_url: string | null;
    is_approved: boolean;
    is_active: boolean;
}

export function useUserRole() {
    const supabase = createClient();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setIsLoading(false);
                return;
            }

            const { data } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single();

            if (data) {
                setProfile(data as UserProfile);
            } else {
                // Fallback to user_metadata if no profile yet
                setProfile({
                    id: user.id,
                    name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
                    email: user.email || '',
                    role: user.user_metadata?.role || 'dispatcher',
                    avatar_url: user.user_metadata?.avatar_url || null,
                    is_approved: false,
                    is_active: true,
                });
            }
            setIsLoading(false);
        };

        fetchProfile();
    }, []);

    return {
        profile,
        role: profile?.role || 'dispatcher',
        isApproved: profile?.is_approved ?? false,
        isLoading,
        isManager: profile?.role === 'manager',
        canWrite: (resource: string): boolean => {
            if (!profile) return false;
            const r = profile.role;
            switch (resource) {
                case 'vehicles': return r === 'manager';
                case 'trips': return r === 'manager' || r === 'dispatcher';
                case 'drivers': return r === 'manager' || r === 'safety_officer';
                case 'maintenance': return r === 'manager' || r === 'safety_officer';
                case 'expenses': return r === 'manager' || r === 'finance' || r === 'dispatcher';
                case 'expenses_approve': return r === 'manager' || r === 'finance';
                case 'users': return r === 'manager';
                default: return r === 'manager';
            }
        },
    };
}
