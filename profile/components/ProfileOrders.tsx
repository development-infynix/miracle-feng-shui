'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale } from '@/context/CurrencyContext';
import { downloadStandaloneTaxInvoice } from '@/lib/invoice';
import { ProductLink } from '@/shop/components/ProductDrawerProvider';
import CancelOrderModal from './CancelOrderModal';
import RefundSubmittedModal from './RefundSubmittedModal';
import { FormError, skeleton } from './profileUi';

const FALLBACK_IMAGE = '/images/miracle.jpeg';
export const SUPPORT_EMAIL = 'care@miraclefengshui.com';

interface OrderItem {
  id: string;
  productId: string;
  title?: string;
  name?: string;
  productName?: string;
  price: number;
  quantity: number;
  image?: string;
  slug?: string;
}

export interface CustomerOrder {
  id: string;
  orderNumber: string;
  date: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  shippingAddress: string;
  total: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  tracking: { courier: string | null; number: string } | null;
  canCancel?: boolean;
  cancellationDeclined?: boolean;
  canRequestRefund?: boolean;
  refund?: { status: 'REQUESTED' | 'PROCESSING' | 'PROCESSED'; amount: number } | null;
  paymentId?: string | null;
  shopName: string;
  items: OrderItem[];
}

// Stone & Gold: the same sharp, lightly outlined box as the product card.
const box = 'border border-ink/25';
const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink';
const action = `group inline-flex h-10 min-w-[96px] shrink-0 items-center justify-center gap-2 border px-4 ${focusRing}`;
const actionLabel = 'font-geist text-[14px] font-semibold';
const linkButton = `group cursor-pointer ${focusRing}`;
const linkLabel = 'font-geist text-[14px] font-semibold text-ink underline decoration-[1.5px] underline-offset-[5px] transition-colors group-hover:text-logo-purple';

const RED_STATUSES = ['CANCELLATION_REQUESTED', 'CANCELLATION_APPROVED', 'CANCELLED'];

const STATUS: Record<string, { key: string; label: string; icon: string }> = {
  PENDING: { key: 'profile.status_pending', label: 'Awaiting payment', icon: 'fa-regular fa-clock' },
  COD_PENDING: { key: 'profile.status_cod', label: 'Order placed, pay on delivery', icon: 'fa-regular fa-clock' },
  PAID: { key: 'profile.status_paid', label: 'Paid, being prepared', icon: 'fa-solid fa-box' },
  PROCESSING: { key: 'profile.status_processing', label: 'Being prepared', icon: 'fa-solid fa-box' },
  SHIPPED: { key: 'profile.status_shipped', label: 'On its way', icon: 'fa-solid fa-truck-fast' },
  DELIVERED: { key: 'profile.status_delivered', label: 'Delivered', icon: 'fa-solid fa-circle-check' },
  CANCELLATION_REQUESTED: { key: 'profile.status_cancel_requested', label: 'Cancellation requested', icon: 'fa-regular fa-clock' },
  // Customers see an approved cancellation simply as Cancelled.
  CANCELLATION_APPROVED: { key: 'profile.status_cancelled', label: 'Cancelled', icon: 'fa-solid fa-circle-xmark' },
  CANCELLED: { key: 'profile.status_cancelled', label: 'Cancelled', icon: 'fa-solid fa-circle-xmark' },
};

export function invoicePayload(order: CustomerOrder) {
  return {
    orderId: order.orderNumber || order.id,
    orderDate: order.date,
    customerName: order.customerName,
    customerEmail: order.email,
    customerPhone: order.phone || '',
    deliveryAddress: order.shippingAddress || order.address || '',
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    totalAmount: order.total || order.totalAmount || 0,
    items: order.items.map((item) => ({
      name: item.title || item.name || item.productName || '',
      quantity: item.quantity || 1,
      price: item.price || 0,
      maker: order.shopName,
    })),
  };
}

