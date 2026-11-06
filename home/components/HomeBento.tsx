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
 * The close of the page. Desktop: account and cart on top, favorites and socials below,
 * best sellers filling the right half. Phones: account and cart side by side, then the rest full width.
 */
export default function HomeBento({ bestsellers }: { bestsellers: ProductSummary[] }) {
  const { t } = useLocale();

  return (
    <section aria-labelledby="home-bento-title" className={CONTAINER}>
      <SectionHeading id="home-bento-title" title={t('home.bento_title', 'Your corner')} />

      <div className="mt-6 grid grid-cols-1 gap-3 sm:mt-8 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        <ProfileTile className="lg:col-start-1 lg:row-start-1" />
        <CartTile className="lg:col-start-2 lg:row-start-1" />
        <BestSellersTile products={bestsellers} className="sm:col-span-2 lg:col-start-3 lg:row-span-2 lg:row-start-1" />
        <FavoritesTile className="lg:col-start-1 lg:row-start-2" />
        <SocialsTile className="lg:col-start-2 lg:row-start-2" />
      </div>
    </section>
  );
}
