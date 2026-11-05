'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import GooNavShell from '@/components/GooNavShell';
import { useLocale } from '@/context/CurrencyContext';
import { downloadStandaloneTaxInvoice } from '@/lib/invoice';
import { invoicePayload, SUPPORT_EMAIL, type CustomerOrder } from '@/profile/components/ProfileOrders';
import { ConfirmedSeal, StatusSeal } from './OrderSeal';

const FALLBACK_IMAGE = '/images/miracle.jpeg';
const MAX_THUMBNAILS = 3;
const POUR_DELAY_MS = 750;
const COPIED_MS = 2000;

const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#3A1F62]';
const primaryButton = `inline-flex h-12 items-center justify-center rounded-md bg-[#431769] px-6 transition-colors hover:bg-[#3A1F62] ${focusRing}`;
const secondaryButton = `group inline-flex h-12 items-center justify-center rounded-md border border-[#431769] px-6 ${focusRing}`;
const textLink = `group cursor-pointer rounded-sm ${focusRing}`;
const textLabel = 'font-outfit text-[14px] font-medium text-[#431769] underline underline-offset-2 transition-colors group-hover:text-[#7A2FC0]';

type OrderOutcome = 'confirmed' | 'pay-on-delivery' | 'unpaid' | 'cancelled';

function outcomeOf(order: CustomerOrder): OrderOutcome {
  if (order.status === 'CANCELLED' || order.status === 'CANCELLATION_APPROVED') return 'cancelled';
  if (order.paymentStatus === 'PAID') return 'confirmed';
  if (order.status === 'COD_PENDING') return 'pay-on-delivery';
  return 'unpaid';
}

function CopyButton({ value, label, compact = false }: { value: string; label: string; compact?: boolean }) {
  const { t } = useLocale();
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      return; // Clipboard can be blocked, and the ID stays on screen to select by hand.
    }
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), COPIED_MS);
  };

  return (
    <button
      type="button"
      onClick={() => void copy()}
      aria-label={`${t('confirmation.copy', 'Copy')} ${label}`}
      className={`group flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-2.5 ${focusRing}`}
    >
      <i aria-hidden="true" className={`${copied ? 'fa-solid fa-check' : 'fa-regular fa-copy'} text-[13px] text-[#431769] transition-colors group-hover:text-[#7A2FC0]`} />
      <span aria-live="polite" className={`font-outfit text-[13px] font-medium text-[#431769] transition-colors group-hover:text-[#7A2FC0] ${compact ? "hidden sm:inline" : ""}`}>
        {copied ? t('confirmation.copied', 'Copied') : t('confirmation.copy', 'Copy')}
      </span>
    </button>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 first:pt-0">
      <dt className="shrink-0 font-outfit text-[14px] text-[#5B4A70]">{label}</dt>
      <dd className="min-w-0 text-right font-outfit text-[14px] font-medium text-[#111111]">{children}</dd>
    </div>
  );
}

