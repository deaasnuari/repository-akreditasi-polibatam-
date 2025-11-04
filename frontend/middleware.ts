import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  const role = req.cookies.get('role')?.value;
  const { pathname } = req.nextUrl;

  // === 1. Belum login tapi akses dashboard ===
  if (!token && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/auth', req.url));
  }

  // === 2. Batasi akses sesuai role ===
  if (pathname.startsWith('/dashboard/tim-akreditasi') && role !== 'tim-akreditasi') {
    // Jika role tidak cocok, redirect ke root (tidak masuk ke dashboard lain)
    return NextResponse.redirect(new URL('/', req.url));
  }

  if (pathname.startsWith('/dashboard/p4m') && role !== 'p4m') {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // backend stores role as 'tu' for Tata Usaha; frontend path is '/dashboard/tata-usaha'
  if (pathname.startsWith('/dashboard/tata-usaha') && role !== 'tu') {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // === 3. Kalau sudah login tapi buka /auth ===
  if (token && pathname === '/auth') {
    let dashboardPath = '/dashboard';
    if (role === 'tim-akreditasi') dashboardPath = '/dashboard/tim-akreditasi';
    else if (role === 'p4m') dashboardPath = '/dashboard/p4m';
    else if (role === 'tata-usaha') dashboardPath = '/dashboard/tata-usaha';

    return NextResponse.redirect(new URL(dashboardPath, req.url));
  }

  // === 4. Lanjutkan ===
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth'],
};
