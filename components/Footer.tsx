'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useLocale } from '@/context/CurrencyContext';
import type { NavCategory } from '@/lib/nav-categories';
import { FACEBOOK_URL, INSTAGRAM_URL } from '@/lib/social-links';
import { translateCategory } from '@/lib/translations';

const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink';
const socialLink = `group flex h-9 w-9 items-center justify-center rounded-full ${focusRing}`;
const socialIcon = 'h-6 w-6 transition-opacity group-hover:opacity-75';

function FooterLink({ href, label, onClick }: {
  href: string;
  label: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}) {
  return (
    <li>
      <Link href={href} onClick={onClick} className={`group flex min-h-9 w-fit items-center rounded-md py-1 ${focusRing}`}>
        <span className="font-geist text-[15px] font-medium leading-snug text-ink transition-colors group-hover:text-logo-purple">
          {label}
        </span>
      </Link>
    </li>
  );
}

function FooterGroup({ title, className, children }: { title: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      <h3>
        <span className="block pb-1.5 font-geist text-[13px] font-semibold text-logo-purple">{title}</span>
      </h3>
      <ul className="list-none">{children}</ul>
    </div>
  );
}

/** The end of the store: a full-width sheet of the same glass as the navigation. */
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
    <footer className="mt-16 w-full overflow-hidden glass-veil shadow-[0_-6px_10px_rgba(20,18,16,0.12),inset_0_2px_0_rgba(255,255,255,0.7),inset_0_-3px_5px_rgba(20,18,16,0.12)]">
      <div className="mx-auto w-full max-w-[1280px] px-4 pt-10 sm:px-6 sm:pt-14">
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-[1.5fr_1fr_1fr_1fr] md:gap-x-10">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" aria-label="Miracle feng shui" className={`block w-fit rounded-full ${focusRing}`}>
              <span className="block h-11 w-11 overflow-hidden rounded-full">
                {/* The SVG has a transparent margin around its circle; the scale crops it off. */}
                <img src="/images/logofull.svg" alt="" className="h-full w-full scale-[1.23] object-cover" />
              </span>
            </Link>
            {/* The spacing is on a wrapper because a global heading rule overrides margins on h2. */}
            <div className="mt-4">
              <h2>
                <span className="block max-w-[22ch] font-display text-[24px] font-normal leading-tight tracking-tight text-ink [text-wrap:balance]">
                  {t('footer.tagline', 'Feng shui decor, jewelry, candles, crystals and books.')}
                </span>
              </h2>
            </div>
            <div className="-ml-1.5 mt-3 flex items-center gap-1">
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className={socialLink}>
                <img src="/images/instagram-badge.svg" alt="" className={socialIcon} />
              </a>
              <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className={socialLink}>
                <img src="/images/facebook.svg" alt="" className={socialIcon} />
              </a>
            </div>
          </div>

          <FooterGroup title={t('footer.shop', 'Shop')}>
            {categories.map((category) => (
              <FooterLink
                key={category.id}
                href={`/shop?category=${encodeURIComponent(category.name)}`}
                label={translateCategory(category.name, language)}
              />
            ))}
            <FooterLink href="/shop" label={t('footer.all_products', 'All products')} />
          </FooterGroup>

          <FooterGroup title={t('footer.account', 'Your account')}>
            <FooterLink href="/profile?tab=orders" label={t('nav.my_orders', 'My Orders')} onClick={requireLogin} />
            <FooterLink href="/profile?tab=favorites" label={t('nav.favorites', 'Favorites')} onClick={requireLogin} />
            <FooterLink href="/cart" label={t('nav.cart', 'Cart')} onClick={requireLogin} />
          </FooterGroup>

          <FooterGroup title={t('footer.about', 'About')} className="col-span-2 md:col-span-1">
            <FooterLink href="/about" label={t('footer.about_miracle', 'About Miracle feng shui')} />
            <FooterLink href="/privacy-policy" label={t('footer.privacy', 'Privacy Policy')} />
            <FooterLink href="/terms" label={t('footer.terms', 'Terms & Conditions')} />
            <FooterLink href="/return-policy" label={t('footer.cancellation_policy', 'Cancellation & Return Policy')} />
          </FooterGroup>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-ink/15 pt-4 font-geist text-[13px] text-ink-muted sm:mt-10">
          <p>
            © {new Date().getFullYear()} Miracle feng shui. {t('footer.all_rights', 'All rights reserved.')}
          </p>
          <p className="tabular-nums">{region}</p>
        </div>

        {/* The name set into the glass at full width. It sinks past the bottom edge, and it's only decoration. */}
        <svg aria-hidden="true" viewBox="0 0 1000 112" className="mt-5 block w-full select-none sm:mt-7">
          <text
            x="0"
            y="104"
            textLength="1000"
            lengthAdjust="spacingAndGlyphs"
            fontSize="136"
            fontWeight="700"
            className="fill-ink/[0.07] font-serif"
          >
            Miracle feng shui
          </text>
        </svg>
      </div>
    </footer>
  );
}
