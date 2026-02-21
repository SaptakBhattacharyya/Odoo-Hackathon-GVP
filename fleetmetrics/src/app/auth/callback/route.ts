import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const role = searchParams.get('role') || 'dispatcher';
    const next = searchParams.get('next') ?? '/dashboard';

    if (code) {
        const supabase = await createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            // Get the authenticated user
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                // Update user metadata with role if from OAuth
                if (role && role !== 'dispatcher') {
                    await supabase.auth.updateUser({
                        data: { role }
                    });
                }

                // Check if user profile exists in public.users
                const { data: profile } = await supabase
                    .from('users')
                    .select('is_approved, role')
                    .eq('id', user.id)
                    .single();

                if (!profile) {
                    // Trigger didn't fire (unlikely), create profile manually
                    const name = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User';
                    await supabase.from('users').upsert({
                        id: user.id,
                        name,
                        email: user.email,
                        role,
                        avatar_url: user.user_metadata?.avatar_url || null,
                        is_approved: false,
                        is_active: true,
                    });
                    return NextResponse.redirect(`${origin}/pending-approval`);
                }

                // Update role if it was passed via URL and different from stored
                if (role && profile.role !== role) {
                    await supabase.from('users').update({ role }).eq('id', user.id);
                }

                if (!profile.is_approved) {
                    return NextResponse.redirect(`${origin}/pending-approval`);
                }
            }

            return NextResponse.redirect(`${origin}${next}`);
        }
    }

    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
