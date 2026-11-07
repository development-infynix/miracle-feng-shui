'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useCart, type CartItem } from '@/context/CartContext';
import { useLocale } from '@/context/CurrencyContext';
import { translateProductTitle } from '@/lib/translations';
import { useSiteHeaderHeight } from '@/lib/useSiteHeaderHeight';
import CartItemRow from './CartItemRow';
import CheckoutDrawer from './CheckoutDrawer';
import { CartCheckoutBar, CartSummary } from './CartSummary';
import { isCartItemBlocked } from './cartStock';
import { primaryButton, primaryLabel } from '@/profile/components/profileUi';

const NOTICE_MS = 6000;
// Keep the delete spinner up this long so quick removes don't just flash.
const MIN_REMOVE_MS = 400;
const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#3A1F62]';
const primaryLink = primaryButton;

type Notice = { title: string; item: CartItem; error?: string };

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
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
  }, []);

  const showNotice = (next: Notice | null) => {
    setNotice(next);
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    if (next) noticeTimer.current = setTimeout(() => setNotice(null), NOTICE_MS);
  };

  const handleRemove = async (item: CartItem) => {
    if (removingIds.has(item.id)) return;
    setRemovingIds((prev) => new Set(prev).add(item.id));
    const start = Date.now();
    await removeItem(item.id);
    const remaining = MIN_REMOVE_MS - (Date.now() - start);
    if (remaining > 0) await new Promise((resolve) => setTimeout(resolve, remaining));
    setRemovingIds((prev) => {
      const next = new Set(prev);
      next.delete(item.id);
      return next;
    });
    showNotice({ title: translateProductTitle(item.product.name, language, item.product.id), item });
  };

  const undoRemove = async () => {
    if (!notice) return;
    const { item } = notice;
    const result = await addItem(item.product, item.quantity, item.selectedVariations, item.personalizationText);
    showNotice(result.ok ? null : { ...notice, error: result.error || t('cart.undo_failed', "Couldn't put this back in your cart.") });
  };

  const guest = status === 'unauthenticated' && !userLoggedIn;
  const blocked = items.some(isCartItemBlocked);
  const hasItems = items.length > 0;

  // The fixed checkout bar would otherwise cover the bottom of the footer on phones.
  useEffect(() => {
    if (!hasItems) return;
    document.body.setAttribute('data-bottom-bar', '');
    return () => document.body.removeAttribute('data-bottom-bar');
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
                  removing={removingIds.has(item.id)}
                  onQuantityChange={(quantity) => setQty(item.id, quantity)}
                  onRemove={() => handleRemove(item)}
                />
              ))}
            </ul>
          </div>

          {/* Desktop only. Phones get the fixed checkout bar instead. */}
          <div className="hidden lg:sticky lg:block" style={{ top: headerHeight + 16 }}>
            <CartSummary count={count} subtotal={subtotal} blocked={blocked} onCheckout={() => setCheckoutOpen(true)} />
          </div>
          <CartCheckoutBar count={count} subtotal={subtotal} blocked={blocked} onCheckout={() => setCheckoutOpen(true)} />
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
                <span className={primaryLabel}>{t('cart.login', 'Log in')}</span>
              </button>
            ) : (
              <Link href="/shop" className={primaryLink}>
                <span className={primaryLabel}>{t('product.browse', 'Browse products')}</span>
              </Link>
            )}
          </div>
        </div>
      )}


      <CheckoutDrawer open={checkoutOpen} onClose={() => setCheckoutOpen(false)} />

      {/* Stays mounted so screen readers announce what changes inside it. */}
      <div role="status" className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center px-3 lg:bottom-6">
        {notice && (
          <div className="pointer-events-auto flex max-w-[560px] items-center gap-3 rounded-full glass-veil py-2.5 pl-5 pr-4 shadow-[0_6px_10px_rgba(67,23,105,0.14),inset_0_2px_0_rgba(255,255,255,0.7),inset_0_-3px_5px_rgba(67,23,105,0.16)]">
            <p className="min-w-0 truncate font-outfit text-[14px] text-[#111111]">
              {notice.error || t('cart.removed_notice', 'Removed: {title}').replace('{title}', notice.title)}
            </p>
            <button type="button" onClick={() => void undoRemove()} className={`group shrink-0 cursor-pointer rounded-sm ${focusRing}`}>
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
