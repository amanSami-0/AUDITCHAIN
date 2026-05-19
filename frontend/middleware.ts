import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log(`--- Middleware checking: ${pathname} ---`);

  const protectedRoutes = ['/profile', '/hashes', '/settings', '/update'];
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  if (isProtectedRoute) {
    const token = request.cookies.get('auth_token');
    console.log(`Protected Route: ${pathname} | Token status: ${token ? 'Found' : 'Not Found'}`);

    if (!token) {
      console.log(`Redirecting unauthorized user from ${pathname} to /login`);
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  }

  const devProtectedRoutes = ['/audit', '/dev/access-logs', '/dev/admin', '/dev/dashboard'];
  const isDevRoute = devProtectedRoutes.some((route) => pathname.startsWith(route));

  if (isDevRoute) {
    const devToken = request.cookies.get('audit_token');
    console.log(`Dev Protected Route: ${pathname} | Dev Token status: ${devToken ? 'Found' : 'Not Found'}`);

    if (!devToken) {
      console.log(`Redirecting unauthorized dev from ${pathname} to /dev/login`);
      const url = request.nextUrl.clone();
      url.pathname = '/dev/login';
      return NextResponse.redirect(url);
    }
  }

  if (pathname === '/') {
    console.log(`Root path detected, redirecting to /login`);
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/profile/:path*',
    '/audit/:path*',
    '/hashes/:path*',
    '/settings/:path*',
    '/update/:path*',
    '/dev/access-logs/:path*',
    '/dev/admin/:path*',
    '/dev/dashboard/:path*',
  ],
};