function ReceiptPanel({ order, outcome }: { order: CustomerOrder; outcome: OrderOutcome }) {
  const { formatPrice, language, t } = useLocale();
  void language;
  const itemCount = order.items.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const thumbnails = order.items.slice(0, MAX_THUMBNAILS);
  const extra = order.items.length - thumbnails.length;
  const total = order.total || order.totalAmount;

  return (
    <div className="p-5 sm:p-7">
      <dl className="divide-y divide-[#431769]/15">
        <Row label={t('confirmation.items', 'Items')}>
          <span className="flex items-center justify-end gap-2.5">
            <span aria-hidden="true" className="flex items-center">
              {thumbnails.map((item, index) => (
                <img
                  key={item.id || index}
                  src={item.image || FALLBACK_IMAGE}
                  alt=""
                  className={`h-8 w-8 rounded-md border-2 border-[#EDE4F7] bg-white/50 object-cover ${index > 0 ? '-ml-2.5' : ''}`}
                  onError={(e) => {
                    const image = e.currentTarget;
                    if (!image.src.endsWith(FALLBACK_IMAGE)) image.src = FALLBACK_IMAGE;
                  }}
                />
              ))}
              {extra > 0 && <span className="ml-1.5 font-outfit text-[12px] tabular-nums text-[#5B4A70]">+{extra}</span>}
            </span>
            <span className="tabular-nums">
              {itemCount === 1 ? t('cart.one_item', '1 item') : t('cart.item_count', '{count} items').replace('{count}', String(itemCount))}
            </span>
          </span>
        </Row>
        <Row label={outcome === 'confirmed' ? t('confirmation.total_paid', 'Total paid') : t('confirmation.total', 'Total')}>
          <span className="text-[18px] font-bold tabular-nums">{formatPrice(total)}</span>
        </Row>
        <Row label={t('confirmation.payment', 'Payment')}>{order.paymentMethod}</Row>
        {order.paymentId && (
          <Row label={t('confirmation.payment_id', 'Payment ID')}>
            <span className="flex items-center justify-end gap-1">
              <span className="min-w-0 break-all tabular-nums">{order.paymentId}</span>
              <CopyButton compact value={order.paymentId} label={t('confirmation.payment_id', 'Payment ID')} />
            </span>
          </Row>
        )}
        <Row label={t('confirmation.date', 'Order date')}>{order.date}</Row>
        <Row label={t('confirmation.deliver_to', 'Delivering to')}>
          <span className="block">{order.customerName}</span>
          <span className="block font-normal leading-snug text-[#2B1A3F]">{order.shippingAddress || order.address}</span>
        </Row>
      </dl>

      {(outcome === 'confirmed' || outcome === 'pay-on-delivery') && (
        <p className="mt-2 flex items-center gap-2.5 rounded-md bg-white/55 p-3 font-outfit text-[14px] font-medium text-[#111111]">
          <i aria-hidden="true" className="fa-solid fa-truck-fast text-[14px] text-[#431769]" />
          {t('checkout.expected_delivery', 'Expected delivery within 7 days')}
        </p>
      )}

      {/* Primary actions live inside the receipt so they align with the card. */}
      <div className="mt-5 grid w-full gap-3 sm:grid-cols-2">
        {outcome === 'unpaid' && (
          <Link href="/cart" className={primaryButton}>
            <span className="font-outfit text-[15px] font-semibold text-white">{t('confirmation.back_to_cart', 'Back to cart')}</span>
          </Link>
        )}
        <Link href="/shop" className={outcome !== 'unpaid' ? `${primaryButton} sm:col-span-2` : secondaryButton}>
          <span className={`font-outfit text-[15px] font-semibold transition-colors ${outcome !== 'unpaid' ? 'text-white' : 'text-[#431769] group-hover:text-[#7A2FC0]'}`}>
            {t('cart.continue_shopping', 'Continue shopping')}
          </span>
        </Link>
      </div>

      <div className="mt-4 flex items-center justify-center">
        <a href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(`Order ${order.orderNumber}`)}`} className={textLink}>
          <span className={textLabel}>{t('profile.order_help', 'Get help with this order')}</span>
        </a>
      </div>
    </div>
  );
}

function CenteredMessage({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-[44ch] px-4 py-20 text-center">
      <h1>
        <span className="block font-serif text-[28px] font-bold tracking-tight text-[#111111]">{title}</span>
      </h1>
      <p className="mt-2 font-outfit text-[15px] leading-relaxed text-[#5B4A70]">{hint}</p>
      <div className="mt-5">{children}</div>
    </div>
  );
}

export default function OrderConfirmationView() {
  const searchParams = useSearchParams();
  const { t } = useLocale();
  const reference = searchParams.get('orderNumber') || searchParams.get('orderId') || searchParams.get('id');
  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'not-found' | 'failed'>(reference ? 'loading' : 'not-found');
  const [attempt, setAttempt] = useState(0);
  const [poured, setPoured] = useState(false);
  const pillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!reference) return;
    const controller = new AbortController();
    fetch(`/api/orders/${encodeURIComponent(reference)}`, { signal: controller.signal })
      .then(async (res) => {
        if (res.status === 404 || res.status === 401) {
          setStatus('not-found');
          return;
        }
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(`Request failed: ${res.status}`);
        setOrder(json.data);
        setStatus('ready');
      })
      .catch(() => {
        if (!controller.signal.aborted) setStatus('failed');
      });
    return () => controller.abort();
  }, [reference, attempt]);

  // The receipt pours once the seal has had its moment.
  useEffect(() => {
    if (status !== 'ready') return;
    const timer = setTimeout(() => setPoured(true), POUR_DELAY_MS);
    return () => clearTimeout(timer);
  }, [status]);

  if (status === 'loading') {
    return (
      <div aria-busy="true" className="mx-auto flex max-w-[560px] flex-col items-center gap-4 px-4 py-24">
        <div className="h-20 w-20 animate-pulse rounded-full bg-[#431769]/10 motion-reduce:animate-none" />
        <div className="h-6 w-2/3 animate-pulse rounded-sm bg-[#431769]/10 motion-reduce:animate-none" />
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <CenteredMessage title={t('confirmation.load_failed', "We couldn't load this order")} hint={t('confirmation.load_failed_hint', 'Check your connection and try again. Your order is safe.')}>
        <button type="button" onClick={() => { setStatus('loading'); setAttempt((value) => value + 1); }} className={`${primaryButton} cursor-pointer`}>
          <span className="font-outfit text-[15px] font-semibold text-white">{t('profile.try_again', 'Try again')}</span>
        </button>
      </CenteredMessage>
    );
  }

  if (status === 'not-found' || !order) {
    return (
      <CenteredMessage title={t('confirmation.not_found', "We couldn't find that order")} hint={t('confirmation.not_found_hint', 'It may be on another account. All of your orders are in your profile.')}>
        <Link href="/profile?tab=orders" className={primaryButton}>
          <span className="font-outfit text-[15px] font-semibold text-white">{t('confirmation.view_orders', 'View my orders')}</span>
        </Link>
      </CenteredMessage>
    );
  }

  const outcome = outcomeOf(order);
  const firstName = (order.customerName || '').trim().split(/\s+/)[0];

  const heading: Record<OrderOutcome, { title: string; hint: string }> = {
    confirmed: {
      title: firstName
        ? t('confirmation.thanks_name', 'Thank you, {name}').replace('{name}', firstName)
        : t('confirmation.thanks', 'Thank you'),
      hint: order.email
        ? t('confirmation.confirmed_hint_email', "Your order is confirmed. We'll send the details to {email}.").replace('{email}', order.email)
        : t('confirmation.confirmed_hint', 'Your order is confirmed.'),
    },
    'pay-on-delivery': {
      title: t('confirmation.placed', 'Your order is placed'),
      hint: t('confirmation.placed_hint', 'Please keep the payment ready for when it arrives.'),
    },
    unpaid: {
      title: t('confirmation.unpaid', "This order hasn't been paid"),
      hint: t('confirmation.unpaid_hint', "Your payment wasn't completed, so this order won't be shipped. If money left your account, contact us with your order ID and we'll sort it out."),
    },
    cancelled: {
      title: t('confirmation.cancelled', 'This order was cancelled'),
      hint: t('confirmation.cancelled_hint', 'If you have a question about it, contact us with your order ID.'),
    },
  };

  return (
    <div className="mx-auto flex w-full max-w-[580px] flex-col items-center px-4 pb-8 pt-2 sm:px-6">
      {outcome === 'confirmed' || outcome === 'pay-on-delivery' ? (
        <ConfirmedSeal />
      ) : (
        <div className="mt-6">
          <StatusSeal icon={outcome === 'unpaid' ? 'fa-regular fa-clock' : 'fa-solid fa-xmark'} tone={outcome === 'unpaid' ? 'waiting' : 'stopped'} />
        </div>
      )}

      <div className="confirm-rise -mt-2 text-center">
        <h1>
          <span className="block font-serif text-[32px] font-bold leading-tight tracking-tight text-[#111111] [text-wrap:balance] sm:text-[38px]">
            {heading[outcome].title}
          </span>
        </h1>
        <p role="status" className="mx-auto mt-2 max-w-[46ch] break-words font-outfit text-[15px] leading-relaxed text-[#2B1A3F]">
          {heading[outcome].hint}
        </p>
      </div>

      <div className="confirm-rise mt-7 w-full">
        <GooNavShell
          open={poured}
          triggerRef={pillRef}
          dropId="order-receipt"
          drop={<ReceiptPanel order={order} outcome={outcome} />}
          dropRadius={28}
          dropClassName="w-full"
          dropInFlow
          fitMain
        >
          <div ref={pillRef} className="flex h-14 items-center gap-2 pl-5 pr-2.5">
            <span className="font-outfit text-[16px] font-bold tabular-nums tracking-wide text-[#111111]">{order.orderNumber}</span>
            <CopyButton value={order.orderNumber} label={t('confirmation.order_id', 'Order ID')} />
            {outcome !== 'unpaid' && (
              <>
                <span aria-hidden="true" className="h-6 w-px shrink-0 bg-[#431769]/20" />
                <button
                  type="button"
                  onClick={() => downloadStandaloneTaxInvoice(invoicePayload(order))}
                  className={`group flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-2.5 ${focusRing}`}
                >
                  <i aria-hidden="true" className="fa-solid fa-download text-[13px] text-[#431769] transition-colors group-hover:text-[#7A2FC0]" />
                  <span className="font-outfit text-[13px] font-medium text-[#431769] transition-colors group-hover:text-[#7A2FC0]">
                    {t('profile.invoice', 'Invoice')}
                  </span>
                </button>
              </>
            )}
          </div>
        </GooNavShell>
      </div>
    </div>
  );
}
