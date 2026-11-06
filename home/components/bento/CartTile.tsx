'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { useCart } from '@/context/CartContext';
import { useLocale } from '@/context/CurrencyContext';
import { PillLink, TextLink } from '../homeUi';
import { BentoTile, SignInPrompt, SkeletonLine, Thumb } from './BentoTile';

/** What's in the cart: a few photos, the item count and the subtotal. */
export default function CartTile({ className }: { className?: string }) {
  const { status } = useSession();
  const { items, count, subtotal, cartLoading } = useCart();
  const { formatPrice, t } = useLocale();
  const title = t('home.tile_cart', 'Your cart');

  if (status === 'unauthenticated') {
    return (
      <BentoTile title={title} titleId="home-tile-cart" className={className}>
        <SignInPrompt
          variant="outline"
          reason={t('home.cart_guest', 'Your cart is saved to your account, so it follows you to any device.')}
          label={t('home.cart_guest_action', 'Sign in to shop')}
        />
      </BentoTile>
    );
  }

  if (status === 'loading' || cartLoading) {
    return (
      <BentoTile title={title} titleId="home-tile-cart" className={className}>
        <SkeletonLine className="w-2/3" />
        <SkeletonLine className="mt-2 w-1/3" />
      </BentoTile>
    );
  }

  if (items.length === 0) {
    return (
      <BentoTile title={title} titleId="home-tile-cart" className={className}>
        <p className="font-geist text-[15px] leading-relaxed text-ink-muted">{t('home.cart_empty', 'Your cart is empty.')}</p>
        <div className="mt-auto pt-5">
          <TextLink href="/shop">{t('home.browse_products', 'Browse all products')}</TextLink>
        </div>
      </BentoTile>
    );
  }

  const shown = items.slice(0, 3);
  const itemsLabel = (count === 1 ? t('home.cart_items_one', '{count} item') : t('home.cart_items', '{count} items')).replace(
    '{count}',
    String(count)
  );

  return (
    <BentoTile title={title} titleId="home-tile-cart" className={className}>
      <div className="flex items-center">
        {shown.map((item, index) => (
          <span key={item.id} className={index > 0 ? '-ml-3 rounded-[8px] ring-2 ring-white' : 'rounded-[8px] ring-2 ring-white'}>
            <Thumb src={item.product.images?.[0]} />
          </span>
        ))}
        {items.length > shown.length && (
          <span className="ml-2 font-geist text-[14px] text-ink-muted tabular-nums">+{items.length - shown.length}</span>
        )}
      </div>
      <p className="mt-3 font-geist text-[15px] text-ink-muted tabular-nums">
        {itemsLabel} · <span className="font-semibold text-ink">{formatPrice(subtotal)}</span>
      </p>
      <div className="mt-auto pt-5">
        <PillLink href="/cart">{t('home.view_cart', 'View cart')}</PillLink>
      </div>
    </BentoTile>
  );
}
