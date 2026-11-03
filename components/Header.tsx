'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useStore } from '@/context/StoreContext';
import { products } from '@/lib/placeholder-data';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useLocale } from '@/context/CurrencyContext';
import { Country, Currency, Language, translateCategory } from '@/lib/translations';
import AddressManagerModal from '@/components/AddressManagerModal';

export function Header() {
  const router = useRouter();
  const pathname = usePathname();

  // Completely hide public store header on all admin routes
  if (pathname?.startsWith('/admin')) {
    return null;
  }
  const { count, userLoggedIn, setUserLoggedIn, favorites } = useCart();
  const { categories: storeCategories } = useStore();
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

  const [query, setQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);
  const [mobileSearchActive, setMobileSearchActive] = useState(false);
  const [showRegionModal, setShowRegionModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [password, setPassword] = useState('');
  const [staySignedIn, setStaySignedIn] = useState(true);
  const [authError, setAuthError] = useState('');
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);

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

  // Lock body scroll while mobile search overlay is active to prevent page scrolling/bleed
  React.useEffect(() => {
    if (mobileSearchActive) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileSearchActive]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/shop?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push('/shop');
    }
  };

  // Live matching products while typing in mobile search
  const mobileLiveMatches = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.maker && p.maker.toLowerCase().includes(q))
      )
      .slice(0, 8);
  }, [query]);

  const secondaryNavItems = useMemo(() => {
    if (storeCategories && storeCategories.length > 1) {
      return storeCategories
        .filter((c) => c !== 'All')
        .slice(0, 8)
        .map((catName, idx) => ({
          name: catName,
          href: `/shop?category=${encodeURIComponent(catName)}`,
          isGift: idx === 0,
        }));
    }
    return [
      { name: 'Feng Shui Decor', href: '/shop?category=Feng%20Shui%20Decor', isGift: true },
      { name: 'Feng Shui Jewelry', href: '/shop?category=Feng%20Shui%20Jewelry' },
      { name: 'Feng Shui Candles', href: '/shop?category=Feng%20Shui%20Candles' },
      { name: 'Crystals & Trees', href: '/shop?category=Crystals%20%26%20Trees' },
      { name: 'Zen & Meditation', href: '/shop?category=Zen%20%26%20Meditation' },
      { name: 'Feng Shui Books', href: '/shop?category=Feng%20Shui%20Books' },
    ];
  }, [storeCategories]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsAuthSubmitting(true);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    try {
      if (isRegisterMode) {
        const regRes = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: firstName.trim() || cleanEmail.split('@')[0],
            email: cleanEmail,
            password: cleanPassword,
          }),
        });
        const regData = await regRes.json();
        if (!regRes.ok || !regData.success) {
          setAuthError(regData.error || 'Registration failed');
          setIsAuthSubmitting(false);
          return;
        }
      }

      const res = await signIn('credentials', {
        email: cleanEmail,
        password: cleanPassword,
        redirect: false,
      });

      if (res?.error) {
        setAuthError('Invalid email or password');
        setIsAuthSubmitting(false);
        return;
      }

      setUserLoggedIn(true);
      if (firstName.trim()) {
        setUserName(firstName.trim());
      } else {
        setUserName(cleanEmail.split('@')[0]);
      }
      setUserEmail(cleanEmail);
      setShowAuthModal(false);
      setPassword('');
    } catch {
      setAuthError('An unexpected error occurred. Please try again.');
    } finally {
      setIsAuthSubmitting(false);
    }
  };

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
      <header className="sticky top-0 z-40 bg-white border-b border-[#E0D7E8]">
        {/* Top Header Row */}
        <div className="etsy-container py-2 sm:py-2.5">
          {/* Mobile Full-Screen Fixed Search Overlay (Zero overlap with page content below) */}
          {mobileSearchActive && (
            <div className="fixed inset-0 z-[9999] bg-white md:hidden flex flex-col animate-in fade-in duration-150">
              {/* Fixed Top Search Bar */}
              <div className="px-3.5 py-2.5 border-b border-gray-200 bg-white flex items-center gap-2.5 shadow-2xs">
                <form
                  onSubmit={(e) => {
                    handleSearch(e);
                    setMobileSearchActive(false);
                  }}
                  role="search"
                  className="flex-1 min-w-0 relative"
                >
                  <div className="relative flex items-center">
                    <i className="fa-solid fa-magnifying-glass text-[#3A1F62] absolute left-3.5 top-1/2 -translate-y-1/2 text-sm pointer-events-none" />
                    <input
                      ref={mobileSearchInputRef}
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search for anything..."
                      className="w-full h-10 pl-9 pr-9 rounded-full border border-gray-300 focus:border-[#3A1F62] focus:ring-1 focus:ring-[#3A1F62]/20 focus:outline-none text-[14.5px] text-[#222222] placeholder-gray-400 bg-white shadow-xs"
                      autoFocus
                    />
                    {query && (
                      <button
                        type="button"
                        onClick={() => setQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1 text-xs cursor-pointer"
                        aria-label="Clear search text"
                      >
                        <i className="fa-solid fa-xmark text-sm" />
                      </button>
                    )}
                  </div>
                </form>
                <button
                  type="button"
                  onClick={() => {
                    setMobileSearchActive(false);
                  }}
                  className="text-[14.5px] font-bold text-[#222222] hover:text-black shrink-0 px-2 py-1 cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              {/* Suggestions / Popular Searches Container */}
              <div className="flex-1 bg-white p-4 overflow-y-auto">
                {!query.trim() ? (
                  <div>
                    {/* Trending Keywords (Popular Searches) */}
                    <div className="flex items-center gap-1.5 mb-3">
                      <i className="fa-solid fa-arrow-trend-up text-xs text-[#3A1F62]" />
                      <span className="text-[11.5px] uppercase tracking-wider font-bold text-gray-500">
                        Popular Searches
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'Pixiu Wealth Bracelet',
                        'Citrine Money Tree',
                        'S925 Pixiu Ring',
                        'Blackwood Amulet',
                        'Tibetan Singing Bowl',
                        'Laughing Buddha',
                        '7 Chakra Gemstone Tree',
                        'Tai Sui Protection',
                        'Feng Shui Tortoise',
                        'Evil Eye Wall Charm',
                        'Chinese Wealth Coins',
                        'Rose Quartz Tree',
                      ].map((term) => (
                        <button
                          key={term}
                          type="button"
                          onClick={() => {
                            setQuery(term);
                            router.push(`/shop?q=${encodeURIComponent(term)}`);
                            setMobileSearchActive(false);
                          }}
                          className="px-3.5 py-1.5 rounded-full bg-[#FAF9F6] hover:bg-[#F3EEFC] text-gray-700 hover:text-[#3A1F62] text-xs font-medium border border-gray-200/80 shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                        >
                          <i className="fa-solid fa-magnifying-glass text-[10px] text-gray-400" />
                          <span>{term}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Live Search Results while typing */
                  <div>
                    <div className="flex items-center justify-between mb-3 pb-1.5 border-b border-gray-200">
                      <span className="text-[11px] uppercase tracking-wider font-bold text-gray-600">
                        Products Matching &ldquo;{query}&rdquo; ({mobileLiveMatches.length})
                      </span>
                    </div>

                    {mobileLiveMatches.length > 0 ? (
                      <div className="flex flex-col gap-2">
                        {mobileLiveMatches.map((prod) => (
                          <div
                            key={prod.id}
                            onClick={() => {
                              router.push(`/product/${prod.id}`);
                              setMobileSearchActive(false);
                            }}
                            className="flex items-center gap-3 p-2 rounded-xl border border-gray-200/80 bg-white hover:border-[#3A1F62]/40 hover:bg-[#FAF8FD] transition-all cursor-pointer shadow-2xs active:scale-[0.99]"
                          >
                            <img
                              src={prod.images[0]}
                              alt={prod.name}
                              className="w-14 h-14 rounded-lg object-cover bg-gray-100 shrink-0 border border-black/5"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-gray-900 truncate leading-snug">
                                {prod.name}
                              </p>
                              <span className="text-[10.5px] text-gray-400 block truncate mt-0.5">
                                {prod.category} &bull; {prod.maker}
                              </span>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs font-bold text-gray-900">
                                  {formatPrice(prod.price)}
                                </span>
                                {prod.bestseller && (
                                  <span className="text-[9px] font-bold text-amber-800 bg-[#FEF9C3] px-1.5 py-0.2 rounded border border-yellow-300">
                                    Popular
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className="text-[11px] font-bold text-[#3A1F62] shrink-0 pr-1 flex items-center gap-1">
                              <span>View</span>
                              <i className="fa-solid fa-arrow-right text-[10px]" />
                            </span>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={(e) => {
                            handleSearch(e);
                            setMobileSearchActive(false);
                          }}
                          className="mt-3 w-full py-2.5 rounded-xl bg-[#3A1F62] hover:bg-[#2B154C] text-white text-xs font-bold text-center transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2"
                        >
                          <span>See all results for &ldquo;{query}&rdquo;</span>
                          <i className="fa-solid fa-arrow-right text-[11px]" />
                        </button>
                      </div>
                    ) : (
                      <div className="py-10 text-center text-gray-400 bg-white rounded-2xl border border-gray-200/80 p-6">
                        <i className="fa-solid fa-magnifying-glass text-gray-300 text-3xl mb-2 block" />
                        <p className="text-sm font-semibold text-gray-800">
                          No matching products found
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          We couldn&apos;t find products for &ldquo;{query}&rdquo;.
                        </p>
                        <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                          {['Tree', 'Pixiu', 'Buddha', 'Bracelet'].map((tag) => (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => setQuery(tag)}
                              className="px-2.5 py-1 text-xs rounded-full bg-gray-100 hover:bg-[#F3EEFC] text-gray-700 hover:text-[#3A1F62] font-medium transition-colors cursor-pointer"
                            >
                              Try &ldquo;{tag}&rdquo;
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Standard Header Row */}
          <div className="flex items-center justify-between gap-1 sm:gap-2.5 md:gap-4 w-full">
            {/* Left: Mobile Menu Button + Brand Logo */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Mobile Menu Button */}
              <button
                type="button"
                aria-label="Toggle navigation menu"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-1.5 -ml-1 rounded-full hover:bg-etsy-bg-soft text-etsy-dark shrink-0 cursor-pointer"
              >
                {mobileMenuOpen ? <i className="fa-solid fa-xmark text-[18px]" /> : <i className="fa-solid fa-bars text-[18px]" />}
              </button>

              {/* Logo: Round avatar + Brand Name (Increased sizes for mobile) */}
              <Link
                href="/"
                className="flex items-center gap-2 sm:gap-2.5 shrink-0 select-none hover:opacity-90 transition-opacity"
              >
                <div className="w-[38px] h-[38px] sm:w-[44px] sm:h-[44px] md:w-[48px] md:h-[48px] rounded-full overflow-hidden shadow-2xs shrink-0 border border-black/10">
                  <img
                    src="/images/miracle.jpeg"
                    alt="Miracle feng shui"
                    className="w-full h-full object-cover scale-105"
                  />
                </div>
                <span className="font-serif text-[22px] sm:text-[25px] md:text-[28px] font-bold text-[#222222] tracking-tight leading-none">
                  <span className="sm:hidden">Miracle</span>
                  <span className="hidden sm:inline">Miracle feng shui</span>
                </span>
              </Link>

              {/* Categories Trigger Button (Desktop Only) */}
              <button
                type="button"
                onClick={() => router.push('/shop')}
                className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-etsy-bg-soft text-[14px] font-semibold text-etsy-dark shrink-0 transition-colors ml-1"
              >
                <i className="fa-solid fa-bars text-[13px]" />
                <span>{t('nav.categories', 'Categories')}</span>
              </button>
            </div>

            {/* Middle: Desktop Search Bar */}
            <form
              onSubmit={handleSearch}
              role="search"
              className="hidden md:block flex-1 min-w-0 max-w-3xl mx-3 relative"
            >
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t('nav.search_placeholder', 'Search')}
                  className="w-full h-10 md:h-11 pl-4 pr-12 rounded-full border border-gray-400 md:border-2 md:border-[#222222] focus:outline-none focus:border-[#3A1F62] text-[14.5px] text-[#222222] placeholder-gray-500 bg-white transition-all shadow-2xs"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="absolute right-11 text-gray-400 hover:text-gray-600 p-0.5 text-xs cursor-pointer"
                    aria-label="Clear search text"
                  >
                    <i className="fa-solid fa-xmark text-[11px]" />
                  </button>
                )}
                {/* Search Button with Logo Purple Background */}
                <button
                  type="submit"
                  aria-label="Submit search"
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#3A1F62] hover:bg-[#2B154C] text-white flex items-center justify-center transition-colors shrink-0 cursor-pointer shadow-xs"
                >
                  <i className="fa-solid fa-magnifying-glass text-[12px]" />
                </button>
              </div>
            </form>

            {/* Right Actions: Mobile Search Icon 🔍 | Region Flag 🇮🇳/🇦🇪 | Profile / Sign In 👤 | Favourites ♥ | Cart 👜 */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              {/* Mobile Search Icon Trigger Button */}
              <button
                type="button"
                aria-label="Open search"
                onClick={() => {
                  setMobileSearchActive(true);
                  setTimeout(() => mobileSearchInputRef.current?.focus(), 60);
                }}
                className="md:hidden w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center cursor-pointer transition-colors shrink-0"
              >
                <i className="fa-solid fa-magnifying-glass text-[17px] text-[#3A1F62]" />
              </button>

              {/* Region Button with Tooltip (Dynamic Flag: India 🇮🇳 or UAE 🇦🇪) */}
              <div
                className="relative"
                onMouseEnter={() => setHoveredIcon('region')}
                onMouseLeave={() => setHoveredIcon(null)}
              >
                <button
                  type="button"
                  aria-label="Select region, language and currency"
                  onClick={() => setShowRegionModal(true)}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full hover:bg-[#DCE8F5] flex items-center justify-center transition-colors cursor-pointer"
                >
                  {country === 'UAE' ? (
                    /* UAE Flag */
                    <svg className="w-5 h-5 rounded-full shadow-xs" viewBox="0 0 36 36" fill="none">
                      <circle cx="18" cy="18" r="18" fill="#F4F4F4" />
                      <path d="M0 6C0 2.686 2.686 0 6 0H36V12H0V6Z" fill="#00732F" />
                      <path d="M0 12H36V24H0V12Z" fill="#FFFFFF" />
                      <path d="M0 24H36V30C36 33.314 33.314 36 30 36H6C2.686 36 0 33.314 0 30V24Z" fill="#000000" />
                      <path d="M0 6C0 2.686 2.686 0 6 0H12V36H6C2.686 36 0 33.314 0 30V6Z" fill="#FF0000" />
                    </svg>
                  ) : (
                    /* Indian Flag */
                    <svg className="w-5 h-5 rounded-full shadow-xs" viewBox="0 0 36 36" fill="none">
                      <circle cx="18" cy="18" r="18" fill="#F4F4F4" />
                      <path d="M0 6C0 2.686 2.686 0 6 0H30C33.314 0 36 2.686 36 6V12H0V6Z" fill="#FF9933" />
                      <path d="M0 24H36V30C36 33.314 33.314 36 30 36H6C2.686 36 0 33.314 0 30V24Z" fill="#138808" />
                      <path d="M0 12H36V24H0V12Z" fill="#FFFFFF" />
                      <circle cx="18" cy="18" r="4.5" stroke="#000080" strokeWidth="1" fill="none" />
                      <circle cx="18" cy="18" r="1.2" fill="#000080" />
                    </svg>
                  )}
                </button>

                {hoveredIcon === 'region' && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 bg-[#1E2B37] text-white text-[12px] font-semibold px-3 py-1 rounded-md shadow-lg whitespace-nowrap z-50 animate-in fade-in">
                    {country === 'UAE' ? '🇦🇪 UAE (AED)' : '🇮🇳 India (INR)'}
                  </div>
                )}
              </div>

              {/* Profile Dropdown / Sign In Trigger */}
              {userLoggedIn ? (
                <div className="relative" ref={profileRef}>
                  <button
                    type="button"
                    onClick={() => setProfileDropdownOpen((prev) => !prev)}
                    className="flex items-center gap-1.5 py-1 px-1.5 sm:py-1.5 sm:px-2.5 rounded-full hover:bg-gray-100 transition-colors border border-gray-200 cursor-pointer"
                    aria-label="User account menu"
                  >
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#111111] text-white flex items-center justify-center font-bold text-[11px] sm:text-[12px] shadow-xs shrink-0">
                      {userName.charAt(0).toUpperCase() || 'A'}
                    </div>
                    <span className="hidden md:inline text-[13px] font-semibold text-[#111111] max-w-[90px] truncate">
                      {userName.split(' ')[0]}
                    </span>
                    <i className="fa-solid fa-chevron-down text-[9px] text-gray-400 hidden sm:inline" />
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
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsRegisterMode(false);
                    setShowAuthModal(true);
                  }}
                  aria-label="Sign in"
                  className="w-8 h-8 sm:w-auto sm:h-auto sm:px-4 sm:py-1.5 rounded-full hover:bg-gray-100 text-[13.5px] font-semibold text-[#111111] transition-colors cursor-pointer flex items-center justify-center"
                >
                  <span className="hidden sm:inline">{t('nav.signin', 'Sign in')}</span>
                  <i className="fa-solid fa-user text-[16px] text-[#222222] sm:hidden" />
                </button>
              )}

              {/* Wishlist / Favourites Button with Tooltip */}
              <div
                className="relative"
                onMouseEnter={() => setHoveredIcon('favourites')}
                onMouseLeave={() => setHoveredIcon(null)}
              >
                <Link
                  href="/favorites"
                  aria-label="Favourites"
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full hover:bg-[#DCE8F5] text-etsy-dark flex items-center justify-center transition-colors relative"
                >
                  <i className="fa-solid fa-heart text-[16px] sm:text-[18px] text-[#222222]" />
                  {favorites.length > 0 && (
                    <span className="absolute -top-1 -right-1 sm:top-0.5 sm:right-0.5 bg-etsy-orange text-white text-[10px] font-bold rounded-full min-w-[16px] h-[16px] px-1 inline-flex items-center justify-center leading-none shadow-xs">
                      {favorites.length}
                    </span>
                  )}
                </Link>

                {hoveredIcon === 'favourites' && (
                  <div className="hidden sm:block absolute top-full left-1/2 -translate-x-1/2 mt-1.5 bg-[#1E2B37] text-white text-[12px] font-semibold px-3 py-1 rounded-md shadow-lg whitespace-nowrap z-50 animate-in fade-in">
                    {t('nav.favorites', 'Favourites')}
                  </div>
                )}
              </div>

              {/* Cart Button with Tooltip */}
              <div
                className="relative"
                onMouseEnter={() => setHoveredIcon('cart')}
                onMouseLeave={() => setHoveredIcon(null)}
              >
                <Link
                  href="/cart"
                  aria-label="Cart"
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full hover:bg-[#DCE8F5] text-etsy-dark flex items-center justify-center transition-colors relative"
                >
                  <i className="fa-solid fa-bag-shopping text-[17px] sm:text-[18px] text-[#222222]" />
                  {count > 0 && (
                    <span className="absolute -top-1 -right-1 sm:top-0.5 sm:right-0.5 bg-etsy-orange text-white text-[10px] font-bold rounded-full min-w-[16px] h-[16px] px-1 inline-flex items-center justify-center leading-none shadow-xs">
                      {count}
                    </span>
                  )}
                </Link>

                {hoveredIcon === 'cart' && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 bg-[#1E2B37] text-white text-[12px] font-semibold px-3 py-1 rounded-md shadow-lg whitespace-nowrap z-50 animate-in fade-in">
                    {t('nav.cart', 'Cart')}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Categories Navigation Bar (Desktop & Tablet) */}
        <nav className="border-t border-[#E1E3DF] bg-white hidden md:block">
          <div className="etsy-container">
            <ul className="flex items-center justify-center gap-7 sm:gap-9 py-2.5 list-none m-0 p-0 overflow-x-auto text-[13.5px] sm:text-[14px] font-medium text-[#222222] whitespace-nowrap scrollbar-none mx-auto w-full">
              {secondaryNavItems.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-1.5 hover:text-etsy-orange hover:underline transition-colors ${item.isGift ? 'text-etsy-orange font-bold' : ''
                      }`}
                  >
                    {item.isGift && <i className="fa-solid fa-gift text-[13px]" />}
                    <span>{translateCategory(item.name, language)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </header>

      {/* MOBILE NAVIGATION DRAWER */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Content */}
          <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-white shadow-2xl z-50 flex flex-col p-5 overflow-y-auto animate-in slide-in-from-left duration-200">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full overflow-hidden border border-black/10">
                  <img src="/images/miracle.jpeg" alt="Miracle feng shui" className="w-full h-full object-cover" />
                </div>
                <span className="font-serif font-semibold text-[18px] text-[#222222]">Miracle feng shui</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500"
                aria-label="Close menu"
              >
                <i className="fa-solid fa-xmark text-[18px]" />
              </button>
            </div>

            {/* User Quick Bar */}
            <div className="py-4 border-b border-gray-100">
              {userLoggedIn ? (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#111111] text-white flex items-center justify-center font-bold text-[14px]">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-bold text-[14px] text-gray-900 truncate">{userName}</p>
                    <p className="text-[12px] text-gray-400 truncate">{userEmail}</p>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setShowAuthModal(true);
                  }}
                  className="w-full py-2.5 px-4 rounded-full bg-[#222222] text-white text-[14px] font-bold shadow-xs hover:bg-black transition-colors"
                >
                  {t('nav.signin_or_register', 'Sign in or Register')}
                </button>
              )}
            </div>

            {/* Categories Navigation */}
            <div className="py-4 flex-1">
              <p className="text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-2">{t('nav.explore_categories', 'Explore Categories')}</p>
              <div className="space-y-1">
                {secondaryNavItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 text-[14px] font-medium text-[#222222] transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      {item.isGift && <i className="fa-solid fa-gift text-etsy-orange text-[13px]" />}
                      {translateCategory(item.name, language)}
                    </span>
                    <i className="fa-solid fa-chevron-right text-[11px] text-gray-300" />
                  </Link>
                ))}
              </div>

              {/* Quick links: Favorites & Orders */}
              <div className="pt-4 mt-3 border-t border-gray-100 space-y-1">
                <Link
                  href="/favorites"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 text-[14px] font-medium text-[#222222]"
                >
                  <span className="flex items-center gap-3">
                    <i className="fa-solid fa-heart text-[15px] text-gray-500 w-5 text-center" />
                    <span>{t('nav.favorites', 'Favourites')}</span>
                  </span>
                  {favorites.length > 0 && (
                    <span className="bg-etsy-orange text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                      {favorites.length}
                    </span>
                  )}
                </Link>
                <Link
                  href="/my-orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 text-[14px] font-medium text-[#222222]"
                >
                  <i className="fa-regular fa-calendar-check text-[15px] text-gray-500 w-5 text-center" />
                  <span>{t('nav.my_orders', 'My orders')}</span>
                </Link>
                <Link
                  href="/cart"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 text-[14px] font-medium text-[#222222]"
                >
                  <span className="flex items-center gap-3">
                    <i className="fa-solid fa-bag-shopping text-[15px] text-gray-500 w-5 text-center" />
                    <span>{t('nav.cart', 'Cart')}</span>
                  </span>
                  {count > 0 && (
                    <span className="bg-etsy-orange text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                      {count}
                    </span>
                  )}
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AUTH MODAL */}
      {showAuthModal && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-[#F0F1F5] md:bg-black/55 md:flex md:items-center md:justify-center md:p-4 md:backdrop-blur-xs animate-in fade-in"
          onClick={() => setShowAuthModal(false)}
        >
          {/* ══════════════════════════════════════════════════════════════════════
              MOBILE VIEW (< md): Exact same design as Admin Login
              Cover Image: feng_shui_sacred_finds.jpg | Caption: Pure White
              ══════════════════════════════════════════════════════════════════════ */}
          <div
            className="md:hidden min-h-screen w-full flex flex-col bg-[#F0F1F5]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Cover Banner */}
            <div className="relative h-56 sm:h-64 w-full overflow-hidden bg-[#161619] flex-shrink-0">
              <img
                src="/images/feng_shui_sacred_finds.jpg"
                alt="Miracle Feng Shui"
                className="w-full h-full object-cover brightness-[0.65] contrast-[1.1]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

              {/* Floating '< Back' Pill Button */}
              <button
                type="button"
                onClick={() => setShowAuthModal(false)}
                className="absolute top-5 left-4 z-20 inline-flex items-center gap-1.5 bg-black/60 hover:bg-black text-white text-xs font-semibold px-3.5 py-1.5 rounded-full backdrop-blur-md border border-white/20 transition-all shadow-md cursor-pointer"
              >
                <i className="fa-solid fa-chevron-left text-[10px]" />
                <span>Back</span>
              </button>

              {/* Brand Pill Badge */}
              <div className="absolute top-5 right-4 z-20 flex items-center gap-2 bg-black/50 backdrop-blur-md border border-white/15 px-3 py-1 rounded-full">
                <img src="/images/miracle.jpeg" alt="Logo" className="w-4 h-4 rounded-full object-cover" />
                <span className="text-[10.5px] font-semibold text-white/90">Miracle Feng Shui</span>
              </div>

              {/* Bottom text inside banner (White font color, NO yellow) */}
              <div className="absolute bottom-10 left-6 z-10">
                <span className="inline-block text-[10px] uppercase font-bold tracking-widest text-white/90 mb-0.5">
                  {isRegisterMode ? 'Member Registration' : 'Member Sanctuary'}
                </span>
              </div>
            </div>

            {/* Sliding White Sheet with rounded-t-[32px] */}
            <div className="relative z-10 -mt-7 bg-white rounded-t-[32px] shadow-2xl px-6 pt-7 pb-8 flex-1 flex flex-col justify-between">
              <div>
                {/* Brand Logo above title */}
                <div className="flex justify-center mb-3">
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-gray-100 shadow-md">
                    <img src="/images/miracle.jpeg" alt="Miracle Feng Shui" className="w-full h-full object-cover" />
                  </div>
                </div>

                {/* Title & Subtitle matching Admin Bebas Neue styling */}
                <h1
                  style={{ fontFamily: "'Bebas Neue', 'Montserrat', sans-serif" }}
                  className="text-3xl sm:text-4xl text-gray-900 tracking-wide font-normal mb-1 text-center leading-none"
                >
                  {isRegisterMode ? 'Create Your Account' : 'Welcome Back'}
                </h1>
                <p className="text-xs text-gray-500 text-center mb-3 leading-relaxed">
                  {isRegisterMode
                    ? 'Join Miracle Feng Shui for orders & saved addresses'
                    : 'Sign in to access your store orders & wishlist'}
                </p>

                {/* Mode Switcher */}
                <div className="text-xs text-gray-600 mb-5 text-center">
                  {isRegisterMode ? (
                    <span>
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setIsRegisterMode(false);
                          setAuthError('');
                        }}
                        className="text-black font-bold underline hover:text-[#e05638] transition-colors cursor-pointer"
                      >
                        Sign in
                      </button>
                    </span>
                  ) : (
                    <span>
                      New to Miracle Feng Shui?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setIsRegisterMode(true);
                          setAuthError('');
                        }}
                        className="text-black font-bold underline hover:text-[#e05638] transition-colors cursor-pointer"
                      >
                        Create an account
                      </button>
                    </span>
                  )}
                </div>

                {/* Error Alert */}
                {authError && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 mb-4 animate-in fade-in">
                    <i className="fa-solid fa-circle-exclamation shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                {/* Customer Form matching Admin layout */}
                <form onSubmit={handleAuthSubmit} className="space-y-4 text-left">
                  {/* Email with floating label */}
                  <div className="relative">
                    <label className="absolute -top-2.5 left-3.5 bg-white px-1.5 text-[11px] font-bold text-gray-700 z-10">
                      Email <span className="text-rose-600">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-3 text-xs sm:text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-black transition-all"
                      />
                      <i className="fa-regular fa-envelope absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
                    </div>
                  </div>

                  {/* First Name (Visible in Register Mode) */}
                  {isRegisterMode && (
                    <div className="relative">
                      <label className="absolute -top-2.5 left-3.5 bg-white px-1.5 text-[11px] font-bold text-gray-700 z-10">
                        First name <span className="text-rose-600">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          placeholder="Your full name"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-3 text-xs sm:text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-black transition-all"
                        />
                        <i className="fa-regular fa-user absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
                      </div>
                    </div>
                  )}

                  {/* Password with floating label & eye toggle */}
                  <div className="relative">
                    <label className="absolute -top-2.5 left-3.5 bg-white px-1.5 text-[11px] font-bold text-gray-700 z-10">
                      Password <span className="text-rose-600">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-3 text-xs sm:text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-black transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1 cursor-pointer transition-colors"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        <i className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-xs`} />
                      </button>
                    </div>
                  </div>

                  {/* Remember / Stay signed in */}
                  {!isRegisterMode && (
                    <div className="flex items-center justify-between pt-0.5">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="mobile-stay-signed-in"
                          checked={staySignedIn}
                          onChange={(e) => setStaySignedIn(e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black accent-black cursor-pointer"
                        />
                        <label htmlFor="mobile-stay-signed-in" className="text-xs text-gray-600 font-medium cursor-pointer select-none">
                          Remember this device
                        </label>
                      </div>
                      <button
                        type="button"
                        className="text-xs text-gray-500 hover:text-black hover:underline cursor-pointer"
                        onClick={() => {
                          setShowAuthModal(false);
                          router.push('/forgot-password');
                        }}
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}

                  {/* Sign In / Register button matching Admin styling */}
                  <button
                    type="submit"
                    disabled={isAuthSubmitting}
                    style={{ backgroundColor: '#111111', color: '#ffffff' }}
                    className="w-full py-3.5 px-5 rounded-xl text-xs sm:text-sm font-bold tracking-wider uppercase bg-[#111111] hover:bg-black text-white flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all cursor-pointer disabled:opacity-60 active:scale-[0.99] mt-1"
                  >
                    {isAuthSubmitting ? (
                      <>
                        <i className="fa-solid fa-circle-notch fa-spin text-xs" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <span>{isRegisterMode ? 'Create Account' : 'Sign In'}</span>
                        <i className="fa-solid fa-arrow-right text-xs" />
                      </>
                    )}
                  </button>
                </form>

                {/* Social logins */}
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-white px-3 text-gray-400 font-medium">or continue with</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('user@gmail.com');
                      setUserLoggedIn(true);
                      setShowAuthModal(false);
                    }}
                    className="flex-1 h-11 rounded-xl border border-gray-200 hover:border-black flex items-center justify-center transition-colors bg-gray-50 hover:bg-white cursor-pointer"
                    title="Continue with Google"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('user@facebook.com');
                      setUserLoggedIn(true);
                      setShowAuthModal(false);
                    }}
                    className="flex-1 h-11 rounded-xl border border-gray-200 hover:border-black flex items-center justify-center transition-colors bg-gray-50 hover:bg-white cursor-pointer"
                    title="Continue with Facebook"
                  >
                    <svg className="w-5 h-5 text-[#1877F2] fill-current" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('user@icloud.com');
                      setUserLoggedIn(true);
                      setShowAuthModal(false);
                    }}
                    className="flex-1 h-11 rounded-xl border border-gray-200 hover:border-black flex items-center justify-center transition-colors bg-gray-50 hover:bg-white cursor-pointer"
                    title="Continue with Apple"
                  >
                    <svg className="w-5 h-5 fill-current text-black" viewBox="0 0 24 24">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.63-.76 1.05-1.82.93-2.88-.91.04-2.01.61-2.66 1.37-.57.65-1.07 1.73-.94 2.76 1.02.08 2.05-.49 2.67-1.25z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Bottom Terms */}
              <div className="text-center mt-5">
                <p className="text-[11px] text-gray-400 leading-tight">
                  By continuing, you agree to our{' '}
                  <a href="#" className="underline text-gray-700 hover:text-black">Terms of Use</a>{' '}
                  and{' '}
                  <a href="#" className="underline text-gray-700 hover:text-black">Privacy Policy</a>.
                </p>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════════════
              DESKTOP VIEW (>= md): Classic Elegance Modal Card
              ══════════════════════════════════════════════════════════════════════ */}
          <div
            className="hidden md:block bg-white rounded-[24px] max-w-[445px] w-full px-7 sm:px-9 py-6 sm:py-7 shadow-2xl relative text-center animate-in zoom-in-95 my-auto border border-gray-100/80 max-h-[95vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Close Button */}
            <button
              type="button"
              aria-label="Close"
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4.5 right-4.5 p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-black transition-colors"
            >
              <i className="fa-solid fa-xmark text-[16px]" />
            </button>

            {/* Round Brand Logo */}
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden shadow-xs border border-black/10 mx-auto mb-2.5">
              <img
                src="/images/miracle.jpeg"
                alt="Miracle feng shui"
                className="w-full h-full object-cover scale-105"
              />
            </div>

            {/* Headline */}
            <h2 className="text-[26px] sm:text-[29px] font-serif font-normal text-[#222222] leading-tight mb-2">
              {isRegisterMode ? 'Create your account' : 'Sign in to Miracle feng shui'}
            </h2>

            {/* Mode Switcher */}
            <div className="text-[13.5px] text-gray-600 mb-5">
              {isRegisterMode ? (
                <span>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setIsRegisterMode(false)}
                    className="text-[#222222] font-semibold underline hover:text-etsy-orange transition-colors"
                  >
                    Sign in
                  </button>
                </span>
              ) : (
                <span>
                  New to Miracle feng shui?{' '}
                  <button
                    type="button"
                    onClick={() => setIsRegisterMode(true)}
                    className="text-[#222222] font-semibold underline hover:text-etsy-orange transition-colors"
                  >
                    Create an account
                  </button>
                </span>
              )}
            </div>

            {/* Form */}
            <form onSubmit={handleAuthSubmit} className="space-y-3.5 text-left">
              {/* Email Address */}
              <div>
                <label className="text-[13.5px] font-medium text-[#222222] block mb-1">
                  Email address<span className="text-[#A61A11] ml-0.5">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-[44px] px-3.5 rounded-[10px] border border-[#757575] text-[14.5px] text-[#222222] focus:outline-none focus:ring-2 focus:ring-black/15 focus:border-black transition-all"
                />
              </div>

              {/* First Name (Visible in Register Mode) */}
              {isRegisterMode && (
                <div>
                  <label className="text-[13.5px] font-medium text-[#222222] block mb-1">
                    First name<span className="text-[#A61A11] ml-0.5">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full h-[44px] px-3.5 rounded-[10px] border border-[#757575] text-[14.5px] text-[#222222] focus:outline-none focus:ring-2 focus:ring-black/15 focus:border-black transition-all"
                  />
                </div>
              )}

              {/* Password with Show/Hide Eye Icon */}
              <div>
                <label className="text-[13.5px] font-medium text-[#222222] block mb-1">
                  Password<span className="text-[#A61A11] ml-0.5">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-[44px] px-3.5 pr-11 rounded-[10px] border border-[#757575] text-[14.5px] text-[#222222] focus:outline-none focus:ring-2 focus:ring-black/15 focus:border-black transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#222222] hover:text-etsy-orange focus:outline-none p-1"
                  >
                    {showPassword ? (
                      <i className="fa-regular fa-eye-slash text-[14px]" />
                    ) : (
                      <i className="fa-regular fa-eye text-[14px]" />
                    )}
                  </button>
                </div>
              </div>

              {/* Stay Signed In */}
              {!isRegisterMode && (
                <div className="flex items-center justify-between pt-0.5">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="stay-signed-in-modal"
                      checked={staySignedIn}
                      onChange={(e) => setStaySignedIn(e.target.checked)}
                      className="w-4 h-4 rounded text-black focus:ring-black accent-black cursor-pointer"
                    />
                    <label htmlFor="stay-signed-in-modal" className="text-[13px] text-[#222222] cursor-pointer select-none">
                      Stay signed in
                    </label>
                  </div>
                  <button
                    type="button"
                    className="text-[12.5px] text-[#222222] hover:underline cursor-pointer"
                    onClick={() => {
                      setShowAuthModal(false);
                      router.push('/forgot-password');
                    }}
                  >
                    Forgot your password?
                  </button>
                </div>
              )}

              {/* Auth Error Message */}
              {authError && (
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
                  <i className="fa-solid fa-circle-exclamation text-red-500" />
                  <span>{authError}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isAuthSubmitting}
                style={{ backgroundColor: '#222222', color: '#ffffff' }}
                className="w-full bg-[#222222] hover:bg-black disabled:opacity-60 text-white font-bold h-[46px] rounded-full text-[15.5px] transition-all mt-3.5 cursor-pointer text-center flex items-center justify-center shadow-sm hover:shadow-md"
              >
                {isAuthSubmitting ? 'Please wait...' : isRegisterMode ? 'Register' : 'Sign in'}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E1E3DF]" />
              </div>
              <div className="relative flex justify-center text-[12.5px]">
                <span className="bg-white px-3.5 text-[#595959] font-normal">or</span>
              </div>
            </div>

            {/* 3 Social Buttons */}
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setEmail('user@gmail.com');
                  setUserLoggedIn(true);
                  setShowAuthModal(false);
                }}
                style={{ border: '1px solid #222222' }}
                className="flex-1 h-[42px] rounded-full border border-[#222222] hover:bg-gray-100 flex items-center justify-center transition-colors bg-white cursor-pointer"
                title="Continue with Google"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('user@facebook.com');
                  setUserLoggedIn(true);
                  setShowAuthModal(false);
                }}
                style={{ border: '1px solid #222222' }}
                className="flex-1 h-[42px] rounded-full border border-[#222222] hover:bg-gray-100 flex items-center justify-center transition-colors bg-white cursor-pointer"
                title="Continue with Facebook"
              >
                <svg className="w-5 h-5 text-[#1877F2] fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('user@icloud.com');
                  setUserLoggedIn(true);
                  setShowAuthModal(false);
                }}
                style={{ border: '1px solid #222222' }}
                className="flex-1 h-[42px] rounded-full border border-[#222222] hover:bg-gray-100 flex items-center justify-center transition-colors bg-white cursor-pointer"
                title="Continue with Apple"
              >
                <svg className="w-5 h-5 fill-current text-black" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.63-.76 1.05-1.82.93-2.88-.91.04-2.01.61-2.66 1.37-.57.65-1.07 1.73-.94 2.76 1.02.08 2.05-.49 2.67-1.25z" />
                </svg>
              </button>
            </div>

            {/* Terms and Privacy Footer */}
            <p className="text-[12px] text-[#595959] text-center mt-4 leading-tight">
              By continuing, you agree to our{' '}
              <a href="#" className="underline text-[#222222] hover:text-etsy-orange">
                Terms of Use
              </a>{' '}
              and{' '}
              <a href="#" className="underline text-[#222222] hover:text-etsy-orange">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>
      )}

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
