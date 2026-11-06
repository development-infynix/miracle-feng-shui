'use client';

import React, { useCallback, useRef, useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { useLocale } from '@/context/CurrencyContext';
import { translateCategory } from '@/lib/translations';
import { headerFocus, headerTextButton, useDismiss } from './useDismiss';

/** "Categories" in the header: a dropdown with every category, plus All products. */
export default function NavCategoriesMenu() {
  const { categoriesList } = useStore();
  const { language, t } = useLocale();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(open, close, panelRef, triggerRef);

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls="header-categories-panel"
        onClick={() => setOpen((v) => !v)}
        className={`${headerTextButton} ${open ? 'bg-[#222222]/[0.07]' : ''}`}
      >
        <i aria-hidden="true" className="fa-solid fa-bars text-[16px]" />
        <span className="text-[15px] font-semibold">{t('nav.categories', 'Categories')}</span>
      </button>

      {open && (
        <div
          ref={panelRef}
          id="header-categories-panel"
          className="absolute left-0 top-full z-50 mt-2 w-[min(640px,calc(100vw-48px))] rounded-2xl border border-[#E1E3DF] bg-white p-3 shadow-[0_12px_32px_rgba(34,34,34,0.16)]"
        >
          {categoriesList.length > 0 ? (
            <ul className="grid list-none grid-cols-2 gap-1 sm:grid-cols-3">
              {categoriesList.map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/shop?category=${encodeURIComponent(category.name)}`}
                    onClick={close}
                    className={`flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-[15px] text-[#222222] hover:bg-[#F5F5F1] ${headerFocus}`}
                  >
                    <span className="truncate">{translateCategory(category.name, language)}</span>
                    {typeof category.productCount === 'number' && category.productCount > 0 && (
                      <span className="shrink-0 text-[13px] text-[#595959] tabular-nums">{category.productCount}</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-3 py-2.5 text-[15px] text-[#595959]">{t('nav.categories_loading', 'Loading categories…')}</p>
          )}
          <div className="mt-2 border-t border-[#E1E3DF] pt-2">
            <Link
              href="/shop"
              onClick={close}
              className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-[15px] font-semibold text-[#222222] hover:bg-[#F5F5F1] ${headerFocus}`}
            >
              {t('nav.all_products', 'All products')}
              <i aria-hidden="true" className="fa-solid fa-arrow-right text-[13px]" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
