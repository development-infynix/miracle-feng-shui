'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { useLocale } from '@/context/CurrencyContext';
import { translateCategory } from '@/lib/translations';
import { headerFocus } from './useDismiss';

const row = `flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3 text-left text-[16px] text-[#222222] hover:bg-[#F5F5F1] cursor-pointer ${headerFocus}`;

interface NavMobileMenuProps {
  open: boolean;
  signedIn: boolean;
  onClose: () => void;
  onSignIn: () => void;
  onSignOut: () => void;
}

/** Phones: a panel from the left with every category, then the account links. */
export default function NavMobileMenu({ open, signedIn, onClose, onSignIn, onSignOut }: NavMobileMenuProps) {
  const { categoriesList } = useStore();
  const { language, t } = useLocale();
  const panelRef = useRef<HTMLDivElement>(null);

  // The page behind stops scrolling; Escape closes the panel.
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    panelRef.current?.focus();
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  return (
    <div className={`fixed inset-0 z-[60] md:hidden ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/40 transition-opacity duration-200 motion-reduce:transition-none ${open ? 'opacity-100' : 'opacity-0'}`}
      />
      <div
        ref={panelRef}
        id="header-mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label={t('nav.menu', 'Menu')}
        tabIndex={-1}
        className={`absolute inset-y-0 left-0 flex w-[min(340px,86vw)] flex-col bg-white shadow-xl outline-none transition-transform duration-200 ease-out motion-reduce:transition-none ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between border-b border-[#E1E3DF] px-4 py-3">
          <span className="text-[18px] font-bold text-[#222222]">{t('nav.browse_categories', 'Browse categories')}</span>
          <button
            type="button"
            aria-label={t('nav.close_menu', 'Close menu')}
            onClick={onClose}
            className={`flex h-10 w-10 items-center justify-center rounded-full text-[#222222] hover:bg-[#222222]/[0.07] ${headerFocus}`}
          >
            <i aria-hidden="true" className="fa-solid fa-xmark text-[18px]" />
          </button>
        </div>

        <nav aria-label={t('nav.categories', 'Categories')} className="flex-1 overflow-y-auto px-2 py-2">
          {categoriesList.map((category) => (
            <Link key={category.id} href={`/shop?category=${encodeURIComponent(category.name)}`} onClick={onClose} className={row}>
              <span className="truncate">{translateCategory(category.name, language)}</span>
              <i aria-hidden="true" className="fa-solid fa-chevron-right text-[12px] text-[#595959]" />
            </Link>
          ))}
          <Link href="/shop" onClick={onClose} className={`${row} font-semibold`}>
            {t('nav.all_products', 'All products')}
            <i aria-hidden="true" className="fa-solid fa-arrow-right text-[13px]" />
          </Link>

          <div className="my-2 border-t border-[#E1E3DF]" />

          {signedIn ? (
            <>
              <Link href="/profile?tab=orders" onClick={onClose} className={row}>
                {t('nav.my_orders', 'My orders')}
              </Link>
              <Link href="/profile" onClick={onClose} className={row}>
                {t('profile.title', 'Your profile')}
              </Link>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSignOut();
                }}
                className={row}
              >
                {t('nav.sign_out', 'Sign out')}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                onClose();
                onSignIn();
              }}
              className={row}
            >
              {t('nav.signin', 'Sign in')}
            </button>
          )}
        </nav>
      </div>
    </div>
  );
}
