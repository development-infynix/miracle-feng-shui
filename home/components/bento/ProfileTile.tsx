'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { useLocale } from '@/context/CurrencyContext';
import { initialsOf } from '@/lib/initials';
import { PillLink } from '../homeUi';
import { BentoTile, SignInPrompt, SkeletonLine } from './BentoTile';

/** The customer's account: who's signed in and the way to their orders and settings. */
export default function ProfileTile({ className }: { className?: string }) {
  const { data: session, status } = useSession();
  const { t } = useLocale();
  const title = t('home.tile_account', 'Your account');

  if (status === 'loading') {
    return (
      <BentoTile title={title} titleId="home-tile-account" className={className}>
        <SkeletonLine className="w-3/4" />
        <SkeletonLine className="mt-2 w-1/2" />
      </BentoTile>
    );
  }

  if (status !== 'authenticated' || !session?.user) {
    return (
      <BentoTile title={title} titleId="home-tile-account" className={className}>
        <SignInPrompt
          reason={t('home.account_guest', 'Sign in to follow your orders and keep your saved addresses.')}
          label={t('nav.sign_in', 'Sign in')}
        />
      </BentoTile>
    );
  }

  const name = session.user.name || session.user.email?.split('@')[0] || '';

  return (
    <BentoTile title={title} titleId="home-tile-account" className={className}>
      <span className="block truncate font-geist text-[16px] font-semibold text-ink">{name}</span>
      {session.user.email && <span className="block truncate font-geist text-[14px] text-ink-muted">{session.user.email}</span>}

      {/* The initials block and the two buttons share one width (Orders and Settings side by side);
          the block grows to fill the tile's height from the email down to the buttons. */}
      <div className="mt-4 flex w-fit flex-1 flex-col gap-2">
        <span
          aria-hidden="true"
          className="flex min-h-24 w-full flex-1 items-center justify-center bg-logo-purple font-display text-[40px] font-bold leading-none tracking-[0.02em] text-white"
        >
          {initialsOf(name)}
        </span>
        <div className="flex gap-2">
          <PillLink href="/profile?tab=orders">{t('home.my_orders', 'Orders')}</PillLink>
          <PillLink href="/profile?tab=settings" variant="outline">
            {t('home.settings', 'Settings')}
          </PillLink>
        </div>
      </div>
    </BentoTile>
  );
}
