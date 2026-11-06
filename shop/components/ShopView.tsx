'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { ProductSummary } from '@/lib/placeholder-data';
import { useLocale } from '@/context/CurrencyContext';
import { translateCategory } from '@/lib/translations';
import { useSiteHeaderHeight } from '@/lib/useSiteHeaderHeight';
import ShopAppliedFilters from './ShopAppliedFilters';
import ShopFilterDrawer from './ShopFilterDrawer';
import ShopProductGrid from './ShopProductGrid';
import { countActiveFilters, shopUrl, type ShopCategory, type ShopFilters } from './shopFilters';

// Same width as the site header, so the bar and the grid line up with it.
const CONTAINER = 'mx-auto w-full max-w-[1380px] px-4 sm:px-6';

interface ShopViewProps {
  filters: ShopFilters;
  categories: ShopCategory[];
  products: ProductSummary[];
  total: number;
}

/** The shop page's client side: holds the drawer and the pending state while filters load. */
export default function ShopView({ filters, categories, products, total }: ShopViewProps) {
  const router = useRouter();
  const { language, t } = useLocale();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const headerHeight = useSiteHeaderHeight();

  const applyFilters = (next: ShopFilters) => {
    startTransition(() => router.push(shopUrl(next), { scroll: false }));
  };

  let heading = t('nav.products', 'Products');
  if (filters.q) heading = t('shop.results_for', 'Results for "{query}"').replace('{query}', filters.q);
  else if (filters.category) heading = translateCategory(filters.category, language);

  const activeCount = countActiveFilters(filters);

  return (
    <div className="pb-20 ">
      {/* There's no visible page heading, so this names the page for screen readers and search engines. */}
      <h1 aria-live="polite" className="sr-only">
        {heading} ({total})
      </h1>

      {/* Sticks under the site header. Products start below it and only ever scroll beneath it. */}
      <div className="sticky z-30 bg-page-ground" style={{ top: headerHeight }}>
        {/* The site header is see-through, so this covers products passing behind its pills. */}
        <div aria-hidden="true" className="absolute inset-x-0 bottom-full bg-page-ground" style={{ height: headerHeight }} />

        {/* All filters first, then the applied filters, with the result count on the right. */}
        <div className={`${CONTAINER} flex items-center gap-3 py-3`}>
          <button
            type="button"
            aria-haspopup="dialog"
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen(true)}
            className="inline-flex h-11 shrink-0 cursor-pointer items-center gap-2 rounded-full border border-[#222222] bg-white px-4 transition-colors hover:bg-[#F5F5F1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#222222]"
          >
            <i aria-hidden="true" className="fa-solid fa-sliders text-[14px] text-[#222222]" />
            <span className="text-[15px] font-semibold text-[#222222]">{t('shop.all_filters', 'All filters')}</span>
            {activeCount > 0 && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#222222] px-1 text-[11px] font-bold leading-none text-white tabular-nums">
                {activeCount}
              </span>
            )}
          </button>
          <div className="min-w-0 flex-1">
            <ShopAppliedFilters filters={filters} onChange={applyFilters} />
          </div>
          <p className="hidden shrink-0 text-[14px] text-[#595959] tabular-nums sm:block">
            {(total === 1 ? t('shop.result_one', '{count} result') : t('shop.results', '{count} results')).replace('{count}', total.toLocaleString('en-IN'))}
          </p>
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
