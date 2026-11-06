'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useCart } from '@/context/CartContext';
import { useLocale } from '@/context/CurrencyContext';
import type { NavCategory } from '@/lib/nav-categories';
import { translateCategory } from '@/lib/translations';
import AuthModal from '@/home/components/authmodal';
import NavSearch from '@/components/nav/NavSearch';
import NavCategoriesMenu from '@/components/nav/NavCategoriesMenu';
import NavAccountMenu from '@/components/nav/NavAccountMenu';
import NavMobileMenu from '@/components/nav/NavMobileMenu';
import { headerBadge, headerFocus, headerIconButton, headerTextButton } from '@/components/nav/useDismiss';

/**
 * The site header, in a marketplace layout: brand, Categories (every category), a search bar whose
 * results drop down under it, and Sign in, or Favorites, Cart and the account menu once signed in.
 * Below it, the newest categories as quick links. Phones put the menu button and search on a second row.
 */
export function Header({ navCategories }: { navCategories: NavCategory[] }) {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) return null;
  return <SiteHeader navCategories={navCategories} pathname={pathname ?? ''} />;
}

function SiteHeader({ navCategories, pathname }: { navCategories: NavCategory[]; pathname: string }) {
  const { count, userLoggedIn, setUserLoggedIn, favorites } = useCart();
  const { data: session, status } = useSession();
  const { language, t } = useLocale();

  const [menuOpen, setMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');

  // Keep the cart's login state and the account menu's name in step with the session.
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      setUserLoggedIn(true);
      setUserName(session.user.name || session.user.email?.split('@')[0] || '');
      setUserEmail(session.user.email || '');
      // The session can hold an old name; the profile has the current one.
      fetch('/api/auth/profile')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.success && data.data?.name) setUserName(data.data.name);
        })
        .catch(() => {});
    } else if (status === 'unauthenticated') {
      setUserLoggedIn(false);
    }
  }, [status, session, setUserLoggedIn]);

  // Other parts of the site open the sign in modal with this event.
  useEffect(() => {
    const handleOpenAuth = (e: Event) => {
      setIsRegisterMode((e as CustomEvent<{ mode?: 'signin' | 'register' }>).detail?.mode === 'register');
      setShowAuthModal(true);
    };
    window.addEventListener('open-auth-modal', handleOpenAuth);
    return () => window.removeEventListener('open-auth-modal', handleOpenAuth);
  }, []);

  // A new page closes the phone menu.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const openSignIn = () => {
    setIsRegisterMode(false);
    setShowAuthModal(true);
  };
  const handleSignOut = async () => {
    await signOut({ redirect: false });
    setUserLoggedIn(false);
  };

  const brand = (
    <Link href="/" className={`flex shrink-0 items-center gap-2 rounded-full ${headerFocus}`}>
      <span className="h-8 w-8 shrink-0 overflow-hidden rounded-full md:h-10 md:w-10">
        {/* The SVG has a transparent margin around its circle; the scale crops it off. */}
        <img src="/images/logofull.svg" alt="" className="h-full w-full scale-[1.23] object-cover" />
      </span>
      <span className="font-serif whitespace-nowrap text-[19px] font-bold leading-none tracking-tight text-[#222222] md:text-[22px]">
        Miracle feng shui
      </span>
    </Link>
  );

  // Sign in for guests; Favorites, Cart and the account menu once signed in.
  const actions = userLoggedIn ? (
    <div className="flex items-center">
      <Link href="/profile?tab=favorites" aria-label={t('nav.favorites', 'Favorites')} className={headerIconButton}>
        <i aria-hidden="true" className="fa-solid fa-heart text-[20px]" />
        {favorites.length > 0 && <span className={headerBadge}>{favorites.length}</span>}
      </Link>
      <Link href="/cart" aria-label={t('nav.cart', 'Cart')} className={headerIconButton}>
        <i aria-hidden="true" className="fa-solid fa-cart-shopping text-[20px]" />
        {count > 0 && <span className={headerBadge}>{count}</span>}
      </Link>
      <NavAccountMenu name={userName} email={userEmail} onSignOut={handleSignOut} />
    </div>
  ) : status === 'loading' ? (
    <span aria-hidden="true" className="h-11 w-20" />
  ) : (
    <button type="button" onClick={openSignIn} className={headerTextButton}>
      <span className="text-[15px] font-semibold">{t('nav.signin', 'Sign in')}</span>
    </button>
  );

  return (
    <>
      <header id="site-header" className="sticky top-0 z-50 border-b border-[#E1E3DF] bg-etsy-bg-soft">
        <div className="mx-auto w-full max-w-[1380px] px-4 sm:px-6">
          {/* Tablet and up: one row */}
          <div className="hidden h-[76px] items-center gap-4 md:flex">
            {brand}
            <NavCategoriesMenu />
            <NavSearch className="min-w-0 flex-1" />
            {actions}
          </div>

          {/* Phones: brand and actions, then the menu button and search */}
          <div className="md:hidden">
            <div className="flex h-14 items-center justify-between gap-2">
              {brand}
              {actions}
            </div>
            <div className="flex items-center gap-1 pb-3">
              <button
                type="button"
                aria-label={t('nav.categories', 'Categories')}
                aria-expanded={menuOpen}
                aria-controls="header-mobile-menu"
                onClick={() => setMenuOpen(true)}
                className={`${headerIconButton} -ml-2 shrink-0`}
              >
                <i aria-hidden="true" className="fa-solid fa-bars text-[20px]" />
              </button>
              <NavSearch className="min-w-0 flex-1" />
            </div>
          </div>
        </div>

        {/* The newest categories as quick links, under the search bar (tablet and up). */}
        {navCategories.length > 0 && (
          <nav aria-label={t('nav.latest_categories', 'Latest categories')} className="hidden md:block">
            <ul className="no-scrollbar mx-auto flex h-11 max-w-[1380px] list-none items-center justify-center gap-2 overflow-x-auto px-6">
              {navCategories.map((category) => (
                <li key={category.id} className="shrink-0">
                  <Link
                    href={`/shop?category=${encodeURIComponent(category.name)}`}
                    className={`inline-flex h-9 items-center rounded-full px-4 text-[15px] font-semibold text-[#222222] transition-colors hover:bg-[#222222]/[0.07] ${headerFocus}`}
                  >
                    {translateCategory(category.name, language)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </header>

      <NavMobileMenu open={menuOpen} signedIn={userLoggedIn} onClose={closeMenu} onSignIn={openSignIn} onSignOut={handleSignOut} />

      <AuthModal
        open={showAuthModal}
        mode={isRegisterMode ? 'register' : 'signin'}
        onModeChange={(mode) => setIsRegisterMode(mode === 'register')}
        onClose={() => setShowAuthModal(false)}
        onSignedIn={({ name, email }) => {
          setUserLoggedIn(true);
          setUserName(name);
          setUserEmail(email);
          setShowAuthModal(false);
        }}
      />
    </>
  );
}
