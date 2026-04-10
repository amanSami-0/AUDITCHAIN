import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log(`--- Middleware checking: ${pathname} ---`);

  const protectedRoutes = ['/profile', '/audit', '/hashes', '/settings', '/update'];
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  if (isProtectedRoute) {
    const token = request.cookies.get('token');
    console.log(`Protected Route: ${pathname} | Token status: ${token ? 'Found' : 'Not Found'}`);

    if (!token) {
      console.log(`Redirecting unauthorized user from ${pathname} to /login`);
      const url = request.nextUrl.clone();
      url.pathname = '/login';
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
  ],
};
