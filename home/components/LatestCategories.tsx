'use client';

import React from 'react';
import Link from 'next/link';
import { useLocale } from '@/context/CurrencyContext';
import { translateCategory } from '@/lib/translations';
import { focusRing, SectionHeading } from './homeUi';

export interface HomeCategory {
  id: string;
  name: string;
  image: string;
  productCount: number;
}

/** The 4 newest categories as round photos, with View all leading to the shop. */
export default function LatestCategories({ categories }: { categories: HomeCategory[] }) {
  const { language, t } = useLocale();
  if (categories.length === 0) return null;

  return (
    <section aria-labelledby="home-categories" className="etsy-container py-8 sm:py-12">
      <SectionHeading
        id="home-categories"
        title={t('home.categories_title', 'Shop by category')}
        viewAll={{ href: '/shop', label: t('home.view_all', 'View all') }}
      />
      <ul className="mt-6 grid list-none grid-cols-2 gap-x-4 gap-y-6 sm:mt-8 sm:gap-x-6 md:grid-cols-4">
        {categories.map((category) => {
          const name = translateCategory(category.name, language);
          return (
            <li key={category.id}>
              <Link href={`/shop?category=${encodeURIComponent(category.name)}`} className={`group block rounded-2xl text-center ${focusRing}`}>
                <span className="mx-auto block aspect-square w-full max-w-[220px] overflow-hidden rounded-full bg-[#F0EFEB] shadow-[0_1px_4px_rgba(34,34,34,0.12)] transition-shadow group-hover:shadow-[0_6px_18px_rgba(34,34,34,0.18)]">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04] motion-reduce:transition-none"
                    />
                  ) : (
                    <span aria-hidden="true" className="flex h-full w-full items-center justify-center text-[48px] font-semibold text-[#222222]/25">
                      {name.charAt(0)}
                    </span>
                  )}
                </span>
                <span className="mt-3 block text-[15px] font-semibold text-[#222222] group-hover:underline sm:text-[16px]">{name}</span>
                {category.productCount > 0 && (
                  <span className="block text-[13px] text-[#595959] tabular-nums">
                    {(category.productCount === 1 ? t('home.product_count_one', '{count} item') : t('home.product_count', '{count} items')).replace(
                      '{count}',
                      String(category.productCount)
                    )}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
