'use client';

import React from 'react';
import Link from 'next/link';
import { useLocale } from '@/context/CurrencyContext';
import { focusRing } from '../homeUi';
import { BentoTile } from './BentoTile';

type Panel = 'charcoal' | 'stone' | 'purple' | 'card';

// Each card's drawing sits on a panel: stone line on the dark ones, ink line on the light one.
const PANEL: Record<Panel, string> = {
  charcoal: 'bg-ink-fill',
  stone: 'bg-[#E2DDD1]',
  // The logo's own purple, so its disc melts into the panel and only the white figure shows.
  purple: 'bg-logo-purple',
  // All categories: the same beige as its card's own background.
  card: 'bg-[#E5E1D7]',
};

/**
 * For guests, where signed-in customers see four best sellers: three ways into the shop, each a
 * drawn card (New arrivals has its own section higher up the page). A row of 3 square cards from
 * tablets up, which fills the tile's height beside Follow along. Phones: Best sellers runs full
 * width as a wide card, with the other two side by side below it.
 */
export default function ExploreTile({ className }: { className?: string }) {
  const { t } = useLocale();

  const cards: { key: string; href: string; art: string; panel: Panel; title: string; line: string }[] = [
    {
      key: 'bestsellers',
      href: '/shop?sort=relevancy',
      art: '/illustrations/explore-bestsellers.svg',
      panel: 'charcoal',
      title: t('home.explore_bestsellers', 'Best sellers'),
      line: t('home.explore_bestsellers_line', 'Our most-loved pieces'),
    },
    {
      key: 'picks',
      href: '/shop?picks=true',
      art: '/images/logofull.svg', // The shop's own seal: these are the pieces it vouches for. On the logo's purple.
      panel: 'purple',
      title: t('home.explore_picks', 'Miracle picks'),
      line: t('home.explore_picks_line', 'Chosen by our team'),
    },
    {
      key: 'categories',
      href: '/shop?browse=categories',
      art: '/images/all-categories-card.svg', // A full card with its own background: it fills the panel.
      panel: 'card',
      title: t('home.explore_categories', 'All categories'),
      line: t('home.explore_categories_line', 'Every corner of the shop'),
    },
  ];

  return (
    <BentoTile title={t('home.tile_explore', 'Explore the shop')} titleId="home-tile-explore" className={className}>
      <ul className="grid list-none grid-cols-2 gap-x-3 gap-y-4 sm:grid-cols-3 sm:gap-x-4">
        {cards.map((card, index) => (
          <li key={card.key} className={`min-w-0 ${index === 0 ? 'max-sm:col-span-2' : ''}`}>
            <Link href={card.href} className={`group block ${focusRing}`}>
              <span className={`flex items-center justify-center overflow-hidden ${index === 0 ? 'aspect-[2/1] sm:aspect-square' : 'aspect-square'} ${PANEL[card.panel]}`}>
                <img
                  src={card.art}
                  alt=""
                  loading="lazy"
                  className={`w-auto transition-transform duration-500 motion-reduce:transition-none ${
                    // The logo's disc is invisible on its purple, so it's scaled past the panel's edge to bring the figure up to size.
                    card.key === 'picks'
                      ? 'h-full scale-[1.1] group-hover:scale-[1.15]'
                      : card.key === 'categories'
                        ? 'h-full w-full object-cover group-hover:scale-[1.04]'
                        : 'h-[78%] group-hover:scale-[1.05]'
                  }`}
                />
              </span>
              <span className="mt-2 flex items-center gap-1.5">
                <span className="truncate font-geist text-[14px] font-semibold text-ink transition-colors group-hover:text-logo-purple sm:text-[15px]">
                  {card.title}
                </span>
                <i
                  aria-hidden="true"
                  className="fa-solid fa-arrow-right text-[11px] text-ink transition-transform group-hover:translate-x-0.5 group-hover:text-logo-purple"
                />
              </span>
              <span className="block truncate font-geist text-[13px] text-ink-muted sm:text-[14px]">{card.line}</span>
            </Link>
          </li>
        ))}
      </ul>
    </BentoTile>
  );
}
