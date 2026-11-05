'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/context/CurrencyContext';

const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#3A1F62]';
const glass = 'rounded-lg bg-gradient-to-b from-[#F3ECFB] to-[#DCCDF0] shadow-[0_6px_10px_rgba(67,23,105,0.14),inset_0_-3px_5px_rgba(67,23,105,0.1)]';
const primaryButton = `cursor-pointer rounded-md bg-[#431769] transition-colors hover:bg-[#3A1F62] disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`;

interface CartSummaryProps {
  count: number;
  subtotal: number;
  /** An item has too little stock, so the order would be refused. */
  blocked: boolean;
}

export function CartSummary({ count, subtotal, blocked }: CartSummaryProps) {
  const router = useRouter();
  const { formatPrice, t } = useLocale();
  const itemsLabel =
    count === 1 ? t('cart.one_item', '1 item') : t('cart.item_count', '{count} items').replace('{count}', String(count));

  return (
    <section aria-labelledby="cart-summary-heading" className={`${glass} p-5 sm:p-6`}>
      <h2 id="cart-summary-heading">
        <span className="block font-serif text-[22px] font-bold tracking-tight text-[#111111]">
          {t('cart.order_summary', 'Order Summary')}
        </span>
      </h2>

      <dl className="mt-4 space-y-2 font-outfit text-[15px] tabular-nums text-[#111111]">
        <div className="flex items-baseline justify-between gap-3">
          <dt>{t('cart.items_subtotal', 'Items')} ({itemsLabel})</dt>
          <dd className="font-medium">{formatPrice(subtotal)}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <dt>{t('cart.delivery', 'Delivery')}</dt>
          <dd className="font-medium">{t('cart.delivery_free', 'Free')}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-3 border-t border-[#431769]/15 pt-3">
          <dt className="font-semibold">{t('product.total', 'Total')}</dt>
          <dd className="text-[22px] font-bold">{formatPrice(subtotal)}</dd>
        </div>
      </dl>

      <button type="button" disabled={blocked} onClick={() => router.push('/checkout')} className={`${primaryButton} mt-5 h-12 w-full`}>
        <span className="font-outfit text-[15px] font-semibold text-white">
          {t('cart.proceed_to_checkout', 'Proceed to Checkout')}
        </span>
      </button>

      {blocked && (
        <p className="mt-2 font-outfit text-[13px] font-medium text-[#8F1610]">
          {t('cart.blocked_note', 'Fix the items marked in your cart to continue.')}
        </p>
      )}

      <p className="mt-3 font-outfit text-[13px] leading-relaxed text-[#2B1A3F]">
        {t('cart.payment_note', 'Pay by card, UPI or cash on delivery at checkout.')}
      </p>

      <Link href="/shop" className={`group mt-3 inline-block rounded-sm ${focusRing}`}>
        <span className="font-outfit text-[14px] font-medium text-[#431769] underline underline-offset-2 transition-colors group-hover:text-[#7A2FC0]">
          {t('cart.continue_shopping', 'Continue shopping')}
        </span>
      </Link>
    </section>
  );
}

/** The phone version of the summary: the total and checkout, fixed to the bottom of the screen. */
export function CartCheckoutBar({ count, subtotal, blocked }: CartSummaryProps) {
  const router = useRouter();
  const { formatPrice, t } = useLocale();
  const itemsLabel =
    count === 1 ? t('cart.one_item', '1 item') : t('cart.item_count', '{count} items').replace('{count}', String(count));

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 bg-gradient-to-b from-[#F3ECFB] to-[#DCCDF0] px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 shadow-[0_-6px_10px_rgba(67,23,105,0.14),inset_0_2px_0_rgba(255,255,255,0.7)] lg:hidden">
      {blocked && (
        <p className="pb-2 font-outfit text-[13px] font-medium text-[#8F1610]">
          {t('cart.blocked_note', 'Fix the items marked in your cart to continue.')}
        </p>
      )}
      <div className="flex items-center justify-between gap-3">
        <p className="min-w-0 font-outfit tabular-nums text-[#111111]">
          <span className="block truncate text-[18px] font-bold leading-tight">{formatPrice(subtotal)}</span>
          <span className="block truncate text-[12px] text-[#5B4A70]">
            {itemsLabel} · {t('cart.delivery', 'Delivery')} {t('cart.delivery_free', 'Free').toLowerCase()}
          </span>
        </p>
        <button type="button" disabled={blocked} onClick={() => router.push('/checkout')} className={`${primaryButton} h-12 shrink-0 px-6`}>
          <span className="font-outfit text-[15px] font-semibold text-white">{t('cart.checkout_short', 'Checkout')}</span>
        </button>
      </div>
    </div>
  );
}
