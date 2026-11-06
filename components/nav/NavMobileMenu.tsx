"use client";

import React from "react";
import Link from "next/link";
import type { NavCategory } from "@/lib/nav-categories";
import { useLocale } from "@/context/CurrencyContext";
import { translateCategory } from "@/lib/translations";
import { FACEBOOK_URL, INSTAGRAM_URL } from "@/lib/social-links";
import RegionOptions from "./RegionOptions";
import { navBadge, navFocus, panelRow, panelRowLabel } from "./navUi";

interface NavMobileMenuProps {
  open: boolean;
  categories: NavCategory[];
  signedIn: boolean;
  favoritesCount: number;
  cartCount: number;
  onClose: () => void;
  /** Opens the search modal. Left out on pages with their own search, such as the shop. */
  onSearch?: () => void;
  onSignIn: () => void;
  onSignOut: () => void;
}

/** Phones: a stone sheet under the bar with categories, links, account and socials. */
export default function NavMobileMenu({
  open,
  categories,
  signedIn,
  favoritesCount,
  cartCount,
  onClose,
  onSearch,
  onSignIn,
  onSignOut,
}: NavMobileMenuProps) {
  const { language, t } = useLocale();

  return (
    <div
      id="nav-mobile-menu"
      className={`fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto overscroll-contain bg-stone transition-[opacity,visibility] duration-200 ease-out motion-reduce:transition-none md:hidden ${open ? "visible opacity-100" : "invisible pointer-events-none opacity-0"}`}
    >
      <nav aria-label={t("nav.menu", "Menu")} className="px-4 pb-10 pt-4">
        <h2>
          <span className="font-display text-[22px] font-bold text-ink">
            {t("nav.categories", "Categories")}
          </span>
        </h2>
        <ul className="mt-3 grid list-none grid-cols-2 gap-3">
          {categories.map((category) => {
            const name = translateCategory(category.name, language);
            return (
              <li key={category.id}>
                <Link
                  href={`/shop?category=${encodeURIComponent(category.name)}`}
                  onClick={onClose}
                  className={`flex items-center gap-2.5 rounded-[10px] bg-white p-2 ${navFocus}`}
                >
                  <span className="h-11 w-11 shrink-0 overflow-hidden rounded-[6px] bg-[#DDD8CC]">
                    {category.image && (
                      <img
                        src={category.image}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    )}
                  </span>
                  <span className="min-w-0 font-geist text-[14px] font-medium leading-snug text-ink">
                    {name}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-2 border-b border-ink/15 pb-3">
          <Link href="/shop" onClick={onClose} className={panelRow}>
            <span className={`${panelRowLabel} flex-1`}>
              {t("nav.all_products", "All products")}
            </span>
            <i
              aria-hidden="true"
              className="fa-solid fa-arrow-right text-[13px] text-ink"
            />
          </Link>
        </div>

        <div className="mt-3 flex flex-col">
          {onSearch && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onSearch();
              }}
              className={panelRow}
            >
              <i
                aria-hidden="true"
                className="fa-solid fa-magnifying-glass w-5 text-center text-[15px] text-ink-muted"
              />
              <span className={panelRowLabel}>{t("nav.search", "Search")}</span>
            </button>
          )}

          {signedIn && (
            <Link href="/cart" onClick={onClose} className={panelRow}>
              <i
                aria-hidden="true"
                className="fa-solid fa-cart-shopping w-5 text-center text-[15px] text-ink-muted"
              />
              <span className={`${panelRowLabel} flex-1`}>
                {t("nav.cart", "Cart")}
              </span>
              {cartCount > 0 && <span className={navBadge}>{cartCount}</span>}
            </Link>
          )}

          {signedIn ? (
            <>
              <Link
                href="/profile?tab=favorites"
                onClick={onClose}
                className={panelRow}
              >
                <i
                  aria-hidden="true"
                  className="fa-regular fa-heart w-5 text-center text-[15px] text-ink-muted"
                />
                <span className={`${panelRowLabel} flex-1`}>
                  {t("nav.favorites", "Favorites")}
                </span>
                {favoritesCount > 0 && (
                  <span className={navBadge}>{favoritesCount}</span>
                )}
              </Link>
              <Link
                href="/profile?tab=orders"
                onClick={onClose}
                className={panelRow}
              >
                <i
                  aria-hidden="true"
                  className="fa-regular fa-calendar-check w-5 text-center text-[15px] text-ink-muted"
                />
                <span className={panelRowLabel}>
                  {t("nav.my_orders", "My orders")}
                </span>
              </Link>
              <Link href="/profile" onClick={onClose} className={panelRow}>
                <i
                  aria-hidden="true"
                  className="fa-regular fa-user w-5 text-center text-[15px] text-ink-muted"
                />
                <span className={panelRowLabel}>
                  {t("profile.title", "Your profile")}
                </span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSignOut();
                }}
                className={panelRow}
              >
                <i
                  aria-hidden="true"
                  className="fa-solid fa-arrow-right-from-bracket w-5 text-center text-[15px] text-ink-muted"
                />
                <span className={panelRowLabel}>
                  {t("nav.sign_out", "Sign out")}
                </span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                onClose();
                onSignIn();
              }}
              className={panelRow}
            >
              <i
                aria-hidden="true"
                className="fa-regular fa-user w-5 text-center text-[15px] text-ink-muted"
              />
              <span className={panelRowLabel}>
                {t("nav.signin", "Sign in")}
              </span>
            </button>
          )}
        </div>

        {/* Region & currency, for guests too. */}
        <div className="mt-3 border-t border-ink/15 pt-3">
          <RegionOptions onPicked={onClose} />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3 border-t border-ink/15 pt-4">
          {[
            {
              name: "Instagram",
              url: INSTAGRAM_URL,
              icon: "/images/instagram-badge.svg",
            },
            {
              name: "Facebook",
              url: FACEBOOK_URL,
              icon: "/images/facebook.svg",
            },
          ].map((social) => (
            <a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className={`flex items-center gap-2.5 rounded-[10px] bg-white p-3 ${navFocus}`}
            >
              <img src={social.icon} alt="" className="h-6 w-6 shrink-0" />
              <span className="font-geist text-[14px] font-medium text-ink">
                {social.name}
              </span>
            </a>
          ))}
        </div>
      </nav>
    </div>
  );
}
