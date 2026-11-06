'use client';

import React, { useRef } from 'react';
import { useLocale } from '@/context/CurrencyContext';
import { useGlassModal } from '@/home/components/useGlassModal';
import { translateCategory } from '@/lib/translations';
import {
  getPriceOptions,
  hasActiveFilters,
  NO_FILTERS,
  type ShopCategory,
  type ShopFilters,
  type ShopSort,
} from './shopFilters';

const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink';

function OptionRow({
  label,
  detail,
  selected,
  onClick,
}: {
  label: string;
  detail?: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`group flex h-11 w-full cursor-pointer items-center justify-between gap-3 px-3 text-left ${focusRing}`}
    >
      <span className={`min-w-0 truncate font-geist text-[15px] font-medium transition-colors group-hover:text-logo-purple ${selected ? 'text-logo-purple' : 'text-ink'}`}>
        {label}
      </span>
      <span className="flex shrink-0 items-center gap-2">
        {detail && <span className="font-geist text-[13px] tabular-nums text-ink-muted">{detail}</span>}
        <span className="flex w-3 justify-center">
          {selected && <i aria-hidden="true" className="fa-solid fa-check text-[12px] text-logo-purple" />}
        </span>
      </span>
    </button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-ink/15 pt-4 first:border-t-0 first:pt-0">
      <h3>
        <span className="block px-3 pb-1.5 font-geist text-[13px] font-semibold text-ink">{title}</span>
      </h3>
      {children}
    </section>
  );
}

interface ShopFilterDrawerProps {
  open: boolean;
  onClose: () => void;
  filters: ShopFilters;
  categories: ShopCategory[];
  total: number;
  /** A filter change is loading on the server. */
  pending: boolean;
  onChange: (next: ShopFilters) => void;
}

/** All shop filters, in a glass drawer from the right. Choices apply straight away. */
export default function ShopFilterDrawer({
  open,
  onClose,
  filters,
  categories,
  total,
  pending,
  onChange,
}: ShopFilterDrawerProps) {
  const { formatPrice, language, t } = useLocale();
  const panelRef = useRef<HTMLDivElement>(null);
  const slidIn = useGlassModal({ open, onClose, panelRef, initialFocusRef: panelRef });

  const update = (next: Partial<ShopFilters>) => onChange({ ...filters, ...next });

  const sortOptions: { value: ShopSort; label: string }[] = [
    { value: 'newest', label: t('shop.sort_newest', 'Newest') },
    { value: 'relevancy', label: t('shop.sort_bestsellers', 'Bestsellers') },
    { value: 'price-asc', label: t('shop.sort_price_asc', 'Lowest Price') },
    { value: 'price-desc', label: t('shop.sort_price_desc', 'Highest Price') },
    { value: 'rating', label: t('shop.sort_rating', 'Highest Rated') },
  ];

  // Hide empty categories so nobody lands on a blank page, but keep the one in use visible.
  const visibleCategories = categories.filter(
    (category) => category.productCount > 0 || category.name.toLowerCase() === filters.category.toLowerCase()
  );

  const showLabel =
    total === 1
      ? t('shop.show_one', 'Show 1 product')
      : t('shop.show_count', 'Show {count} products').replace('{count}', String(total));

  return (
    <div
      inert={!open}
      className={`fixed inset-0 z-[9998] transition-[visibility] duration-300 ${open ? 'visible' : 'invisible'}`}
    >
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`absolute inset-0 bg-[#141210]/25 backdrop-blur-md transition-opacity duration-300 motion-reduce:transition-none ${slidIn ? 'opacity-100' : 'opacity-0'}`}
      />

      <aside
        ref={panelRef}
        tabIndex={-1}
        // It takes focus on open for screen readers, and shows no ring because it isn't a control.
        style={{ outline: 'none' }}
        role="dialog"
        aria-modal="true"
        aria-label={t('shop.filters', 'Filters')}
        className={`absolute inset-y-0 right-0 flex w-full max-w-[400px] flex-col overflow-hidden glass-veil shadow-[-6px_0_24px_rgba(20,18,16,0.18),inset_2px_0_2px_rgba(255,255,255,0.7)] transition-transform duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${slidIn ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <header className="flex h-16 shrink-0 items-center justify-between gap-3 pl-6 pr-3">
          <h2>
            <span className="block font-display text-[24px] font-bold tracking-tight text-ink">
              {t('shop.filters', 'Filters')}
            </span>
          </h2>
          <button
            type="button"
            aria-label={t('auth.close', 'Close')}
            onClick={onClose}
            className={`group flex h-10 w-10 cursor-pointer items-center justify-center rounded-full ${focusRing}`}
          >
            <i aria-hidden="true" className="fa-solid fa-xmark text-[18px] text-ink transition-colors group-hover:text-logo-purple" />
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto no-scrollbar px-3 pb-4">
          <Section title={t('shop.category', 'Category')}>
            <OptionRow
              label={t('shop.all_products', 'All products')}
              selected={!filters.category}
              onClick={() => update({ category: '' })}
            />
            {visibleCategories.map((category) => (
              <OptionRow
                key={category.id}
                label={translateCategory(category.name, language)}
                detail={String(category.productCount)}
                selected={category.name.toLowerCase() === filters.category.toLowerCase()}
                onClick={() => update({ category: category.name })}
              />
            ))}
          </Section>

          <Section title={t('shop.price', 'Price')}>
            {getPriceOptions(t, formatPrice).map((option) => (
              <OptionRow
                key={option.value}
                label={option.label}
                selected={filters.price === option.value}
                onClick={() => update({ price: option.value })}
              />
            ))}
          </Section>

          <Section title={t('shop.offers', 'Offers')}>
            <OptionRow
              label={t('shop.free_delivery_short', 'Free delivery')}
              selected={filters.freeShipping}
              onClick={() => update({ freeShipping: !filters.freeShipping })}
            />
            <OptionRow
              label={t('shop.on_sale', 'On sale')}
              selected={filters.onSale}
              onClick={() => update({ onSale: !filters.onSale })}
            />
          </Section>

          <Section title={t('shop.sort', 'Sort')}>
            {sortOptions.map((option) => (
              <OptionRow
                key={option.value}
                label={option.label}
                selected={filters.sort === option.value}
                onClick={() => update({ sort: option.value })}
              />
            ))}
          </Section>
        </div>

        <footer className="flex shrink-0 items-center gap-3 border-t border-ink/15 p-4">
          {hasActiveFilters(filters) && (
            <button
              type="button"
              onClick={() => onChange(NO_FILTERS)}
              className={`group shrink-0 cursor-pointer rounded-full px-2 py-1 ${focusRing}`}
            >
              <span className="font-geist text-[14px] font-semibold text-ink underline underline-offset-2 transition-colors group-hover:text-logo-purple">
                {t('shop.clear_all', 'Clear all')}
              </span>
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-busy={pending}
            className={`h-12 min-w-0 flex-1 cursor-pointer bg-ink-fill px-4 transition-colors hover:shadow-[0_8px_22px_rgba(231,169,59,0.45)] ${focusRing}`}
          >
            <span aria-live="polite" className="block truncate font-geist text-[15px] font-semibold text-white">
              {pending ? t('shop.updating', 'Updating…') : showLabel}
            </span>
          </button>
        </footer>
      </aside>
    </div>
  );
}
