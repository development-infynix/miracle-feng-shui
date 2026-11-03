import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Dev-only: allow admin APIs without login (consistent with upload route)
  if (process.env.NODE_ENV === 'development' && pathname.startsWith('/api/admin/')) {
    return NextResponse.next();
  }

  // Allow admin login page and public auth endpoints
  if (pathname === '/admin/login' || pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET || 'miracle-feng-shui-super-secret-jwt-key-2026',
  });

  const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/api/admin');
  const isInvoiceRoute = pathname.includes('/invoice');
  const isOrderDetailRoute = pathname.startsWith('/api/orders/') && !pathname.includes('/status');
  const isProtectedCustomerRoute =
    !isInvoiceRoute &&
    !isOrderDetailRoute &&
    (pathname === '/checkout' ||
      pathname.startsWith('/my-orders') ||
      pathname.startsWith('/orders') ||
      pathname.startsWith('/api/cart') ||
      pathname.startsWith('/api/orders') ||
      pathname.startsWith('/api/favorites') ||
      pathname.startsWith('/api/addresses'));

  // Admin route protection: must have role === 'ADMIN' or verified admin cookie
  if (isAdminRoute) {
    const hasAdminCookie = req.cookies.get('mfs_admin_auth')?.value === 'true';
    const isSessionAdmin = token && token.role === 'ADMIN';

    if (!isSessionAdmin && !hasAdminCookie) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized: Admin access required' },
          { status: 401 }
        );
      }
      const loginUrl = new URL('/admin/login', req.url);
      loginUrl.searchParams.set('callbackUrl', req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Customer route protection
  if (isProtectedCustomerRoute) {
    if (!token) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { success: false, error: 'Authentication required' },
          { status: 401 }
        );
      }
      const homeUrl = new URL('/', req.url);
      homeUrl.searchParams.set('auth', 'signin');
      return NextResponse.redirect(homeUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/checkout',
    '/my-orders',
    '/orders',
    '/api/cart/:path*',
    '/api/orders/:path*',
    '/api/favorites/:path*',
    '/api/addresses/:path*',
  ],
};