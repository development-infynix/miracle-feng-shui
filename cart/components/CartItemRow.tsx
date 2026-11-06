'use client';

import React from 'react';
import type { CartItem } from '@/context/CartContext';
import { useLocale } from '@/context/CurrencyContext';
import { translateCategory, translateProductTitle } from '@/lib/translations';
import { ProductLink } from '@/shop/components/ProductDrawerProvider';
import { isCartItemBlocked, isCartItemUnavailable } from './cartStock';

const FALLBACK_IMAGE = '/images/miracle.jpeg';
const LOW_STOCK = 10;
const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#222222]';
const control = 'rounded-lg border border-[#222222]/25 bg-white';
const iconButton = `group flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center ${control} ${focusRing}`;
const icon = 'text-[14px] text-[#222222] transition-colors group-hover:underline';
const stepButton = `group flex h-10 w-9 cursor-pointer sm:w-10 items-center justify-center rounded-lg disabled:cursor-not-allowed disabled:opacity-40 ${focusRing}`;
const stepIcon = 'text-[12px] text-[#222222] transition-colors group-hover:underline';

interface CartItemRowProps {
  item: CartItem;
  /** Delete is in flight: dim the card, block its controls, and show a spinner. */
  removing?: boolean;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
}

/** A horizontal glass card: the photo inset on the left, details in the middle, a bento block of actions on the right. */
export default function CartItemRow({ item, removing = false, onQuantityChange, onRemove }: CartItemRowProps) {
  const { formatPrice, language, t } = useLocale();
  const { product, quantity } = item;
  const title = translateProductTitle(product.name, language, product.id);
  const stock = product.stock;
  const unavailable = isCartItemUnavailable(item);
  const outOfStock = stock === 0;
  const blocked = isCartItemBlocked(item);
  const lowStock = !blocked && stock !== undefined && stock < LOW_STOCK;
  const originalPrice = product.originalPrice && product.originalPrice > product.price ? product.originalPrice : null;

  const prices = (
    <>
      <p className="flex flex-col tabular-nums sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-x-2">
        {originalPrice && (
          <span className="text-[15px] text-[#595959] line-through">{formatPrice(originalPrice * quantity)}</span>
        )}
        <span className="text-[20px] font-bold leading-tight text-[#222222]">{formatPrice(product.price * quantity)}</span>
      </p>
      {quantity > 1 && (
        <p className="mt-0.5 text-[13px] tabular-nums text-[#595959]">
          {t('cart.each', '{price} each').replace('{price}', formatPrice(product.price))}
        </p>
      )}
    </>
  );

  return (
    <li className={`relative grid grid-cols-[88px_minmax(0,1fr)] gap-x-3 gap-y-3 rounded-lg bg-white p-2.5 sm:grid-cols-[160px_minmax(0,1fr)_auto] sm:gap-x-5 sm:p-3 ${removing ? 'pointer-events-none select-none' : ''}`}>
      {/* Delete-in-flight overlay: covers the card so its controls can't be used twice. */}
      {removing && (
        <div
          aria-busy="true"
          className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white/70 backdrop-blur-[1px]"
        >
          <i aria-hidden="true" className="fa-solid fa-spinner animate-spin text-[22px] text-[#222222]" />
          <span className="sr-only">{t('cart.removing', 'Removing…')}</span>
        </div>
      )}
      {/* The name is the link for keyboards and screen readers, so the photo isn't announced twice. */}
      <ProductLink product={product} aria-hidden="true" tabIndex={-1} className="group block self-start overflow-hidden rounded-lg bg-[#F5F5F1]">
        <img
          src={product.images[0] || FALLBACK_IMAGE}
          alt=""
          className={`aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none ${outOfStock ? 'opacity-60' : ''}`}
          onError={(e) => {
            const image = e.currentTarget;
            if (!image.src.endsWith(FALLBACK_IMAGE)) image.src = FALLBACK_IMAGE;
          }}
        />
      </ProductLink>

      <div className="flex min-w-0 flex-col sm:py-1.5">
        {product.category && (
          <p className="truncate text-[12px] text-[#595959] sm:text-[13px]">
            {translateCategory(product.category, language)}
          </p>
        )}
        <ProductLink product={product} className={`group mt-0.5 block w-fit rounded-sm ${focusRing}`}>
          <span className="line-clamp-2 text-[15px] font-semibold leading-snug text-[#222222] transition-colors group-hover:underline sm:text-[18px]">
            {title}
          </span>
        </ProductLink>
        {item.personalizationText && (
          <p className="mt-1 truncate text-[13px] text-[#595959]">
            {t('cart.personalization', 'Personalization')}: {item.personalizationText}
          </p>
        )}

        <div className="mt-1 sm:mt-auto sm:pt-3">
          <div className="hidden sm:block">{prices}</div>
          {unavailable ? (
            <p className="mt-1 text-[13px] font-medium text-[#8F1610]">
              {t('cart.unavailable_note', 'No longer available. Remove it to continue to checkout.')}
            </p>
          ) : outOfStock ? (
            <p className="mt-1 text-[13px] font-medium text-[#8F1610]">
              {t('cart.out_of_stock_note', 'Out of stock. Remove it to continue to checkout.')}
            </p>
          ) : blocked ? (
            <p className="mt-1 text-[13px] font-medium text-[#8F1610]">
              {t('cart.too_many_note', 'Only {count} left. Lower the quantity to continue to checkout.').replace('{count}', String(stock))}
            </p>
          ) : lowStock ? (
            <p className="mt-1 text-[13px] text-[#595959]">
              {t('shop.only_left', 'Only {count} left').replace('{count}', String(stock))}
            </p>
          ) : null}
        </div>
      </div>

      {/* On phones the prices fill the space left of the actions. On larger screens they sit with the name. */}
      <div className="col-span-2 flex items-end justify-between gap-3 self-end sm:col-span-1 sm:block sm:py-1.5">
        <div className="min-w-0 sm:hidden">{prices}</div>

        {/* Bento block: delete and quantity on top, View across the block's width below. */}
        <div className="grid w-[146px] shrink-0 grid-cols-[40px_minmax(0,1fr)] gap-2 sm:w-[172px]">
        <button type="button" onClick={onRemove} aria-label={`${t('cart.remove', 'Remove')}: ${title}`} title={t('cart.remove', 'Remove')} className={iconButton}>
          <i aria-hidden="true" className={`fa-regular fa-trash-can ${icon}`} />
        </button>

        <div role="group" aria-label={`${t('product.quantity', 'Quantity')}: ${title}`} className={`flex h-10 items-center justify-between ${control}`}>
          <button
            type="button"
            aria-label={t('product.decrease', 'Decrease quantity')}
            disabled={quantity <= 1}
            onClick={() => onQuantityChange(quantity - 1)}
            className={stepButton}
          >
            <i aria-hidden="true" className={`fa-solid fa-minus ${stepIcon}`} />
          </button>
          <span aria-live="polite" className="min-w-6 text-center text-[15px] font-semibold tabular-nums text-[#222222]">
            {quantity}
          </span>
          <button
            type="button"
            aria-label={t('product.increase', 'Increase quantity')}
            disabled={stock !== undefined && quantity >= stock}
            onClick={() => onQuantityChange(quantity + 1)}
            className={stepButton}
          >
            <i aria-hidden="true" className={`fa-solid fa-plus ${stepIcon}`} />
          </button>
        </div>

        <ProductLink product={product} className={`group col-span-2 flex h-10 items-center justify-center gap-2 ${control} ${focusRing}`}>
          <span className="text-[14px] font-semibold text-[#222222] transition-colors group-hover:underline">
            <span className="sm:hidden">{t('cart.view_short', 'View')}</span>
            <span className="hidden sm:inline">{t('cart.view_item', 'View item')}</span>
          </span>
          <i aria-hidden="true" className="fa-solid fa-angles-right text-[13px] text-[#222222] transition-[color,transform] duration-200 group-hover:translate-x-0.5 group-hover:underline motion-reduce:transition-none" />
        </ProductLink>
        </div>
      </div>
    </li>
  );
}
