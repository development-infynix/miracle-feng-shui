'use client';

import React from 'react';
import { useLocale } from '@/context/CurrencyContext';
import { FACEBOOK_URL, INSTAGRAM_URL } from '@/lib/social-links';
import { focusRing } from '../homeUi';
import { BentoTile } from './BentoTile';

const handleOf = (url: string) => url.replace(/\/+$/, '').split('/').pop() ?? '';

const PLATFORMS = [
  { name: 'Instagram', url: INSTAGRAM_URL, icon: '/images/instagram-badge.svg', handle: `@${handleOf(INSTAGRAM_URL)}` },
  { name: 'Facebook', url: FACEBOOK_URL, icon: '/images/facebook.svg', handle: handleOf(FACEBOOK_URL) },
];

/** A card for each social account the shop really has. */
export default function SocialsTile({ className }: { className?: string }) {
  const { t } = useLocale();

  return (
    <BentoTile title={t('home.tile_socials', 'Follow along')} titleId="home-tile-socials" className={className}>
      <ul className="grid list-none gap-2 sm:grid-cols-2 lg:grid-cols-1">
        {PLATFORMS.map((platform) => (
          <li key={platform.name}>
            <a
              href={platform.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`group flex items-center gap-3 rounded-[8px] bg-stone p-3 transition-colors hover:bg-[#E5E1D6] ${focusRing}`}
            >
              <img src={platform.icon} alt="" className="h-8 w-8 shrink-0" />
              <span className="min-w-0 flex-1">
                <span className="block font-geist text-[15px] font-semibold text-ink">{platform.name}</span>
                <span className="block truncate font-geist text-[13px] text-ink-muted">{platform.handle}</span>
              </span>
              <i
                aria-hidden="true"
                className="fa-solid fa-arrow-up-right-from-square text-[12px] text-ink-muted transition-colors group-hover:text-ink"
              />
              <span className="sr-only">{t('home.opens_new_tab', '(opens in a new tab)')}</span>
            </a>
          </li>
        ))}
      </ul>
    </BentoTile>
  );
}
