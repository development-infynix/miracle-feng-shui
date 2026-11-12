'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useLocale } from '@/context/CurrencyContext';
import { downloadStandaloneTaxInvoice } from '@/lib/invoice';
import { ProductLink } from '@/shop/components/ProductDrawerProvider';
import CancelOrderModal from './CancelOrderModal';
import RefundSubmittedModal from './RefundSubmittedModal';
import OrderDetailsDrawer from './OrderDetailsDrawer';
import StoreCancelledModal from './StoreCancelledModal';
import type { TimelineEntry } from './OrderTimeline';
import {
  card,
  FormError,
  primaryButton,
  primaryLabel,
  skeleton,
  smallButton,
  smallLabel,
  focusRing,
  textButton,
  textLabel,
} from './profileUi';

const FALLBACK_IMAGE = '/images/miracle.jpeg';
export const SUPPORT_EMAIL = 'care@miraclefengshui.com';

interface OrderItem {
  id: string;
  /** Null once the product is deleted for good. */
  productId: string | null;
  /** False once the product is archived or deleted: the line keeps its photo and title but links nowhere. */
  available?: boolean;
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
  /** The main steps so far, with dates. */
  timeline?: TimelineEntry[];
  /** False when the order was bought while the store didn't allow cancellation. */
  cancellationAllowed?: boolean;
  /** The store cancelled this paid order and is refunding it. */
  refundPending?: boolean;
  /** Why the store cancelled it, when the store did. */
  storeCancellationReason?: string | null;
}

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
    cancellationAllowed: order.cancellationAllowed !== false,
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
  onShowDetails,
}: {
  order: CustomerOrder;
  onCancel: () => void;
  onRefundRequested: (order: CustomerOrder) => void;
  onShowDetails: () => void;
}) {
  const { formatPrice, t } = useLocale();
  const status = STATUS[order.status] ?? { key: '', label: order.status, icon: 'fa-regular fa-clock' };
  const red = RED_STATUSES.includes(order.status);
  const [requesting, setRequesting] = useState(false);
  const [refundError, setRefundError] = useState('');
  const [showCancelReason, setShowCancelReason] = useState(false);

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
    <li id={`order-${order.id}`} className="scroll-mt-28 rounded-lg bg-white">
      <div className="space-y-2 border-b border-[#E1E3DF] p-4 sm:px-6">
        <div className="flex items-start justify-between gap-x-6">
          <div className="min-w-0">
            <p className="text-[15px] font-semibold text-[#222222]">
              {t('profile.order', 'Order')} #{order.orderNumber}
            </p>
            <p className="text-[13px] text-[#595959]">{order.date}</p>
          </div>
          <p className="text-[18px] font-bold tabular-nums text-[#222222]">{formatPrice(order.total || order.totalAmount)}</p>
        </div>
        {/* The status and what the customer can do about it share one line. */}
        <div className="flex items-center justify-between gap-3">
          {order.storeCancellationReason ? (
            // The store cancelled it: the status opens the reason.
            <button
              type="button"
              onClick={() => setShowCancelReason(true)}
              aria-label={`${status.key ? t(status.key, status.label) : status.label}. ${t('profile.store_cancelled_title', 'Why was this order cancelled?')}`}
              className={`group flex min-w-0 cursor-pointer items-center gap-2 rounded-sm text-[14px] font-medium text-[#8F1610] ${focusRing}`}
            >
              <i aria-hidden="true" className={`${status.icon} text-[13px]`} />
              <span className="underline decoration-dotted underline-offset-4 group-hover:decoration-solid">
                {status.key ? t(status.key, status.label) : status.label}
              </span>
              {order.refundPending && (
                <span className="font-normal text-[#5C4300]">({t('profile.processing_refund', 'Processing refund')})</span>
              )}
              <i aria-hidden="true" className="fa-solid fa-circle-info text-[12px] opacity-70" />
            </button>
          ) : (
            <p aria-live="polite" className={`flex min-w-0 items-center gap-2 text-[14px] font-medium ${red ? 'text-[#8F1610]' : 'text-[#222222]'}`}>
              <i aria-hidden="true" className={`${status.icon} text-[13px]`} />
              {status.key ? t(status.key, status.label) : status.label}
              {order.refundPending && (
                <span className="font-normal text-[#5C4300]">({t('profile.processing_refund', 'Processing refund')})</span>
              )}
            </p>
          )}
          {order.canCancel && (
            <button
              type="button"
              onClick={onCancel}
              aria-label={`${t('profile.cancel_order', 'Cancel')}: ${t('profile.order', 'Order')} #${order.orderNumber}`}
              className={`group inline-flex h-10 min-w-[96px] shrink-0 cursor-pointer items-center justify-center rounded-lg border border-[#8F1610]/40 px-4 ${focusRing}`}
            >
              <span className="text-[14px] font-semibold text-[#8F1610] transition-colors group-hover:text-[#5E0E0A]">
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
              className={`group inline-flex h-10 min-w-[96px] shrink-0 cursor-pointer items-center justify-center rounded-lg border border-[#D9A400] bg-[#FFF3C4] px-4 disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`}
            >
              <span className="text-[14px] font-semibold text-[#5C4300] transition-colors group-hover:text-[#3D2C00]">
                {requesting ? t('profile.refund_sending', 'Sending…') : t('profile.refund', 'Refund')}
              </span>
            </button>
          )}
          {(order.refund?.status === 'REQUESTED' || order.refund?.status === 'PROCESSING') && (
            <button
              type="button"
              disabled
              className="inline-flex h-10 min-w-[96px] shrink-0 cursor-not-allowed items-center justify-center gap-2 rounded-lg border border-[#D9A400]/60 bg-[#FFF9E3] px-4"
            >
              <i aria-hidden="true" className="fa-regular fa-clock text-[13px] text-[#5C4300]" />
              <span className="text-[14px] font-semibold text-[#5C4300]">
                {order.refund.status === 'PROCESSING' ? t('profile.refund_processing_short', 'Processing') : t('profile.cancel_pending', 'Pending')}
              </span>
            </button>
          )}
          {/* A requested cancellation shows only its red status; once approved, a paid order offers Refund (canRequestRefund). */}
        </div>
        {order.refund && (
          <p aria-live="polite" className="flex items-center gap-2 text-[14px] font-medium text-[#5C4300]">
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
          <p className="w-full text-[13px] text-[#595959]">
            {t('profile.cancel_declined', "Your cancellation request wasn't approved.")}
          </p>
        )}
        {order.tracking && (
          <p className="w-full text-[13px] text-[#222222]">
            {order.tracking.courier ? `${order.tracking.courier}: ` : `${t('profile.tracking', 'Tracking')}: `}
            <span className="font-medium tabular-nums">{order.tracking.number}</span>
          </p>
        )}
      </div>

      <ul className="list-none divide-y divide-[#E1E3DF] px-4 sm:px-6">
        {order.items.map((item, index) => {
          const title = item.title || item.name || item.productName || '';
          // An archived or deleted product has nothing to open, so its line shows without links.
          const productRef = item.available === false ? null : item.productId || item.slug;
          const photoClass = 'block overflow-hidden rounded-lg bg-[#F5F5F1]';
          const photo = (
            <img
              src={item.image || FALLBACK_IMAGE}
              alt=""
              className="aspect-square w-full object-cover"
              onError={(e) => {
                const image = e.currentTarget;
                if (!image.src.endsWith(FALLBACK_IMAGE)) image.src = FALLBACK_IMAGE;
              }}
            />
          );
          return (
            <li key={item.id || index} className="grid grid-cols-[64px_minmax(0,1fr)] items-center gap-3 py-4 sm:grid-cols-[72px_minmax(0,1fr)_auto] sm:gap-4">
              {productRef ? (
                <ProductLink product={productRef} aria-hidden="true" tabIndex={-1} className={photoClass}>
                  {photo}
                </ProductLink>
              ) : (
                <div className={photoClass}>{photo}</div>
              )}
              <div className="min-w-0">
                {productRef ? (
                  <ProductLink product={productRef} className={`group block w-fit rounded-sm ${focusRing}`}>
                    <span className="line-clamp-2 text-[15px] font-semibold leading-snug text-[#222222] transition-colors group-hover:underline">
                      {title}
                    </span>
                  </ProductLink>
                ) : (
                  <span className="line-clamp-2 text-[15px] font-semibold leading-snug text-[#222222]">{title}</span>
                )}
                <p className="mt-0.5 text-[13px] tabular-nums text-[#595959]">
                  {formatPrice(item.price * (item.quantity || 1))} · {t('profile.qty', 'Qty')} {item.quantity || 1}
                </p>
              </div>
              {productRef ? (
                <ProductLink product={productRef} className={`${smallButton} col-span-2 sm:col-span-1`}>
                  <span className={smallLabel}>{t('cart.view_item', 'View item')}</span>
                  <i aria-hidden="true" className="fa-solid fa-angles-right text-[13px] text-[#222222] transition-colors group-hover:underline" />
                </ProductLink>
              ) : (
                <p className="col-span-2 text-[13px] text-[#595959] sm:col-span-1">
                  {t('profile.item_unavailable', 'No longer available')}
                </p>
              )}
            </li>
          );
        })}
      </ul>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[#E1E3DF] p-4 sm:px-6">
        <button
          type="button"
          onClick={onShowDetails}
          aria-label={`${t('profile.show_order_details', 'Show order details')}: ${t('profile.order', 'Order')} #${order.orderNumber}`}
          className={textButton}
        >
          <span className={textLabel}>{t('profile.show_order_details', 'Show order details')}</span>
        </button>
        {/* Short labels; the full meaning is in each one's accessible name. */}
        <button
          type="button"
          onClick={() => downloadStandaloneTaxInvoice(invoicePayload(order))}
          aria-label={`${t('profile.download_invoice', 'Download invoice')}: ${t('profile.order', 'Order')} #${order.orderNumber}`}
          className={`${textButton} inline-flex items-center gap-1.5`}
        >
          <i aria-hidden="true" className="fa-solid fa-download text-[12px] text-[#222222]" />
          <span className={textLabel}>{t('profile.invoice', 'Invoice')}</span>
        </button>
        {/* Once it's delivered, help is usually about a problem with what arrived. */}
        {order.status === 'DELIVERED' ? (
          <a
            href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(`Issue with order ${order.orderNumber}`)}`}
            aria-label={`${t('profile.report_issue_full', 'Report an issue with this order')}: #${order.orderNumber}`}
            className={textButton}
          >
            <span className={textLabel}>{t('profile.report_issue', 'Report issue')}</span>
          </a>
        ) : (
          <a
            href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(`Order ${order.orderNumber}`)}`}
            aria-label={`${t('profile.order_help', 'Get help with this order')}: #${order.orderNumber}`}
            className={textButton}
          >
            <span className={textLabel}>{t('profile.support', 'Support')}</span>
          </a>
        )}
      </div>
      {showCancelReason && order.storeCancellationReason && (
        <StoreCancelledModal
          orderNumber={order.orderNumber}
          reason={order.storeCancellationReason}
          total={order.total || order.totalAmount}
          refundPending={Boolean(order.refundPending)}
          refunded={order.refund?.status === 'PROCESSED'}
          supportEmail={SUPPORT_EMAIL}
          onClose={() => setShowCancelReason(false)}
        />
      )}
    </li>
  );
}

