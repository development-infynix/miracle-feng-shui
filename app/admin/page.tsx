'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore, OrderStatus } from '@/context/StoreContext';

export default function AdminDashboardPage() {
  const router = useRouter();
  const {
    products,
    orders,
    refreshOrders,
    sections,
    updateOrderStatus,
    confirmOrder,
    ordersLeftToConfirm,
    ordersLeftToPack,
    ordersInTransit,
    settledBalance,
    pendingBalance,
    totalOrderRevenue,
  } = useStore();
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [greeting, setGreeting] = useState('Good Afternoon');
  const [bannerSearchQuery, setBannerSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    refreshOrders();
  }, [refreshOrders]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      if (hours < 12) setGreeting('Good Morning');
      else if (hours < 18) setGreeting('Good Afternoon');
      else setGreeting('Good Evening');

      const dateStr = now.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      const timeStr = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
      setCurrentDateTime(`${dateStr} | ${timeStr}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Metrics
  const totalRevenue = orders.reduce((sum, ord) => sum + ord.totalAmount, 0);
  const pendingOrdersCount = orders.filter((o) => o.status === 'Pending').length;
  const activeSectionsCount = sections.filter((s) => s.enabled).length;

  // Search Results filtering
  const matchingProducts = bannerSearchQuery.trim()
    ? products
        .filter(
          (p) =>
            p.name.toLowerCase().includes(bannerSearchQuery.toLowerCase()) ||
            p.category.toLowerCase().includes(bannerSearchQuery.toLowerCase()) ||
            (p.maker && p.maker.toLowerCase().includes(bannerSearchQuery.toLowerCase()))
        )
        .slice(0, 4)
    : [];

  const matchingOrders = bannerSearchQuery.trim()
    ? orders
        .filter(
          (o) =>
            o.orderNumber.toLowerCase().includes(bannerSearchQuery.toLowerCase()) ||
            o.customerName.toLowerCase().includes(bannerSearchQuery.toLowerCase())
        )
        .slice(0, 3)
    : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerSearchQuery.trim()) return;
    setShowSearchDropdown(false);
    router.push(`/admin/products?q=${encodeURIComponent(bannerSearchQuery.trim())}`);
  };

  const statusPastels: Record<OrderStatus, { bg: string; text: string }> = {
    Pending: { bg: 'bg-[#FFF7ED]', text: 'text-[#C2410C]' },
    Processing: { bg: 'bg-[#EBF2FE]', text: 'text-[#1D4ED8]' },
    Shipped: { bg: 'bg-[#F3EEFC]', text: 'text-[#6D28D9]' },
    Delivered: { bg: 'bg-[#E6F4F1]', text: 'text-[#0F766E]' },
    Cancelled: { bg: 'bg-[#FEE2E2]', text: 'text-[#B91C1C]' },
  };

  // Banner Navigation Pages
  const bannerPages = [
    { name: 'Dashboard', href: '/admin', icon: 'fa-gauge-high', active: true },
    { name: 'Sections Layout', href: '/admin/homepage', icon: 'fa-layer-group', count: `${activeSectionsCount}/${sections.length}` },
    { name: 'Products Catalog', href: '/admin/products', icon: 'fa-boxes-stacked', count: `${products.length}` },
    { name: 'Customer Orders', href: '/admin/orders', icon: 'fa-receipt', count: `${orders.length}` },
    { name: 'Live Storefront', href: '/', icon: 'fa-store', isExternal: true },
  ];

  const currentDateStr = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: '2-digit',
    year: 'numeric',
  }).toUpperCase();

  return (
    <div
      style={{ fontFamily: "'Montserrat', sans-serif" }}
      className="flex flex-col gap-4 sm:gap-5 max-w-7xl mx-auto antialiased"
    >
      {/* Luxury Noir Salon-Style Hero Command Header with Right-Side Fade Image */}
      <div className="rounded-3xl bg-[#161619] p-6 sm:p-8 text-white shadow-xl border border-white/10 relative overflow-hidden flex flex-col justify-between gap-6 min-h-[190px]">
        {/* Right-Side Photo with Seamless Noir Blend Gradient (matching reference screenshot) */}
        <div className="absolute right-0 top-0 bottom-0 w-full sm:w-3/5 lg:w-1/2 pointer-events-none overflow-hidden select-none">
          <img
            src="/images/feng_shui_hero_banner.jpg"
            alt="Miracle Feng Shui Sanctuary"
            className="w-full h-full object-cover object-right brightness-[0.7] contrast-[1.08]"
          />
          {/* Seamless Left Fade Gradient */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to right, #161619 0%, #161619 12%, rgba(22, 22, 25, 0.85) 42%, rgba(22, 22, 25, 0.25) 75%, transparent 100%)',
            }}
          />
          {/* Subtle Top & Bottom Vignette */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to bottom, rgba(22, 22, 25, 0.35) 0%, transparent 25%, transparent 75%, rgba(22, 22, 25, 0.5) 100%)',
            }}
          />
        </div>

        {/* Top Header Row: Greeting & Functional Wink Search Pill */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full relative z-10">
          <div>
            {/* Date Pill Badge (matching reference screenshot) */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.08] border border-white/15 text-white/90 text-[10.5px] font-mono tracking-[0.16em] uppercase font-semibold mb-2.5 shadow-2xs backdrop-blur-xs">
              <span>{currentDateStr}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <h1
              style={{ fontFamily: "'Bebas Neue', 'Montserrat', sans-serif" }}
              className="text-2xl sm:text-3xl lg:text-4xl font-normal tracking-tight text-white leading-tight"
            >
              Miracle Command Center
            </h1>
            <p
              style={{ fontFamily: "'Montserrat', sans-serif" }}
              className="text-xs sm:text-sm text-white/70 mt-1 max-w-lg font-normal leading-relaxed"
            >
              Monitor store catalog, fulfill customer orders, and orchestrate homepage sections.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-center">
            {/* Functional Search in Banner with Live Results Dropdown */}
            <div ref={searchContainerRef} className="relative">
              <form
                onSubmit={handleSearchSubmit}
                className="flex items-center bg-gray-100/80 hover:bg-gray-100 focus-within:bg-white focus-within:ring-2 focus-within:ring-black/15 transition-all border border-gray-200/80 rounded-full px-4 py-2 text-xs text-gray-900 placeholder-gray-400 w-56 sm:w-68 shadow-2xs"
              >
                <button
                  type="submit"
                  aria-label="Search catalog"
                  className="text-gray-500 hover:text-black mr-2 cursor-pointer bg-transparent border-none p-0 flex items-center"
                >
                  <i className="fa-solid fa-magnifying-glass text-xs" />
                </button>
                <input
                  type="text"
                  value={bannerSearchQuery}
                  onChange={(e) => {
                    setBannerSearchQuery(e.target.value);
                    setShowSearchDropdown(true);
                  }}
                  onFocus={() => setShowSearchDropdown(true)}
                  placeholder="Search catalog, orders..."
                  className="bg-transparent border-none outline-hidden text-xs text-gray-900 placeholder-gray-400 w-full"
                />
                {bannerSearchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setBannerSearchQuery('');
                      setShowSearchDropdown(false);
                    }}
                    className="text-gray-400 hover:text-black text-xs cursor-pointer ml-1 p-0.5"
                  >
                    <i className="fa-solid fa-xmark text-[11px]" />
                  </button>
                )}
              </form>

              {/* Instant Search Dropdown Results Popover */}
              {showSearchDropdown && bannerSearchQuery.trim().length > 0 && (
                <div
                  className="absolute right-0 top-full mt-2 w-72 sm:w-96 bg-white text-gray-900 rounded-2xl shadow-2xl border border-gray-200 p-3 z-50 animate-in fade-in zoom-in-95 duration-150"
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      Search Results for &ldquo;{bannerSearchQuery}&rdquo;
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowSearchDropdown(false)}
                      className="text-gray-400 hover:text-gray-600 text-xs cursor-pointer"
                    >
                      <i className="fa-solid fa-xmark" />
                    </button>
                  </div>

                  {/* Matching Products */}
                  {matchingProducts.length > 0 && (
                    <div className="mt-2.5">
                      <div className="text-[10.5px] font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <i className="fa-solid fa-boxes-stacked text-[10px]" />
                        <span>Products ({matchingProducts.length})</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        {matchingProducts.map((prod) => (
                          <button
                            key={prod.id}
                            type="button"
                            onClick={() => {
                              setShowSearchDropdown(false);
                              router.push(`/admin/products?q=${encodeURIComponent(prod.name)}`);
                            }}
                            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-gray-100 text-left transition-colors cursor-pointer w-full"
                          >
                            <img
                              src={prod.images[0]}
                              alt={prod.name}
                              className="w-8 h-8 rounded-lg object-cover shrink-0 border border-gray-100"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold text-gray-900 truncate leading-snug">
                                {prod.name}
                              </p>
                              <span className="text-[10px] text-gray-400 block truncate">
                                {prod.category} &bull; ₹{prod.price}
                              </span>
                            </div>
                            <span className="text-[10.5px] font-bold text-black shrink-0">
                              Edit &rarr;
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Matching Orders */}
                  {matchingOrders.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-gray-100">
                      <div className="text-[10.5px] font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <i className="fa-solid fa-receipt text-[10px]" />
                        <span>Orders ({matchingOrders.length})</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        {matchingOrders.map((ord) => (
                          <Link
                            key={ord.id}
                            href="/admin/orders"
                            onClick={() => setShowSearchDropdown(false)}
                            className="flex items-center justify-between p-1.5 rounded-xl hover:bg-gray-100 text-left transition-colors no-underline"
                          >
                            <div>
                              <span className="text-xs font-bold text-gray-900 font-mono block">
                                {ord.orderNumber}
                              </span>
                              <span className="text-[10px] text-gray-500 block">
                                {ord.customerName} &bull; ₹{ord.totalAmount}
                              </span>
                            </div>
                            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700">
                              {ord.status}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {matchingProducts.length === 0 && matchingOrders.length === 0 && (
                    <div className="py-5 text-center text-gray-400 text-xs">
                      <i className="fa-solid fa-magnifying-glass text-gray-300 text-lg mb-1 block" />
                      No matching products or orders found.
                    </div>
                  )}

                  {/* Bottom View All Link */}
                  <div className="mt-3 pt-2 border-t border-gray-100 text-center">
                    <button
                      type="button"
                      onClick={handleSearchSubmit}
                      className="text-xs font-bold text-black hover:underline cursor-pointer bg-transparent border-none"
                    >
                      Search &ldquo;{bannerSearchQuery}&rdquo; in Products Catalog &rarr;
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Avatar */}
            <div className="w-8 h-8 rounded-full bg-[#111111] text-white font-bold flex items-center justify-center text-xs shadow-xs">
              A
            </div>
          </div>
        </div>

        {/* All Admin Pages Direct Wink Navigation Pill Bar */}
        <div className="pt-3 border-t border-white/10 relative z-10">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {bannerPages.map((pg) => (
              <Link
                key={pg.href}
                href={pg.href}
                target={pg.isExternal ? '_blank' : undefined}
                style={
                  pg.active
                    ? { backgroundColor: '#FFFFFF', color: '#111111' }
                    : undefined
                }
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all no-underline ${
                  pg.active
                    ? 'bg-white text-black shadow-md font-bold'
                    : 'bg-white/10 hover:bg-white/20 text-white/90 border border-white/15 backdrop-blur-xs'
                }`}
              >
                <i
                  className={`fa-solid ${pg.icon} text-[11px] ${
                    pg.active ? 'text-black' : 'text-white/80'
                  }`}
                />
                <span>{pg.name}</span>
                {pg.count && (
                  <span
                    className={`text-[10px] px-2 py-0.2 rounded-full font-bold ${
                      pg.active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {pg.count}
                  </span>
                )}
                {pg.isExternal && (
                  <i className="fa-solid fa-arrow-up-right-from-square text-[9px] opacity-75" />
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Compact KPI Cards Grid with Minimalist Pastel Circles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Sales with Real-Time Cash Flow Breakdown */}
        <div className="bg-white p-4 sm:p-4.5 rounded-2xl border border-gray-200/70 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gray-100 text-gray-500 flex items-center justify-center text-sm shrink-0 shadow-2xs border border-gray-200/50">
                <i className="fa-solid fa-indian-rupee-sign" />
              </div>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Total Sales
              </span>
            </div>
            <Link
              href="/admin/orders"
              className="text-[10.5px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200/60 no-underline"
            >
              ₹{settledBalance.toLocaleString('en-IN')} Settled
            </Link>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              ₹{totalOrderRevenue.toLocaleString('en-IN')}
            </div>
            <span className="text-[10.5px] font-semibold text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded-md border border-gray-200 flex items-center gap-1">
              <span>₹{pendingBalance.toLocaleString('en-IN')} COD Due</span>
            </span>
          </div>
        </div>

        {/* Customer Orders (Very Light Pastel Peach / Blush) */}
        <div className="bg-white p-4 sm:p-4.5 rounded-2xl border border-gray-200/70 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gray-100 text-gray-500 flex items-center justify-center text-sm shrink-0 shadow-2xs border border-gray-200/50">
                <i className="fa-solid fa-bag-shopping" />
              </div>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Store Orders
              </span>
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              {orders.length}
            </div>
            <span className="text-[10.5px] font-semibold text-[#9A3412] bg-[#FDF4F0] px-1.5 py-0.5 rounded-md border border-[#FDBA74]/50 flex items-center gap-1">
              <i className="fa-solid fa-arrow-trend-up text-[9px]" />
              <span>8%</span>
            </span>
          </div>
        </div>

        {/* Active Products (Very Light Pastel Lavender) */}
        <div className="bg-white p-4 sm:p-4.5 rounded-2xl border border-gray-200/70 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gray-100 text-gray-500 flex items-center justify-center text-sm shrink-0 shadow-2xs border border-gray-200/50">
                <i className="fa-solid fa-cubes" />
              </div>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Catalog Items
              </span>
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              {products.length}
            </div>
            <span className="text-[10.5px] font-semibold text-[#6B21A8] bg-[#F6F2FC] px-1.5 py-0.5 rounded-md border border-purple-200/50 flex items-center gap-1">
              <i className="fa-solid fa-check text-[9px]" />
              <span>Active</span>
            </span>
          </div>
        </div>

        {/* Layout Sections (Very Light Pastel Mint / Sage) */}
        <div className="bg-white p-4 sm:p-4.5 rounded-2xl border border-gray-200/70 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gray-100 text-gray-500 flex items-center justify-center text-sm shrink-0 shadow-2xs border border-gray-200/50">
                <i className="fa-solid fa-sliders" />
              </div>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Sections
              </span>
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              {activeSectionsCount} / {sections.length}
            </div>
            <span className="text-[10.5px] font-semibold text-[#115E59] bg-[#F0F7F5] px-1.5 py-0.5 rounded-md border border-teal-200/50 flex items-center gap-1">
              <i className="fa-solid fa-check text-[9px]" />
              <span>Optimal</span>
            </span>
          </div>
        </div>
      </div>

      {/* Action Required: Orders Left to Confirm Queue */}
      {ordersLeftToConfirm > 0 && (
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#040404] text-white flex items-center justify-center text-lg shrink-0 shadow-xs">
              <i className="fa-solid fa-bell" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                Action Required: {ordersLeftToConfirm} New Order{ordersLeftToConfirm > 1 ? 's' : ''} Left to Confirm
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Verify customer addresses and confirm dispatch readiness to move to packing.
              </p>
            </div>
          </div>
          <Link
            href="/admin/orders"
            style={{ backgroundColor: '#040404', color: '#FFFFFF' }}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#040404] hover:bg-black text-white text-xs font-semibold transition-all shadow-xs shrink-0 no-underline"
          >
            <span>Review Orders ({ordersLeftToConfirm})</span>
            <i className="fa-solid fa-arrow-right text-[10px]" />
          </Link>
        </div>
      )}

      {/* Main Grid: Active Sections / Orders (Left 8) and System Alerts (Right 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
        {/* Left 8 Cols: Active Sections Cards & Orders Table */}
        <div className="lg:col-span-8 flex flex-col gap-4 sm:gap-5">
          {/* Active Sections Grid */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/70 shadow-2xs">
            <div className="flex items-center justify-between mb-3.5">
              <h2 className="text-sm sm:text-base font-bold text-gray-900 tracking-tight">
                Active Homepage Sections
              </h2>
              <Link
                href="/admin/homepage"
                className="text-[11px] font-bold text-gray-600 hover:text-black bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-lg uppercase tracking-wider transition-colors no-underline"
              >
                VIEW ALL
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Card 1: Very Light Pastel Amber */}
              <div className="bg-[#FAF9F6] hover:bg-[#F5F2EB] transition-colors p-3 rounded-xl border border-gray-200/60 flex flex-col items-center text-center">
                <div className="w-9 h-9 rounded-xl bg-gray-100 text-gray-500 flex items-center justify-center text-base mb-1.5 shadow-2xs border border-gray-200/50">
                  <i className="fa-solid fa-star" />
                </div>
                <span className="text-xs font-bold text-gray-800 truncate w-full">
                  Hero Showcase
                </span>
                <span className="text-[9.5px] text-gray-400 font-semibold uppercase mt-0.5">
                  ENABLED
                </span>
              </div>

              {/* Card 2: Very Light Pastel Peach / Blush */}
              <div className="bg-[#FAF9F6] hover:bg-[#F5F2EB] transition-colors p-3 rounded-xl border border-gray-200/60 flex flex-col items-center text-center">
                <div className="w-9 h-9 rounded-xl bg-gray-100 text-gray-500 flex items-center justify-center text-base mb-1.5 shadow-2xs border border-gray-200/50">
                  <i className="fa-solid fa-gem" />
                </div>
                <span className="text-xs font-bold text-gray-800 truncate w-full">
                  Auspicious Finds
                </span>
                <span className="text-[9.5px] text-gray-400 font-semibold uppercase mt-0.5">
                  ENABLED
                </span>
              </div>

              {/* Card 3: Very Light Pastel Lavender */}
              <div className="bg-[#FAF9F6] hover:bg-[#F5F2EB] transition-colors p-3 rounded-xl border border-gray-200/60 flex flex-col items-center text-center">
                <div className="w-9 h-9 rounded-xl bg-gray-100 text-gray-500 flex items-center justify-center text-base mb-1.5 shadow-2xs border border-gray-200/50">
                  <i className="fa-solid fa-circle-nodes" />
                </div>
                <span className="text-xs font-bold text-gray-800 truncate w-full">
                  Curated Interests
                </span>
                <span className="text-[9.5px] text-gray-400 font-semibold uppercase mt-0.5">
                  ENABLED
                </span>
              </div>

              {/* Card 4: Very Light Pastel Mint / Sage */}
              <div className="bg-[#FAF9F6] hover:bg-[#F5F2EB] transition-colors p-3 rounded-xl border border-gray-200/60 flex flex-col items-center text-center">
                <div className="w-9 h-9 rounded-xl bg-gray-100 text-gray-500 flex items-center justify-center text-base mb-1.5 shadow-2xs border border-gray-200/50">
                  <i className="fa-solid fa-gift" />
                </div>
                <span className="text-xs font-bold text-gray-800 truncate w-full">
                  Prosperity Gifts
                </span>
                <span className="text-[9.5px] text-gray-400 font-semibold uppercase mt-0.5">
                  ENABLED
                </span>
              </div>
            </div>
          </div>

          {/* Recent Orders Table */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/70 shadow-2xs flex flex-col">
            <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-gray-100">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-gray-900 tracking-tight">Recent Customer Orders</h2>
                <p className="text-[11px] text-gray-400 mt-0.5">Live store orders</p>
              </div>
              <Link
                href="/admin/orders"
                className="text-xs font-bold text-[#170E22] hover:text-[#EA580C] no-underline transition-colors"
              >
                All Orders &rarr;
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50/80 text-gray-400 text-[10px] uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-2 px-2.5 rounded-l-lg">Order #</th>
                    <th className="py-2 px-2.5">Customer</th>
                    <th className="py-2 px-2.5">Items</th>
                    <th className="py-2 px-2.5">Total</th>
                    <th className="py-2 px-2.5">Status</th>
                    <th className="py-2 px-2.5 rounded-r-lg text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.slice(0, 5).map((order) => {
                    const pastel = statusPastels[order.status] || statusPastels.Pending;
                    return (
                      <tr key={order.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-2.5 px-2.5 font-semibold text-gray-900 font-mono text-[11px]">
                          {order.orderNumber}
                        </td>
                        <td className="py-2.5 px-2.5 text-gray-700">
                          <div className="font-bold text-gray-900 text-xs">{order.customerName}</div>
                          <div className="text-[10px] text-gray-400">{order.city}</div>
                        </td>
                        <td className="py-2.5 px-2.5 text-gray-600 text-xs">
                          {order.items.length} item{order.items.length > 1 ? 's' : ''}
                        </td>
                        <td className="py-2.5 px-2.5 font-bold text-gray-900 text-xs">
                          ₹{order.totalAmount.toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 px-2.5">
                          <div className="flex items-center gap-1.5">
                            <select
                              value={order.status}
                              onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                              className={`text-[11px] font-bold px-2 py-0.5 rounded-full border border-black/5 cursor-pointer focus:outline-hidden ${pastel.bg} ${pastel.text}`}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Processing">Processing</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>

                            {order.status === 'Pending' && (
                              <button
                                type="button"
                                onClick={() => confirmOrder(order.id)}
                                style={{ backgroundColor: '#059669', color: '#ffffff' }}
                                className="px-2 py-0.5 text-[10px] font-bold hover:bg-emerald-700 text-white rounded-md shadow-2xs transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                                title="Confirm this order"
                              >
                                <i className="fa-solid fa-check text-[9px]" />
                                <span>Confirm</span>
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 px-2.5 text-right">
                          <Link
                            href="/admin/orders"
                            style={{ backgroundColor: '#111111', color: '#FFFFFF' }}
                            className="inline-block px-3.5 py-1 rounded-full text-xs font-semibold bg-[#111111] hover:bg-black text-white shadow-2xs no-underline transition-all"
                          >
                            Details
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 4 Cols: System Alerts & Shortcuts */}
        <div className="lg:col-span-4 flex flex-col gap-4 sm:gap-5">
          {/* System Alerts Card */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/70 shadow-2xs flex flex-col">
            <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-gray-100">
              <h2 className="text-sm sm:text-base font-bold text-gray-900 tracking-tight">System Alerts</h2>
              <div className="w-5 h-5 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center text-[10px] border border-gray-200/60">
                <i className="fa-solid fa-exclamation" />
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              {/* Alert 1: Very Light Pastel Peach */}
              <div className="p-2.5 bg-gray-50/70 rounded-xl flex items-center justify-between border border-gray-200/60">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center text-xs shrink-0 border border-gray-200/50">
                    <i className="fa-solid fa-bolt" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-900 block">
                      Catalog Sync
                    </span>
                    <span className="text-[10px] text-gray-400 block">
                      Live connection
                    </span>
                  </div>
                </div>
                <span className="text-[9.5px] font-bold text-emerald-800 bg-[#E6F4F1] px-1.5 py-0.5 rounded-md border border-emerald-200/60">
                  Live
                </span>
              </div>

              {/* Alert 2: Very Light Pastel Amber */}
              <div className="p-2.5 bg-gray-50/70 rounded-xl flex items-center justify-between border border-gray-200/60">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center text-xs shrink-0 border border-gray-200/50">
                    <i className="fa-solid fa-shield-halved" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-900 block">
                      Security Guard
                    </span>
                    <span className="text-[10px] text-gray-400 block">
                      URL protected
                    </span>
                  </div>
                </div>
                <span className="text-[9.5px] font-bold text-[#B45309] bg-[#FEF7EE] px-1.5 py-0.5 rounded-md border border-[#FED7AA]/60">
                  Optimal
                </span>
              </div>

              {/* Alert 3: Very Light Pastel Lavender */}
              <div className="p-2.5 bg-gray-50/70 rounded-xl flex items-center justify-between border border-gray-200/60">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center text-xs shrink-0 border border-gray-200/50">
                    <i className="fa-solid fa-box-open" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-900 block">
                      Inventory
                    </span>
                    <span className="text-[10px] text-gray-400 block">
                      {products.length} SKU records
                    </span>
                  </div>
                </div>
                <span className="text-[9.5px] font-bold text-purple-800 bg-[#F6F2FC] px-1.5 py-0.5 rounded-md border border-purple-200/60">
                  Normal
                </span>
              </div>
            </div>

            {/* Quick Actions in Wink Style */}
            <div className="mt-4 pt-3 border-t border-gray-100 flex flex-col gap-2">
              <Link
                href="/admin/products"
                style={{ backgroundColor: '#111111', color: '#FFFFFF' }}
                className="w-full py-2.5 bg-[#111111] hover:bg-black text-white text-xs font-semibold rounded-full text-center transition-all no-underline shadow-xs flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-plus text-[11px]" />
                <span>Add New Product</span>
              </Link>

              <Link
                href="/admin/homepage"
                className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded-full text-center transition-colors no-underline flex items-center justify-center gap-2 border border-gray-200/70"
              >
                <i className="fa-solid fa-arrows-up-down text-[11px] text-gray-600" />
                <span>Reorder Homepage</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
