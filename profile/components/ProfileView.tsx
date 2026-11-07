'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLocale } from '@/context/CurrencyContext';
import { useSiteHeaderHeight } from '@/lib/useSiteHeaderHeight';
import AccountDetailsCard from './AccountDetailsCard';
import AddressBookCard from './AddressBookCard';
import ChangePasswordCard from './ChangePasswordCard';
import GoogleAccountCard from './GoogleAccountCard';
import ProfileFavorites from './ProfileFavorites';
import ProfileOrders from './ProfileOrders';
import { card, focusRing, skeleton, textButton, textLabel } from './profileUi';

export type ProfileTab = 'settings' | 'favorites' | 'orders';

export interface CustomerProfile {
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
  /** False for accounts made with Google, which have no password. */
  hasPassword: boolean;
  googleLinked: boolean;
}

const TABS: ProfileTab[] = ['settings', 'favorites', 'orders'];
const glass = 'bg-white border border-[#E1E3DF] rounded-2xl';

const parseTab = (value: string | null): ProfileTab => (TABS.includes(value as ProfileTab) ? (value as ProfileTab) : 'settings');

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

export default function ProfileView() {
  const searchParams = useSearchParams();
  const { t } = useLocale();
  const headerHeight = useSiteHeaderHeight();
  const tab = parseTab(searchParams.get('tab'));
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  // A tab loads the first time it's opened, then stays mounted so going back to it is instant.
  const [opened, setOpened] = useState<ProfileTab[]>([tab]);

  if (!opened.includes(tab)) setOpened([...opened, tab]);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/auth/profile', { signal: controller.signal })
      .then((res) => res.json().then((json) => ({ ok: res.ok, json })))
      .then(({ ok, json }) => {
        if (!ok || !json.success) throw new Error('Failed to load profile');
        setProfile(json.data);
        setFailed(false);
      })
      .catch(() => {
        if (!controller.signal.aborted) setFailed(true);
      });
    return () => controller.abort();
  }, [attempt]);

  // The fixed menu would otherwise cover the bottom of the footer on phones.
  useEffect(() => {
    document.body.setAttribute('data-bottom-bar', '');
    return () => document.body.removeAttribute('data-bottom-bar');
  }, []);

  const openTab = (next: ProfileTab) => {
    const url = new URL(window.location.href);
    url.searchParams.set('tab', next);
    // Next keeps useSearchParams in step with this, without asking the server for the page again.
    window.history.replaceState(null, '', `${url.pathname}${url.search}`);
  };

  const menu: { id: ProfileTab; label: string; icon: string }[] = [
    { id: 'settings', label: t('profile.settings', 'Settings'), icon: 'fa-solid fa-gear' },
    { id: 'favorites', label: t('nav.favorites', 'Favorites'), icon: 'fa-regular fa-heart' },
    { id: 'orders', label: t('profile.orders', 'Orders'), icon: 'fa-regular fa-calendar-check' },
  ];

  const joined = profile
    ? new Date(profile.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : '';

  return (
    <div className="mx-auto w-full max-w-[1120px] px-4 pb-8 pt-4 sm:px-6 sm:pt-6">
      <h1 className="sr-only">{t('profile.title', 'Your profile')}</h1>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-8">
        <aside className="space-y-3 lg:sticky" style={{ top: headerHeight + 16 }}>
          <div className={`${glass} p-5`}>
            {profile ? (
              <div className="flex items-center gap-4 lg:block">
                <p aria-hidden="true" className="font-serif text-[40px] font-bold leading-none tracking-tight text-[#222222] lg:text-[64px]">
                  {initialsOf(profile.name)}
                </p>
                <div className="min-w-0 lg:mt-4">
                  <p className="truncate font-serif text-[20px] font-bold leading-tight tracking-tight text-[#222222] lg:text-[22px]">{profile.name}</p>
                  <p className="mt-1 flex items-center gap-2 text-[13px] text-[#222222]">
                    <i aria-hidden="true" className="fa-regular fa-envelope text-[12px] text-[#222222]" />
                    <span className="min-w-0 truncate">{profile.email}</span>
                  </p>
                  <p className="mt-1 text-[12px] text-[#595959]">
                    {t('profile.joined', 'Joined {date}').replace('{date}', joined)}
                  </p>
                </div>
              </div>
            ) : (
              <div aria-busy="true" className="space-y-2.5">
                <div className={`${skeleton} h-10 w-16`} />
                <div className={`${skeleton} h-4 w-2/3`} />
                <div className={`${skeleton} h-3 w-5/6`} />
              </div>
            )}
          </div>

          {/* Desktop: rows under the identity card. Phones use the fixed bar below instead. */}
          <nav aria-label={t('profile.title', 'Your profile')} className="hidden gap-3 lg:grid">
            {menu.map(({ id, label, icon }) => {
              const selected = tab === id;
              return (
                <button
                  key={id}
                  type="button"
                  aria-current={selected ? 'page' : undefined}
                  onClick={() => openTab(id)}
                  className={`${glass} group flex h-14 cursor-pointer items-center justify-between px-5 ${selected ? 'border-[#222222] bg-[#F5F5F1]' : ''} ${focusRing}`}
                >
                  <span className={`flex min-w-0 items-center gap-3 text-[15px] font-semibold transition-colors group-hover:underline ${selected ? 'font-bold text-[#222222]' : 'text-[#222222]'}`}>
                    <i aria-hidden="true" className={`${icon} text-[14px]`} />
                    <span className="truncate">{label}</span>
                  </span>
                  <i aria-hidden="true" className={`fa-solid fa-chevron-right text-[12px] transition-[color,transform] duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none ${selected ? 'text-[#222222]' : 'text-[#595959]'}`} />
                </button>
              );
            })}
          </nav>
        </aside>

        <div className="min-w-0">
          {failed && !profile && (
            <div className={`${card} text-center`}>
              <p role="alert" className="text-[15px] text-[#222222]">
                {t('profile.load_failed', "Couldn't load your profile.")}{' '}
                <button type="button" onClick={() => setAttempt((value) => value + 1)} className={textButton}>
                  <span className={textLabel}>{t('profile.try_again', 'Try again')}</span>
                </button>
              </p>
            </div>
          )}

          <div hidden={tab !== 'settings'} className="space-y-4 sm:space-y-5">
            {profile && (
              <>
                <AccountDetailsCard profile={profile} onSaved={(changes) => setProfile({ ...profile, ...changes })} />
                <AddressBookCard profile={profile} />
                {profile.hasPassword ? <ChangePasswordCard /> : <GoogleAccountCard email={profile.email} />}
              </>
            )}
            {!profile && !failed && (
              <div aria-busy="true" className={`${card} space-y-3`}>
                <div className={`${skeleton} h-6 w-1/3`} />
                <div className={`${skeleton} h-4 w-2/3`} />
                <div className={`${skeleton} h-4 w-1/2`} />
              </div>
            )}
          </div>
          <div hidden={tab !== 'favorites'}>{opened.includes('favorites') && <ProfileFavorites />}</div>
          <div hidden={tab !== 'orders'}>{opened.includes('orders') && <ProfileOrders />}</div>
        </div>
      </div>

      {/* Phones: the menus stay in reach, fixed to the bottom of the screen. */}
      <nav
        aria-label={t('profile.title', 'Your profile')}
        className="bg-white border border-[#E1E3DF] fixed inset-x-0 bottom-0 z-50 grid grid-cols-3 gap-1.5 px-2 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 lg:hidden"
      >
        {menu.map(({ id, label }) => {
          const selected = tab === id;
          return (
            <button
              key={id}
              type="button"
              aria-current={selected ? 'page' : undefined}
              onClick={() => openTab(id)}
              className={`group flex h-12 min-w-0 cursor-pointer items-center justify-center rounded-full px-1 ${selected ? 'bg-[#222222]' : ''} ${focusRing}`}
            >
              <span className={`truncate text-[14px] font-semibold ${selected ? 'text-white' : 'text-[#222222] transition-colors group-hover:underline'}`}>
                {label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
