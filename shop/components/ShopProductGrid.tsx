'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { ProductSummary } from '@/lib/placeholder-data';
import { useLocale } from '@/context/CurrencyContext';
import ShopProductCard from './ShopProductCard';
import { hasNarrowingFilters, NO_FILTERS, toProductQuery, type ShopFilters } from './shopFilters';

const buttonClass =
  'group inline-flex h-11 cursor-pointer items-center justify-center rounded-lg bg-[#222222] px-6 transition-colors hover:bg-black disabled:cursor-wait disabled:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#222222]';

interface ShopProductGridProps {
  filters: ShopFilters;
  initialProducts: ProductSummary[];
  total: number;
  /** A filter change is loading on the server. */
  pending: boolean;
  onClearFilters: (next: ShopFilters) => void;
}

/** The product grid, with further pages loaded from the server on demand. */
export default function ShopProductGrid({ filters, initialProducts, total, pending, onClearFilters }: ShopProductGridProps) {
  const { t } = useLocale();
  const [products, setProducts] = useState(initialProducts);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const request = useRef<AbortController | null>(null);

  useEffect(() => () => request.current?.abort(), []);

  const loadMore = async () => {
    if (request.current) return;
    const controller = new AbortController();
    request.current = controller;
    setLoading(true);
    setFailed(false);

    try {
      const query = new URLSearchParams(toProductQuery(filters, page + 1));
      const res = await fetch(`/api/products?${query}`, { signal: controller.signal });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(`Request failed: ${res.status}`);
      setProducts((current) => {
        // A product added while browsing shifts the pages, so one can arrive twice.
        const seen = new Set(current.map((product) => product.id));
        return [...current, ...(json.data.items as ProductSummary[]).filter((product) => !seen.has(product.id))];
      });
      setPage((current) => current + 1);
    } catch (error) {
      if (controller.signal.aborted) return;
      console.error('Failed to load more products:', error);
      setFailed(true);
    }

    request.current = null;
    setLoading(false);
  };

  if (products.length === 0) {
    const hasFilters = hasNarrowingFilters(filters);
    return (
      <div className={`mx-auto max-w-[46ch] py-16 text-center transition-opacity ${pending ? 'opacity-60' : ''}`}>
        <h2>
          <span className="block font-serif text-[24px] font-bold text-[#222222]">
            {hasFilters ? t('shop.no_matches_title', "We couldn't find any matches") : t('shop.no_products_title', 'No products yet')}
          </span>
        </h2>
        {hasFilters && (
          <>
            <p className="mt-2 text-[15px] text-[#595959]">
              {t('shop.no_matches_hint', 'Try removing a filter or checking the spelling.')}
            </p>
            <button type="button" onClick={() => onClearFilters(NO_FILTERS)} className={`${buttonClass} mt-5`}>
              <span className="text-[14px] font-semibold text-white">
                {t('shop.clear_filters', 'Clear all filters')}
              </span>
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <>
      <div
        aria-busy={pending}
        className={`grid grid-cols-2 gap-3 transition-opacity sm:gap-5 md:grid-cols-3 lg:grid-cols-4 ${pending ? 'opacity-60' : ''}`}
      >
        {products.map((product) => (
          <ShopProductCard key={product.id} product={product} />
        ))}
      </div>

      {products.length < total && (
        <div className="mt-10 flex flex-col items-center gap-3">
          <p className="text-[13px] tabular-nums text-[#595959]">
            {t('shop.showing', 'Showing {shown} of {total}')
              .replace('{shown}', String(products.length))
              .replace('{total}', String(total))}
          </p>
          {failed && (
            <p role="alert" className="text-[14px] text-[#8F1610]">
              {t('shop.load_more_failed', "Couldn't load more products. Please try again.")}
            </p>
          )}
          <button type="button" onClick={loadMore} disabled={loading} className={buttonClass}>
            <span className="text-[14px] font-semibold text-white">
              {loading ? t('shop.loading_more', 'Loading…') : t('shop.load_more', 'Load more')}
            </span>
          </button>
        </div>
      )}
    </>
  );
}
