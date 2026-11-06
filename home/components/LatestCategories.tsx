'use client';

import React from 'react';
import Link from 'next/link';
import { useLocale } from '@/context/CurrencyContext';
import { translateCategory } from '@/lib/translations';
import { CONTAINER, SectionHeading, focusRing } from './homeUi';

export interface HomeCategory {
  id: string;
  name: string;
  image: string;
  productCount: number;
}

/** The 4 newest categories as tall photo tiles. */
export default function LatestCategories({ categories }: { categories: HomeCategory[] }) {
  const { language, t } = useLocale();
  if (categories.length === 0) return null;

  return (
    <section id="home-categories" aria-labelledby="home-categories-title" className={`${CONTAINER} scroll-mt-28`}>
      <SectionHeading
        id="home-categories-title"
        title={t('home.categories_title', 'Shop by category')}
        action={{ href: '/shop', label: t('home.all_products', 'All products') }}
      />

      <ul className="mt-6 grid list-none grid-cols-2 gap-3 sm:mt-8 sm:gap-5 md:grid-cols-4">
        {categories.map((category) => {
          const name = translateCategory(category.name, language);
          const count = (
            category.productCount === 1
              ? t('home.product_count_one', '{count} product')
              : t('home.product_count', '{count} products')
          ).replace('{count}', String(category.productCount));
          return (
            <li key={category.id} className="h-full">
              {/* Same card as the product card: sharp corners, a light outline and the page showing through. */}
              <Link
                href={`/shop?category=${encodeURIComponent(category.name)}`}
                className={`group flex h-full flex-col overflow-hidden border border-ink/25 transition-shadow duration-500 hover:shadow-[0_14px_36px_rgba(231,169,59,0.35)] motion-reduce:transition-none ${focusRing}`}
              >
                <span className="relative block aspect-[4/5] overflow-hidden bg-[#E2DDD1]">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04] motion-reduce:transition-none"
                    />
                  ) : (
                    <span aria-hidden="true" className="flex h-full w-full items-center justify-center font-display text-[64px] text-ink/25">
                      {name.charAt(0)}
                    </span>
                  )}
                </span>
                <span className="flex flex-1 flex-col px-3 pb-3 pt-2.5 sm:px-4 sm:pb-4 sm:pt-3.5">
                  <span className="block font-display text-[17px] font-bold leading-snug text-ink transition-colors group-hover:text-logo-purple sm:text-[21px]">
                    {name}
                  </span>
                  {category.productCount > 0 && (
                    <span className="mt-0.5 block font-geist text-[12px] text-ink-muted tabular-nums sm:text-[14px]">{count}</span>
                  )}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
