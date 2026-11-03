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

  return (
    <div style={{ fontFamily: "Montserrat, sans-serif" }} className="admin-portal min-h-screen bg-[#F2F3F7] text-gray-900 flex antialiased w-full overflow-x-hidden">

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col shrink-0 w-60 p-0 sticky top-0 h-screen z-30">
        <div className="flex flex-col h-full bg-white rounded-none border border-gray-200/80 shadow-sm p-5 gap-5">
          <div className="flex items-center gap-3 px-1">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 shrink-0">
              <img src="/images/logofull.svg" alt="Miracle" className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0">
              <span className="font-extrabold text-sm text-gray-900 block leading-tight truncate">Miracles Feng Shui</span>
              <span className="text-[10px] text-gray-400 font-medium block truncate">Admin Panel</span>
              <span className="text-[9px] text-gray-400 font-mono tracking-wide">{new Date().toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' }).toUpperCase()}</span>
            </div>
          </div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Navigation</p>
          <nav className="flex flex-col gap-1.5 flex-1">
            {navItems.map((item) => {
              const active = isActive(item);
              return (
                <Link key={item.name} href={item.href} target={item.isExternal ? '_blank' : undefined}
                  style={{ textDecoration: 'none', color: active ? '#ffffff' : '#4B5563', backgroundColor: active ? '#040404' : '' }}
                  className={`flex items-center justify-between px-4 py-3 rounded-full text-xs font-semibold transition-all ${active ? 'shadow-sm' : 'bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
                  title={item.name}
                >
                  <div className="flex items-center gap-3">
                    <i className={`fa-solid ${item.icon} text-sm shrink-0`} style={{ color: active ? '#ffffff' : '#9CA3AF' }} />
                    <span className="truncate">{item.name}</span>
                  </div>
                  {item.isExternal && <i className="fa-solid fa-arrow-up-right-from-square text-[9px]" style={{ color: active ? 'rgba(255,255,255,0.6)' : '#D1D5DB' }} />}
                </Link>
              );
            })}
          </nav>
          <div className="flex flex-col gap-3 pt-3 border-t border-gray-100">
            <Link href="/admin/products" style={{ color: '#ffffff', textDecoration: 'none', backgroundColor: '#040404' }} className="w-full py-2.5 font-bold text-[11px] tracking-wider rounded-full text-center transition-all cursor-pointer block">
              + New Product
            </Link>
            <div className="flex items-center justify-between gap-2 px-1">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 text-gray-700 font-bold flex items-center justify-center text-xs shrink-0">
                  {adminUser.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-gray-800 block truncate leading-tight">{adminUser.split('@')[0]}</span>
                  <span className="text-[10px] text-gray-400 block truncate">Admin</span>
                </div>
              </div>
              <button type="button" onClick={handleSignOut} className="text-gray-400 hover:text-gray-700 text-xs cursor-pointer p-1.5 rounded-full hover:bg-gray-100 transition-colors" title="Sign Out">
                <i className="fa-solid fa-arrow-right-from-bracket" />
              </button>
            </div>
          </div>
        </div>
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
            <div className="w-72 bg-[#F2F3F7] h-full p-0 flex flex-col shadow-2xl animate-in slide-in-from-left duration-200">
              <div className="bg-white rounded-none border border-gray-200 shadow-sm p-5 flex flex-col gap-5 h-full">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-200 shrink-0">
                      <img src="/images/logofull.svg" alt="Miracle" className="w-full h-full object-cover" />
                    </div>
                    <span className="font-extrabold text-sm text-gray-900 leading-tight">Miracles Feng Shui</span>
                    <span className="text-[9px] text-gray-400 font-mono tracking-wide">{new Date().toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' }).toUpperCase()}</span>
                  </div>
                  <button type="button" onClick={() => setMobileMenuOpen(false)} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 cursor-pointer transition-colors">
                    <i className="fa-solid fa-xmark text-sm" />
                  </button>
                </div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Navigation</p>
                <nav className="flex flex-col gap-1.5 flex-1">
                  {navItems.map((item) => {
                    const active = isActive(item);
                    return (
                      <Link key={item.name} href={item.href} onClick={() => setMobileMenuOpen(false)}
                        style={{ textDecoration: 'none', color: active ? '#ffffff' : '#4B5563', backgroundColor: active ? '#040404' : '' }}
                        className={`flex items-center gap-3 px-4 py-3 rounded-full text-xs font-semibold transition-all ${active ? 'shadow-sm' : 'bg-white border border-gray-200 hover:bg-gray-50'}`}
                      >
                        <i className={`fa-solid ${item.icon} text-sm shrink-0`} style={{ color: active ? '#ffffff' : '#9CA3AF' }} />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </nav>
                <div className="pt-3 border-t border-gray-100 flex flex-col gap-2.5">
                  <Link href="/admin/products" onClick={() => setMobileMenuOpen(false)} style={{ color: '#ffffff', textDecoration: 'none', backgroundColor: '#040404' }} className="w-full py-2.5 font-bold text-[11px] tracking-wider rounded-full text-center block">
                    + New Product
                  </Link>
                  <button type="button" onClick={handleSignOut} className="w-full py-2.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-full text-xs font-semibold cursor-pointer transition-colors flex items-center justify-center gap-2">
                    <i className="fa-solid fa-arrow-right-from-bracket text-xs" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
            <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
          </div>
        )}

        <main className="flex-1 w-full max-w-full px-3 sm:px-4 lg:px-5 py-5 min-w-0 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
