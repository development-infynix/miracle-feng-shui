'use client';

import React, { useCallback, useRef, useState } from 'react';
import { useLocale } from '@/context/CurrencyContext';
import type { Country } from '@/lib/translations';
import { headerFocus, headerIconButton, useDismiss } from './useDismiss';

/** A round flag for the region button. */
function Flag({ country, size = 26 }: { country: Country; size?: number }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 32 32" className="shrink-0 overflow-hidden rounded-full ring-1 ring-[#222222]/15">
      <clipPath id={`flag-${country}`}>
        <circle cx="16" cy="16" r="16" />
      </clipPath>
      {country === 'India' ? (
        <g clipPath={`url(#flag-${country})`}>
          <rect width="32" height="11" fill="#FF9933" />
          <rect y="11" width="32" height="10" fill="#FFFFFF" />
          <rect y="21" width="32" height="11" fill="#138808" />
          <circle cx="16" cy="16" r="3.6" fill="none" stroke="#000080" strokeWidth="1.1" />
          <circle cx="16" cy="16" r="0.9" fill="#000080" />
        </g>
      ) : (
        <g clipPath={`url(#flag-${country})`}>
          <rect width="32" height="11" fill="#00732F" />
          <rect y="11" width="32" height="10" fill="#FFFFFF" />
          <rect y="21" width="32" height="11" fill="#000000" />
          <rect width="10" height="32" fill="#FF0000" />
        </g>
      )}
    </svg>
  );
}

const REGIONS: { country: Country; name: string; currency: string }[] = [
  { country: 'India', name: 'India', currency: 'INR (₹)' },
  { country: 'UAE', name: 'United Arab Emirates', currency: 'AED (د.إ)' },
];

/**
 * The region and currency picker: a round flag in the header that opens India / UAE.
 * UAE shows prices in AED for convenience; every order is still charged in rupees.
 */
export default function RegionSwitcher() {
  const { country, setCountry, t } = useLocale();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(open, close, panelRef, triggerRef);

  const current = REGIONS.find((r) => r.country === country) ?? REGIONS[0];

  return (
    <div className="relative shrink-0">
      <button
        ref={triggerRef}
        type="button"
        aria-label={t('nav.region_label', 'Region and currency: {region}').replace('{region}', `${current.name}, ${current.currency}`)}
        aria-expanded={open}
        aria-controls="header-region-panel"
        onClick={() => setOpen((v) => !v)}
        className={headerIconButton}
      >
        <Flag country={current.country} />
      </button>

      {open && (
        <div
          ref={panelRef}
          id="header-region-panel"
          className="absolute right-0 top-full z-50 mt-2 w-[min(320px,calc(100vw-32px))] rounded-2xl border border-[#E1E3DF] bg-white p-2 shadow-[0_12px_32px_rgba(34,34,34,0.16)]"
        >
          <p className="px-3 pb-2 pt-2 text-[15px] font-semibold text-[#222222]">{t('nav.region_settings', 'Region & currency')}</p>
          <ul className="list-none">
            {REGIONS.map((region) => {
              const selected = region.country === country;
              return (
                <li key={region.country}>
                  <button
                    type="button"
                    aria-pressed={selected}
                    onClick={() => {
                      setCountry(region.country);
                      close();
                    }}
                    className={`flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-[#F5F5F1] ${selected ? 'bg-[#F5F5F1]' : ''} ${headerFocus}`}
                  >
                    <Flag country={region.country} size={24} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] text-[#222222]">{region.name}</span>
                      <span className="block text-[13px] text-[#595959]">{region.currency}</span>
                    </span>
                    {selected && <i aria-hidden="true" className="fa-solid fa-check text-[13px] text-[#222222]" />}
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="px-3 pb-2 pt-2 text-[12px] leading-relaxed text-[#595959]">
            {t('nav.region_note', 'Prices in AED are shown for your convenience. Orders are charged in Indian rupees (INR).')}
          </p>
        </div>
      )}
    </div>
  );
}
