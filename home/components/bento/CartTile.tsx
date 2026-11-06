'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { useCart } from '@/context/CartContext';
import { useLocale } from '@/context/CurrencyContext';
import { PillLink, TextLink } from '../homeUi';
import { BentoTile, SignInPrompt, SkeletonLine, Thumb } from './BentoTile';

/** A shopping bag with the shop's things in it and a gold lucky coin tag, drawn in stone on the charcoal.
 *  It sits between the message and the action. */
function CartArt() {
  return (
    <img
      src="/illustrations/cart-bag.svg"
      alt=""
      aria-hidden="true"
      loading="lazy"
      className="pointer-events-none mx-auto my-4 h-36 w-auto sm:h-40"
    />
  );
}

/** What's in the cart: a few photos, the item count and the subtotal, on the charcoal tile. */
export default function CartTile({ className }: { className?: string }) {
  const { status } = useSession();
  const { items, count, subtotal, cartLoading } = useCart();
  const { formatPrice, t } = useLocale();
  const title = t('home.tile_cart', 'Your cart');

  // Guests don't get this tile on the homepage; this keeps it honest anywhere else it's used.
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

  const tile = (children: React.ReactNode) => (
    <BentoTile tone="charcoal" title={title} titleId="home-tile-cart" className={className}>
      {children}
    </BentoTile>
  );

  if (status === 'loading' || cartLoading) {
    return tile(
      <>
        <SkeletonLine light className="w-2/3" />
        <SkeletonLine light className="mt-2 w-1/3" />
      </>
    );
  }

  if (items.length === 0) {
    return tile(
      <>
        <p className="font-geist text-[15px] leading-relaxed text-stone/80">{t('home.cart_empty', 'Your cart is empty.')}</p>
        <CartArt />
        <div className="mt-auto">
          <TextLink light href="/shop">
            {t('home.browse_products', 'Browse all products')}
          </TextLink>
        </div>
      </>
    );
  }

  const shown = items.slice(0, 3);
  const itemsLabel = (count === 1 ? t('home.cart_items_one', '{count} item') : t('home.cart_items', '{count} items')).replace(
    '{count}',
    String(count)
  );

  return tile(
    <>
      <div className="flex items-center">
        {shown.map((item, index) => (
          <span key={item.id} className={index > 0 ? '-ml-3 ring-2 ring-ink-fill' : 'ring-2 ring-ink-fill'}>
            <Thumb src={item.product.images?.[0]} />
          </span>
        ))}
        {items.length > shown.length && (
          <span className="ml-2 font-geist text-[14px] text-stone/80 tabular-nums">+{items.length - shown.length}</span>
        )}
      </div>
      <p className="mt-3 font-geist text-[15px] text-stone/80 tabular-nums">
        {itemsLabel} · <span className="font-semibold text-stone">{formatPrice(subtotal)}</span>
      </p>
      <CartArt />
      <div className="mt-auto">
        <PillLink href="/cart" variant="light">
          {t('home.view_cart', 'View cart')}
        </PillLink>
      </div>
    </>
  );
}
