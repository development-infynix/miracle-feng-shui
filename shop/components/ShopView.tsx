"use client";

import React, { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ProductSummary } from "@/lib/placeholder-data";
import { useLocale } from "@/context/CurrencyContext";
import { translateCategory } from "@/lib/translations";
import { useSiteHeaderHeight } from "@/lib/useSiteHeaderHeight";
import ShopAppliedFilters from "./ShopAppliedFilters";
import ShopFilterDrawer from "./ShopFilterDrawer";
import ShopProductGrid from "./ShopProductGrid";
import {
  countActiveFilters,
  shopUrl,
  type ShopCategory,
  type ShopFilters,
} from "./shopFilters";

const CONTAINER = "mx-auto w-full max-w-[1280px] px-3 sm:px-6";

interface ShopViewProps {
  filters: ShopFilters;
  categories: ShopCategory[];
  products: ProductSummary[];
  total: number;
  /** Open the filters drawer on arrival, as the homepage's All categories card asks. */
  browseCategories?: boolean;
}

/** The shop page's client side: holds the drawer and the pending state while filters load. */
export default function ShopView({
  filters,
  categories,
  products,
  total,
  browseCategories = false,
}: ShopViewProps) {
  const router = useRouter();
  const { language, t } = useLocale();
  const [drawerOpen, setDrawerOpen] = useState(browseCategories);
  const [pending, startTransition] = useTransition();
  const headerHeight = useSiteHeaderHeight();
  const [query, setQuery] = useState(filters.q);
  // The last search this box sent, so its own result doesn't overwrite what the customer has typed since.
  const sentQuery = useRef(filters.q);

  // Keep the box in step when the search changes elsewhere, such as removing its chip.
  useEffect(() => {
    if (filters.q !== sentQuery.current) {
      sentQuery.current = filters.q;
      setQuery(filters.q);
    }
  }, [filters.q]);

  const applyFilters = (next: ShopFilters, { replace = false } = {}) => {
    startTransition(() => {
      if (replace) router.replace(shopUrl(next), { scroll: false });
      else router.push(shopUrl(next), { scroll: false });
    });
  };

  // Search as you type: the server searches once typing pauses. Typing replaces the address
  // instead of adding a history entry for every pause.
  const SEARCH_DELAY_MS = 400;
  const filtersRef = useRef(filters);
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);
  useEffect(() => {
    const q = query.trim();
    if (q === sentQuery.current) return;
    const timer = setTimeout(() => {
      sentQuery.current = q;
      applyFilters({ ...filtersRef.current, q }, { replace: true });
    }, SEARCH_DELAY_MS);
    return () => clearTimeout(timer);
    // applyFilters is recreated every render; the timer only needs to restart when the text changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  let heading = t("nav.products", "Products");
  if (filters.q)
    heading = t("shop.results_for", 'Results for "{query}"').replace(
      "{query}",
      filters.q,
    );
  else if (filters.category)
    heading = translateCategory(filters.category, language);

  const activeCount = countActiveFilters(filters);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (q === sentQuery.current) return;
    sentQuery.current = q;
    applyFilters({ ...filters, q });
  };

  return (
    <div className="pb-20 font-outfit">
      {/* There's no visible page heading, so this names the page for screen readers and search engines. */}
      <h1 aria-live="polite" className="sr-only">
        {heading} ({total})
      </h1>

      {/* Sticks under the site header. Products start below it and only ever scroll beneath it. */}
      <div className="sticky z-30 bg-[#EEEBE3]" style={{ top: headerHeight }}>
        {/* The site header is see-through, so this covers products passing behind its pills. */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-full bg-[#EEEBE3]"
          style={{ height: headerHeight }}
        />

        {/* Phones: search and Filters share the full width, with applied filters below.
            Tablet and up: applied filters on the left, search and Filters on the right. */}
        <div
          className={`${CONTAINER} flex flex-col gap-2.5 py-3 md:flex-row md:items-center md:gap-3`}
        >
          <div className="order-2 min-w-0 empty:hidden md:order-1 md:flex-1">
            <ShopAppliedFilters filters={filters} onChange={applyFilters} />
          </div>
          <div className="order-1 flex w-full items-center gap-2 md:order-2 md:ml-auto md:w-auto">
            <form
              role="search"
              onSubmit={submitSearch}
              className="relative min-w-0 flex-1 md:w-72 md:flex-none"
            >
              <label htmlFor="shop-search" className="sr-only">
                {t("shop.search_products", "Search products")}
              </label>
              <i
                aria-hidden="true"
                className="fa-solid fa-magnifying-glass pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[14px] text-ink-muted"
              />
              <input
                id="shop-search"
                type="search"
                enterKeyHint="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("shop.search_placeholder", "Search products")}
                // The field draws its own focus state.
                style={{ outline: "none" }}
                className="h-11 w-full border border-ink/25 bg-transparent pl-10 pr-10 font-geist text-[16px] text-ink caret-ink transition-[border-color,background-color] placeholder:text-ink-muted hover:bg-white/40 focus:border-ink focus:bg-white/60 [&::-webkit-search-cancel-button]:hidden"
              />
              {query && (
                <button
                  type="button"
                  aria-label={t("shop.clear_search", "Clear search")}
                  onClick={() => {
                    setQuery("");
                    if (filters.q) {
                      sentQuery.current = "";
                      applyFilters({ ...filters, q: "" });
                    }
                  }}
                  className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center focus-visible:outline-2 focus-visible:outline-ink"
                >
                  <i
                    aria-hidden="true"
                    className="fa-solid fa-xmark text-[14px] text-ink-muted"
                  />
                </button>
              )}
            </form>
            <button
              type="button"
              aria-haspopup="dialog"
              aria-label={t("shop.filters", "Filters")}
              aria-expanded={drawerOpen}
              onClick={() => setDrawerOpen(true)}
              // Sharp like the cards: an outline at rest, filled charcoal while filters are applied.
              className={`group inline-flex h-11 min-w-11 shrink-0 cursor-pointer items-center justify-center gap-2.5 border px-3 md:px-4 transition-[background-color,box-shadow] duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
                activeCount > 0
                  ? "border-ink-fill bg-ink-fill hover:shadow-[0_8px_22px_rgba(231,169,59,0.45)]"
                  : "border-ink/25 hover:bg-white/60"
              }`}
            >
              <i
                aria-hidden="true"
                className={`fa-solid fa-sliders text-[14px] ${activeCount > 0 ? "text-stone" : "text-ink transition-colors group-hover:text-logo-purple"}`}
              />
              <span
                className={`hidden font-geist text-[15px] font-semibold md:inline ${activeCount > 0 ? "text-stone" : "text-ink transition-colors group-hover:text-logo-purple"}`}
              >
                {t("shop.filters", "Filters")}
              </span>
              {activeCount > 0 && (
                <span className="inline-flex h-5 min-w-5 items-center justify-center bg-stone px-1 font-geist text-[11px] font-bold leading-none text-ink tabular-nums">
                  {activeCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className={CONTAINER}>
        <div className="mt-2">
          {/* A new filter set starts a fresh list. */}
          <ShopProductGrid
            key={shopUrl(filters)}
            filters={filters}
            initialProducts={products}
            total={total}
            pending={pending}
            onClearFilters={applyFilters}
          />
        </div>
      </div>

      <ShopFilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        filters={filters}
        categories={categories}
        total={total}
        pending={pending}
        onChange={applyFilters}
      />
    </div>
  );
}
