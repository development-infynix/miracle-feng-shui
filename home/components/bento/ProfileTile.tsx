'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { useLocale } from '@/context/CurrencyContext';
import { PillLink } from '../homeUi';
import { BentoTile, SignInPrompt, SkeletonLine } from './BentoTile';

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase() || '?';
}

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
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-logo-purple font-display text-[18px] text-white"
        >
          {initialsOf(name)}
        </span>
        <span className="min-w-0">
          <span className="block truncate font-geist text-[16px] font-semibold text-ink">{name}</span>
          {session.user.email && (
            <span className="block truncate font-geist text-[14px] text-ink-muted">{session.user.email}</span>
          )}
        </span>
      </div>
      <div className="mt-auto flex flex-wrap gap-2 pt-5">
        <PillLink href="/profile?tab=orders">{t('home.my_orders', 'Orders')}</PillLink>
        <PillLink href="/profile?tab=settings" variant="outline">
          {t('home.settings', 'Settings')}
        </PillLink>
      </div>
    </BentoTile>
  );
}
