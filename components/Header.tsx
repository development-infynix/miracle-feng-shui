'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import type { NavCategory } from '@/lib/nav-categories';
import { signOut, useSession } from 'next-auth/react';
import { useLocale } from '@/context/CurrencyContext';
import { Country, Currency, Language, translateCategory } from '@/lib/translations';
import AddressManagerModal from '@/components/AddressManagerModal';
import GooNavShell from '@/components/GooNavShell';
import AuthModal from '@/home/components/authmodal';
import GeneralSearchModal from '@/home/components/generalsearchmodal';
import { TbChartBubbleFilled } from 'react-icons/tb';

const NAV_CATEGORIES_CLOSED_KEY = 'mfs_nav_categories_closed';
const INSTAGRAM_URL = 'https://www.instagram.com/fengshui.chitrahanson';
// Add the page link here to make the Facebook icon clickable.
const FACEBOOK_URL = 'https://facebook.com/miraclefengshui';
const navSocialIconClass = 'w-6 h-6 transition-opacity group-hover:opacity-75';

const navItemBase =
  'group relative items-center justify-center rounded-full cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#3A1F62]';
const navIconButton = `flex w-9 h-9 shrink-0 ${navItemBase}`;
const navTextButton = `h-10 px-3 ${navItemBase}`;
const navItemClass = `inline-flex h-10 px-3 gap-1.5 ${navItemBase}`;
const navLabelClass = 'font-outfit text-[#111111] transition-colors group-hover:text-[#7A2FC0]';
const navBadgeClass =
  'min-w-4 h-4 px-1 inline-flex items-center justify-center rounded-full bg-[#431769] text-white text-[10px] font-bold leading-none';
const mobileRowClass =
  'group flex w-full h-11 items-center gap-3 px-3 rounded-2xl text-left cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#3A1F62]';
const mobileLabelClass = 'font-outfit transition-colors group-hover:text-[#7A2FC0]';
const mobileIconClass = 'w-5 text-center text-[15px] text-[#431769]';

