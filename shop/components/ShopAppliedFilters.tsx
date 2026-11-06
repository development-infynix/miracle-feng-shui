'use client';

import React from 'react';
import { useLocale } from '@/context/CurrencyContext';
import { translateCategory } from '@/lib/translations';
import { getPriceOptions, NO_FILTERS, type ShopFilters } from './shopFilters';

const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#3A1F62]';

interface ShopAppliedFiltersProps {
  filters: ShopFilters;
  onChange: (next: ShopFilters) => void;
}

/** Removable pills for what's narrowing the list. Sort isn't here, since it doesn't hide anything. */
export default function ShopAppliedFilters({ filters, onChange }: ShopAppliedFiltersProps) {
  const { formatPrice, language, t } = useLocale();
  const priceLabel = getPriceOptions(t, formatPrice).find((option) => option.value === filters.price)?.label;

  const applied: { key: string; label: string; clear: Partial<ShopFilters> }[] = [
    ...(filters.q ? [{ key: 'q', label: `“${filters.q}”`, clear: { q: '' } }] : []),
    ...(filters.category
      ? [{ key: 'category', label: translateCategory(filters.category, language), clear: { category: '' } }]
      : []),
    ...(filters.price !== 'all' && priceLabel
      ? [{ key: 'price', label: priceLabel, clear: { price: 'all' as const } }]
      : []),
    ...(filters.freeShipping
      ? [{ key: 'freeShipping', label: t('shop.free_delivery_short', 'Free delivery'), clear: { freeShipping: false } }]
      : []),
    ...(filters.onSale ? [{ key: 'onSale', label: t('shop.on_sale', 'On sale'), clear: { onSale: false } }] : []),
    ...(filters.picks ? [{ key: 'picks', label: t('shop.miracle_picks', 'Miracle picks'), clear: { picks: false } }] : []),
  ];

  if (applied.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {applied.map((filter) => (
        <button
          key={filter.key}
          type="button"
          aria-label={`${t('shop.remove_filter', 'Remove filter')}: ${filter.label}`}
          onClick={() => onChange({ ...filters, ...filter.clear })}
          className={`group inline-flex h-8 max-w-full cursor-pointer items-center gap-1.5 rounded-full border border-[#431769]/15 bg-[#F3ECFB] px-2.5 ${focusRing}`}
        >
          <span className="min-w-0 truncate font-outfit text-[13px] font-medium text-[#111111] transition-colors group-hover:text-[#7A2FC0]">
            {filter.label}
          </span>
          <i aria-hidden="true" className="fa-solid fa-xmark text-[11px] text-[#431769]" />
        </button>
      ))}
      <button
        type="button"
        onClick={() => onChange(NO_FILTERS)}
        className={`group h-8 cursor-pointer rounded-full px-2 ${focusRing}`}
      >
        <span className="font-outfit text-[13px] font-semibold text-[#431769] underline underline-offset-2 transition-colors group-hover:text-[#7A2FC0]">
          {t('shop.clear_all', 'Clear all')}
        </span>
      </button>
    </div>
  );
}
