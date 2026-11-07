'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/context/StoreContext';

/** The dark banner: today's date, a search across products and orders, and links to the other admin pages. */
export default function DashboardHeader({ productCount, orderCount }: { productCount: number; orderCount: number }) {
  const router = useRouter();
  const { products, orders, refreshOrders } = useStore();
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // The search looks through the orders list, which only loads on request.
  useEffect(() => {
    refreshOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) setShowResults(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const term = query.trim().toLowerCase();
  const matchingProducts = term
    ? products
        .filter(
          (p) =>
            p.name.toLowerCase().includes(term) ||
            p.category.toLowerCase().includes(term) ||
            (p.maker && p.maker.toLowerCase().includes(term))
        )
        .slice(0, 4)
    : [];
  const matchingOrders = term
    ? orders
        .filter((o) => o.orderNumber.toLowerCase().includes(term) || o.customerName.toLowerCase().includes(term))
        .slice(0, 3)
    : [];

  const searchCatalog = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;
    setShowResults(false);
    router.push(`/admin/products?q=${encodeURIComponent(query.trim())}`);
  };

  const today = new Date()
    .toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' })
    .toUpperCase();

  const pages = [
    { name: 'Dashboard', href: '/admin', icon: 'fa-gauge-high', active: true },
    { name: 'Products Catalog', href: '/admin/products', icon: 'fa-boxes-stacked', count: productCount },
    { name: 'Customer Orders', href: '/admin/orders', icon: 'fa-receipt', count: orderCount },
    { name: 'Live Storefront', href: '/', icon: 'fa-store', isExternal: true },
  ];

  return (
    <div className="rounded-3xl bg-[#161619] p-6 sm:p-8 text-white shadow-xl border border-white/10 relative overflow-hidden flex flex-col justify-between gap-6 min-h-[190px]">
      <div className="absolute right-0 top-0 bottom-0 w-full sm:w-3/5 lg:w-1/2 pointer-events-none overflow-hidden select-none">
        <img
          src="/images/feng_shui_hero_banner.jpg"
          alt=""
          className="w-full h-full object-cover object-right brightness-[0.7] contrast-[1.08]"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to right, #161619 0%, #161619 12%, rgba(22, 22, 25, 0.85) 42%, rgba(22, 22, 25, 0.25) 75%, transparent 100%)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, rgba(22, 22, 25, 0.35) 0%, transparent 25%, transparent 75%, rgba(22, 22, 25, 0.5) 100%)',
          }}
        />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full relative z-10">
        <div>
          <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-white/[0.08] border border-white/15 text-white/90 text-[10.5px] font-mono tracking-[0.16em] uppercase font-semibold mb-2.5 backdrop-blur-xs">
            {today}
          </div>
          <h1
            style={{ fontFamily: "'Bebas Neue', 'Montserrat', sans-serif" }}
            className="text-2xl sm:text-3xl lg:text-4xl font-normal tracking-tight text-white leading-tight"
          >
            Miracle Command Center
          </h1>
          <p className="text-xs sm:text-sm text-white/70 mt-1 max-w-lg font-normal leading-relaxed">
            What needs doing, how sales are going, and how the catalog stands.
          </p>
        </div>

        <div ref={searchRef} className="relative self-start sm:self-center">
          <form
            onSubmit={searchCatalog}
            role="search"
            className="flex items-center bg-gray-100/80 hover:bg-gray-100 focus-within:bg-white focus-within:ring-2 focus-within:ring-black/15 transition-all border border-gray-200/50 rounded-full px-4 py-2 w-64 sm:w-72"
          >
            <button type="submit" aria-label="Search catalog" className="text-gray-500 hover:text-black mr-2 cursor-pointer bg-transparent border-none p-0 flex items-center">
              <i className="fa-solid fa-magnifying-glass text-xs" />
            </button>
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowResults(true);
              }}
              onFocus={() => setShowResults(true)}
              placeholder="Search products, orders..."
              aria-label="Search products and orders"
              className="bg-transparent border-none outline-hidden text-xs text-gray-900 placeholder-gray-500 w-full"
            />
            {query && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => {
                  setQuery('');
                  setShowResults(false);
                }}
                className="text-gray-400 hover:text-black text-xs cursor-pointer ml-1 p-0.5"
              >
                <i className="fa-solid fa-xmark text-[11px]" />
              </button>
            )}
          </form>

          {showResults && term && (
            <div className="absolute right-0 top-full mt-2 w-72 sm:w-96 bg-white text-gray-900 rounded-2xl shadow-2xl border border-gray-200 p-3 z-50">
              {matchingProducts.length > 0 && (
                <div>
                  <div className="text-[10.5px] font-bold text-gray-700 uppercase tracking-wider mb-1.5">Products</div>
                  <div className="flex flex-col gap-1">
                    {matchingProducts.map((prod) => (
                      <Link
                        key={prod.id}
                        href={`/admin/products?q=${encodeURIComponent(prod.name)}`}
                        onClick={() => setShowResults(false)}
                        className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-gray-100 transition-colors no-underline"
                      >
                        <img src={prod.images[0]} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0 border border-gray-100" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-gray-900 truncate">{prod.name}</p>
                          <span className="text-[10px] text-gray-500 block truncate">
                            {prod.category} &bull; ₹{prod.price.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {matchingOrders.length > 0 && (
                <div className={matchingProducts.length > 0 ? 'mt-3 pt-2.5 border-t border-gray-100' : ''}>
                  <div className="text-[10.5px] font-bold text-gray-700 uppercase tracking-wider mb-1.5">Orders</div>
                  <div className="flex flex-col gap-1">
                    {matchingOrders.map((ord) => (
                      <Link
                        key={ord.id}
                        href={`/admin/orders?q=${encodeURIComponent(ord.orderNumber)}`}
                        onClick={() => setShowResults(false)}
                        className="flex items-center justify-between p-1.5 rounded-xl hover:bg-gray-100 transition-colors no-underline"
                      >
                        <div>
                          <span className="text-xs font-bold text-gray-900 font-mono block">{ord.orderNumber}</span>
                          <span className="text-[10px] text-gray-500 block">
                            {ord.customerName} &bull; ₹{ord.totalAmount.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700">{ord.status}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {matchingProducts.length === 0 && matchingOrders.length === 0 && (
                <p className="py-4 text-center text-gray-500 text-xs">No matching products or orders.</p>
              )}

              <div className="mt-3 pt-2 border-t border-gray-100 text-center">
                <button type="button" onClick={() => searchCatalog()} className="text-xs font-bold text-black hover:underline cursor-pointer bg-transparent border-none">
                  Search &ldquo;{query.trim()}&rdquo; in the products catalog &rarr;
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <nav aria-label="Admin pages" className="pt-3 border-t border-white/10 relative z-10">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {pages.map((pg) => (
            <Link
              key={pg.href}
              href={pg.href}
              target={pg.isExternal ? '_blank' : undefined}
              aria-current={pg.active ? 'page' : undefined}
              style={pg.active ? { backgroundColor: '#FFFFFF', color: '#111111' } : undefined}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all no-underline ${
                pg.active ? 'shadow-md font-bold' : 'bg-white/10 hover:bg-white/20 text-white/90 border border-white/15 backdrop-blur-xs'
              }`}
            >
              <i className={`fa-solid ${pg.icon} text-[11px] ${pg.active ? 'text-black' : 'text-white/80'}`} />
              <span>{pg.name}</span>
              {pg.count !== undefined && (
                <span className="text-[10px] px-2 rounded-full font-bold bg-gray-100 text-gray-700 tabular-nums">{pg.count}</span>
              )}
              {pg.isExternal && <i className="fa-solid fa-arrow-up-right-from-square text-[9px] opacity-75" />}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
