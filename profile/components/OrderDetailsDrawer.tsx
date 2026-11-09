'use client';

import React, { useRef } from 'react';
import { useLocale } from '@/context/CurrencyContext';
import { useGlassModal } from '@/home/components/useGlassModal';
import OrderTimeline from './OrderTimeline';
import type { CustomerOrder } from './ProfileOrders';
import { focusRing, primaryButton, primaryLabel } from './profileUi';

const FALLBACK_IMAGE = '/images/miracle.jpeg';
const sectionTitle = 'mb-2 text-[13px] font-semibold uppercase tracking-[0.06em] text-[#595959]';

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[7.5rem_minmax(0,1fr)] gap-3 py-2.5 text-[14px]">
      <dt className="text-[#595959]">{label}</dt>
      <dd className="min-w-0 break-words font-medium text-[#222222]">{children}</dd>
    </div>
  );
}

interface OrderDetailsDrawerProps {
  open: boolean;
  /** The order to show. Kept while the drawer slides out, so it doesn't empty mid-animation. */
  order: CustomerOrder | null;
  /** The status as the order list words it, e.g. "On its way". */
  statusLabel: string;
  onClose: () => void;
  onDownloadInvoice: (order: CustomerOrder) => void;
}

/** One order in full: its details, what was bought, where it's going, and its history. */
export default function OrderDetailsDrawer({ open, order, statusLabel, onClose, onDownloadInvoice }: OrderDetailsDrawerProps) {
  const { t, formatPrice } = useLocale();
  const panelRef = useRef<HTMLElement>(null);
  const slidIn = useGlassModal({ open, onClose, panelRef, initialFocusRef: panelRef });
  const title = t('profile.order_details', 'Order details');

  return (
    <div inert={!open} className={`fixed inset-0 z-[9998] transition-[visibility] duration-300 ${open ? 'visible' : 'invisible'}`}>
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 motion-reduce:transition-none ${slidIn ? 'opacity-100' : 'opacity-0'}`}
      />

      <aside
        ref={panelRef}
        tabIndex={-1}
        // It takes focus on open for screen readers, and shows no ring because it isn't a control.
        style={{ outline: 'none' }}
        role="dialog"
        aria-modal="true"
        aria-label={order ? `${title}: #${order.orderNumber}` : title}
        className={`bg-white border border-[#E1E3DF] absolute inset-y-0 right-0 flex w-full max-w-[520px] flex-col overflow-hidden transition-transform duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${slidIn ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <header className="flex h-16 shrink-0 items-center justify-between gap-3 pl-6 pr-3">
          <h2>
            <span className="block font-serif text-[24px] font-bold tracking-tight text-[#222222]">{title}</span>
          </h2>
          <button
            type="button"
            aria-label={t('auth.close', 'Close')}
            onClick={onClose}
            className={`group flex h-10 w-10 cursor-pointer items-center justify-center rounded-full ${focusRing}`}
          >
            <i aria-hidden="true" className="fa-solid fa-xmark text-[18px] text-[#222222] transition-colors group-hover:underline" />
          </button>
        </header>

        {order && (
          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto no-scrollbar px-6 pb-6 pt-1">
            <section>
              <dl className="divide-y divide-[#E1E3DF] rounded-xl border border-[#E1E3DF] px-4">
                <Row label={t('profile.order', 'Order')}>#{order.orderNumber}</Row>
                <Row label={t('profile.placed_on', 'Placed on')}>{order.date}</Row>
                <Row label={t('profile.status', 'Status')}>{statusLabel}</Row>
                <Row label={t('profile.payment', 'Payment')}>
                  {order.paymentMethod} · {order.paymentStatus}
                </Row>
                {order.paymentId && <Row label={t('profile.payment_id', 'Payment ID')}>{order.paymentId}</Row>}
                {order.cancellationAllowed === false && (
                  <Row label={t('profile.cancellation', 'Cancellation')}>
                    {t('profile.not_cancellable', 'Not available for this order. Damaged or wrong items are still replaced.')}
                  </Row>
                )}
                {order.tracking && (
                  <Row label={order.tracking.courier || t('profile.tracking', 'Tracking')}>
                    <span className="tabular-nums">{order.tracking.number}</span>
                  </Row>
                )}
              </dl>
            </section>

            <section aria-labelledby="order-history-title">
              <h3 id="order-history-title" className={sectionTitle}>
                {t('profile.order_history', 'History')}
              </h3>
              <div className="rounded-xl border border-[#E1E3DF] p-4">
                <OrderTimeline timeline={order.timeline} />
              </div>
            </section>

            <section aria-labelledby="order-items-title">
              <h3 id="order-items-title" className={sectionTitle}>
                {t('profile.items', 'Items')}
              </h3>
              <ul className="divide-y divide-[#E1E3DF] rounded-xl border border-[#E1E3DF] px-4">
                {order.items.map((item, index) => {
                  const quantity = item.quantity || 1;
                  return (
                    <li key={item.id || index} className="grid grid-cols-[48px_minmax(0,1fr)_auto] items-center gap-3 py-3">
                      <img
                        src={item.image || FALLBACK_IMAGE}
                        alt=""
                        className="aspect-square w-full rounded-lg bg-[#F5F5F1] object-cover"
                        onError={(e) => {
                          const image = e.currentTarget;
                          if (!image.src.endsWith(FALLBACK_IMAGE)) image.src = FALLBACK_IMAGE;
                        }}
                      />
                      <div className="min-w-0">
                        <p className="line-clamp-2 text-[14px] font-semibold leading-snug text-[#222222]">
                          {item.title || item.name || item.productName}
                        </p>
                        <p className="text-[13px] tabular-nums text-[#595959]">
                          {t('profile.qty', 'Qty')} {quantity} · {formatPrice(item.price)}
                        </p>
                      </div>
                      <p className="text-[14px] font-semibold tabular-nums text-[#222222]">{formatPrice(item.price * quantity)}</p>
                    </li>
                  );
                })}
                <li className="flex items-center justify-between py-3">
                  <span className="text-[15px] font-semibold text-[#222222]">{t('profile.total', 'Total')}</span>
                  <span className="text-[16px] font-bold tabular-nums text-[#222222]">{formatPrice(order.totalAmount ?? order.total)}</span>
                </li>
              </ul>
            </section>

            <section aria-labelledby="order-address-title">
              <h3 id="order-address-title" className={sectionTitle}>
                {t('profile.delivery_address', 'Delivery address')}
              </h3>
              <address className="rounded-xl border border-[#E1E3DF] px-4 py-3 text-[14px] not-italic leading-relaxed text-[#222222]">
                <p className="font-semibold">{order.customerName}</p>
                <p>{order.shippingAddress || order.address}</p>
                {order.phone && <p className="mt-1 text-[#595959]">{order.phone}</p>}
              </address>
            </section>
          </div>
        )}

        {order && (
          <footer className="shrink-0 border-t border-[#E1E3DF] p-4">
            <button type="button" onClick={() => onDownloadInvoice(order)} className={`${primaryButton} w-full`}>
              <span className={primaryLabel}>{t('profile.download_invoice', 'Download invoice')}</span>
            </button>
          </footer>
        )}
      </aside>
    </div>
  );
}
