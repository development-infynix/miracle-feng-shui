'use client';

import React from 'react';
import type { ProductSummary } from '@/lib/placeholder-data';
import { useLocale } from '@/context/CurrencyContext';
import { CONTAINER, SectionHeading } from './homeUi';
import ProfileTile from './bento/ProfileTile';
import CartTile from './bento/CartTile';
import BestSellersTile from './bento/BestSellersTile';
import FavoritesTile from './bento/FavoritesTile';
import SocialsTile from './bento/SocialsTile';

/**
 * The close of the page. Tablet and up: best sellers as a full-width shelf on top, then account,
 * cart, favorites and socials in one row (two by two on tablets). Phones: one column, account first.
 */
export default function HomeBento({ bestsellers }: { bestsellers: ProductSummary[] }) {
  const { t } = useLocale();

  return (
    <section aria-labelledby="home-bento-title" className={CONTAINER}>
      <SectionHeading id="home-bento-title" title={t('home.bento_title', 'Your corner')} />

      <div className="mt-6 grid grid-cols-1 gap-4 sm:mt-8 sm:grid-cols-2 lg:grid-cols-4">
        <ProfileTile />
        <CartTile />
        <BestSellersTile products={bestsellers} className="sm:order-first sm:col-span-2 lg:col-span-4" />
        <FavoritesTile />
        <SocialsTile />
      </div>
    </section>
  );
}
