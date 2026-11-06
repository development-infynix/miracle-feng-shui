'use client';

import React from 'react';
import type { Product, ProductSummary } from '@/lib/placeholder-data';
import { useCart } from '@/context/CartContext';
import { useLocale } from '@/context/CurrencyContext';
import { translateCategory, translateProductTitle } from '@/lib/translations';
import { ProductLink } from './ProductDrawerProvider';

const FALLBACK_IMAGE = '/images/miracle.jpeg';
const LOW_STOCK = 10;
const imagePill = 'rounded-md px-2 py-1 font-outfit text-[11px] font-semibold leading-none';

/** A self-contained glass product card: photo on top, details and price below. */
export default function ShopProductCard({ product }: { product: ProductSummary }) {
  const { isFavorite, addFavorite, removeFavorite } = useCart();
  const { formatPrice, language, t } = useLocale();
  const favorited = isFavorite(product.id);
  const title = translateProductTitle(product.name, language, product.id);
  const outOfStock = product.stock === 0;
  const lowStock = product.stock !== undefined && product.stock > 0 && product.stock < LOW_STOCK;
  const originalPrice = product.originalPrice && product.originalPrice > product.price ? product.originalPrice : null;

  return (
    <article className="relative flex h-full flex-col overflow-hidden rounded-lg bg-white shadow-[0_6px_10px_rgba(67,23,105,0.14)]">
      <ProductLink product={product}
        className="group flex flex-1 flex-col rounded-lg focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#3A1F62]"
      >
        <div className="relative aspect-square overflow-hidden bg-[#F3ECFB] sm:mx-2.5 sm:mt-2.5 sm:aspect-[4/3] sm:rounded-md">
          <img
            src={product.images[0] || FALLBACK_IMAGE}
            alt=""
            loading="lazy"
            className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none ${outOfStock ? 'opacity-60' : ''}`}
            onError={(e) => {
              const image = e.currentTarget;
              if (!image.src.endsWith(FALLBACK_IMAGE)) image.src = FALLBACK_IMAGE;
            }}
          />

          {outOfStock && (
            <span className={`${imagePill} absolute left-2 top-2 bg-[#111111] text-white sm:left-2.5 sm:top-2.5`}>
              {t('shop.out_of_stock', 'Out of stock')}
            </span>
          )}

          {/* The rating an admin entered. Customer reviews don't affect it. */}
          {(product.rating ?? 0) > 0 && (
            <span
              aria-label={t('shop.rating_label', 'Rated {rating} out of 5').replace('{rating}', product.rating.toFixed(1))}
              className="absolute bottom-2 left-2 inline-flex items-center gap-0.5 rounded-[2px] bg-[#7A2FC0] px-1.5 py-0.5 font-outfit text-[10px] font-semibold leading-none text-white tabular-nums sm:bottom-2.5 sm:left-2.5 sm:gap-1 sm:px-2 sm:py-1 sm:text-[11px]"
            >
              <i aria-hidden="true" className="fa-solid fa-star text-[8px] sm:text-[9px]" />
              {product.rating.toFixed(1)}
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-3 sm:p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="min-w-0 truncate font-outfit text-[12px] text-[#5B4A70]">
              {translateCategory(product.category, language)}
            </span>
          </div>

          <h3 className="mt-1.5">
            <span className="line-clamp-2 font-outfit text-[12.5px] font-semibold leading-snug text-[#111111] transition-colors group-hover:text-[#7A2FC0] sm:text-[16px]">
              {title}
            </span>
          </h3>

          {lowStock && (
            <p className="mt-1 truncate font-outfit text-[12px] text-[#5B4A70]">
              {t('shop.only_left', 'Only {count} left').replace('{count}', String(product.stock))}
            </p>
          )}

          <div className="mt-auto pt-2 sm:pt-3">
            <div className="flex items-center justify-between gap-2 border-t border-[#431769]/15 pt-2 sm:pt-3">
              <p className="ml-auto flex min-w-0 flex-wrap items-baseline justify-end gap-x-1.5 tabular-nums sm:ml-0 sm:justify-start">
                {originalPrice && (
                  <span className="font-outfit text-[11px] text-[#5B4A70] line-through sm:text-[13px]">
                    {formatPrice(originalPrice)}
                  </span>
                )}
                <span className="font-outfit text-[13px] font-bold text-[#111111] sm:text-[18px]">
                  {formatPrice(product.price)}
                </span>
              </p>
              <span aria-hidden="true" className="hidden shrink-0 text-[#431769] sm:flex transition-[color,transform] duration-200 group-hover:translate-x-0.5 group-hover:text-[#7A2FC0] motion-reduce:transition-none">
                <i className="fa-solid fa-angles-right text-[15px] sm:text-[18px]" />
              </span>
            </div>
          </div>
        </div>
      </ProductLink>

      <button
        type="button"
        aria-pressed={favorited}
        aria-label={`${favorited ? t('shop.remove_favorite', 'Remove from favorites') : t('shop.save_favorite', 'Save to favorites')}: ${title}`}
        onClick={() => (favorited ? removeFavorite(product.id) : addFavorite(product as Product))}
        className="group/heart absolute right-2 top-2 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-white/70 bg-[#F3ECFB]/85 backdrop-blur-sm focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#3A1F62] sm:right-4.5 sm:top-4.5 sm:h-9 sm:w-9"
      >
        <i
          aria-hidden="true"
          className={`${favorited ? 'fa-solid text-[#7A2FC0]' : 'fa-regular text-[#111111]'} fa-heart text-[12px] transition-colors sm:text-[14px] group-hover/heart:text-[#7A2FC0]`}
        />
      </button>
    </article>
  );
}
