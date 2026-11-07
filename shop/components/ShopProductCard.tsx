'use client';

import React from 'react';
import type { Product, ProductSummary } from '@/lib/placeholder-data';
import { useCart } from '@/context/CartContext';
import { useLocale } from '@/context/CurrencyContext';
import { translateProductTitle } from '@/lib/translations';
import { ProductLink } from './ProductDrawerProvider';

const FALLBACK_IMAGE = '/images/miracle.jpeg';
const LOW_STOCK = 10;

/**
 * A minimal marketplace product card: no frame, a rounded photo, then the name, rating and price.
 * The whole card opens the product; the heart on the photo saves it.
 */
export default function ShopProductCard({ product }: { product: ProductSummary }) {
  const { isFavorite, addFavorite, removeFavorite } = useCart();
  const { formatPrice, language, t } = useLocale();
  const favorited = isFavorite(product.id);
  const title = translateProductTitle(product.name, language, product.id);
  // A paused product is shown but can't be bought, like one that's out of stock.
  const paused = product.isPaused === true;
  const outOfStock = paused || product.stock === 0;
  const lowStock = !paused && product.stock !== undefined && product.stock > 0 && product.stock < LOW_STOCK;
  const originalPrice = product.originalPrice && product.originalPrice > product.price ? product.originalPrice : null;
  const rating = product.rating ?? 0;

  return (
    <article className="group/card relative flex h-full flex-col">
      <ProductLink
        product={product}
        className="group flex flex-1 flex-col rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#222222]"
      >
        <div className="relative aspect-square overflow-hidden rounded-xl bg-[#F0EFEB] transition-shadow group-hover:shadow-[0_6px_18px_rgba(34,34,34,0.18)]">
          <img
            src={product.images[0] || FALLBACK_IMAGE}
            alt=""
            loading="lazy"
            className={`h-full w-full object-cover ${outOfStock ? 'opacity-60' : ''}`}
            onError={(e) => {
              const image = e.currentTarget;
              if (!image.src.endsWith(FALLBACK_IMAGE)) image.src = FALLBACK_IMAGE;
            }}
          />
          {outOfStock && (
            <span className="absolute bottom-2 left-2 rounded-full bg-white px-2.5 py-1 text-[12px] font-semibold text-[#222222] shadow-sm">
              {paused ? t('shop.currently_unavailable', 'Currently unavailable') : t('shop.out_of_stock', 'Out of stock')}
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col pt-2">
          <h3>
            <span className="line-clamp-2 text-[13px] leading-snug text-[#222222] group-hover:underline sm:text-[14px]">{title}</span>
          </h3>

          {/* The rating an admin entered. Customer reviews don't affect it. */}
          {rating > 0 && (
            <p
              aria-label={t('shop.rating_label', 'Rated {rating} out of 5').replace('{rating}', rating.toFixed(1))}
              className="mt-1 flex items-center gap-1 text-[12px] text-[#222222] tabular-nums sm:text-[13px]"
            >
              <span className="font-semibold">{rating.toFixed(1)}</span>
              <i aria-hidden="true" className="fa-solid fa-star text-[11px] text-[#222222]" />
            </p>
          )}

          <p className="mt-1 flex flex-wrap items-baseline gap-x-1.5 tabular-nums">
            <span className="text-[15px] font-bold text-[#222222] sm:text-[16px]">{formatPrice(product.price)}</span>
            {originalPrice && <span className="text-[12px] text-[#595959] line-through sm:text-[13px]">{formatPrice(originalPrice)}</span>}
          </p>

          {lowStock && (
            <p className="mt-0.5 text-[12px] font-medium text-[#B14F00] sm:text-[13px]">
              {t('shop.only_left', 'Only {count} left').replace('{count}', String(product.stock))}
            </p>
          )}
        </div>
      </ProductLink>

      <button
        type="button"
        aria-pressed={favorited}
        aria-label={`${favorited ? t('shop.remove_favorite', 'Remove from favorites') : t('shop.save_favorite', 'Save to favorites')}: ${title}`}
        onClick={() => (favorited ? removeFavorite(product.id) : addFavorite(product as Product))}
        className="absolute right-2 top-2 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white shadow-[0_1px_4px_rgba(34,34,34,0.25)] transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#222222]"
      >
        <i aria-hidden="true" className={`${favorited ? 'fa-solid text-[#B91C1C]' : 'fa-regular text-[#222222]'} fa-heart text-[15px]`} />
      </button>
    </article>
  );
}
