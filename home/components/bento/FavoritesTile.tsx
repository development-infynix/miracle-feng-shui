'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { useCart } from '@/context/CartContext';
import { useLocale } from '@/context/CurrencyContext';
import { ProductLink } from '@/shop/components/ProductDrawerProvider';
import { focusRing, TextLink } from '../homeUi';
import { BentoTile, SignInPrompt, SkeletonLine, Thumb } from './BentoTile';

const SHOWN = 4;

/** The customer's saved products, as a row of photos. */
export default function FavoritesTile({ className }: { className?: string }) {
  const { status } = useSession();
  const { favorites } = useCart();
  const { t } = useLocale();
  const title = t('home.tile_favorites', 'Favorites');

  if (status === 'unauthenticated') {
    return (
      <BentoTile title={title} titleId="home-tile-favorites" className={className}>
        <SignInPrompt
          variant="outline"
          reason={t('home.favorites_guest', 'Save the pieces you love and find them again later.')}
          label={t('home.favorites_guest_action', 'Sign in to save')}
        />
      </BentoTile>
    );
  }

  if (status === 'loading') {
    return (
      <BentoTile title={title} titleId="home-tile-favorites" className={className}>
        <SkeletonLine className="w-2/3" />
      </BentoTile>
    );
  }

  if (favorites.length === 0) {
    return (
      <BentoTile title={title} titleId="home-tile-favorites" className={className}>
        <p className="font-geist text-[15px] leading-relaxed text-ink-muted">
          {t('home.favorites_empty', 'Tap the heart on any product to save it here.')}
        </p>
      </BentoTile>
    );
  }

  return (
    <BentoTile title={title} titleId="home-tile-favorites" className={className}>
      <ul className="grid list-none grid-cols-4 gap-2">
        {favorites.slice(0, SHOWN).map((product) => (
          <li key={product.id}>
            <ProductLink product={product} aria-label={product.name} className={`block rounded-[6px] ${focusRing}`}>
              <Thumb src={product.images?.[0]} size="aspect-square w-full" />
            </ProductLink>
          </li>
        ))}
      </ul>
      <div className="mt-auto flex items-baseline justify-between gap-3 pt-5">
        <span className="font-geist text-[14px] text-ink-muted tabular-nums">
          {(favorites.length === 1 ? t('home.saved_one', '{count} saved') : t('home.saved', '{count} saved')).replace(
            '{count}',
            String(favorites.length)
          )}
        </span>
        <TextLink href="/profile?tab=favorites">{t('home.view_all', 'View all')}</TextLink>
      </div>
    </BentoTile>
  );
}
