'use client';

import React, { useEffect, useState } from 'react';
import { useLocale } from '@/context/CurrencyContext';
import type { ProductSummary } from '@/lib/placeholder-data';
import ShopProductCard from '@/shop/components/ShopProductCard';

const FETCH_COUNT = 12;
const SHOW_COUNT = 4;

/** The newest products that aren't already in the cart. If they can't load, the section just doesn't show. */
export default function CartSuggestions({ excludeIds }: { excludeIds: string[] }) {
  const { t } = useLocale();
  const [products, setProducts] = useState<ProductSummary[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/products?sort=newest&pageSize=${FETCH_COUNT}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setProducts(json.data.items);
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  const suggestions = products.filter((product) => !excludeIds.includes(product.id)).slice(0, SHOW_COUNT);
  if (suggestions.length === 0) return null;

  return (
    <section aria-labelledby="cart-suggestions-heading" className="mt-14 sm:mt-16">
      <h2 id="cart-suggestions-heading">
        <span className="block font-serif text-[24px] font-bold tracking-tight text-[#111111]">
          {t('search.new_arrivals', 'New arrivals')}
        </span>
      </h2>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
        {suggestions.map((product) => (
          <ShopProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