function OrderCard({
  order,
  onCancel,
  onRefundRequested,
}: {
  order: CustomerOrder;
  onCancel: () => void;
  onRefundRequested: (order: CustomerOrder) => void;
}) {
  const { formatPrice, t } = useLocale();
  const status = STATUS[order.status] ?? { key: '', label: order.status, icon: 'fa-regular fa-clock' };
  const red = RED_STATUSES.includes(order.status);
  const [requesting, setRequesting] = useState(false);
  const [refundError, setRefundError] = useState('');

  const requestRefund = async () => {
    setRequesting(true);
    setRefundError('');
    try {
      const res = await fetch(`/api/orders/${order.id}/refund`, { method: 'POST' });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);
      onRefundRequested(json.data);
    } catch (err) {
      setRefundError((err instanceof Error && err.message) || t('profile.refund_failed', "We couldn't send your request. Please try again."));
    } finally {
      setRequesting(false);
    }
  };

  return (
    <li className={box}>
      <div className="space-y-2.5 border-b border-ink/15 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-x-6">
          <div className="min-w-0">
            <p className="font-display text-[16px] font-bold leading-tight text-ink sm:text-[21px]">
              {t('profile.order', 'Order')} #{order.orderNumber}
            </p>
            <p className="mt-0.5 font-geist text-[13px] text-ink-muted">{order.date}</p>
          </div>
          <p className="font-geist text-[18px] font-bold tabular-nums text-ink">{formatPrice(order.total || order.totalAmount)}</p>
        </div>
        {/* The status and what the customer can do about it share one line. */}
        <div className="flex items-center justify-between gap-3">
          <p aria-live="polite" className={`flex min-w-0 items-center gap-2 font-geist text-[14px] font-semibold ${red ? 'text-[#8F1610]' : 'text-ink'}`}>
            <i aria-hidden="true" className={`${status.icon} text-[13px]`} />
            {status.key ? t(status.key, status.label) : status.label}
          </p>
          {order.canCancel && (
            <button
              type="button"
              onClick={onCancel}
              aria-label={`${t('profile.cancel_order', 'Cancel')}: ${t('profile.order', 'Order')} #${order.orderNumber}`}
              className={`${action} cursor-pointer border-[#8F1610]/50 transition-colors hover:bg-[#8F1610]/5`}
            >
              <span className={`${actionLabel} text-[#8F1610]`}>
                {t('profile.cancel_order', 'Cancel')}
              </span>
            </button>
          )}
          {order.canRequestRefund && (
            <button
              type="button"
              disabled={requesting}
              onClick={() => void requestRefund()}
              aria-label={`${t('profile.refund', 'Refund')}: ${t('profile.order', 'Order')} #${order.orderNumber}`}
              className={`${action} cursor-pointer border-[#D9A400] bg-[#FFF3C4] transition-colors hover:bg-[#FFEAA0] disabled:cursor-not-allowed disabled:opacity-60`}
            >
              <span className={`${actionLabel} text-[#5C4300]`}>
                {requesting ? t('profile.refund_sending', 'Sending…') : t('profile.refund', 'Refund')}
              </span>
            </button>
          )}
          {(order.refund?.status === 'REQUESTED' || order.refund?.status === 'PROCESSING') && (
            <button
              type="button"
              disabled
              className={`${action} cursor-not-allowed border-[#D9A400]/60 bg-[#FFF9E3]`}
            >
              <i aria-hidden="true" className="fa-regular fa-clock text-[13px] text-[#5C4300]" />
              <span className={`${actionLabel} text-[#5C4300]`}>
                {order.refund.status === 'PROCESSING' ? t('profile.refund_processing_short', 'Processing') : t('profile.cancel_pending', 'Pending')}
              </span>
            </button>
          )}
          {/* A requested cancellation shows only its red status; once approved, a paid order offers Refund (canRequestRefund). */}
        </div>
        {order.refund && (
          <p aria-live="polite" className="flex items-center gap-2 font-geist text-[14px] font-medium text-[#5C4300]">
            <i aria-hidden="true" className={`${order.refund.status === 'PROCESSED' ? 'fa-solid fa-circle-check' : 'fa-regular fa-clock'} text-[13px]`} />
            {order.refund.status === 'PROCESSED'
              ? t('profile.refunded', '{amount} refunded').replace('{amount}', formatPrice(order.refund.amount))
              : order.refund.status === 'PROCESSING'
              ? t('profile.refund_processing', 'Refund processing')
              : t('profile.refund_requested', 'Refund requested')}
          </p>
        )}
        {refundError && <FormError>{refundError}</FormError>}
        {order.cancellationDeclined && (
          <p className="w-full font-geist text-[13px] text-ink-muted">
            {t('profile.cancel_declined', "Your cancellation request wasn't approved.")}
          </p>
        )}
        {order.tracking && (
          <p className="w-full font-geist text-[13px] text-ink">
            {order.tracking.courier ? `${order.tracking.courier}: ` : `${t('profile.tracking', 'Tracking')}: `}
            <span className="font-medium tabular-nums">{order.tracking.number}</span>
          </p>
        )}
      </div>

      <ul className="list-none divide-y divide-ink/15 px-4 sm:px-5">
        {order.items.map((item, index) => {
          const title = item.title || item.name || item.productName || '';
          const productRef = item.productId || item.slug;
          return (
            <li key={item.id || index} className="grid grid-cols-[64px_minmax(0,1fr)] items-center gap-3 py-4 sm:grid-cols-[72px_minmax(0,1fr)_auto] sm:gap-4">
              <ProductLink product={productRef} aria-hidden="true" tabIndex={-1} className="block overflow-hidden bg-[#E2DDD1]">
                <img
                  src={item.image || FALLBACK_IMAGE}
                  alt=""
                  className="aspect-square w-full object-cover"
                  onError={(e) => {
                    const image = e.currentTarget;
                    if (!image.src.endsWith(FALLBACK_IMAGE)) image.src = FALLBACK_IMAGE;
                  }}
                />
              </ProductLink>
              <div className="min-w-0">
                <ProductLink product={productRef} className={`group block w-fit ${focusRing}`}>
                  <span className="line-clamp-2 font-geist text-[15px] font-semibold leading-snug text-ink transition-colors group-hover:text-logo-purple">
                    {title}
                  </span>
                </ProductLink>
                <p className="mt-0.5 font-geist text-[13px] tabular-nums text-ink-muted">
                  {formatPrice(item.price * (item.quantity || 1))} · {t('profile.qty', 'Qty')} {item.quantity || 1}
                </p>
              </div>
              <ProductLink product={productRef} className={`${action} col-span-2 border-ink-fill bg-ink-fill transition-shadow duration-300 hover:shadow-[0_8px_22px_rgba(231,169,59,0.45)] sm:col-span-1`}>
                <span className={`${actionLabel} text-stone`}>{t('cart.view_item', 'View item')}</span>
              </ProductLink>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-ink/15 p-4 sm:px-5">
        <button type="button" onClick={() => downloadStandaloneTaxInvoice(invoicePayload(order))} className={linkButton}>
          <span className={linkLabel}>{t('profile.download_invoice', 'Download invoice')}</span>
        </button>
        <a href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(`Order ${order.orderNumber}`)}`} className={linkButton}>
          <span className={linkLabel}>{t('profile.order_help', 'Get help with this order')}</span>
        </a>
      </div>
    </li>
  );
}

export default function ProfileOrders() {
  const { t } = useLocale();
  const [orders, setOrders] = useState<CustomerOrder[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [cancelling, setCancelling] = useState<CustomerOrder | null>(null);
  const [refundSubmitted, setRefundSubmitted] = useState(false);

  const load = useCallback(async (signal?: AbortSignal) => {
    setFailed(false);
    try {
      const res = await fetch('/api/orders', { signal });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(`Request failed: ${res.status}`);
      setOrders(json.data);
    } catch {
      if (!signal?.aborted) setFailed(true);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  if (failed && !orders) {
    return (
      <div className={`${box} p-5 text-center`}>
        <p role="alert" className="font-geist text-[15px] text-ink">
          {t('profile.orders_failed', "Couldn't load your orders.")}{' '}
          <button type="button" onClick={() => void load()} className={linkButton}>
            <span className={linkLabel}>{t('profile.try_again', 'Try again')}</span>
          </button>
        </p>
      </div>
    );
  }

  if (!orders) {
    return (
      <div aria-busy="true" className="space-y-4">
        {[0, 1].map((n) => (
          <div key={n} className={`${box} space-y-3 p-5`}>
            <div className={`${skeleton} h-4 w-1/3`} />
            <div className={`${skeleton} h-16 w-full`} />
          </div>
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className={`${box} px-5 py-12 text-center`}>
        <h2>
          <span className="block font-display text-[24px] font-bold tracking-tight text-ink">
            {t('profile.no_orders', 'No orders yet')}
          </span>
        </h2>
        <p className="mx-auto mt-2 max-w-[42ch] font-geist text-[15px] leading-relaxed text-ink-muted">
          {t('profile.no_orders_hint', 'When you place an order, you can follow it here and get your invoice.')}
        </p>
        <Link href="/shop" className={`mt-5 inline-flex h-12 items-center justify-center bg-ink-fill px-6 transition-shadow duration-300 hover:shadow-[0_10px_28px_rgba(231,169,59,0.45)] ${focusRing}`}>
          <span className="font-geist text-[15px] font-semibold text-stone">{t('product.browse', 'Browse products')}</span>
        </Link>
      </div>
    );
  }

  return (
    <>
      <ul className="list-none space-y-4">
        {orders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            onCancel={() => setCancelling(order)}
            onRefundRequested={(updated) => {
              setOrders((current) => current && current.map((row) => (row.id === updated.id ? updated : row)));
              setRefundSubmitted(true);
            }}
          />
        ))}
      </ul>
      {refundSubmitted && <RefundSubmittedModal onClose={() => setRefundSubmitted(false)} />}
      {cancelling && (
        <CancelOrderModal
          orderId={cancelling.id}
          orderNumber={cancelling.orderNumber}
          onClose={() => setCancelling(null)}
          onRequested={(updated) => {
            setOrders((current) => current && current.map((order) => (order.id === updated.id ? updated : order)));
            setCancelling(null);
          }}
          // The order changed while the popup was open, such as being shipped.
          onRefused={() => void load()}
        />
      )}
    </>
  );
}