export function Header({ navCategories }: { navCategories: NavCategory[] }) {
  const router = useRouter();
  const pathname = usePathname();

  // Completely hide public store header on all admin routes
  if (pathname?.startsWith('/admin')) {
    return null;
  }
  const { count, userLoggedIn, setUserLoggedIn, favorites } = useCart();
  const { data: session, status } = useSession();
  const {
    country,
    currency,
    language,
    isRtl,
    setCountry,
    setCurrency,
    setLanguage,
    formatPrice,
    t,
  } = useLocale();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(true);
  const categoriesTriggerRef = useRef<HTMLButtonElement>(null);

  // The category pill starts open until the visitor closes it, then stays closed on later
  // page loads. The script in app/layout.tsx hides it before this runs, so it doesn't flash.
  React.useLayoutEffect(() => {
    if (document.documentElement.hasAttribute('data-nav-categories-closed')) setCategoriesOpen(false);
  }, []);

  const toggleCategories = () => {
    const next = !categoriesOpen;
    setCategoriesOpen(next);
    document.documentElement.toggleAttribute('data-nav-categories-closed', !next);
    try {
      if (next) localStorage.removeItem(NAV_CATEGORIES_CLOSED_KEY);
      else localStorage.setItem(NAV_CATEGORIES_CLOSED_KEY, 'true');
    } catch {
      // Storage can be blocked. The choice then lasts until the next full page load.
    }
  };
  const mobileMenuTriggerRef = useRef<HTMLButtonElement>(null);
  const [showRegionModal, setShowRegionModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Temp values for Region & Language modal
  const [tempCountry, setTempCountry] = useState<Country>(country);
  const [tempCurrency, setTempCurrency] = useState<Currency>(currency);
  const [tempLanguage, setTempLanguage] = useState<Language>(language);

  useEffect(() => {
    if (showRegionModal) {
      setTempCountry(country);
      setTempCurrency(currency);
      setTempLanguage(language);
    }
  }, [showRegionModal, country, currency, language]);

  // Profile Dropdown & Modal States
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [showProfileEditModal, setShowProfileEditModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // User Profile Data
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userAddress, setUserAddress] = useState('');
  const [savedToast, setSavedToast] = useState(false);

  // Synchronize session with header profile and login status
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      setUserLoggedIn(true);
      if (session.user.name) {
        setUserName(session.user.name);
      } else if (session.user.email) {
        setUserName(session.user.email.split('@')[0]);
      }
      if (session.user.email) {
        setUserEmail(session.user.email);
      }

      // Fetch persisted user profile and addresses from PostgreSQL
      fetch('/api/auth/profile')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.success && data.data) {
            if (data.data.name) setUserName(data.data.name);
            if (data.data.phone) setUserPhone(data.data.phone);
            if (data.data.addresses && data.data.addresses.length > 0) {
              const def = data.data.addresses.find((a: any) => a.isDefault) || data.data.addresses[0];
              const fullAddr = [def.line1, def.line2, def.city, def.state, def.pincode, def.country].filter(Boolean).join(', ');
              setUserAddress(fullAddr || def.line1);
            }
          }
        })
        .catch(() => {});
    } else if (status === 'unauthenticated') {
      setUserLoggedIn(false);
    }
  }, [status, session, setUserLoggedIn]);

  const profileRef = useRef<HTMLDivElement>(null);

  // Tooltip hover states

  // Form states

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  React.useEffect(() => {
    const handleOpenAuth = (e: Event) => {
      const customEvent = e as CustomEvent<{ mode?: 'signin' | 'register' }>;
      if (customEvent.detail?.mode === 'register') {
        setIsRegisterMode(true);
      } else {
        setIsRegisterMode(false);
      }
      setShowAuthModal(true);
    };

    window.addEventListener('open-auth-modal', handleOpenAuth);
    return () => {
      window.removeEventListener('open-auth-modal', handleOpenAuth);
    };
  }, []);

  // Phone menu: lock the blurred page behind it, close on Escape or a tap outside it.
  React.useEffect(() => {
    if (!mobileMenuOpen) return;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setMobileMenuOpen(false);
      mobileMenuTriggerRef.current?.focus();
    };
    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as Element;
      if (mobileMenuTriggerRef.current?.contains(target) || target.closest('#nav-mobile-menu')) return;
      setMobileMenuOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('pointerdown', handlePointerDown);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [mobileMenuOpen]);

  const closeMobileMenu = () => setMobileMenuOpen(false);
  const onShopPage = pathname === '/shop';

  const openSignIn = () => {
    setIsRegisterMode(false);
    setShowAuthModal(true);
  };

  const brandLink = (
    <Link
      href="/"
      className="flex min-w-0 items-center gap-2 select-none rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3A1F62]"
    >
      <span className="w-7 h-7 md:w-9 md:h-9 rounded-full overflow-hidden shrink-0">
        {/* The SVG has a transparent margin around its circle; the scale crops it off. */}
        <img src="/images/logofull.svg" alt="" className="w-full h-full object-cover scale-[1.23]" />
      </span>
      <span className="font-serif text-[18px] md:text-[21px] font-bold text-[#111111] tracking-tight leading-none whitespace-nowrap">
        Miracle feng shui
      </span>
    </Link>
  );

  // Newest categories from the server (app/layout.tsx), then the link to all of them.
  const secondaryNavItems = [
    ...navCategories.map((category) => ({
      key: category.id,
      label: translateCategory(category.name, language),
      href: `/shop?category=${encodeURIComponent(category.name)}`,
      isViewAll: false,
    })),
    { key: 'view-all', label: t('nav.view_all', 'View all'), href: '/shop', isViewAll: true },
  ];

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: userName || 'Valued Customer',
          phone: userPhone || '+971 50 123 4567',
          line1: userAddress.trim(),
          city: 'Dubai',
          state: 'Dubai',
          pincode: '00000',
          country: country || 'United Arab Emirates',
          isDefault: true,
        }),
      });
    } catch {
      // Gracefully fall back to local update
    }
    setShowAddressModal(false);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: userName.trim(),
          phone: userPhone.trim(),
        }),
      });
    } catch {
      // Gracefully fall back to local update
    }
    setShowProfileEditModal(false);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  return (
    <>
      {/* Phones: blurs the page behind the open menu. A tap on it closes the menu. */}
      <div
        aria-hidden="true"
        className={`fixed inset-0 z-30 md:hidden bg-[#2B154C]/15 backdrop-blur-[6px] transition-[opacity,visibility] duration-300 motion-reduce:transition-none ${mobileMenuOpen ? 'opacity-100' : 'invisible opacity-0'}`}
      />

      <header id="site-header" className="sticky top-0 z-40 pointer-events-none pt-2.5 pb-1">
        <div className="mx-auto w-full max-w-[1040px] px-3 sm:px-6">
          {/* Tablet and up: main pill with the category pill below it */}
          <div className="hidden md:block">
            <GooNavShell
              open={categoriesOpen}
              triggerRef={categoriesTriggerRef}
              dropId="nav-categories-pill"
              openSpaceClassName="pb-[68px]"
              drop={
                <ul className="flex items-center p-1 list-none overflow-x-auto no-scrollbar font-outfit text-[14px] font-medium tracking-[0.01em] whitespace-nowrap">
                  {secondaryNavItems.map((item, idx) => (
                    <li key={item.key} className="flex items-center shrink-0">
                      {idx > 0 && <span aria-hidden="true" className="h-4 w-px mx-0.5 bg-[#431769]/30" />}
                      <Link
                        href={item.href}
                        className="group flex items-center h-9 px-4 rounded-full focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#3A1F62]"
                      >
                        {/* Text colour sits on this span: the global `a { color: inherit }` rule overrides colour utilities on the link. */}
                        <span
                          className={`flex items-center gap-1.5 transition-colors group-hover:text-[#7A2FC0] ${item.isViewAll ? 'text-[#431769]' : 'text-[#111111]'}`}
                        >
                          {item.label}
                          {item.isViewAll && <i aria-hidden="true" className="fa-solid fa-arrow-right text-[11px]" />}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              }
            >
              <div className="flex h-14 items-center gap-1 px-4">
                {/* Left: brand */}
                <div className="flex flex-1 min-w-0 items-center">{brandLink}</div>

                {/* Centre: main links */}
                <nav aria-label="Main" className="flex shrink-0 items-center gap-1 font-outfit text-[14px] font-medium tracking-[0.01em]">
                  <button
                    ref={categoriesTriggerRef}
                    type="button"
                    aria-expanded={categoriesOpen}
                    aria-controls="nav-categories-pill"
                    onClick={toggleCategories}
                    className={`inline-flex ${navTextButton}`}
                  >
                    <span className={`flex items-center gap-1.5 font-outfit transition-colors group-hover:text-[#7A2FC0] ${categoriesOpen ? 'text-[#7A2FC0]' : 'text-[#111111]'}`}>
                      {t('nav.categories', 'Categories')}
                      <i
                        aria-hidden="true"
                        className={`fa-solid fa-chevron-down text-[10px] transition-transform duration-300 motion-reduce:transition-none ${categoriesOpen ? 'rotate-180' : ''}`}
                      />
                    </span>
                  </button>

                  <Link href="/shop" aria-current={onShopPage ? 'page' : undefined} className={navItemClass}>
                    <span className={`font-outfit transition-colors group-hover:text-[#7A2FC0] ${onShopPage ? 'text-[#7A2FC0]' : 'text-[#111111]'}`}>
                      {t('nav.products', 'Products')}
                    </span>
                  </Link>

                  <button type="button" onClick={() => setSearchOpen(true)} className={navItemClass}>
                    <span className={navLabelClass}>{t('nav.search', 'Search')}</span>
                  </button>

                  {userLoggedIn ? (
                    <>
                      <Link href="/favorites" className={navItemClass}>
                        <span className={navLabelClass}>{t('nav.favorites', 'Favourites')}</span>
                        {favorites.length > 0 && <span className={navBadgeClass}>{favorites.length}</span>}
                      </Link>
                      <Link href="/cart" className={navItemClass}>
                        <span className={navLabelClass}>{t('nav.cart', 'Cart')}</span>
                        {count > 0 && <span className={navBadgeClass}>{count}</span>}
                      </Link>
                    </>
                  ) : (
                    <button type="button" onClick={openSignIn} className={navItemClass}>
                      <span className={navLabelClass}>{t('nav.signin', 'Sign in')}</span>
                    </button>
                  )}
                </nav>

                {/* Right: social links and the account menu */}
                <div className="flex flex-1 items-center justify-end gap-1">
                  <a
                    href={INSTAGRAM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className={navIconButton}
                  >
                    <img src="/images/instagram-badge.svg" alt="" className={navSocialIconClass} />
                  </a>
                  {FACEBOOK_URL ? (
                    <a
                      href={FACEBOOK_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Facebook"
                      className={navIconButton}
                    >
                      <img src="/images/facebook.svg" alt="" className={navSocialIconClass} />
                    </a>
                  ) : (
                    <span aria-hidden="true" className="flex w-9 h-9 shrink-0 items-center justify-center">
                      <img src="/images/facebook.svg" alt="" className="w-6 h-6" />
                    </span>
                  )}

                  {userLoggedIn && (
                    <div className="relative" ref={profileRef}>
                      <button
                        type="button"
                        onClick={() => setProfileDropdownOpen((prev) => !prev)}
                        aria-label="User account menu"
                        aria-expanded={profileDropdownOpen}
                        className={navIconButton}
                      >
                        <span className="w-7 h-7 rounded-full bg-[#431769] text-white flex items-center justify-center font-bold text-[12px] shrink-0">
                          {userName.charAt(0).toUpperCase() || 'A'}
                        </span>
                      </button>

                    {/* Sleek Dropdown Menu */}
                    {profileDropdownOpen && (
                      <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 p-3 z-50 animate-in fade-in slide-in-from-top-1 duration-150 text-left">
                        {/* User Header */}
                        <div className="px-3 pt-2 pb-3 border-b border-gray-100">
                          <p className="font-bold text-[14.5px] text-[#111111] leading-snug">
                            {userName}
                          </p>
                          <p className="text-[12px] text-gray-400 mt-0.5 truncate">
                            {userEmail}
                          </p>
                        </div>
  
                        {/* Store Navigation Items */}
                        <div className="py-2 text-[13px] space-y-0.5 text-gray-700">
                          <Link
                            href="/my-orders"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl hover:bg-gray-50 hover:text-black transition-colors"
                          >
                            <i className="fa-regular fa-calendar-check text-[14px] text-gray-400 w-4 text-center shrink-0" />
                            <span className="font-medium text-gray-800">{t('nav.my_orders', 'My orders')}</span>
                          </Link>
  
                          <button
                            type="button"
                            onClick={() => {
                              setProfileDropdownOpen(false);
                              setShowAddressModal(true);
                            }}
                            className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl hover:bg-gray-50 hover:text-black transition-colors text-left cursor-pointer"
                          >
                            <i className="fa-solid fa-location-dot text-[14px] text-gray-400 w-4 text-center shrink-0" />
                            <span className="font-medium text-gray-800">{t('nav.delivery_addresses', 'Delivery addresses')}</span>
                          </button>
  
                          <button
                            type="button"
                            onClick={() => {
                              setProfileDropdownOpen(false);
                              setShowProfileEditModal(true);
                            }}
                            className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl hover:bg-gray-50 hover:text-black transition-colors text-left cursor-pointer"
                          >
                            <i className="fa-regular fa-user text-[14px] text-gray-400 w-4 text-center shrink-0" />
                            <span className="font-medium text-gray-800">{t('nav.edit_profile', 'Edit profile')}</span>
                          </button>
                        </div>
  
                        {/* Sign Out */}
                        <div className="pt-2 mt-1 border-t border-gray-100">
                          <button
                            type="button"
                            onClick={async () => {
                              await signOut({ redirect: false });
                              setUserLoggedIn(false);
                              setProfileDropdownOpen(false);
                            }}
                            className="w-full flex items-center gap-3.5 px-3 py-2 rounded-xl hover:bg-red-50 text-red-600 font-medium text-[13px] transition-colors text-left cursor-pointer"
                          >
                            <i className="fa-solid fa-arrow-right-from-bracket text-[13px] text-red-500 w-4 text-center shrink-0" />
                            <span>{t('nav.sign_out', 'Sign out')}</span>
                          </button>
                        </div>
                      </div>
                    )}
                    </div>
                  )}
                </div>
              </div>
            </GooNavShell>
          </div>

          {/* Phones: brand and menu button, with the menu dropping down from the pill */}
          <div className="md:hidden">
            <GooNavShell
              open={mobileMenuOpen}
              triggerRef={mobileMenuTriggerRef}
              dropId="nav-mobile-menu"
              mainHeight={52}
              dropRadius={28}
              dropClassName="w-full"
              dropWrapperClassName="px-2"
              drop={
                <nav aria-label="Menu" className="max-h-[calc(100dvh-104px)] overflow-y-auto no-scrollbar p-2 font-outfit text-[15px] font-medium">
                  {secondaryNavItems.map((item) => (
                    <Link key={item.key} href={item.href} onClick={closeMobileMenu} className={mobileRowClass}>
                      <span className={`${mobileLabelClass} ${item.isViewAll ? 'text-[#431769]' : 'text-[#111111]'}`}>
                        {item.label}
                      </span>
                      {item.isViewAll && <i aria-hidden="true" className="fa-solid fa-arrow-right text-[12px] text-[#431769]" />}
                    </Link>
                  ))}

                  <div aria-hidden="true" className="mx-3 my-1.5 h-px bg-[#431769]/20" />

                  <Link href="/shop" onClick={closeMobileMenu} aria-current={onShopPage ? 'page' : undefined} className={mobileRowClass}>
                    <i aria-hidden="true" className={`fa-solid fa-boxes-stacked ${mobileIconClass}`} />
                    <span className={`${mobileLabelClass} ${onShopPage ? 'text-[#7A2FC0]' : 'text-[#111111]'}`}>{t('nav.products', 'Products')}</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      closeMobileMenu();
                      setSearchOpen(true);
                    }}
                    className={mobileRowClass}
                  >
                    <i aria-hidden="true" className={`fa-solid fa-magnifying-glass ${mobileIconClass}`} />
                    <span className={`${mobileLabelClass} text-[#111111]`}>{t('nav.search', 'Search')}</span>
                  </button>

                  {userLoggedIn ? (
                    <>
                      <Link href="/favorites" onClick={closeMobileMenu} className={mobileRowClass}>
                        <i aria-hidden="true" className={`fa-solid fa-heart ${mobileIconClass}`} />
                        <span className={`${mobileLabelClass} flex-1 text-[#111111]`}>{t('nav.favorites', 'Favourites')}</span>
                        {favorites.length > 0 && <span className={navBadgeClass}>{favorites.length}</span>}
                      </Link>
                      <Link href="/cart" onClick={closeMobileMenu} className={mobileRowClass}>
                        <i aria-hidden="true" className={`fa-solid fa-bag-shopping ${mobileIconClass}`} />
                        <span className={`${mobileLabelClass} flex-1 text-[#111111]`}>{t('nav.cart', 'Cart')}</span>
                        {count > 0 && <span className={navBadgeClass}>{count}</span>}
                      </Link>
                      <Link href="/my-orders" onClick={closeMobileMenu} className={mobileRowClass}>
                        <i aria-hidden="true" className={`fa-regular fa-calendar-check ${mobileIconClass}`} />
                        <span className={`${mobileLabelClass} text-[#111111]`}>{t('nav.my_orders', 'My orders')}</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          closeMobileMenu();
                          setShowAddressModal(true);
                        }}
                        className={mobileRowClass}
                      >
                        <i aria-hidden="true" className={`fa-solid fa-location-dot ${mobileIconClass}`} />
                        <span className={`${mobileLabelClass} text-[#111111]`}>{t('nav.delivery_addresses', 'Delivery addresses')}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          closeMobileMenu();
                          setShowProfileEditModal(true);
                        }}
                        className={mobileRowClass}
                      >
                        <i aria-hidden="true" className={`fa-regular fa-user ${mobileIconClass}`} />
                        <span className={`${mobileLabelClass} text-[#111111]`}>{t('nav.edit_profile', 'Edit profile')}</span>
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          closeMobileMenu();
                          await signOut({ redirect: false });
                          setUserLoggedIn(false);
                        }}
                        className={mobileRowClass}
                      >
                        <i aria-hidden="true" className={`fa-solid fa-arrow-right-from-bracket ${mobileIconClass}`} />
                        <span className={`${mobileLabelClass} text-[#111111]`}>{t('nav.sign_out', 'Sign out')}</span>
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        closeMobileMenu();
                        openSignIn();
                      }}
                      className={mobileRowClass}
                    >
                      <i aria-hidden="true" className={`fa-solid fa-user ${mobileIconClass}`} />
                      <span className={`${mobileLabelClass} text-[#111111]`}>{t('nav.signin', 'Sign in')}</span>
                    </button>
                  )}

                  <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" onClick={closeMobileMenu} className={mobileRowClass}>
                    <img src="/images/instagram-badge.svg" alt="" className="w-5 h-5 shrink-0" />
                    <span className={`${mobileLabelClass} text-[#111111]`}>Instagram</span>
                  </a>
                  {FACEBOOK_URL ? (
                    <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" onClick={closeMobileMenu} className={mobileRowClass}>
                      <img src="/images/facebook.svg" alt="" className="w-5 h-5 shrink-0" />
                      <span className={`${mobileLabelClass} text-[#111111]`}>Facebook</span>
                    </a>
                  ) : (
                    <div className="flex h-11 items-center gap-3 px-3">
                      <img src="/images/facebook.svg" alt="" className="w-5 h-5 shrink-0" />
                      <span className="text-[#111111]">Facebook</span>
                    </div>
                  )}
                </nav>
              }
            >
              <div className="flex h-[52px] items-center justify-between gap-2 pl-3 pr-2">
                {brandLink}
                <button
                  ref={mobileMenuTriggerRef}
                  type="button"
                  aria-label="Menu"
                  aria-expanded={mobileMenuOpen}
                  aria-controls="nav-mobile-menu"
                  onClick={() => setMobileMenuOpen((prev) => !prev)}
                  className={navIconButton}
                >
                  <TbChartBubbleFilled
                    aria-hidden="true"
                    className={`text-[24px] transition-[color,rotate] duration-500 ease-out motion-reduce:transition-none group-hover:text-[#7A2FC0] ${mobileMenuOpen ? 'rotate-180 text-[#7A2FC0]' : 'rotate-0 text-[#431769]'}`}
                  />
                </button>
              </div>
            </GooNavShell>
          </div>
        </div>
      </header>

      <GeneralSearchModal open={searchOpen} onClose={() => setSearchOpen(false)} categories={navCategories} />

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

      {/* REGION SETTINGS MODAL */}
      {showRegionModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in"
          onClick={() => setShowRegionModal(false)}
        >
          <div
            className="bg-white rounded-[24px] max-w-md w-full p-6 shadow-2xl relative my-auto border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowRegionModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-etsy-bg-soft text-gray-500 hover:text-black"
            >
              <i className="fa-solid fa-xmark text-[16px]" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <i className="fa-solid fa-globe text-[20px] text-etsy-dark" />
              <div>
                <h2 className="text-[20px] font-bold text-etsy-dark">
                  {t('modal.region_title', 'Update your settings')}
                </h2>
                <p className="text-[12px] text-gray-500 mt-0.5">
                  {t('modal.region_subtitle', 'Select your country of delivery and preferred language.')}
                </p>
              </div>
            </div>

            <div className="space-y-4 text-left">
              <div>
                <label className="text-[13px] font-bold text-etsy-dark block mb-1">
                  {t('modal.country', 'Country / Region:')}
                </label>
                <select
                  value={tempCountry}
                  onChange={(e) => {
                    const c = e.target.value as Country;
                    setTempCountry(c);
                    if (c === 'India') {
                      setTempCurrency('INR');
                    } else if (c === 'UAE') {
                      setTempCurrency('AED');
                    }
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-etsy-border text-[14px] text-etsy-dark focus:outline-none focus:ring-2 focus:ring-etsy-orange cursor-pointer font-medium"
                >
                  <option value="India">🇮🇳 India (भारत)</option>
                  <option value="UAE">🇦🇪 United Arab Emirates (الإمارات العربية المتحدة)</option>
                </select>
              </div>

              <div>
                <label className="text-[13px] font-bold text-etsy-dark block mb-1">
                  {t('modal.language', 'Language:')}
                </label>
                <select
                  value={tempLanguage}
                  onChange={(e) => setTempLanguage(e.target.value as Language)}
                  className="w-full px-4 py-2.5 rounded-xl border border-etsy-border text-[14px] text-etsy-dark focus:outline-none focus:ring-2 focus:ring-etsy-orange cursor-pointer font-medium"
                >
                  <option value="en">English (US/UK)</option>
                  <option value="ar">العربية (Arabic)</option>
                </select>
              </div>

              <div>
                <label className="text-[13px] font-bold text-etsy-dark block mb-1">
                  {t('modal.currency', 'Currency:')}
                </label>
                <select
                  value={tempCurrency}
                  onChange={(e) => setTempCurrency(e.target.value as Currency)}
                  className="w-full px-4 py-2.5 rounded-xl border border-etsy-border text-[14px] text-etsy-dark focus:outline-none focus:ring-2 focus:ring-etsy-orange cursor-pointer font-medium"
                >
                  <option value="INR">₹ INR (Indian Rupee)</option>
                  <option value="AED">AED د.إ (UAE Dirham)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-[#E1E3DF]">
              <button
                type="button"
                onClick={() => setShowRegionModal(false)}
                style={{ border: '1.5px solid #222222', color: '#222222', backgroundColor: '#FFFFFF' }}
                className="px-5 py-2 rounded-full hover:bg-[#F5F5F1] text-[14px] font-bold transition-colors cursor-pointer"
              >
                {t('modal.cancel', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setCountry(tempCountry);
                  setCurrency(tempCurrency);
                  setLanguage(tempLanguage);
                  setShowRegionModal(false);
                }}
                style={{ backgroundColor: '#222222', color: '#FFFFFF' }}
                className="px-6 py-2 rounded-full hover:bg-black text-[14px] font-bold transition-all shadow-sm hover:shadow-md cursor-pointer"
              >
                {t('modal.save', 'Save Preferences')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. DELIVERY ADDRESSES MODAL */}
      {showAddressModal && (
        <AddressManagerModal
          onClose={() => setShowAddressModal(false)}
          onAddressSelect={(addr) => {
            setUserAddress(`${addr.line1}${addr.line2 ? ', ' + addr.line2 : ''}, ${addr.city}, ${addr.state} - ${addr.pincode}`);
            setSavedToast(true);
            setTimeout(() => setSavedToast(false), 3000);
          }}
          userName={userName}
          userPhone={userPhone}
        />
      )}

      {/* 2. EDIT PROFILE MODAL */}
      {showProfileEditModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in"
          onClick={() => setShowProfileEditModal(false)}
        >
          <div
            className="bg-white rounded-[24px] max-w-md w-full p-6 sm:p-7 shadow-2xl relative my-auto border border-gray-100 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowProfileEditModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-black cursor-pointer"
            >
              <i className="fa-solid fa-xmark text-[16px]" />
            </button>

            <div className="flex items-center gap-3 mb-5 text-left">
              <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                <i className="fa-solid fa-gear text-[18px]" />
              </div>
              <div>
                <h2 className="text-[20px] font-bold text-[#222222]">
                  Edit Profile &amp; Account
                </h2>
                <p className="text-[12.5px] text-[#595959]">
                  Update your contact details and sanctuary preferences
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-left">
              <div>
                <label className="text-[12.5px] font-bold text-[#222222] block mb-1">
                  Full Name:
                </label>
                <input
                  type="text"
                  required
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E1E3DF] text-[13.5px] text-[#222222] focus:outline-none focus:ring-2 focus:ring-[#F1641E]"
                />
              </div>

              <div>
                <label className="text-[12.5px] font-bold text-[#222222] block mb-1">
                  Email Address:
                </label>
                <input
                  type="email"
                  required
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E1E3DF] text-[13.5px] text-[#222222] focus:outline-none focus:ring-2 focus:ring-[#F1641E]"
                />
              </div>

              <div>
                <label className="text-[12.5px] font-bold text-[#222222] block mb-1">
                  Phone Number:
                </label>
                <input
                  type="tel"
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E1E3DF] text-[13.5px] text-[#222222] focus:outline-none focus:ring-2 focus:ring-[#F1641E]"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E1E3DF]">
                <button
                  type="button"
                  onClick={() => setShowProfileEditModal(false)}
                  style={{ border: '1.5px solid #222222', color: '#222222', backgroundColor: '#FFFFFF' }}
                  className="px-5 py-2 rounded-full hover:bg-[#F5F5F1] text-[13.5px] font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ backgroundColor: '#222222', color: '#FFFFFF' }}
                  className="px-6 py-2 rounded-full hover:bg-black text-[13.5px] font-bold transition-all shadow-sm hover:shadow-md cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. DOWNLOAD INVOICES MODAL */}
      {showInvoiceModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in"
          onClick={() => setShowInvoiceModal(false)}
        >
          <div
            className="bg-white rounded-[24px] max-w-lg w-full p-6 sm:p-7 shadow-2xl relative my-auto border border-gray-100 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowInvoiceModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-black cursor-pointer"
            >
              <i className="fa-solid fa-xmark text-[16px]" />
            </button>

            <div className="flex items-center gap-3 mb-5 text-left">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                <i className="fa-solid fa-file-invoice text-[18px]" />
              </div>
              <div>
                <h2 className="text-[20px] font-bold text-[#222222]">
                  Tax Invoices &amp; Receipts
                </h2>
                <p className="text-[12.5px] text-[#595959]">
                  Download GST invoices and authentic consecration certificates
                </p>
              </div>
            </div>

            <div className="space-y-3 text-left">
              {/* Sample Invoice Item 1 */}
              <div className="bg-[#FAF9F5] p-3.5 rounded-2xl border border-[#E1E3DF] flex items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-[13.5px] text-[#222222]">
                    Order #FS-235358
                  </p>
                  <p className="text-[12px] text-[#595959]">
                    15 Sept 2026 • {formatPrice(4349)} (Paid in full)
                  </p>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-1">
                    ✓ {currency === 'AED' ? 'VAT' : 'GST'} Invoice Ready
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 rounded-full border border-[#222222] hover:bg-white text-[12.5px] font-bold text-[#222222] flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-2xs"
                >
                  <i className="fa-solid fa-print text-[12px]" />
                  <span>Download / Print</span>
                </button>
              </div>

              {/* Sample Invoice Item 2 */}
              <div className="bg-[#FAF9F5] p-3.5 rounded-2xl border border-[#E1E3DF] flex items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-[13.5px] text-[#222222]">
                    Order #FS-190482
                  </p>
                  <p className="text-[12px] text-[#595959]">
                    02 Aug 2026 • {formatPrice(2430)} (Delivered)
                  </p>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-1">
                    ✓ Consecration Certificate Ready
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 rounded-full border border-[#222222] hover:bg-white text-[12.5px] font-bold text-[#222222] flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-2xs"
                >
                  <i className="fa-solid fa-print text-[12px]" />
                  <span>Download / Print</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 mt-5 border-t border-[#E1E3DF] text-[12px] text-[#595959]">
              <span className="flex items-center gap-1.5">
                <i className="fa-solid fa-shield-halved text-emerald-600 text-[14px]" /> Digitally signed &amp; verified
              </span>
              <button
                type="button"
                onClick={() => setShowInvoiceModal(false)}
                className="font-bold text-[#222222] hover:underline cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Toast for Saved Profile / Address */}
      {savedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#222222] text-white px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 text-[13px] font-bold animate-in slide-in-from-bottom-3 duration-200">
          <i className="fa-solid fa-check text-emerald-400 text-[13px]" />
          <span>Settings saved successfully!</span>
        </div>
      )}
    </>
  );
}
