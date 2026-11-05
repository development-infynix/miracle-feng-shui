'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useCart, type CartItem } from '@/context/CartContext';
import { useLocale } from '@/context/CurrencyContext';
import { translateProductTitle } from '@/lib/translations';
import { useSiteHeaderHeight } from '@/lib/useSiteHeaderHeight';
import CartItemRow from './CartItemRow';
import { CartCheckoutBar, CartSummary } from './CartSummary';
import CartSuggestions from './CartSuggestions';
import { isCartItemBlocked } from './cartStock';

const NOTICE_MS = 6000;
const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#3A1F62]';
const primaryLink = `inline-flex h-12 cursor-pointer items-center justify-center rounded-md bg-[#431769] px-6 transition-colors hover:bg-[#3A1F62] ${focusRing}`;

type Notice = { title: string; item: CartItem };

function CartSkeleton() {
  return (
    <div aria-busy="true" className="space-y-5">
      {[0, 1].map((row) => (
        <div key={row} className="flex gap-4">
          <div className="h-20 w-20 shrink-0 animate-pulse rounded-md bg-[#431769]/10 motion-reduce:animate-none sm:h-28 sm:w-28" />
          <div className="flex-1 space-y-2.5 pt-1">
            <div className="h-4 w-3/4 animate-pulse rounded-sm bg-[#431769]/10 motion-reduce:animate-none" />
            <div className="h-4 w-1/3 animate-pulse rounded-sm bg-[#431769]/10 motion-reduce:animate-none" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CartView() {
  const { status } = useSession();
  const { items, count, subtotal, cartLoading, userLoggedIn, setQty, removeItem, addItem } = useCart();
  const { language, t } = useLocale();
  const headerHeight = useSiteHeaderHeight();
  const [notice, setNotice] = useState<Notice | null>(null);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
  }, []);

  const showNotice = (next: Notice | null) => {
    setNotice(next);
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    if (next) noticeTimer.current = setTimeout(() => setNotice(null), NOTICE_MS);
  };

  const handleRemove = (item: CartItem) => {
    removeItem(item.id);
    showNotice({ title: translateProductTitle(item.product.name, language, item.product.id), item });
  };

  const undoRemove = () => {
    if (!notice) return;
    const { item } = notice;
    addItem(item.product, item.quantity, item.selectedVariations, item.personalizationText);
    showNotice(null);
  };

  const guest = status === 'unauthenticated' && !userLoggedIn;
  const blocked = items.some(isCartItemBlocked);
  const hasItems = items.length > 0;

  // The fixed checkout bar would otherwise cover the bottom of the footer on phones.
  useEffect(() => {
    if (!hasItems) return;
    document.body.setAttribute('data-cart-bar', '');
    return () => document.body.removeAttribute('data-cart-bar');
  }, [hasItems]);
  const itemsLabel =
    count === 1 ? t('cart.one_item', '1 item') : t('cart.item_count', '{count} items').replace('{count}', String(count));

  return (
    <div className="mx-auto w-full max-w-[1120px] px-4 pb-8 pt-6 sm:px-6 sm:pt-8">
      <h1 className="flex flex-wrap items-baseline gap-x-2">
        <span className="font-serif text-[26px] font-bold leading-tight tracking-tight text-[#111111] sm:text-[30px]">
          {t('cart.your_cart', 'Your cart')}
        </span>
        {hasItems && (
          <span className="font-outfit text-[14px] font-normal tabular-nums text-[#5B4A70]">
            ({count})<span className="sr-only"> {itemsLabel}</span>
          </span>
        )}
      </h1>

      {hasItems ? (
        <div className="mt-6 grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-12">
          <div>
            <ul className="list-none space-y-3 sm:space-y-4">
              {items.map((item) => (
                <CartItemRow
                  key={item.id}
                  item={item}
                  onQuantityChange={(quantity) => setQty(item.id, quantity)}
                  onRemove={() => handleRemove(item)}
                />
              ))}
            </ul>
          </div>

          {/* Desktop only. Phones get the fixed checkout bar instead. */}
          <div className="hidden lg:sticky lg:block" style={{ top: headerHeight + 16 }}>
            <CartSummary count={count} subtotal={subtotal} blocked={blocked} />
          </div>
          <CartCheckoutBar count={count} subtotal={subtotal} blocked={blocked} />
        </div>
      ) : cartLoading ? (
        <div className="mt-6">
          <CartSkeleton />
        </div>
      ) : (
        <div className="mx-auto max-w-[44ch] py-14 text-center">
          <h2>
            <span className="block font-serif text-[24px] font-bold tracking-tight text-[#111111]">
              {guest
                ? t('cart.guest_title', 'Log in to see your cart')
                : t('cart.empty_heading', 'Your cart is empty')}
            </span>
          </h2>
          <p className="mt-2 font-outfit text-[15px] leading-relaxed text-[#5B4A70]">
            {guest
              ? t('cart.guest_hint', 'Your cart is saved to your account, so it stays with you on any device.')
              : t('cart.empty_hint', 'When you add a product, it will appear here.')}
          </p>
          <div className="mt-5">
            {guest ? (
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('open-auth-modal', { detail: { mode: 'signin' } }))}
                className={primaryLink}
              >
                <span className="font-outfit text-[15px] font-semibold text-white">{t('cart.login', 'Log in')}</span>
              </button>
            ) : (
              <Link href="/shop" className={primaryLink}>
                <span className="font-outfit text-[15px] font-semibold text-white">{t('product.browse', 'Browse products')}</span>
              </Link>
            )}
          </div>
        </div>
      )}

      <CartSuggestions excludeIds={items.map((item) => item.product.id)} />

      {/* Stays mounted so screen readers announce what changes inside it. */}
      <div role="status" className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center px-3 lg:bottom-6">
        {notice && (
          <div className="pointer-events-auto flex max-w-[560px] items-center gap-3 rounded-full bg-gradient-to-b from-[#F3ECFB] to-[#DCCDF0] py-2.5 pl-5 pr-4 shadow-[0_6px_10px_rgba(67,23,105,0.14),inset_0_2px_0_rgba(255,255,255,0.7),inset_0_-3px_5px_rgba(67,23,105,0.16)]">
            <p className="min-w-0 truncate font-outfit text-[14px] text-[#111111]">
              {t('cart.removed_notice', 'Removed: {title}').replace('{title}', notice.title)}
            </p>
            <button type="button" onClick={undoRemove} className={`group shrink-0 cursor-pointer rounded-sm ${focusRing}`}>
              <span className="font-outfit text-[14px] font-semibold text-[#431769] underline underline-offset-2 transition-colors group-hover:text-[#7A2FC0]">
                {t('cart.undo', 'Undo')}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
