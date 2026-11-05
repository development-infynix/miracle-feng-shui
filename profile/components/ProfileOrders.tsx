'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale } from '@/context/CurrencyContext';
import { downloadStandaloneTaxInvoice } from '@/lib/invoice';
import { ProductLink } from '@/shop/components/ProductDrawerProvider';
import {
  card,
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
  paymentId?: string | null;
  shopName: string;
  items: OrderItem[];
}

const STATUS: Record<string, { key: string; label: string; icon: string }> = {
  PENDING: { key: 'profile.status_pending', label: 'Awaiting payment', icon: 'fa-regular fa-clock' },
  COD_PENDING: { key: 'profile.status_cod', label: 'Order placed, pay on delivery', icon: 'fa-regular fa-clock' },
  PAID: { key: 'profile.status_paid', label: 'Paid, being prepared', icon: 'fa-solid fa-box' },
  PROCESSING: { key: 'profile.status_processing', label: 'Being prepared', icon: 'fa-solid fa-box' },
  SHIPPED: { key: 'profile.status_shipped', label: 'On its way', icon: 'fa-solid fa-truck-fast' },
  DELIVERED: { key: 'profile.status_delivered', label: 'Delivered', icon: 'fa-solid fa-circle-check' },
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

function OrderCard({ order }: { order: CustomerOrder }) {
  const { formatPrice, t } = useLocale();
  const status = STATUS[order.status] ?? { key: '', label: order.status, icon: 'fa-regular fa-clock' };
  const cancelled = order.status === 'CANCELLED';

  return (
    <li className="rounded-lg bg-white shadow-[0_6px_10px_rgba(67,23,105,0.14)]">
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2 border-b border-[#431769]/15 p-4 sm:px-6">
        <div>
          <p className="font-outfit text-[15px] font-semibold text-[#111111]">
            {t('profile.order', 'Order')} #{order.orderNumber}
          </p>
          <p className="font-outfit text-[13px] text-[#5B4A70]">{order.date}</p>
        </div>
        <p className="font-outfit text-[18px] font-bold tabular-nums text-[#111111]">{formatPrice(order.total || order.totalAmount)}</p>
        <p className={`flex w-full items-center gap-2 font-outfit text-[14px] font-medium ${cancelled ? 'text-[#8F1610]' : 'text-[#431769]'}`}>
          <i aria-hidden="true" className={`${status.icon} text-[13px]`} />
          {status.key ? t(status.key, status.label) : status.label}
        </p>
        {order.tracking && (
          <p className="w-full font-outfit text-[13px] text-[#2B1A3F]">
            {order.tracking.courier ? `${order.tracking.courier}: ` : `${t('profile.tracking', 'Tracking')}: `}
            <span className="font-medium tabular-nums">{order.tracking.number}</span>
          </p>
        )}
      </div>

      <ul className="list-none divide-y divide-[#431769]/15 px-4 sm:px-6">
        {order.items.map((item, index) => {
          const title = item.title || item.name || item.productName || '';
          const productRef = item.productId || item.slug;
          return (
            <li key={item.id || index} className="grid grid-cols-[64px_minmax(0,1fr)] items-center gap-3 py-4 sm:grid-cols-[72px_minmax(0,1fr)_auto] sm:gap-4">
              <ProductLink product={productRef} aria-hidden="true" tabIndex={-1} className="block overflow-hidden rounded-md bg-[#F3ECFB]">
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
                <ProductLink product={productRef} className={`group block w-fit rounded-sm ${focusRing}`}>
                  <span className="line-clamp-2 font-outfit text-[15px] font-semibold leading-snug text-[#111111] transition-colors group-hover:text-[#7A2FC0]">
                    {title}
                  </span>
                </ProductLink>
                <p className="mt-0.5 font-outfit text-[13px] tabular-nums text-[#5B4A70]">
                  {formatPrice(item.price * (item.quantity || 1))} · {t('profile.qty', 'Qty')} {item.quantity || 1}
                </p>
              </div>
              <ProductLink product={productRef} className={`${smallButton} col-span-2 sm:col-span-1`}>
                <span className={smallLabel}>{t('cart.view_item', 'View item')}</span>
                <i aria-hidden="true" className="fa-solid fa-angles-right text-[13px] text-[#431769] transition-colors group-hover:text-[#7A2FC0]" />
              </ProductLink>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[#431769]/15 p-4 sm:px-6">
        <button type="button" onClick={() => downloadStandaloneTaxInvoice(invoicePayload(order))} className={textButton}>
          <span className={textLabel}>{t('profile.download_invoice', 'Download invoice')}</span>
        </button>
        <a href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(`Order ${order.orderNumber}`)}`} className={textButton}>
          <span className={textLabel}>{t('profile.order_help', 'Get help with this order')}</span>
        </a>
      </div>
    </li>
  );
}

export default function ProfileOrders() {
  const { t } = useLocale();
  const [orders, setOrders] = useState<CustomerOrder[] | null>(null);
  const [failed, setFailed] = useState(false);

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
      <div className={`${card} text-center`}>
        <p role="alert" className="font-outfit text-[15px] text-[#2B1A3F]">
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
          <span className="block font-serif text-[24px] font-bold tracking-tight text-[#111111]">
            {t('profile.no_orders', 'No orders yet')}
          </span>
        </h2>
        <p className="mx-auto mt-2 max-w-[42ch] font-outfit text-[15px] leading-relaxed text-[#5B4A70]">
          {t('profile.no_orders_hint', 'When you place an order, you can follow it here and get your invoice.')}
        </p>
        <Link href="/shop" className={`${primaryButton} mt-5`}>
          <span className={primaryLabel}>{t('product.browse', 'Browse products')}</span>
        </Link>
      </div>
    );
  }

  return (
    <ul className="list-none space-y-4">
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </ul>
  );
}
