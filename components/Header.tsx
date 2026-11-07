"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useCart } from "@/context/CartContext";
import { useLocale } from "@/context/CurrencyContext";
import type { NavCategory } from "@/lib/nav-categories";
import AuthModal from "@/home/components/authmodal";
import GeneralSearchModal from "@/home/components/generalsearchmodal";
import NavCategoriesMenu from "@/components/nav/NavCategoriesMenu";
import NavAccountMenu from "@/components/nav/NavAccountMenu";
import NavMobileMenu from "@/components/nav/NavMobileMenu";
import {
  navBadge,
  navFocus,
  navItem,
  navLabel,
  navLabelActive,
  useDismiss,
} from "@/components/nav/navUi";

const mobileIcon = `relative flex h-10 w-10 items-center justify-center rounded-full cursor-pointer ${navFocus}`;

/**
 * The site navbar: an open bar on the stone page. It takes a stone backing once the page scrolls
 * or a menu opens, so content never shows through behind it.
 */
/** Pages the middleware keeps for signed-in customers; signing out on one goes to the homepage. */
const SIGNED_IN_ONLY_PATHS = ["/profile", "/order-confirmation", "/my-orders", "/orders"];

export function Header({ navCategories }: { navCategories: NavCategory[] }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return <SiteHeader navCategories={navCategories} pathname={pathname ?? ""} />;
}

