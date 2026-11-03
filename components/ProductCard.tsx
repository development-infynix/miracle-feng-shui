'use client';

import React from 'react';
import Link from 'next/link';
import { Product } from '@/lib/placeholder-data';
import { useCart } from '@/context/CartContext';
import { useLocale } from '@/context/CurrencyContext';
import { translateProductTitle } from '@/lib/translations';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { isFavorite, addFavorite, removeFavorite } = useCart();
  const { formatPrice, t, language } = useLocale();
  const favorited = isFavorite(product.id);
  const localizedTitle = translateProductTitle(product.name, language, product.id);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (favorited) {
      removeFavorite(product.id);
    } else {
      addFavorite(product);
    }
  };

  const mainImage = product.images[0];

  return (
    <Link
      href={`/product/${product.id}`}
      className="group flex flex-col no-underline text-inherit hover:-translate-y-1 transition-all duration-200"
    >
      {/* 1. Image Area with Badges & Favorite Heart */}
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-etsy-bg-soft border border-etsy-border/60">
        <img
          src={mainImage}
          alt={localizedTitle}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={(e) => {
            const target = e.currentTarget;
            if (!target.src.includes('photo-1518895949257')) {
              target.src = 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=600&q=80';
            }
          }}
        />

        {/* Overlay Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10 pointer-events-none">
          {product.stock !== undefined && product.stock > 0 && product.stock < 10 && (
            <span className="bg-[#C2410C] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full tracking-wide shadow-xs flex items-center gap-1">
              <i className="fa-solid fa-fire text-[9px]" />
              Only {product.stock} left
            </span>
          )}
          {product.stock === 0 && (
            <span className="bg-red-700 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full tracking-wide shadow-xs">
              Out of stock
            </span>
          )}
          {product.bestseller && (
            <span className="bg-black/85 text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full tracking-wide shadow-xs backdrop-blur-xs">
              {t('badge.bestseller', 'Bestseller')}
            </span>
          )}
          {product.etsyPick && !product.bestseller && (
            <span className="bg-white/95 text-[#111111] border border-black/10 text-[10px] font-semibold px-2.5 py-0.5 rounded-full tracking-wide shadow-xs backdrop-blur-xs">
              {t('badge.miracle_pick', 'Miracle Pick')}
            </span>
          )}
        </div>

        {/* Floating Heart Button */}
        <button
          type="button"
          aria-label={favorited ? 'Remove from favorites' : 'Save to favorites'}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onClick={toggleFavorite}
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center transition-all duration-200 z-10 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 hover:scale-110 active:scale-95 cursor-pointer"
        >
          <i
            className={`text-[13px] transition-colors ${
              favorited
                ? 'fa-solid fa-heart text-[#F1641E]'
                : 'fa-regular fa-heart text-[#111111] hover:text-[#F1641E]'
            }`}
          />
        </button>
      </div>

      {/* 2. Card Body */}
      <div className="pt-2.5 flex flex-col flex-grow">
        {/* Title */}
        <h3 style={{ fontWeight: 400 }} className="text-[13.5px] font-normal text-etsy-dark leading-snug line-clamp-2 no-underline">
          {localizedTitle}
        </h3>

        {/* Rating & Review Count */}
        <div className="flex items-center gap-1.5 mt-1.5">
          <div className="flex items-center gap-0.5 text-[#E59819]">
            {[...Array(5)].map((_, i) => (
              <i key={i} className="fa-solid fa-star text-[11px] leading-none" />
            ))}
          </div>
          <span className="text-[12px] text-etsy-gray font-normal">
            ({product.reviewCount > 1000 ? `${(product.reviewCount / 1000).toFixed(1)}k` : product.reviewCount})
          </span>
        </div>

        {/* Price & Discounts */}
        <div className="flex items-baseline flex-wrap gap-1.5 mt-1.5">
          <span className="text-[16px] font-bold text-etsy-dark">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-[13px] text-etsy-gray line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
          {product.discount && (
            <span className="text-[12px] font-semibold text-etsy-green">
              ({product.discount})
            </span>
          )}
        </div>

        {/* Free Shipping Tag */}
        {product.freeShipping && (
          <div className="text-[12px] font-semibold text-etsy-green mt-0.5 flex items-center gap-1">
            <i className="fa-solid fa-truck-fast text-[11px]" />
            <span>{t('badge.free_delivery', 'FREE delivery')}</span>
          </div>
        )}

        {/* Low Stock Indicator (< 10 products left) */}
        {product.stock !== undefined && product.stock > 0 && product.stock < 10 && (
          <div className="text-[11.5px] font-bold text-[#C2410C] mt-1 flex items-center gap-1">
            <i className="fa-solid fa-fire text-[#EA580C] text-[10.5px]" />
            <span>Only {product.stock} left in stock — order soon!</span>
          </div>
        )}
        {product.stock === 0 && (
          <div className="text-[11.5px] font-bold text-red-600 mt-1 flex items-center gap-1">
            <i className="fa-solid fa-circle-xmark text-[10.5px]" />
            <span>Out of stock</span>
          </div>
        )}
      </div>
    </Link>
  );
}
