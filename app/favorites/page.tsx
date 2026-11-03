'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { ProductCard } from '@/components/ProductCard';

export default function FavoritesPage() {
  const { favorites, removeFavorite, userLoggedIn } = useCart();

  const triggerAuth = (mode: 'signin' | 'register') => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('open-auth-modal', { detail: { mode } })
      );
    }
  };

  return (
    <div className="bg-white min-h-[calc(100vh-140px)] flex flex-col justify-start relative pb-20">
      <div className="etsy-container py-6 sm:py-7 max-w-[1320px]">
        {/* Top Header Row: "Favourite items" + "Sign in" button + "Private" & Pencil */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4 sm:mb-5">
          {/* Left: Title & Sign in button */}
          <div className="flex items-center gap-3">
            <h1 className="text-[30px] sm:text-[36px] font-serif font-normal text-[#222222] tracking-tight leading-none select-none">
              Favourite items
            </h1>
            {!userLoggedIn && (
              <button
                type="button"
                onClick={() => triggerAuth('signin')}
                className="border border-[#222222] hover:bg-[#F5F5F1] text-[#222222] font-semibold text-[13px] sm:text-[13.5px] px-3.5 py-1 rounded-full transition-colors cursor-pointer active:scale-95"
              >
                Sign in
              </button>
            )}
          </div>

          {/* Right: Private status & Pencil icon */}
          <div className="flex items-center gap-2 text-[14.5px] text-[#222222] font-medium">
            <div className="flex items-center gap-1.5">
              <i className="fa-solid fa-lock text-[13px] text-[#222222]" />
              <span className="font-semibold text-[14px]">Private</span>
            </div>
            <button
              type="button"
              onClick={() => triggerAuth('signin')}
              className="p-1.5 rounded-full hover:bg-gray-100 text-[#222222] transition-colors cursor-pointer"
              aria-label="Edit list settings"
              title="Edit list"
            >
              <i className="fa-solid fa-pencil text-[12px] text-[#222222]" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-6 border-b border-[#E1E1DE] mb-6">
          <button
            type="button"
            className="text-[14px] sm:text-[15px] font-bold text-[#222222] pb-2.5 border-b-2 border-[#222222] -mb-px flex items-center gap-1.5"
          >
            <span>Items</span>
            <span className="text-[12px] bg-[#EFEFEA] text-[#222222] px-2 py-0.5 rounded-full font-semibold">
              {favorites.length}
            </span>
          </button>
        </div>

        {/* EMPTY STATE */}
        {favorites.length === 0 ? (
          <div className="py-12 sm:py-16 text-center flex flex-col items-center justify-center">
            {/* Jewelry Mannequin Bust Icon Silhouette */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 mb-3 flex items-center justify-center text-[#222222]">
              <svg
                viewBox="0 0 64 64"
                className="w-14 h-14 sm:w-16 sm:h-16 stroke-current fill-none stroke-[2.2] stroke-linecap-round stroke-linejoin-round"
              >
                {/* Mannequin head oval */}
                <ellipse cx="32" cy="14" rx="8" ry="9" />
                {/* Neck */}
                <path d="M29 23 L29 27 M35 23 L35 27" />
                {/* Shoulders and chest contour */}
                <path d="M20 30 C24 27 28 27 32 27 C36 27 40 27 44 30 L47 38 C47 43 43 46 32 46 C21 46 17 43 17 38 Z" />
                {/* Torso stand pole */}
                <path d="M32 46 L32 58" />
                {/* Pedestal base */}
                <path d="M24 58 L40 58" />
              </svg>
            </div>

            <h2 className="text-[20px] sm:text-[21px] font-bold text-[#222222] mb-1.5 tracking-tight">
              Nothing here... yet.
            </h2>

            <p className="text-[13.5px] sm:text-[14px] text-[#595959] max-w-[420px] leading-relaxed mx-auto">
              These are a few of your favourite things... or they will be, once you favourite something.
            </p>
          </div>
        ) : (
          /* POPULATED FAVORITES GRID */
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
              {favorites.map((product) => (
                <div key={product.id} className="relative group flex flex-col">
                  <ProductCard product={product} />
                  <button
                    type="button"
                    onClick={() => removeFavorite(product.id)}
                    className="mt-2 text-[12px] font-semibold text-[#595959] hover:text-red-600 flex items-center gap-1.5 transition-colors self-start cursor-pointer"
                  >
                    <i className="fa-regular fa-trash-can text-[12px]" />
                    <span>Remove from favourites</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
