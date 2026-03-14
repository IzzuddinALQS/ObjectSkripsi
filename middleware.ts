import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession, getSession } from '@/lib/auth';

export async function middleware(request: NextRequest) {
    const session = await getSession();

    // Protected routes pattern
    const isProtectedRoute =
        request.nextUrl.pathname.startsWith('/admin') ||
        request.nextUrl.pathname.startsWith('/student') ||
        request.nextUrl.pathname.startsWith('/lecturer') ||
        request.nextUrl.pathname.startsWith('/peminjaman') ||
        request.nextUrl.pathname.startsWith('/akademik') ||
        request.nextUrl.pathname.startsWith('/dashboard');

    // Redirect to login if not authenticated on protected routes
    if (!session && isProtectedRoute) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return await updateSession(request);
}

export const config = {
    matcher: [
        '/admin/:path*',
        '/student/:path*',
        '/lecturer/:path*',
        '/peminjaman/:path*',
        '/akademik/:path*',
        '/dashboard/:path*',
        '/login',
    ],
};
