'use client';

import React from 'react';
import type { ProductSummary } from '@/lib/placeholder-data';
import { useLocale } from '@/context/CurrencyContext';
import ShopProductCard from '@/shop/components/ShopProductCard';
import { SectionHeading } from './homeUi';

// Phones show the newest 4 of the 8, as a 2 by 2 block.
const PHONE_COUNT = 4;

/** The 8 newest products, with View all leading to the shop (which sorts newest first). */
export default function NewArrivals({ products }: { products: ProductSummary[] }) {
  const { t } = useLocale();
  if (products.length === 0) return null;

  return (
    <section aria-labelledby="home-new-arrivals" className="etsy-container py-8 sm:py-12">
      <SectionHeading
        id="home-new-arrivals"
        title={t('search.new_arrivals', 'New arrivals')}
        viewAll={{ href: '/shop', label: t('home.view_all', 'View all') }}
      />
      <ul className="mt-6 grid list-none grid-cols-2 gap-3 sm:mt-8 sm:gap-5 md:grid-cols-4">
        {products.map((product, index) => (
          <li key={product.id} className={index >= PHONE_COUNT ? 'hidden md:block' : undefined}>
            <ShopProductCard product={product} />
          </li>
        ))}
      </ul>
    </section>
  );
}
