'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useCart } from '@/context/CartContext';
import { useLocale } from '@/context/CurrencyContext';
import { PillLink } from './homeUi';

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Awaiting payment',
  COD_PENDING: 'Placed, pay on delivery',
  PAID: 'Paid, being prepared',
  PROCESSING: 'Being prepared',
  SHIPPED: 'On its way',
  DELIVERED: 'Delivered',
  CANCELLATION_REQUESTED: 'Cancellation requested',
  CANCELLATION_APPROVED: 'Cancellation approved',
  CANCELLED: 'Cancelled',
};

interface LatestOrder {
  orderNumber: string;
  status: string;
  date: string;
  items: { image?: string }[];
}

const card = 'flex flex-col rounded-2xl border border-[#E1E3DF] bg-white p-5 sm:p-6';
const cardTitle = 'text-[18px] font-semibold text-[#222222]';
const muted = 'text-[15px] text-[#595959]';

function Thumbs({ images }: { images: (string | undefined)[] }) {
  const shown = images.filter(Boolean).slice(0, 4) as string[];
  if (shown.length === 0) return null;
  return (
    <div className="mt-4 flex gap-2">
      {shown.map((src, i) => (
        <span key={i} className="h-14 w-14 overflow-hidden rounded-lg bg-[#F0EFEB]">
          <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
        </span>
      ))}
    </div>
  );
}

/** For signed-in customers: their favorites, cart and latest order, each with the way to see more. */
export default function AccountShortcuts() {
  const { status } = useSession();
  const { favorites, items, count, subtotal } = useCart();
  const { formatPrice, t } = useLocale();
  const [orders, setOrders] = useState<LatestOrder[] | null>(null);
  const signedIn = status === 'authenticated';

  useEffect(() => {
    if (!signedIn) return;
    const controller = new AbortController();
    fetch('/api/orders', { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => setOrders(json?.success && Array.isArray(json.data) ? json.data : []))
      .catch(() => {
        if (!controller.signal.aborted) setOrders([]);
      });
    return () => controller.abort();
  }, [signedIn]);

  if (!signedIn) return null;

  const latest = orders?.[0];

  return (
    <section aria-labelledby="home-account" className="etsy-container py-8 sm:py-12">
      <h2 id="home-account">
        <span className="block text-[20px] font-semibold tracking-tight text-[#222222] sm:text-[26px]">
          {t('home.account_title', 'Pick up where you left off')}
        </span>
      </h2>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:mt-8 md:grid-cols-3">
        <div className={card}>
          <h3>
            <span className={cardTitle}>{t('nav.favorites', 'Favorites')}</span>
          </h3>
          <p className={`mt-1 ${muted}`}>
            {favorites.length === 0
              ? t('home.favorites_empty', 'Tap the heart on any product to save it here.')
              : (favorites.length === 1 ? t('home.saved_one', '{count} saved item') : t('home.saved', '{count} saved items')).replace(
                  '{count}',
                  String(favorites.length)
                )}
          </p>
          <Thumbs images={favorites.map((p) => p.images?.[0])} />
          <div className="mt-auto pt-5">
            <PillLink href="/profile?tab=favorites" variant="outline">
              {t('home.view_favorites', 'View favorites')}
            </PillLink>
          </div>
        </div>

        <div className={card}>
          <h3>
            <span className={cardTitle}>{t('nav.cart', 'Cart')}</span>
          </h3>
          <p className={`mt-1 ${muted}`}>
            {items.length === 0 ? (
              t('home.cart_empty', 'Your cart is empty.')
            ) : (
              <>
                {(count === 1 ? t('home.cart_items_one', '{count} item') : t('home.cart_items', '{count} items')).replace('{count}', String(count))}
                {' · '}
                <span className="font-semibold text-[#222222] tabular-nums">{formatPrice(subtotal)}</span>
              </>
            )}
          </p>
          <Thumbs images={items.map((item) => item.product.images?.[0])} />
          <div className="mt-auto pt-5">
            <PillLink href={items.length === 0 ? '/shop' : '/cart'}>
              {items.length === 0 ? t('home.browse_products', 'Browse products') : t('home.view_cart', 'View cart')}
            </PillLink>
          </div>
        </div>

        <div className={card}>
          <h3>
            <span className={cardTitle}>{t('profile.orders', 'Orders')}</span>
          </h3>
          {orders === null ? (
            <p className={`mt-1 ${muted}`}>{t('home.orders_loading', 'Loading your orders…')}</p>
          ) : latest ? (
            <>
              <p className={`mt-1 ${muted}`}>
                {t('home.latest_order', 'Latest: #{number}').replace('{number}', latest.orderNumber)}
              </p>
              <p className="mt-0.5 text-[15px] font-semibold text-[#222222]">{STATUS_LABEL[latest.status] ?? latest.status}</p>
              <Thumbs images={latest.items.map((item) => item.image)} />
            </>
          ) : (
            <p className={`mt-1 ${muted}`}>{t('profile.no_orders', 'No orders yet')}</p>
          )}
          <div className="mt-auto pt-5">
            <PillLink href="/profile?tab=orders" variant="outline">
              {t('home.view_orders', 'View orders')}
            </PillLink>
          </div>
        </div>
      </div>
    </section>
  );
}
