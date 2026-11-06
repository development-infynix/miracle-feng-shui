'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { useCart } from '@/context/CartContext';
import { useLocale } from '@/context/CurrencyContext';
import { TextLink } from '../homeUi';
import { BentoTile, SignInPrompt, SkeletonLine } from './BentoTile';

/** A heart in one dark ink brush stroke, behind the tile's text; it scales to sit in the bottom right. Hidden on phones. */
function BrushHeart() {
  return (
    <img
      src="/illustrations/heart-brush.svg"
      alt=""
      aria-hidden="true"
      loading="lazy"
      className="pointer-events-none absolute inset-0 hidden h-full w-full sm:block"
    />
  );
}

/** How many products the customer has saved, with the way to them. */
export default function FavoritesTile({ className }: { className?: string }) {
  const { status } = useSession();
  const { favorites } = useCart();
  const { t } = useLocale();
  const title = t('home.tile_favorites', 'Favorites');

  if (status === 'unauthenticated') {
    return (
      <BentoTile title={title} titleId="home-tile-favorites" className={className} art={<BrushHeart />}>
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
      <BentoTile title={title} titleId="home-tile-favorites" className={className} art={<BrushHeart />}>
        <SkeletonLine className="w-2/3" />
      </BentoTile>
    );
  }

  if (favorites.length === 0) {
    return (
      <BentoTile title={title} titleId="home-tile-favorites" className={className} art={<BrushHeart />}>
        <p className="font-geist text-[15px] leading-relaxed text-ink-muted">
          {t('home.favorites_empty', 'Tap the heart on any product to save it here.')}
        </p>
      </BentoTile>
    );
  }

  return (
    <BentoTile title={title} titleId="home-tile-favorites" className={className} art={<BrushHeart />}>
      <p className="font-geist text-[15px] leading-relaxed text-ink-muted">
        {t('home.favorites_saved_hint', 'The pieces you saved are waiting for you.')}
      </p>
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
