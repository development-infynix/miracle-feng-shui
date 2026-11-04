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
    <article className="relative flex h-full flex-col overflow-hidden rounded-lg bg-gradient-to-b from-[#F3ECFB] to-[#DCCDF0] shadow-[0_6px_10px_rgba(67,23,105,0.14),inset_0_-3px_5px_rgba(67,23,105,0.1)]">
      <ProductLink product={product}
        className="group flex flex-1 flex-col rounded-lg focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#3A1F62]"
      >
        <div className="relative mx-2 mt-2 aspect-[4/3] overflow-hidden rounded-md bg-white/50 sm:mx-2.5 sm:mt-2.5">
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

          <div className="absolute left-2 top-2 flex flex-col items-start gap-1 sm:left-2.5 sm:top-2.5">
            {outOfStock && <span className={`${imagePill} bg-[#111111] text-white`}>{t('shop.out_of_stock', 'Out of stock')}</span>}
            {product.bestseller && (
              <span className={`${imagePill} bg-[#F3ECFB] text-[#431769]`}>{t('badge.bestseller', 'Bestseller')}</span>
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col p-3 sm:p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="min-w-0 truncate font-outfit text-[12px] text-[#5B4A70]">
              {translateCategory(product.category, language)}
            </span>
            {/* The rating an admin entered. Customer reviews don't affect it. */}
            {(product.rating ?? 0) > 0 && (
              <span
                aria-label={t('shop.rating_label', 'Rated {rating} out of 5').replace('{rating}', product.rating.toFixed(1))}
                className="inline-flex h-6 shrink-0 items-center gap-1 rounded-md border border-white/70 bg-white/45 px-1.5 font-outfit text-[12px] font-semibold tabular-nums text-[#111111]"
              >
                <i aria-hidden="true" className="fa-solid fa-star text-[10px] text-[#431769]" />
                {product.rating.toFixed(1)}
              </span>
            )}
          </div>

          <h3 className="mt-1.5">
            <span className="line-clamp-2 font-outfit text-[14px] font-semibold leading-snug text-[#111111] transition-colors group-hover:text-[#7A2FC0] sm:text-[16px]">
              {title}
            </span>
          </h3>

          {lowStock && (
            <p className="mt-1 truncate font-outfit text-[12px] text-[#5B4A70]">
              {t('shop.only_left', 'Only {count} left').replace('{count}', String(product.stock))}
            </p>
          )}

          <div className="mt-auto pt-3">
            <div className="flex items-center justify-between gap-2 border-t border-[#431769]/15 pt-3">
              <p className="flex min-w-0 flex-wrap items-baseline gap-x-1.5 tabular-nums">
                {originalPrice && (
                  <span className="font-outfit text-[12px] text-[#5B4A70] line-through sm:text-[13px]">
                    {formatPrice(originalPrice)}
                  </span>
                )}
                <span className="font-outfit text-[15px] font-bold text-[#111111] sm:text-[18px]">
                  {formatPrice(product.price)}
                </span>
              </p>
              <span aria-hidden="true" className="flex shrink-0 text-[#431769] transition-[color,transform] duration-200 group-hover:translate-x-0.5 group-hover:text-[#7A2FC0] motion-reduce:transition-none">
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
        className="group/heart absolute right-3.5 top-3.5 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/70 bg-[#F3ECFB]/85 backdrop-blur-sm focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#3A1F62] sm:right-4.5 sm:top-4.5"
      >
        <i
          aria-hidden="true"
          className={`${favorited ? 'fa-solid text-[#7A2FC0]' : 'fa-regular text-[#111111]'} fa-heart text-[14px] transition-colors group-hover/heart:text-[#7A2FC0]`}
        />
      </button>
    </article>
  );
}
