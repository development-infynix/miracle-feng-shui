'use client';

import React, { useCallback, useRef, useState } from 'react';
import Link from 'next/link';
import type { NavCategory } from '@/lib/nav-categories';
import { useLocale } from '@/context/CurrencyContext';
import { translateCategory } from '@/lib/translations';
import { navFocus, navItem, navLabel, navLabelActive, navPanel, navPanelClosed, navPanelOpen, useDismiss } from './navUi';

/** Categories in the bar: a button that drops a panel with the 4 newest categories and View all. */
export default function NavCategoriesMenu({ categories }: { categories: NavCategory[] }) {
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
        aria-controls="nav-categories-panel"
        onClick={() => setOpen((prev) => !prev)}
        className={`inline-flex ${navItem}`}
      >
        <span className={`flex items-center gap-1.5 ${open ? navLabelActive : navLabel}`}>
          {t('nav.categories', 'Categories')}
          <i
            aria-hidden="true"
            className={`fa-solid fa-chevron-down text-[10px] transition-transform duration-200 motion-reduce:transition-none ${open ? 'rotate-180' : ''}`}
          />
        </span>
      </button>

      <div
        ref={panelRef}
        id="nav-categories-panel"
        className={`absolute left-0 top-full mt-3 w-[min(680px,calc(100vw-48px))] p-3 ${navPanel} ${open ? navPanelOpen : navPanelClosed}`}
      >
        <ul className="grid list-none grid-cols-4 gap-3">
          {categories.map((category) => {
            const name = translateCategory(category.name, language);
            return (
              <li key={category.id}>
                <Link
                  href={`/shop?category=${encodeURIComponent(category.name)}`}
                  onClick={close}
                  className={`group block rounded-[8px] ${navFocus}`}
                >
                  <span className="block aspect-[4/3] overflow-hidden rounded-[8px] bg-[#DDD8CC]">
                    {category.image ? (
                      <img
                        src={category.image}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04] motion-reduce:transition-none"
                      />
                    ) : (
                      <span aria-hidden="true" className="flex h-full w-full items-center justify-center font-display text-[32px] font-bold text-ink/25">
                        {name.charAt(0)}
                      </span>
                    )}
                  </span>
                  <span className="mt-2 block truncate font-geist text-[14px] font-medium text-ink transition-colors group-hover:text-logo-purple">
                    {name}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="mt-3 flex justify-end border-t border-ink/10 pt-3">
          <Link href="/shop" onClick={close} className={`group inline-flex items-center gap-1.5 rounded-full px-2 py-1 ${navFocus}`}>
            <span className="font-geist text-[14px] font-semibold text-ink underline decoration-[1.5px] underline-offset-[5px] transition-colors group-hover:text-logo-purple">
              {t('nav.all_products', 'All products')}
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
