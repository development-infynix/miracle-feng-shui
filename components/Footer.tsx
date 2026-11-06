'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useLocale } from '@/context/CurrencyContext';
import type { NavCategory } from '@/lib/nav-categories';
import { FACEBOOK_URL, INSTAGRAM_URL } from '@/lib/social-links';
import { translateCategory } from '@/lib/translations';

const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white';

function FooterLink({ href, label, onClick }: {
  href: string;
  label: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}) {
  return (
    <li>
      <Link href={href} onClick={onClick} className={`group inline-flex min-h-9 items-center rounded-md py-1 ${focusRing}`}>
        <span className="text-[15px] leading-snug text-white/85 transition-colors group-hover:text-white group-hover:underline">{label}</span>
      </Link>
    </li>
  );
}

function FooterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3>
        <span className="block pb-2 text-[15px] font-bold text-white">{title}</span>
      </h3>
      <ul className="list-none">{children}</ul>
    </div>
  );
}

/** The end of the store, in a marketplace layout: a dark band with the brand and link columns, then a darker legal bar. */
export function Footer({ categories }: { categories: NavCategory[] }) {
  const pathname = usePathname();
  const { status } = useSession();
  const { country, language, t } = useLocale();

  // The admin has its own layout, and the profile page is a focused account screen.
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/profile')) return null;

  const region =
    country === 'UAE'
      ? t('footer.uae_display', 'United Arab Emirates | AED (د.إ)')
      : t('footer.india_display', 'India | INR (₹)');

  // Account pages need a login, so guests get the sign in modal instead of being sent away.
  const requireLogin: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
    if (status !== 'unauthenticated') return;
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('open-auth-modal', { detail: { mode: 'signin' } }));
  };

  return (
    <footer className="mt-16 w-full">
      <div className="bg-[#2B154C] text-white">
        <div className="etsy-container grid grid-cols-2 gap-x-6 gap-y-10 py-12 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:gap-x-10 md:py-14">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className={`flex w-fit items-center gap-3 rounded-full ${focusRing}`}>
              <span className="block h-11 w-11 overflow-hidden rounded-full bg-white">
                {/* The SVG has a transparent margin around its circle; the scale crops it off. */}
                <img src="/images/logofull.svg" alt="" className="h-full w-full scale-[1.23] object-cover" />
              </span>
              <span className="font-serif text-[22px] font-bold tracking-tight text-white">Miracle feng shui</span>
            </Link>
            <p className="mt-4 max-w-[34ch] text-[15px] leading-relaxed text-white/80">
              {t('footer.tagline', 'Feng shui decor, jewelry, candles, crystals and books.')}
            </p>
            <div className="mt-4 flex items-center gap-2">
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className={`flex h-10 w-10 items-center justify-center rounded-full bg-white transition-opacity hover:opacity-85 ${focusRing}`}>
                <img src="/images/instagram-badge.svg" alt="" className="h-6 w-6" />
              </a>
              <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className={`flex h-10 w-10 items-center justify-center rounded-full bg-white transition-opacity hover:opacity-85 ${focusRing}`}>
                <img src="/images/facebook.svg" alt="" className="h-6 w-6" />
              </a>
            </div>
          </div>

          <FooterGroup title={t('footer.shop', 'Shop')}>
            {categories.map((category) => (
              <FooterLink key={category.id} href={`/shop?category=${encodeURIComponent(category.name)}`} label={translateCategory(category.name, language)} />
            ))}
            <FooterLink href="/shop" label={t('footer.all_products', 'All products')} />
          </FooterGroup>

          <FooterGroup title={t('footer.account', 'Your account')}>
            <FooterLink href="/profile?tab=orders" label={t('nav.my_orders', 'My orders')} onClick={requireLogin} />
            <FooterLink href="/profile?tab=favorites" label={t('nav.favorites', 'Favorites')} onClick={requireLogin} />
            <FooterLink href="/cart" label={t('nav.cart', 'Cart')} onClick={requireLogin} />
          </FooterGroup>

          <FooterGroup title={t('footer.about', 'About')}>
            <FooterLink href="/about" label={t('footer.about_miracle', 'About Miracle feng shui')} />
            <FooterLink href="/return-policy" label={t('footer.cancellation_policy', 'Cancellation & Return Policy')} />
          </FooterGroup>
        </div>
      </div>

      <div className="bg-[#1D0E35] text-white/80">
        <div className="etsy-container flex flex-col gap-3 py-4 text-[13px] md:flex-row md:items-center md:justify-between">
          <p className="inline-flex items-center gap-2 tabular-nums">
            <i aria-hidden="true" className="fa-solid fa-globe text-[13px]" />
            {region}
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
            <span>
              © {new Date().getFullYear()} Miracle feng shui. {t('footer.all_rights', 'All rights reserved.')}
            </span>
            <Link href="/terms" className={`rounded-sm underline-offset-2 hover:text-white hover:underline ${focusRing}`}>
              {t('footer.terms', 'Terms & Conditions')}
            </Link>
            <Link href="/privacy-policy" className={`rounded-sm underline-offset-2 hover:text-white hover:underline ${focusRing}`}>
              {t('footer.privacy', 'Privacy Policy')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
