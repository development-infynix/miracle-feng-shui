'use client';

import React from 'react';
import { useLocale } from '@/context/CurrencyContext';
import { FACEBOOK_URL, INSTAGRAM_URL } from '@/lib/social-links';
import { BentoTile } from './BentoTile';

const handleOf = (url: string) => url.replace(/\/+$/, '').split('/').pop() ?? '';

const PLATFORMS = [
  { name: 'Instagram', url: INSTAGRAM_URL, icon: '/images/instagram-badge.svg', handle: `@${handleOf(INSTAGRAM_URL)}` },
  { name: 'Facebook', url: FACEBOOK_URL, icon: '/images/facebook.svg', handle: handleOf(FACEBOOK_URL) },
];

const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone';

/** Three neighbours, drawn in stone line on the purple, standing along the bottom of the tile. */
function Neighbours() {
  return (
    <div aria-hidden="true" className="pointer-events-none -mx-5 -mb-5 mt-6 flex items-end justify-center sm:-mx-6 sm:-mb-6">
      <img src="/illustrations/peep-coffee.svg" alt="" loading="lazy" className="-mr-[12%] h-32 w-auto sm:h-36" />
      <img src="/illustrations/peep-explaining.svg" alt="" loading="lazy" className="relative z-10 h-36 w-auto sm:h-40" />
      <img src="/illustrations/peep-pointing.svg" alt="" loading="lazy" className="-ml-[12%] h-32 w-auto sm:h-36" />
    </div>
  );
}

/** A card for each social account the shop really has, on the purple tile with its drawing. */
export default function SocialsTile({ className }: { className?: string }) {
  const { t } = useLocale();

  return (
    <BentoTile
      tone="purple"
      title={t('home.tile_socials', 'Follow along')}
      titleId="home-tile-socials"
      className={className}
      art={<Neighbours />}
    >
      <ul className="grid list-none gap-2 sm:grid-cols-2 lg:grid-cols-1">
        {PLATFORMS.map((platform) => (
          <li key={platform.name}>
            <a
              href={platform.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`group flex items-center gap-3 border border-stone/30 p-3 transition-colors hover:bg-white/10 ${focusRing}`}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-stone">
                <img src={platform.icon} alt="" className="h-6 w-6" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-geist text-[15px] font-semibold text-stone">{platform.name}</span>
                <span className="block truncate font-geist text-[13px] text-stone/75">{platform.handle}</span>
              </span>
              <i
                aria-hidden="true"
                className="fa-solid fa-arrow-up-right-from-square text-[12px] text-stone/75 transition-colors group-hover:text-stone"
              />
              <span className="sr-only">{t('home.opens_new_tab', '(opens in a new tab)')}</span>
            </a>
          </li>
        ))}
      </ul>
    </BentoTile>
  );
}
