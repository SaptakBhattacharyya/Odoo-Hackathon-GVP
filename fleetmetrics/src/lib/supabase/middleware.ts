import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const path = request.nextUrl.pathname;

    // Redirect unauthenticated users to login
    if (!user && path.startsWith('/dashboard')) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        return NextResponse.redirect(url);
    }

    // Redirect unauthenticated users from pending-approval to login
    if (!user && path === '/pending-approval') {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        return NextResponse.redirect(url);
    }

    // Redirect authenticated users away from auth pages
    if (user && (path === '/login' || path === '/register' || path === '/')) {
        // Check if approved first
        const { data: profile } = await supabase
            .from('users')
            .select('is_approved, role')
            .eq('id', user.id)
            .single();

        if (profile && !profile.is_approved) {
            const url = request.nextUrl.clone();
            url.pathname = '/pending-approval';
            return NextResponse.redirect(url);
        }

        const url = request.nextUrl.clone();
        url.pathname = '/dashboard';
        return NextResponse.redirect(url);
    }

    // Check approval status for dashboard access
    if (user && path.startsWith('/dashboard')) {
        const { data: profile } = await supabase
            .from('users')
            .select('is_approved, role')
            .eq('id', user.id)
            .single();

        // Unapproved users cannot access dashboard
        if (!profile || !profile.is_approved) {
            const url = request.nextUrl.clone();
            url.pathname = '/pending-approval';
            return NextResponse.redirect(url);
        }

        const role = profile.role;

        // Role-based route access matrix
        const routeAccess: Record<string, string[]> = {
            '/dashboard/vehicles': ['manager', 'dispatcher', 'safety_officer'],
            '/dashboard/trips': ['manager', 'dispatcher', 'safety_officer'],
            '/dashboard/drivers': ['manager', 'dispatcher', 'safety_officer'],
            '/dashboard/maintenance': ['manager', 'dispatcher', 'safety_officer'],
            '/dashboard/expenses': ['manager', 'dispatcher', 'finance'],
            '/dashboard/analytics': ['manager', 'finance'],
            '/dashboard/users': ['manager'],
        };

        for (const [route, allowedRoles] of Object.entries(routeAccess)) {
            if (path.startsWith(route) && !allowedRoles.includes(role)) {
                const url = request.nextUrl.clone();
                url.pathname = '/dashboard';
                return NextResponse.redirect(url);
            }
        }
    }

    // Approved users should be redirected away from pending-approval
    if (user && path === '/pending-approval') {
        const { data: profile } = await supabase
            .from('users')
            .select('is_approved')
            .eq('id', user.id)
            .single();

        if (profile?.is_approved) {
            const url = request.nextUrl.clone();
            url.pathname = '/dashboard';
            return NextResponse.redirect(url);
        }
    }

    return supabaseResponse;
}
