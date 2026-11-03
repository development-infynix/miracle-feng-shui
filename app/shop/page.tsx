'use client';

import React, { Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { categories } from '@/lib/placeholder-data';
import { ProductCard } from '@/components/ProductCard';
import { useStore } from '@/context/StoreContext';
import { useLocale } from '@/context/CurrencyContext';
import { translateCategory } from '@/lib/translations';

function EtsyShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { products, categories: storeCategories } = useStore();
  const { formatPrice, currencySymbol, language, t } = useLocale();
  const availableCategories = storeCategories && storeCategories.length > 0 ? storeCategories : categories;

  const currentCategory = searchParams.get('category') || 'All';
  const searchQuery = searchParams.get('q') || '';
  const currentSort = searchParams.get('sort') || 'relevancy';
  const freeShippingFilter = searchParams.get('freeShipping') === 'true';
  const onSaleFilter = searchParams.get('onSale') === 'true';
  const priceFilter = searchParams.get('price') || 'all';

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const updateFilters = (updates: {
    category?: string;
    q?: string;
    sort?: string;
    freeShipping?: boolean;
    onSale?: boolean;
    price?: string;
  }) => {
    const params = new URLSearchParams(searchParams.toString());

    if (updates.category !== undefined) {
      if (updates.category === 'All') params.delete('category');
      else params.set('category', updates.category);
    }

    if (updates.q !== undefined) {
      if (!updates.q) params.delete('q');
      else params.set('q', updates.q);
    }

    if (updates.sort !== undefined) {
      if (updates.sort === 'relevancy') params.delete('sort');
      else params.set('sort', updates.sort);
    }

    if (updates.freeShipping !== undefined) {
      if (!updates.freeShipping) params.delete('freeShipping');
      else params.set('freeShipping', 'true');
    }

    if (updates.onSale !== undefined) {
      if (!updates.onSale) params.delete('onSale');
      else params.set('onSale', 'true');
    }

    if (updates.price !== undefined) {
      if (updates.price === 'all') params.delete('price');
      else params.set('price', updates.price);
    }

    const qs = params.toString();
    router.push(qs ? `/shop?${qs}` : '/shop');
  };

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.maker.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (currentCategory && currentCategory !== 'All') {
      result = result.filter(
        (p) => p.category.toLowerCase() === currentCategory.toLowerCase()
      );
    }

    // Free shipping
    if (freeShippingFilter) {
      result = result.filter((p) => p.freeShipping);
    }

    // On Sale
    if (onSaleFilter) {
      result = result.filter((p) => p.originalPrice && p.originalPrice > p.price);
    }

    // Price range
    if (priceFilter === 'under-1000') {
      result = result.filter((p) => p.price < 1000);
    } else if (priceFilter === '1000-1500') {
      result = result.filter((p) => p.price >= 1000 && p.price <= 1500);
    } else if (priceFilter === '1500-2000') {
      result = result.filter((p) => p.price > 1500 && p.price <= 2000);
    } else if (priceFilter === 'over-2000') {
      result = result.filter((p) => p.price > 2000);
    }

    // Sorting
    if (currentSort === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (currentSort === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (currentSort === 'reviews') {
      result.sort((a, b) => b.reviewCount - a.reviewCount);
    } else if (currentSort === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [
    searchQuery,
    currentCategory,
    freeShippingFilter,
    onSaleFilter,
    priceFilter,
    currentSort,
  ]);

  const clearAllFilters = () => {
    router.push('/shop');
  };

  return (
    <div className="bg-white min-h-screen pb-20">
      <div className="etsy-container py-6">
        {/* Breadcrumbs & Header */}
        <div className="flex items-center gap-2 text-[12px] text-etsy-gray mb-3">
          <button onClick={clearAllFilters} className="hover:underline">
            Miracle feng shui
          </button>
          <i className="fa-solid fa-chevron-right text-[10px]" />
          <span className="text-etsy-dark font-semibold">
            {searchQuery
              ? `${t('shop.results_for', 'Results for "{query}"').replace('{query}', searchQuery)}`
              : translateCategory(currentCategory, language)}
          </span>
        </div>

        {/* Top Filter Bar with Heading & Sort dropdown */}
        <div className="flex flex-col sm:row items-start sm:items-center justify-between gap-4 pb-6 border-b border-etsy-border">
          <div>
            <h1 className="text-[26px] md:text-[30px] font-bold text-etsy-dark">
              {searchQuery
                ? t('shop.results_for', 'Results for "{query}"').replace('{query}', searchQuery)
                : currentCategory === 'All'
                ? t('shop.all_items_heading', 'All Feng Shui & Spiritual Harmony Items')
                : translateCategory(currentCategory, language)}
            </h1>
            <p className="text-[13px] text-etsy-gray mt-1">
              ({filteredProducts.length} {t('shop.items_found', 'items found')})
            </p>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 self-start sm:self-auto w-full sm:w-auto justify-start">
            {/* Mobile Filter Toggle */}
            <button
              type="button"
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-full border border-etsy-dark text-[14px] font-semibold text-etsy-dark hover:bg-etsy-bg-soft"
            >
              <i className="fa-solid fa-sliders text-[13px]" />
              <span>{t('shop.filters', 'Filters')}</span>
            </button>

            {/* Sort Select */}
            <div className="flex items-center gap-2">
              <label htmlFor="sort-dropdown" className="text-[13px] text-etsy-gray font-medium hidden sm:inline">
                {t('shop.sort_by', 'Sort by:')}
              </label>
              <select
                id="sort-dropdown"
                value={currentSort}
                onChange={(e) => updateFilters({ sort: e.target.value })}
                className="bg-white border border-etsy-border rounded-full px-4 py-2 text-[13px] font-semibold text-etsy-dark focus:outline-none focus:ring-2 focus:ring-etsy-orange cursor-pointer"
              >
                <option value="relevancy">{t('shop.sort_relevancy', 'Relevancy')}</option>
                <option value="price-asc">{t('shop.sort_price_asc', 'Lowest Price')}</option>
                <option value="price-desc">{t('shop.sort_price_desc', 'Highest Price')}</option>
                <option value="reviews">{t('shop.sort_reviews', 'Top Customer Reviews')}</option>
                <option value="rating">{t('shop.sort_rating', 'Highest Rated')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Horizontal Category Tabs on Mobile (Aligned Left) */}
        <div className="lg:hidden flex items-center gap-2 overflow-x-auto py-3 no-scrollbar border-b border-gray-100 justify-start">
          {availableCategories.map((cat) => {
            const isActive =
              currentCategory === cat ||
              (cat === 'All' && !searchParams.get('category'));
            return (
              <button
                key={cat}
                onClick={() => updateFilters({ category: cat })}
                className={`px-3.5 py-1.5 rounded-full text-[13px] font-semibold whitespace-nowrap transition-colors shrink-0 ${
                  isActive
                    ? 'bg-[#111111] text-white'
                    : 'bg-[#F4F4F4] text-[#222222] hover:bg-[#EAEAEA]'
                }`}
              >
                {translateCategory(cat, language)}
              </button>
            );
          })}
        </div>

        {/* Main 2-Column Browse Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8 mt-8">
          {/* LEFT SIDEBAR FILTERS (Desktop) */}
          <aside className="hidden lg:block space-y-6 text-[14px] text-etsy-dark pr-4 border-r border-etsy-border/60">
            {/* Categories Filter */}
            <div>
              <h3 className="font-bold text-[14px] uppercase tracking-wider text-etsy-gray mb-3">
                {t('shop.categories', 'Categories')}
              </h3>
              <ul className="list-none p-0 m-0 space-y-2">
                {availableCategories.map((cat) => {
                  const isActive =
                    currentCategory === cat ||
                    (cat === 'All' && !searchParams.get('category'));
                  return (
                    <li key={cat}>
                      <button
                        onClick={() => updateFilters({ category: cat })}
                        className={`text-left text-[14px] w-full py-1 transition-colors ${
                          isActive
                            ? 'font-bold text-etsy-orange underline'
                            : 'hover:text-etsy-orange text-etsy-dark'
                        }`}
                      >
                        {translateCategory(cat, language)}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Special Offers */}
            <div className="border-t border-etsy-border pt-5">
              <h3 className="font-bold text-[14px] mb-3">{t('shop.special_offers', 'Special offers')}</h3>
              <div className="space-y-2.5">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={freeShippingFilter}
                    onChange={(e) =>
                      updateFilters({ freeShipping: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-etsy-orange focus:ring-etsy-orange"
                  />
                  <span className="text-[14px]">{t('shop.free_delivery', 'FREE delivery')}</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={onSaleFilter}
                    onChange={(e) =>
                      updateFilters({ onSale: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-etsy-orange focus:ring-etsy-orange"
                  />
                  <span className="text-[14px]">{t('shop.on_sale', 'On sale')}</span>
                </label>
              </div>
            </div>

            {/* Price Range */}
            <div className="border-t border-etsy-border pt-5">
              <h3 className="font-bold text-[14px] mb-3">{t('shop.price', 'Price')} ({currencySymbol})</h3>
              <div className="space-y-2">
                {[
                  { label: t('shop.any_price', 'Any price'), val: 'all' },
                  { label: `${t('shop.under_price', 'Under')} ${formatPrice(1000)}`, val: 'under-1000' },
                  { label: `${formatPrice(1000)} to ${formatPrice(1500)}`, val: '1000-1500' },
                  { label: `${formatPrice(1500)} to ${formatPrice(2000)}`, val: '1500-2000' },
                  { label: `${t('shop.over_price', 'Over')} ${formatPrice(2000)}`, val: 'over-2000' },
                ].map((p) => (
                  <label
                    key={p.val}
                    className="flex items-center gap-2.5 cursor-pointer select-none"
                  >
                    <input
                      type="radio"
                      name="price-filter"
                      checked={priceFilter === p.val}
                      onChange={() => updateFilters({ price: p.val })}
                      className="w-4 h-4 text-etsy-orange focus:ring-etsy-orange"
                    />
                    <span className="text-[14px]">{p.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Clear All Filters Button */}
            <div className="border-t border-etsy-border pt-5">
              <button
                onClick={clearAllFilters}
                className="w-full py-2 rounded-full border border-etsy-dark text-[13px] font-bold text-etsy-dark hover:bg-etsy-bg-soft transition-colors"
              >
                {t('shop.reset_filters', 'Reset all filters')}
              </button>
            </div>
          </aside>

          {/* RIGHT PRODUCT GRID OR EMPTY STATE */}
          <div>
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="py-24 text-center flex flex-col items-center justify-center bg-etsy-bg-soft rounded-2xl border border-etsy-border p-8">
                <h3 className="text-[22px] font-bold text-etsy-dark">
                  {t('shop.no_matches_title', "We couldn't find any matches")}
                </h3>
                <p className="text-[14px] text-etsy-gray mt-2 mb-6 max-w-[42ch]">
                  {t('shop.no_matches_desc', "Try adjusting your search query, checking for spelling errors, or clearing the selected filters.")}
                </p>
                <button
                  onClick={clearAllFilters}
                  className="bg-etsy-orange hover:bg-etsy-orange-dark text-white text-[14px] font-bold px-6 py-2.5 rounded-full transition-colors"
                >
                  {t('shop.clear_filters', 'Clear all filters')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EtsyShopPage() {
  return (
    <Suspense
      fallback={
        <div className="etsy-container py-24 text-center">
          <p className="text-etsy-gray text-[15px] font-medium">Loading Miracle feng shui finds...</p>
        </div>
      }
    >
      <EtsyShopContent />
    </Suspense>
  );
}