export default function ProfileOrders() {
  const { t } = useLocale();
  const [orders, setOrders] = useState<CustomerOrder[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [cancelling, setCancelling] = useState<CustomerOrder | null>(null);
  const [refundSubmitted, setRefundSubmitted] = useState(false);
  // The id, not a copy, so the drawer shows the order as it is in the list (after a cancel or refund too).
  const [details, setDetails] = useState<{ id: string | null; open: boolean }>({ id: null, open: false });
  const detailsOrder = orders?.find((order) => order.id === details.id) ?? null;
  const statusLabel = (status: string) => {
    const info = STATUS[status];
    return info ? t(info.key, info.label) : status;
  };

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

  // A link with ?order= (from a notification) opens that order's details. It's used once, so a
  // refresh doesn't open it again. An order that isn't in the list just leaves the list showing.
  const wantedOrder = useSearchParams().get('order');
  useEffect(() => {
    if (!orders || !wantedOrder) return;
    const match = orders.find((order) => order.orderNumber === wantedOrder || order.id === wantedOrder);
    if (match) {
      setDetails({ id: match.id, open: true });
      document.getElementById(`order-${match.id}`)?.scrollIntoView({ block: 'start' });
    }
    const url = new URL(window.location.href);
    url.searchParams.delete('order');
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}`);
  }, [orders, wantedOrder]);

  if (failed && !orders) {
    return (
      <div className={`${card} text-center`}>
        <p role="alert" className="text-[15px] text-[#222222]">
          {t('profile.orders_failed', "Couldn't load your orders.")}{' '}
          <button type="button" onClick={() => void load()} className={textButton}>
            <span className={textLabel}>{t('profile.try_again', 'Try again')}</span>
          </button>
        </p>
      </div>
    );
  }

  if (!orders) {
    return (
      <div aria-busy="true" className="space-y-4">
        {[0, 1].map((n) => (
          <div key={n} className={`${card} space-y-3`}>
            <div className={`${skeleton} h-4 w-1/3`} />
            <div className={`${skeleton} h-16 w-full`} />
          </div>
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className={`${card} py-12 text-center`}>
        <h2>
          <span className="block font-serif text-[24px] font-bold tracking-tight text-[#222222]">
            {t('profile.no_orders', 'No orders yet')}
          </span>
        </h2>
        <p className="mx-auto mt-2 max-w-[42ch] text-[15px] leading-relaxed text-[#595959]">
          {t('profile.no_orders_hint', 'When you place an order, you can follow it here and get your invoice.')}
        </p>
        <Link href="/shop" className={`${primaryButton} mt-5`}>
          <span className={primaryLabel}>{t('product.browse', 'Browse products')}</span>
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
            onShowDetails={() => setDetails({ id: order.id, open: true })}
            onRefundRequested={(updated) => {
              setOrders((current) => current && current.map((row) => (row.id === updated.id ? updated : row)));
              setRefundSubmitted(true);
            }}
          />
        ))}
      </ul>
      {refundSubmitted && <RefundSubmittedModal onClose={() => setRefundSubmitted(false)} />}
      <OrderDetailsDrawer
        open={details.open}
        order={detailsOrder}
        statusLabel={detailsOrder ? statusLabel(detailsOrder.status) : ''}
        onClose={() => setDetails((current) => ({ ...current, open: false }))}
        onDownloadInvoice={(order) => downloadStandaloneTaxInvoice(invoicePayload(order))}
      />
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
