'use client';

import React from 'react';
import type { Product, ProductSummary } from '@/lib/placeholder-data';
import { useCart } from '@/context/CartContext';
import { useLocale } from '@/context/CurrencyContext';
import { translateCategory, translateProductTitle } from '@/lib/translations';
import { ProductLink } from './ProductDrawerProvider';

const FALLBACK_IMAGE = '/images/miracle.jpeg';
const LOW_STOCK = 10;
// Small sharp labels on the photo: Out of stock and the rating.
const photoLabel =
  'absolute inline-flex items-center gap-1 rounded-[2px] bg-ink-fill px-1.5 py-1 font-geist text-[10px] font-semibold leading-none text-white tabular-nums sm:px-2 sm:text-[11px]';

/**
 * A sharp product card with a light outline on the stone page: the photo leads, then the name, its category and the price.
 * The whole card opens the product; the heart saves it.
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
    <article className="group/card relative flex h-full flex-col overflow-hidden border border-ink/25 bg-transparent transition-shadow duration-500 hover:shadow-[0_14px_36px_rgba(231,169,59,0.35)] motion-reduce:transition-none">
      <ProductLink
        product={product}
        className="group flex flex-1 flex-col focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ink"
      >
        <div className="relative aspect-square overflow-hidden bg-[#E2DDD1] sm:aspect-[5/4]">
          <img
            src={product.images[0] || FALLBACK_IMAGE}
            alt=""
            loading="lazy"
            className={`h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04] motion-reduce:transition-none ${outOfStock ? 'opacity-60' : ''}`}
            onError={(e) => {
              const image = e.currentTarget;
              if (!image.src.endsWith(FALLBACK_IMAGE)) image.src = FALLBACK_IMAGE;
            }}
          />

          {outOfStock && (
            <span className={`${photoLabel} left-2 top-2 sm:left-3 sm:top-3`}>
              {paused ? t('shop.currently_unavailable', 'Currently unavailable') : t('shop.out_of_stock', 'Out of stock')}
            </span>
          )}

          {/* The rating an admin entered. Customer reviews don't affect it. */}
          {rating > 0 && (
            <span
              aria-label={t('shop.rating_label', 'Rated {rating} out of 5').replace('{rating}', rating.toFixed(1))}
              className={`${photoLabel} bottom-2 left-2 sm:bottom-3 sm:left-3`}
            >
              <i aria-hidden="true" className="fa-solid fa-star text-[8px] sm:text-[9px]" />
              {rating.toFixed(1)}
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col px-3 pb-3 pt-2.5 sm:px-4 sm:pb-4 sm:pt-3.5">
          <h3>
            <span className="line-clamp-2 font-geist text-[12.5px] font-semibold leading-snug text-ink transition-colors group-hover:text-logo-purple sm:text-[15px]">
              {title}
            </span>
          </h3>
          <p className="mt-1 truncate font-geist text-[11.5px] text-ink-muted sm:text-[13px]">
            {translateCategory(product.category, language)}
          </p>

          {lowStock && (
            <p className="mt-1 truncate font-geist text-[11.5px] font-medium text-ink sm:text-[13px]">
              {t('shop.only_left', 'Only {count} left').replace('{count}', String(product.stock))}
            </p>
          )}

          <div className="mt-auto pt-2.5 sm:pt-3">
            <p className="flex flex-wrap items-baseline justify-end gap-x-1.5 border-t border-ink/15 pl-8 pt-2.5 tabular-nums sm:justify-start sm:pl-0 sm:pr-10 sm:pt-3">
              {originalPrice && (
                <span className="font-geist text-[10px] text-ink-muted line-through sm:text-[13px]">{formatPrice(originalPrice)}</span>
              )}
              <span className="font-geist text-[12px] font-bold text-ink sm:text-[17px]">{formatPrice(product.price)}</span>
            </p>
          </div>
        </div>
      </ProductLink>

      <button
        type="button"
        aria-pressed={favorited}
        aria-label={`${favorited ? t('shop.remove_favorite', 'Remove from favorites') : t('shop.save_favorite', 'Save to favorites')}: ${title}`}
        onClick={() => (favorited ? removeFavorite(product.id) : addFavorite(product as Product))}
        className="group/heart absolute bottom-[5px] left-1.5 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink sm:bottom-[11px] sm:left-auto sm:right-2.5 sm:h-9 sm:w-9"
      >
        <i
          aria-hidden="true"
          className={`${favorited ? 'fa-solid text-logo-purple' : 'fa-regular text-ink'} fa-heart text-[14px] transition-colors group-hover/heart:text-logo-purple sm:text-[17px]`}
        />
      </button>
    </article>
  );
}
