"use client";

import React from "react";
import Link from "next/link";
import type { NavCategory } from "@/lib/nav-categories";
import { useLocale } from "@/context/CurrencyContext";
import { FACEBOOK_URL, INSTAGRAM_URL } from "@/lib/social-links";
import RegionOptions from "./RegionOptions";
import SignOutRow from "./SignOutRow";
import { indexLabel, indexRow, navBadge, navFocus } from "./navUi";

interface NavMobileMenuProps {
  open: boolean;
  categories: NavCategory[];
  signedIn: boolean;
  unread: number;
  onOpenNotifications: () => void;
  favoritesCount: number;
  cartCount: number;
  onClose: () => void;
  /** Opens the search modal. Left out on pages with their own search, such as the shop. */
  onSearch?: () => void;
  onSignIn: () => void;
  /** Resolves true once the server has ended the session. */
  onSignOut: () => Promise<boolean>;
}

const SOCIALS = [
  { name: "Instagram", url: INSTAGRAM_URL, icon: "/images/instagram-badge.svg" },
  { name: "Facebook", url: FACEBOOK_URL, icon: "/images/facebook.svg" },
];

/** Phones: a stone sheet under the bar, set as a serif index of the shop and the account, with socials and region at its foot. */
export default function NavMobileMenu({
  open,
  categories,
  signedIn,
  unread,
  onOpenNotifications,
  favoritesCount,
  cartCount,
  onClose,
  onSearch,
  onSignIn,
  onSignOut,
}: NavMobileMenuProps) {
  const { t } = useLocale();

  return (
    <div
      id="nav-mobile-menu"
      className={`fixed inset-x-0 bottom-0 top-16 z-[60] flex flex-col overflow-hidden bg-stone transition-[transform,opacity,visibility] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none md:hidden ${open ? "visible translate-y-0 opacity-100" : "invisible pointer-events-none -translate-y-3 opacity-0"}`}
    >
      <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-6 pt-3">
        <nav aria-label={t("nav.menu", "Menu")} className="w-full">
          {/* Shop */}
          <Link href="/shop" onClick={onClose} className={indexRow}>
            <span className={indexLabel}>{t("shop.all_products", "All products")}</span>
            <i
              aria-hidden="true"
              className="fa-solid fa-arrow-right text-[17px] text-ink transition-[color,transform] duration-200 group-hover:translate-x-0.5 group-hover:text-logo-purple motion-reduce:transition-none"
            />
          </Link>
          {categories.length > 0 && (
            <ul
              aria-label={t("nav.categories", "Categories")}
              className="-mt-1 flex flex-wrap gap-x-5 pb-3"
            >
              {categories.map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/shop?category=${encodeURIComponent(category.name)}`}
                    onClick={onClose}
                    className={`group inline-flex min-h-11 items-center ${navFocus}`}
                  >
                    <span className="font-display text-[17px] leading-tight text-ink-muted transition-colors group-hover:text-logo-purple">
                      {category.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {onSearch && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onSearch();
              }}
              className={indexRow}
            >
              <span className={indexLabel}>{t("nav.search", "Search")}</span>
              <i
                aria-hidden="true"
                className="fa-solid fa-magnifying-glass text-[17px] text-ink transition-colors group-hover:text-logo-purple"
              />
            </button>
          )}

          {/* Account */}
          {signedIn ? (
            <>
              <Link href="/cart" onClick={onClose} className={indexRow}>
                <span className={indexLabel}>{t("nav.cart", "Cart")}</span>
                {cartCount > 0 && <span className={navBadge}>{cartCount}</span>}
              </Link>
              <Link href="/profile?tab=favorites" onClick={onClose} className={indexRow}>
                <span className={indexLabel}>{t("nav.favorites", "Favorites")}</span>
                {favoritesCount > 0 && <span className={navBadge}>{favoritesCount}</span>}
              </Link>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenNotifications();
                }}
                className={indexRow}
              >
                <span className={indexLabel}>{t("notifications.title", "Notifications")}</span>
                {unread > 0 && (
                  <span className={navBadge}>
                    {unread > 99 ? "99+" : unread}
                    <span className="sr-only"> {t("notifications.unread", "unread")}</span>
                  </span>
                )}
              </button>
              <Link href="/profile?tab=orders" onClick={onClose} className={indexRow}>
                <span className={indexLabel}>{t("nav.my_orders", "My orders")}</span>
              </Link>
              <Link href="/profile" onClick={onClose} className={indexRow}>
                <span className={indexLabel}>{t("profile.title", "Your profile")}</span>
              </Link>
              <SignOutRow onSignOut={onSignOut} iconClass="text-[17px]" index />
              <div className="border-t border-ink/15" />
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSignIn();
                }}
                className={indexRow}
              >
                <span className={indexLabel}>{t("nav.signin", "Sign in")}</span>
                <i
                  aria-hidden="true"
                  className="fa-regular fa-user text-[17px] text-ink transition-colors group-hover:text-logo-purple"
                />
              </button>
              <div className="border-t border-ink/15" />
            </>
          )}
        </nav>
      </div>

      {/* Pinned foot: socials, then region and currency. */}
      <div className="shrink-0 border-t border-ink/15 bg-stone px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-2">
            {SOCIALS.map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                aria-label={social.name}
                className={`flex h-11 w-11 items-center justify-center rounded-[10px] border border-ink/10 bg-white transition-colors hover:border-ink/25 ${navFocus}`}
              >
                <img src={social.icon} alt="" className="h-6 w-6" />
              </a>
            ))}
          </div>
          <RegionOptions onPicked={onClose} compact />
        </div>
        <p className="pt-2.5 font-geist text-[13px] leading-relaxed text-ink-muted">
          {t(
            "nav.region_note",
            "AED prices are shown for your convenience. Orders are charged in Indian rupees (INR).",
          )}
        </p>
      </div>
    </div>
  );
}
