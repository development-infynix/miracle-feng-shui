'use client';

import React, { useCallback, useRef, useState } from 'react';
import Link from 'next/link';
import { useLocale } from '@/context/CurrencyContext';
import { headerFocus, headerIconButton, useDismiss } from './useDismiss';

const row = `flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[15px] text-[#222222] hover:bg-[#F5F5F1] cursor-pointer ${headerFocus}`;

/** The signed-in customer's avatar: a dropdown with their name, orders, profile and Sign out. */
export default function NavAccountMenu({ name, email, onSignOut }: { name: string; email: string; onSignOut: () => void }) {
  const { t } = useLocale();
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
        aria-label={t('nav.account_menu', 'Account menu')}
        aria-expanded={open}
        aria-controls="header-account-panel"
        onClick={() => setOpen((v) => !v)}
        className={headerIconButton}
      >
        <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-full bg-[#222222] text-[13px] font-bold text-white">
          {name.charAt(0).toUpperCase() || '?'}
        </span>
      </button>

      {open && (
        <div
          ref={panelRef}
          id="header-account-panel"
          className="absolute right-0 top-full z-50 mt-2 w-72 rounded-2xl border border-[#E1E3DF] bg-white p-2 shadow-[0_12px_32px_rgba(34,34,34,0.16)]"
        >
          <div className="border-b border-[#E1E3DF] px-3 pb-3 pt-2">
            <p className="truncate text-[15px] font-semibold text-[#222222]">{name}</p>
            {email && <p className="truncate text-[13px] text-[#595959]">{email}</p>}
          </div>
          <div className="py-1">
            <Link href="/profile?tab=orders" onClick={close} className={row}>
              <i aria-hidden="true" className="fa-regular fa-calendar-check w-4 text-center text-[#595959]" />
              {t('nav.my_orders', 'My orders')}
            </Link>
            <Link href="/profile" onClick={close} className={row}>
              <i aria-hidden="true" className="fa-regular fa-user w-4 text-center text-[#595959]" />
              {t('profile.title', 'Your profile')}
            </Link>
          </div>
          <div className="border-t border-[#E1E3DF] pt-1">
            <button
              type="button"
              onClick={() => {
                close();
                onSignOut();
              }}
              className={row}
            >
              <i aria-hidden="true" className="fa-solid fa-arrow-right-from-bracket w-4 text-center text-[#595959]" />
              {t('nav.sign_out', 'Sign out')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
