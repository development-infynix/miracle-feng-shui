'use client';

import React from 'react';
import { useLocale } from '@/context/CurrencyContext';
import { CONTAINER } from './homeUi';

/** The opening: one full-width line saying what the shop is for. */
export default function HomeIntro() {
  const { t } = useLocale();

  return (
    <section aria-labelledby="home-intro-title" className={`${CONTAINER} pb-14 pt-8 sm:pb-20 sm:pt-14`}>
      <h1 id="home-intro-title">
        <span className="block font-display text-[clamp(40px,6.8vw,96px)] font-bold leading-[0.96] tracking-[-0.03em] text-ink [text-wrap:balance]">
          {t('home.intro_title', 'Bring wealth, calm and protection home.')}
        </span>
      </h1>
    </section>
  );
}