function SiteHeader({
  navCategories,
  pathname,
}: {
  navCategories: NavCategory[];
  pathname: string;
}) {
  const { count, userLoggedIn, setUserLoggedIn, favorites } = useCart();
  const { data: session, status } = useSession();
  const { t } = useLocale();

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const mobileTriggerRef = useRef<HTMLButtonElement>(null);
  const mobilePanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Keep the cart's login state and the account menu's name in step with the session.
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      setUserLoggedIn(true);
      setUserName(session.user.name || session.user.email?.split("@")[0] || "");
      setUserEmail(session.user.email || "");
      // The session can hold an old name; the profile has the current one.
      fetch("/api/auth/profile")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.success && data.data?.name) setUserName(data.data.name);
        })
        .catch(() => {});
    } else if (status === "unauthenticated") {
      setUserLoggedIn(false);
    }
  }, [status, session, setUserLoggedIn]);

  // Other parts of the site open the sign in modal with this event.
  useEffect(() => {
    const handleOpenAuth = (e: Event) => {
      setIsRegisterMode(
        (e as CustomEvent<{ mode?: "signin" | "register" }>).detail?.mode ===
          "register",
      );
      setShowAuthModal(true);
    };
    window.addEventListener("open-auth-modal", handleOpenAuth);
    return () => window.removeEventListener("open-auth-modal", handleOpenAuth);
  }, []);

  // Phone menu: the page behind it stops scrolling, and Escape or a tap outside closes it.
  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);
  useDismiss(mobileMenuOpen, closeMobileMenu, mobilePanelRef, mobileTriggerRef);
  useEffect(() => {
    if (!mobileMenuOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // A new page closes the phone menu.
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const openSignIn = () => {
    setIsRegisterMode(false);
    setShowAuthModal(true);
  };
  // Sign out is not optimistic. Nothing on the page changes until the server has ended the session
  // and a fresh check confirms it; then the browser's copies are cleared and the page reloads, so no
  // signed-in data or cached page is left behind. Pages only for signed-in customers go to the homepage.
  const handleSignOut = async (): Promise<boolean> => {
    try {
      await signOut({ redirect: false });
      const res = await fetch("/api/auth/session", { cache: "no-store" });
      const current = res.ok ? await res.json() : null;
      if (!current || current.user) return false;
    } catch {
      return false;
    }
    setUserLoggedIn(false);
    const signedInOnly = SIGNED_IN_ONLY_PATHS.some(
      (path) => pathname === path || pathname.startsWith(`${path}/`),
    );
    window.location.replace(signedInOnly ? "/" : window.location.href);
    return true;
  };

  const onShopPage = pathname === "/shop";
  const backed = scrolled || mobileMenuOpen;
  const cartLabel =
    userLoggedIn && count > 0
      ? `${t("nav.cart", "Cart")} (${count})`
      : t("nav.cart", "Cart");

  // The cart icon with its count. `display` sets where it shows: "flex" everywhere, or tablet and up only.
  const cartLink = (display: string) => (
    <Link
      href="/cart"
      aria-label={cartLabel}
      className={`group ${mobileIcon} ${display}`}
    >
      <i
        aria-hidden="true"
        className="fa-solid fa-cart-shopping text-[17px] text-ink transition-colors group-hover:text-logo-purple"
      />
      {count > 0 && (
        <span className={`${navBadge} absolute -right-0.5 -top-0.5`}>
          {count}
        </span>
      )}
    </Link>
  );

  // Phones: the open menu lists Search, Favorites and Cart, so the bar's own icons fade out (keeping their space so nothing shifts).
  const hideOnMenu = `transition-opacity duration-200 motion-reduce:transition-none ${mobileMenuOpen ? "max-md:invisible max-md:opacity-0" : ""}`;

  return (
    <>
      <header
        id="site-header"
        className={`sticky top-0 z-50 transition-[background-color,box-shadow] duration-200 motion-reduce:transition-none ${backed ? "bg-stone/95 shadow-[0_1px_0_rgba(20,18,16,0.1)] backdrop-blur-md" : "bg-transparent"}`}
      >
        <div className="mx-auto flex h-16 w-full max-w-[1280px] items-center gap-2 px-4 sm:px-6 md:h-[72px]">
          {/* Tablet and up: brand, links and actions in three zones, so the links sit in the centre. */}
          <div className="flex min-w-0 md:flex-1">
            <Link
              href="/"
              className={`mr-2 flex min-w-0 shrink-0 items-center gap-2.5 rounded-full ${navFocus}`}
            >
              <span className="h-8 w-8 shrink-0 overflow-hidden rounded-full md:h-9 md:w-9">
                {/* The SVG has a transparent margin around its circle; the scale crops it off. */}
                <img
                  src="/images/logofull.svg"
                  alt=""
                  className="h-full w-full scale-[1.23] object-cover"
                />
              </span>
              <span className="font-serif whitespace-nowrap text-[19px] font-bold leading-none tracking-tight text-ink md:text-[21px]">
                Miracle feng shui
              </span>
            </Link>
          </div>

          <nav
            aria-label={t("nav.main", "Main")}
            className="hidden shrink-0 items-center gap-1 md:flex"
          >
            <NavCategoriesMenu categories={navCategories} />
            <Link
              href="/shop"
              aria-current={onShopPage ? "page" : undefined}
              className={`inline-flex ${navItem}`}
            >
              <span className={onShopPage ? navLabelActive : navLabel}>
                {t("nav.products", "Products")}
              </span>
            </Link>
          </nav>

          <div className="ml-auto flex items-center justify-end gap-0.5 md:ml-0 md:flex-1 md:gap-1.5">
            {/* The shop page has its own search bar, so the cart takes the search's place, before Favorites. */}
            {onShopPage && userLoggedIn && cartLink(`flex ${hideOnMenu}`)}
            {/* The shop page has its own search bar, so the navbar's search stays out of the way there. */}
            {!onShopPage && (
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label={t("nav.search", "Search")}
                className={`${navItem} hidden md:inline-flex`}
              >
                <i
                  aria-hidden="true"
                  className="fa-solid fa-magnifying-glass text-[15px] text-ink transition-colors group-hover:text-logo-purple"
                />
                <span className={`${navLabel} hidden lg:inline`}>
                  {t("nav.search", "Search")}
                </span>
              </button>
            )}

            {userLoggedIn ? (
              <Link
                href="/profile?tab=favorites"
                aria-label={t("nav.favorites", "Favorites")}
                className={`${navItem} hidden md:inline-flex`}
              >
                <i
                  aria-hidden="true"
                  className="fa-regular fa-heart text-[16px] text-ink transition-colors group-hover:text-logo-purple"
                />
                {favorites.length > 0 && (
                  <span className={navBadge}>{favorites.length}</span>
                )}
              </Link>
            ) : (
              <button
                type="button"
                onClick={openSignIn}
                className={`${navItem} hidden md:inline-flex`}
              >
                <span className={navLabel}>{t("nav.signin", "Sign in")}</span>
              </button>
            )}

            {/* Phones: only search (the cart on the shop page) and favorites sit in the bar; everything else is in the menu. */}
            {!onShopPage && (
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label={t("nav.search", "Search")}
                className={`${mobileIcon} md:hidden ${hideOnMenu}`}
              >
                <i
                  aria-hidden="true"
                  className="fa-solid fa-magnifying-glass text-[17px] text-ink"
                />
              </button>
            )}
            {userLoggedIn ? (
              <Link
                href="/profile?tab=favorites"
                aria-label={t("nav.favorites", "Favorites")}
                className={`${mobileIcon} md:hidden ${hideOnMenu}`}
              >
                <i
                  aria-hidden="true"
                  className="fa-regular fa-heart text-[18px] text-ink"
                />
                {favorites.length > 0 && (
                  <span className={`${navBadge} absolute -right-0.5 -top-0.5`}>
                    {favorites.length}
                  </span>
                )}
              </Link>
            ) : (
              <button
                type="button"
                onClick={openSignIn}
                aria-label={t("nav.favorites", "Favorites")}
                className={`${mobileIcon} md:hidden ${hideOnMenu}`}
              >
                <i
                  aria-hidden="true"
                  className="fa-regular fa-heart text-[18px] text-ink"
                />
              </button>
            )}
            {/* Only signed-in customers have a cart. On the shop page it sits before Favorites instead. */}
            {userLoggedIn && !onShopPage && cartLink("hidden md:flex")}

            {userLoggedIn && (
              <span className="ml-1 hidden md:block">
                <NavAccountMenu
                  name={userName}
                  email={userEmail}
                  onSignOut={handleSignOut}
                />
              </span>
            )}

            {/* Phones */}
            <button
              ref={mobileTriggerRef}
              type="button"
              aria-label={t("nav.menu", "Menu")}
              aria-expanded={mobileMenuOpen}
              aria-controls="nav-mobile-menu"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className={`-mr-1.5 flex h-10 w-10 items-center justify-center rounded-full cursor-pointer md:hidden ${navFocus}`}
            >
              <span aria-hidden="true" className="relative block h-3 w-5">
                <span
                  className={`absolute left-0 h-[2px] w-5 rounded-full bg-ink transition-transform duration-200 motion-reduce:transition-none ${mobileMenuOpen ? "top-[5px] rotate-45" : "top-0"}`}
                />
                <span
                  className={`absolute left-0 h-[2px] w-5 rounded-full bg-ink transition-transform duration-200 motion-reduce:transition-none ${mobileMenuOpen ? "top-[5px] -rotate-45" : "top-[10px]"}`}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      <div ref={mobilePanelRef}>
        <NavMobileMenu
          open={mobileMenuOpen}
          categories={navCategories}
          signedIn={userLoggedIn}
          favoritesCount={favorites.length}
          cartCount={userLoggedIn ? count : 0}
          onClose={closeMobileMenu}
          onSearch={onShopPage ? undefined : () => setSearchOpen(true)}
          onSignIn={openSignIn}
          onSignOut={handleSignOut}
        />
      </div>

      {!onShopPage && (
        <GeneralSearchModal
          open={searchOpen}
          onClose={() => setSearchOpen(false)}
          categories={navCategories}
        />
      )}

      <AuthModal
        open={showAuthModal}
        mode={isRegisterMode ? "register" : "signin"}
        onModeChange={(mode) => setIsRegisterMode(mode === "register")}
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
