'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [adminUser, setAdminUser] = useState('admin@miraclefengshui.com');

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (isLoginPage) { setIsAuthenticated(true); return; }
    try {
      const auth = localStorage.getItem('mfs_admin_auth');
      const user = localStorage.getItem('mfs_admin_user');
      const isSessionAdmin = session?.user && (session.user as any).role === 'ADMIN';
      if (auth === 'true' || isSessionAdmin) {
        setIsAuthenticated(true);
        if (user) setAdminUser(user);
        else if (session?.user?.email) setAdminUser(session.user.email);
      } else if (sessionStatus !== 'loading') {
        setIsAuthenticated(false);
        window.location.href = '/admin/login';
      }
    } catch {
      if (sessionStatus !== 'loading') { setIsAuthenticated(false); window.location.href = '/admin/login'; }
    }
  }, [pathname, isLoginPage, session, sessionStatus]);

  const handleSignOut = async () => {
    try {
      localStorage.removeItem('mfs_admin_auth');
      localStorage.removeItem('mfs_admin_user');
      document.cookie = 'mfs_admin_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
      await signOut({ redirect: false });
    } catch { /* ignore */ }
    router.replace('/admin/login');
  };

  if (isLoginPage) return <>{children}</>;

  if (isAuthenticated === null || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#140D1F] flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/20 mb-3 animate-pulse">
          <img src="/images/logofull.svg" alt="Miracle Feng Shui" className="w-full h-full object-cover" />
        </div>
        <p className="text-xs font-medium text-white/70 tracking-wide">Verifying credentials...</p>
      </div>
    );
  }

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: 'fa-gauge-high', exact: true },
    { name: 'Customer Orders', href: '/admin/orders', icon: 'fa-cart-shopping' },
    { name: 'Products Catalog', href: '/admin/products', icon: 'fa-boxes-stacked' },
    { name: 'Categories', href: '/admin/categories', icon: 'fa-tags' },
    { name: 'Sections Layout', href: '/admin/homepage', icon: 'fa-layer-group' },
    { name: 'Live Storefront', href: '/', icon: 'fa-store', isExternal: true },
  ];

  const isActive = (item: (typeof navItems)[0]) => {
    if (item.isExternal) return false; // Never mark external links as active
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  };

  const brand = (
    <div className="flex items-center gap-3 min-w-0">
      <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 shrink-0">
        <img src="/images/logofull.svg" alt="Miracle" className="w-full h-full object-cover" />
      </div>
      <div className="min-w-0">
        <span className="font-extrabold text-sm text-gray-900 block leading-tight truncate">Miracles Feng Shui</span>
        <span className="text-[10px] text-gray-500 font-medium block truncate">Admin Panel</span>
      </div>
    </div>
  );

  // Text colour sits on an inner span because the global `a { color: inherit }` rule
  // overrides Tailwind colour utilities placed on the link itself.
  const renderNav = (onNavigate?: () => void) => (
    <nav aria-label="Admin" className="flex-1 min-h-0 overflow-y-auto">
      <div className="divide-y divide-gray-200 border-b border-gray-200">
        {navItems.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.name}
              href={item.href}
              target={item.isExternal ? '_blank' : undefined}
              onClick={onNavigate}
              aria-current={active ? 'page' : undefined}
              title={item.name}
              className={`group block transition-colors duration-150 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-gray-900 ${
                active ? 'bg-[#040404]' : 'hover:bg-gray-50'
              }`}
            >
              <span
                className={`flex items-center gap-3 px-5 py-3.5 text-[13px] font-semibold ${
                  active ? 'text-white' : 'text-gray-600 group-hover:text-gray-900'
                }`}
              >
                <i
                  className={`fa-solid ${item.icon} w-4 text-center text-sm shrink-0 transition-colors duration-150 ${
                    active ? 'text-white' : 'text-gray-400 group-hover:text-gray-700'
                  }`}
                />
                <span className="truncate flex-1">{item.name}</span>
                {item.isExternal && (
                  <i className="fa-solid fa-arrow-up-right-from-square text-[10px] text-gray-400 group-hover:text-gray-700 transition-colors duration-150" />
                )}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );

  const todayLabel = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: '2-digit',
    year: 'numeric',
  });

  const footer = (
    <div className="flex flex-col gap-3 px-5 py-4 border-t border-gray-200">
      <div className="flex items-center justify-center gap-2 rounded-md bg-gray-100 py-2.5 text-[11px] font-bold tracking-wide text-gray-700 tabular-nums">
        <i className="fa-solid fa-calendar-day text-xs text-gray-500" aria-hidden="true" />
        <span>{todayLabel}</span>
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-[#040404] text-white font-bold flex items-center justify-center text-sm shrink-0">
            {adminUser.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <span className="text-[13px] font-bold text-gray-900 block truncate leading-tight">{adminUser.split('@')[0]}</span>
            <span className="text-[11px] text-gray-500 block truncate">Admin</span>
          </div>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          aria-label="Sign out"
          title="Sign Out"
          className="w-9 h-9 flex items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-100 text-xs cursor-pointer transition-colors shrink-0"
        >
          <i className="fa-solid fa-arrow-right-from-bracket" />
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily: "Montserrat, sans-serif" }} className="admin-portal min-h-screen bg-[#F2F3F7] text-gray-900 flex antialiased w-full overflow-x-hidden">

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col shrink-0 w-60 sticky top-0 h-screen z-30 bg-white border-r border-gray-200">
        <div className="px-5 py-4 border-b border-gray-200">{brand}</div>
        {renderNav()}
        {footer}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        <div className="lg:hidden sticky top-0 z-20 bg-white border-b border-gray-100 px-4 h-12 flex items-center">
          <button type="button" onClick={() => setMobileMenuOpen(true)} className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-800 transition-colors cursor-pointer" aria-label="Open navigation menu">
            <i className="fa-solid fa-bars text-base" />
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex animate-in fade-in duration-150">
            <div className="w-72 bg-white h-full flex flex-col shadow-2xl animate-in slide-in-from-left duration-200">
              <div className="flex items-center justify-between gap-2 px-5 py-4 border-b border-gray-200">
                {brand}
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close navigation menu"
                  className="w-9 h-9 rounded-md hover:bg-gray-100 flex items-center justify-center text-gray-500 cursor-pointer transition-colors shrink-0"
                >
                  <i className="fa-solid fa-xmark text-sm" />
                </button>
              </div>
              {renderNav(() => setMobileMenuOpen(false))}
              {footer}
            </div>
            <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
          </div>
        )}

        <main className="flex-1 w-full max-w-full px-3 sm:px-4 lg:px-5 py-5 min-w-0 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
