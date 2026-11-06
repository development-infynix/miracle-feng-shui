'use client';

import React from 'react';
import Link from 'next/link';
import { useLocale } from '@/context/CurrencyContext';

const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#222222]';
const glass = 'rounded-lg bg-white border border-[#E1E3DF]';
const primaryButton = `cursor-pointer rounded-lg bg-[#222222] transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`;

interface CartSummaryProps {
  count: number;
  subtotal: number;
  /** An item has too little stock, so the order would be refused. */
  blocked: boolean;
  onCheckout: () => void;
}

export function CartSummary({ count, subtotal, blocked, onCheckout }: CartSummaryProps) {
  const { formatPrice, t } = useLocale();
  const itemsLabel =
    count === 1 ? t('cart.one_item', '1 item') : t('cart.item_count', '{count} items').replace('{count}', String(count));

  return (
    <section aria-labelledby="cart-summary-heading" className={`${glass} p-5 sm:p-6`}>
      <h2 id="cart-summary-heading">
        <span className="block font-serif text-[22px] font-bold tracking-tight text-[#222222]">
          {t('cart.order_summary', 'Order Summary')}
        </span>
      </h2>

      <dl className="mt-4 space-y-2 text-[15px] tabular-nums text-[#222222]">
        <div className="flex items-baseline justify-between gap-3">
          <dt>{t('cart.items_subtotal', 'Items')} ({itemsLabel})</dt>
          <dd className="font-medium">{formatPrice(subtotal)}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <dt>{t('cart.delivery', 'Delivery')}</dt>
          <dd className="font-medium">{t('cart.delivery_free', 'Free')}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-3 border-t border-[#E1E3DF] pt-3">
          <dt className="font-semibold">{t('product.total', 'Total')}</dt>
          <dd className="text-[22px] font-bold">{formatPrice(subtotal)}</dd>
        </div>
      </dl>

      <button type="button" disabled={blocked} onClick={onCheckout} className={`${primaryButton} mt-5 h-12 w-full`}>
        <span className="text-[15px] font-semibold text-white">
          {t('cart.proceed_to_checkout', 'Proceed to Checkout')}
        </span>
      </button>

      {blocked && (
        <p className="mt-2 text-[13px] font-medium text-[#8F1610]">
          {t('cart.blocked_note', 'Fix the items marked in your cart to continue.')}
        </p>
      )}

      <p className="mt-3 text-[13px] leading-relaxed text-[#222222]">
        {t('cart.payment_note', 'Pay by card or UPI at checkout.')}
      </p>

      <Link href="/shop" className={`group mt-3 inline-block rounded-sm ${focusRing}`}>
        <span className="text-[14px] font-medium text-[#222222] underline underline-offset-2 transition-colors group-hover:underline">
          {t('cart.continue_shopping', 'Continue shopping')}
        </span>
      </Link>
    </section>
  );
}

/** The phone version of the summary: the total and checkout, fixed to the bottom of the screen. */
export function CartCheckoutBar({ count, subtotal, blocked, onCheckout }: CartSummaryProps) {
  const { formatPrice, t } = useLocale();
  const itemsLabel =
    count === 1 ? t('cart.one_item', '1 item') : t('cart.item_count', '{count} items').replace('{count}', String(count));

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 bg-white border border-[#E1E3DF] px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 lg:hidden">
      {blocked && (
        <p className="pb-2 text-[13px] font-medium text-[#8F1610]">
          {t('cart.blocked_note', 'Fix the items marked in your cart to continue.')}
        </p>
      )}
      <div className="flex items-center justify-between gap-3">
        <p className="min-w-0 tabular-nums text-[#222222]">
          <span className="block truncate text-[18px] font-bold leading-tight">{formatPrice(subtotal)}</span>
          <span className="block truncate text-[12px] text-[#595959]">
            {itemsLabel} · {t('cart.delivery', 'Delivery')} {t('cart.delivery_free', 'Free').toLowerCase()}
          </span>
        </p>
        <button type="button" disabled={blocked} onClick={onCheckout} className={`${primaryButton} h-12 shrink-0 px-6`}>
          <span className="text-[15px] font-semibold text-white">{t('cart.checkout_short', 'Checkout')}</span>
        </button>
      </div>
    </div>
  );
}
