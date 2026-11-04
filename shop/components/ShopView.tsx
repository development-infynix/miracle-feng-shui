'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { Product } from '@/lib/placeholder-data';
import { useLocale } from '@/context/CurrencyContext';
import { translateCategory } from '@/lib/translations';
import ShopAppliedFilters from './ShopAppliedFilters';
import ShopFilterDrawer from './ShopFilterDrawer';
import ShopProductGrid from './ShopProductGrid';
import { countActiveFilters, shopUrl, type ShopCategory, type ShopFilters } from './shopFilters';

const CONTAINER = 'mx-auto w-full max-w-[1280px] px-3 sm:px-6';

interface ShopViewProps {
  filters: ShopFilters;
  categories: ShopCategory[];
  products: Product[];
  total: number;
}

/** The shop page's client side: holds the drawer and the pending state while filters load. */
export default function ShopView({ filters, categories, products, total }: ShopViewProps) {
  const router = useRouter();
  const { language, t } = useLocale();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  // The site header changes height as its category pill opens and closes.
  const [headerHeight, setHeaderHeight] = useState(138);

  useEffect(() => {
    const siteHeader = document.getElementById('site-header');
    if (!siteHeader) return;
    const measure = () => setHeaderHeight(siteHeader.offsetHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(siteHeader);
    return () => observer.disconnect();
  }, []);

  const applyFilters = (next: ShopFilters) => {
    startTransition(() => router.push(shopUrl(next), { scroll: false }));
  };

  let heading = t('nav.products', 'Products');
  if (filters.q) heading = t('shop.results_for', 'Results for "{query}"').replace('{query}', filters.q);
  else if (filters.category) heading = translateCategory(filters.category, language);

  const activeCount = countActiveFilters(filters);

  return (
    <div className="pb-20 font-outfit">
      {/* There's no visible page heading, so this names the page for screen readers and search engines. */}
      <h1 aria-live="polite" className="sr-only">
        {heading} ({total})
      </h1>

      {/* Sticks under the site header. Products start below it and only ever scroll beneath it. */}
      <div className="sticky z-30 bg-white" style={{ top: headerHeight }}>
        {/* The site header is see-through, so this covers products passing behind its pills. */}
        <div aria-hidden="true" className="absolute inset-x-0 bottom-full bg-white" style={{ height: headerHeight }} />

        <div className={`${CONTAINER} flex items-center justify-between gap-3 py-3`}>
          <div className="min-w-0 flex-1">
            <ShopAppliedFilters filters={filters} onChange={applyFilters} />
          </div>
          <button
            type="button"
            aria-haspopup="dialog"
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen(true)}
            className="group inline-flex h-11 shrink-0 cursor-pointer items-center gap-2 rounded-md bg-gradient-to-b from-[#F3ECFB] to-[#DCCDF0] px-4 shadow-[0_6px_10px_rgba(67,23,105,0.14),inset_0_2px_2px_rgba(255,255,255,0.7),inset_0_-3px_5px_rgba(67,23,105,0.16)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3A1F62]"
          >
            <i aria-hidden="true" className="fa-solid fa-sliders text-[14px] text-[#431769]" />
            <span className="font-outfit text-[15px] font-medium text-[#111111] transition-colors group-hover:text-[#7A2FC0]">
              {t('shop.filters', 'Filters')}
            </span>
            {activeCount > 0 && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#431769] px-1 font-outfit text-[11px] font-bold leading-none text-white">
                {activeCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className={CONTAINER}>
        <div className="mt-2">
          {/* A new filter set starts a fresh list. */}
          <ShopProductGrid
            key={shopUrl(filters)}
            filters={filters}
            initialProducts={products}
            total={total}
            pending={pending}
            onClearFilters={applyFilters}
          />
        </div>
      </div>

      <ShopFilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        filters={filters}
        categories={categories}
        total={total}
        pending={pending}
        onChange={applyFilters}
      />
    </div>
  );
}
