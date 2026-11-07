'use client';

import React from 'react';
import { useLocale } from '@/context/CurrencyContext';
import type { Country } from '@/lib/translations';
import { navFocus } from './navUi';

/** A round flag for India or the UAE. */
export function RegionFlag({ country, size = 20 }: { country: Country; size?: number }) {
  const clip = `region-flag-${country}`;
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 32 32" className="shrink-0 rounded-full ring-1 ring-ink/15">
      <defs>
        <clipPath id={clip}>
          <circle cx="16" cy="16" r="16" />
        </clipPath>
      </defs>
      {country === 'India' ? (
        <g clipPath={`url(#${clip})`}>
          <rect width="32" height="11" fill="#FF9933" />
          <rect y="11" width="32" height="10" fill="#FFFFFF" />
          <rect y="21" width="32" height="11" fill="#138808" />
          <circle cx="16" cy="16" r="3.6" fill="none" stroke="#000080" strokeWidth="1.1" />
          <circle cx="16" cy="16" r="0.9" fill="#000080" />
        </g>
      ) : (
        <g clipPath={`url(#${clip})`}>
          <rect width="32" height="11" fill="#00732F" />
          <rect y="11" width="32" height="10" fill="#FFFFFF" />
          <rect y="21" width="32" height="11" fill="#000000" />
          <rect width="10" height="32" fill="#FF0000" />
        </g>
      )}
    </svg>
  );
}

const REGIONS: { country: Country; label: string; currency: string }[] = [
  { country: 'India', label: 'INR', currency: '₹' },
  { country: 'UAE', label: 'AED', currency: 'د.إ' },
];

/**
 * India / UAE as two side-by-side choices with their flags, for the account menu and the phone menu.
 * UAE shows prices in AED for convenience; every order is still charged in rupees.
 */
export default function RegionOptions({ onPicked, compact = false }: { onPicked?: () => void; compact?: boolean }) {
  const { country, setCountry, t } = useLocale();

  // Compact: a two-part switch with no heading or note, for the phone menu's foot (which shows the note itself).
  if (compact) {
    return (
      <div role="group" aria-label={t('nav.region_settings', 'Region & currency')} className="flex h-11 border border-ink/20">
        {REGIONS.map((region) => {
          const selected = region.country === country;
          return (
            <button
              key={region.country}
              type="button"
              aria-pressed={selected}
              onClick={() => {
                setCountry(region.country);
                onPicked?.();
              }}
              className={`flex cursor-pointer items-center gap-1.5 px-3 transition-colors ${
                selected ? 'bg-ink-fill' : 'hover:bg-white'
              } ${navFocus}`}
            >
              <RegionFlag country={region.country} size={16} />
              <span className={`font-geist text-[15px] font-semibold tabular-nums ${selected ? 'text-stone' : 'text-ink'}`}>
                {region.label}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div>
      <p className="px-3 pb-1.5 pt-1 font-geist text-[13px] font-medium text-ink-muted">{t('nav.region_settings', 'Region & currency')}</p>
      <div role="group" aria-label={t('nav.region_settings', 'Region & currency')} className="grid grid-cols-2 gap-1.5 px-1.5">
        {REGIONS.map((region) => {
          const selected = region.country === country;
          return (
            <button
              key={region.country}
              type="button"
              aria-pressed={selected}
              onClick={() => {
                setCountry(region.country);
                onPicked?.();
              }}
              className={`flex h-11 cursor-pointer items-center justify-center gap-2 border transition-colors ${
                selected ? 'border-ink-fill bg-ink-fill' : 'border-ink/20 hover:bg-stone'
              } ${navFocus}`}
            >
              <RegionFlag country={region.country} />
              <span className={`font-geist text-[20px] font-semibold tabular-nums ${selected ? 'text-stone' : 'text-ink'}`}>
                {region.label} <span className="font-normal opacity-80">{region.currency}</span>
              </span>
            </button>
          );
        })}
      </div>
      <p className="px-3 pb-1 pt-2 font-geist text-[12px] leading-relaxed text-ink-muted">
        {t('nav.region_note', 'AED prices are shown for your convenience. Orders are charged in Indian rupees (INR).')}
      </p>
    </div>
  );
}
