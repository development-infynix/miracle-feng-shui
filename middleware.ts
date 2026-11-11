import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Explicit, opt-in dev bypass. Only when ALLOW_DEV_ADMIN==='true' (never just
  // because NODE_ENV is development) so it can't silently ship to production.
  const devAdmin = process.env.ALLOW_DEV_ADMIN === 'true';
  if (devAdmin && (pathname.startsWith('/api/admin/') || pathname.startsWith('/admin'))) {
    return NextResponse.next();
  }

  // Allow admin login page and public auth endpoints
  if (pathname === '/admin/login' || pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/api/admin');
  const isInvoiceRoute = pathname.includes('/invoice');
  const isOrderDetailRoute = pathname.startsWith('/api/orders/') && !pathname.includes('/status');
  const isProtectedCustomerRoute =
    !isInvoiceRoute &&
    !isOrderDetailRoute &&
    (pathname.startsWith('/profile') ||
      pathname.startsWith('/order-confirmation') ||
      pathname.startsWith('/my-orders') ||
      pathname.startsWith('/orders') ||
      pathname.startsWith('/api/cart') ||
      pathname.startsWith('/api/orders') ||
      pathname.startsWith('/api/favorites') ||
      pathname.startsWith('/api/addresses') ||
      pathname.startsWith('/api/notifications'));

  // Admin route protection: must have an authenticated session with role === 'ADMIN'.
  if (isAdminRoute) {
    const isSessionAdmin = token && token.role === 'ADMIN';

    if (!isSessionAdmin) {
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
    '/profile',
    '/order-confirmation',
    '/my-orders',
    '/orders',
    '/api/cart/:path*',
    '/api/orders/:path*',
    '/api/favorites/:path*',
    '/api/addresses/:path*',
    '/api/notifications/:path*',
  ],
};