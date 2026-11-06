'use client';

import React, { useCallback, useRef, useState } from 'react';
import Link from 'next/link';
import { useLocale } from '@/context/CurrencyContext';
import { initialsOf } from '@/lib/initials';
import { navFocus, navPanel, navPanelClosed, navPanelOpen, panelRow, panelRowLabel, useDismiss } from './navUi';

/** The signed-in customer's avatar, which drops a panel with their name, orders, profile and Sign out. */
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
        aria-controls="nav-account-panel"
        onClick={() => setOpen((prev) => !prev)}
        className={`flex h-10 w-10 items-center justify-center rounded-full cursor-pointer ${navFocus}`}
      >
        <span
          aria-hidden="true"
          className={`flex h-9 w-9 items-center justify-center rounded-full bg-logo-purple font-display text-[13px] font-bold tracking-[0.02em] text-white ring-offset-2 ring-offset-stone transition-shadow ${open ? 'ring-2 ring-ink' : ''}`}
        >
          {initialsOf(name)}
        </span>
      </button>

      <div
        ref={panelRef}
        id="nav-account-panel"
        className={`absolute right-0 top-full mt-3 w-72 p-2 ${navPanel} ${open ? navPanelOpen : navPanelClosed}`}
      >
        <div className="border-b border-ink/10 px-3 pb-3 pt-2">
          <p className="truncate font-geist text-[15px] font-semibold text-ink">{name}</p>
          {email && <p className="mt-0.5 truncate font-geist text-[13px] text-ink-muted">{email}</p>}
        </div>
        <div className="py-1.5">
          <Link href="/profile?tab=orders" onClick={close} className={panelRow}>
            <i aria-hidden="true" className="fa-regular fa-calendar-check w-4 text-center text-[14px] text-ink-muted" />
            <span className={panelRowLabel}>{t('nav.my_orders', 'My orders')}</span>
          </Link>
          <Link href="/profile" onClick={close} className={panelRow}>
            <i aria-hidden="true" className="fa-regular fa-user w-4 text-center text-[14px] text-ink-muted" />
            <span className={panelRowLabel}>{t('profile.title', 'Your profile')}</span>
          </Link>
        </div>
        <div className="border-t border-ink/10 pt-1.5">
          <button
            type="button"
            onClick={() => {
              close();
              onSignOut();
            }}
            className={panelRow}
          >
            <i aria-hidden="true" className="fa-solid fa-arrow-right-from-bracket w-4 text-center text-[14px] text-ink-muted" />
            <span className={panelRowLabel}>{t('nav.sign_out', 'Sign out')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
