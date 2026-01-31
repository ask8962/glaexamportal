import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Admin email (hardcoded super admin)
const ADMIN_EMAIL = 'ganukalp70@gmail.com';

// Routes that require authentication
const protectedRoutes = ['/dashboard', '/exam', '/results', '/admin'];

// Routes that are only for unauthenticated users
const authRoutes = ['/login', '/register'];

// Admin-only routes
const adminRoutes = ['/admin'];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const hostname = request.headers.get('host') || '';

    // Subdomain Routing for Job Portal
    // Handle job.glaexamportal.site or job.localhost
    if (hostname.startsWith('job.')) {
        const url = request.nextUrl.clone();
        url.pathname = `/jobs${pathname}`;
        return NextResponse.rewrite(url);
    }

    // Get auth token from cookie
    const authToken = request.cookies.get('auth-token')?.value;

    // Check if the route is protected
    const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
    const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
    const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

    // If accessing protected route without auth, redirect to login
    if (isProtectedRoute && !authToken) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // If accessing auth routes while logged in, redirect to dashboard
    if (isAuthRoute && authToken) {
        // We can't decode the token here to check role, so redirect to dashboard
        // The dashboard will handle admin redirect
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // For admin routes, we need to verify the user is actually an admin
    // Since middleware can't access Firestore, we'll handle this client-side
    // The admin pages will check the user role and redirect if not admin

    // Additional security: Check for stored user email in a separate cookie
    const userEmail = request.cookies.get('user-email')?.value;

    if (isAdminRoute && userEmail && userEmail !== ADMIN_EMAIL) {
        // Not an admin, redirect to dashboard
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - api routes
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico
         * - public folder
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
    ],
};
