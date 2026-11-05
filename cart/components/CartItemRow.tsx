'use client';

import React from 'react';
import type { CartItem } from '@/context/CartContext';
import { useLocale } from '@/context/CurrencyContext';
import { translateCategory, translateProductTitle } from '@/lib/translations';
import { ProductLink } from '@/shop/components/ProductDrawerProvider';
import { isCartItemBlocked } from './cartStock';

const FALLBACK_IMAGE = '/images/miracle.jpeg';
const LOW_STOCK = 10;
const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#3A1F62]';
const control = 'rounded-md border border-[#431769]/25 bg-white/45';
const iconButton = `group flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center ${control} ${focusRing}`;
const icon = 'text-[14px] text-[#111111] transition-colors group-hover:text-[#7A2FC0]';
const stepButton = `group flex h-10 w-9 cursor-pointer sm:w-10 items-center justify-center rounded-md disabled:cursor-not-allowed disabled:opacity-40 ${focusRing}`;
const stepIcon = 'text-[12px] text-[#111111] transition-colors group-hover:text-[#7A2FC0]';

interface CartItemRowProps {
  item: CartItem;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
}

/** A horizontal glass card: the photo inset on the left, details in the middle, a bento block of actions on the right. */
export default function CartItemRow({ item, onQuantityChange, onRemove }: CartItemRowProps) {
  const { formatPrice, language, t } = useLocale();
  const { product, quantity } = item;
  const title = translateProductTitle(product.name, language, product.id);
  const stock = product.stock;
  const outOfStock = stock === 0;
  const blocked = isCartItemBlocked(item);
  const lowStock = !blocked && stock !== undefined && stock < LOW_STOCK;
  const originalPrice = product.originalPrice && product.originalPrice > product.price ? product.originalPrice : null;

  const prices = (
    <>
      <p className="flex flex-col tabular-nums sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-x-2">
        {originalPrice && (
          <span className="font-outfit text-[15px] text-[#5B4A70] line-through">{formatPrice(originalPrice * quantity)}</span>
        )}
        <span className="font-outfit text-[20px] font-bold leading-tight text-[#111111]">{formatPrice(product.price * quantity)}</span>
      </p>
      {quantity > 1 && (
        <p className="mt-0.5 font-outfit text-[13px] tabular-nums text-[#5B4A70]">
          {t('cart.each', '{price} each').replace('{price}', formatPrice(product.price))}
        </p>
      )}
    </>
  );

  return (
    <li className="grid grid-cols-[88px_minmax(0,1fr)] gap-x-3 gap-y-3 rounded-lg bg-gradient-to-b from-[#F3ECFB] to-[#DCCDF0] p-2.5 shadow-[0_6px_10px_rgba(67,23,105,0.14),inset_0_-3px_5px_rgba(67,23,105,0.1)] sm:grid-cols-[160px_minmax(0,1fr)_auto] sm:gap-x-5 sm:p-3">
      {/* The name is the link for keyboards and screen readers, so the photo isn't announced twice. */}
      <ProductLink product={product} aria-hidden="true" tabIndex={-1} className="group block self-start overflow-hidden rounded-md bg-white/50">
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
          <p className="truncate font-outfit text-[12px] text-[#5B4A70] sm:text-[13px]">
            {translateCategory(product.category, language)}
          </p>
        )}
        <ProductLink product={product} className={`group mt-0.5 block w-fit rounded-sm ${focusRing}`}>
          <span className="line-clamp-2 font-outfit text-[15px] font-semibold leading-snug text-[#111111] transition-colors group-hover:text-[#7A2FC0] sm:text-[18px]">
            {title}
          </span>
        </ProductLink>
        {item.personalizationText && (
          <p className="mt-1 truncate font-outfit text-[13px] text-[#5B4A70]">
            {t('cart.personalization', 'Personalization')}: {item.personalizationText}
          </p>
        )}

        <div className="mt-1 sm:mt-auto sm:pt-3">
          <div className="hidden sm:block">{prices}</div>
          {outOfStock ? (
            <p className="mt-1 font-outfit text-[13px] font-medium text-[#8F1610]">
              {t('cart.out_of_stock_note', 'Out of stock. Remove it to continue to checkout.')}
            </p>
          ) : blocked ? (
            <p className="mt-1 font-outfit text-[13px] font-medium text-[#8F1610]">
              {t('cart.too_many_note', 'Only {count} left. Lower the quantity to continue to checkout.').replace('{count}', String(stock))}
            </p>
          ) : lowStock ? (
            <p className="mt-1 font-outfit text-[13px] text-[#5B4A70]">
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
          <span aria-live="polite" className="min-w-6 text-center font-outfit text-[15px] font-semibold tabular-nums text-[#111111]">
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
          <span className="font-outfit text-[14px] font-semibold text-[#431769] transition-colors group-hover:text-[#7A2FC0]">
            <span className="sm:hidden">{t('cart.view_short', 'View')}</span>
            <span className="hidden sm:inline">{t('cart.view_item', 'View item')}</span>
          </span>
          <i aria-hidden="true" className="fa-solid fa-angles-right text-[13px] text-[#431769] transition-[color,transform] duration-200 group-hover:translate-x-0.5 group-hover:text-[#7A2FC0] motion-reduce:transition-none" />
        </ProductLink>
        </div>
      </div>
    </li>
  );
}
