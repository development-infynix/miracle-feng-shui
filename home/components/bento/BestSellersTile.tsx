'use client';

import React from 'react';
import type { ProductSummary } from '@/lib/placeholder-data';
import { useLocale } from '@/context/CurrencyContext';
import { translateProductTitle } from '@/lib/translations';
import { ProductLink } from '@/shop/components/ProductDrawerProvider';
import { focusRing, TextLink } from '../homeUi';
import { BentoTile } from './BentoTile';

/** The products an admin marked as bestsellers: 2 by 2 on phones, a row of 4 from tablets up. */
export default function BestSellersTile({ products, className }: { products: ProductSummary[]; className?: string }) {
  const { formatPrice, language, t } = useLocale();

  return (
    <BentoTile title={t('home.tile_bestsellers', 'Best sellers')} titleId="home-tile-bestsellers" className={className}>
      {products.length > 0 ? (
        <ul className="grid list-none grid-cols-2 gap-x-3 gap-y-4 sm:grid-cols-4 sm:gap-x-4">
          {products.map((product) => {
            const name = translateProductTitle(product.name, language, product.id);
            return (
              <li key={product.id} className="min-w-0">
                <ProductLink product={product} className={`group block ${focusRing}`}>
                  <span className="block aspect-square overflow-hidden bg-[#E2DDD1] lg:aspect-[4/3]">
                    <img
                      src={product.images[0] || '/images/miracle.jpeg'}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none"
                    />
                  </span>
                  <span className="mt-2 block truncate font-geist text-[14px] font-medium text-ink sm:text-[15px]">{name}</span>
                  <span className="block font-geist text-[14px] font-semibold text-ink tabular-nums">{formatPrice(product.price)}</span>
                </ProductLink>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="font-geist text-[15px] leading-relaxed text-ink-muted">
          {t('home.bestsellers_empty', 'Our most-loved pieces will show here soon.')}
        </p>
      )}

      <div className="mt-auto pt-5">
        <TextLink href="/shop?sort=relevancy">{t('home.view_all', 'View all')}</TextLink>
      </div>
    </BentoTile>
  );
}
