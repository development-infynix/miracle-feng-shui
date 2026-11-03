'use client';

import React from 'react';
import Link from 'next/link';
import { CategoryCircleInfo } from '@/lib/placeholder-data';
import { useLocale } from '@/context/CurrencyContext';
import { translateCategory } from '@/lib/translations';

export function CategoryCircle({ category }: { category: CategoryCircleInfo }) {
  const { language } = useLocale();

  return (
    <Link
      href={`/shop?category=${encodeURIComponent(category.slug)}`}
      className="group flex flex-col items-center text-center no-underline w-full p-0 pb-3 rounded-[16px] sm:rounded-[20px] transition-all duration-300 hover:bg-white hover:shadow-[0_4px_22px_rgba(0,0,0,0.11)] border border-transparent hover:border-black/5"
    >
      <div className="relative w-full aspect-[1/1.08] rounded-[14px] sm:rounded-[18px] overflow-hidden bg-[#F0EFEB]">
        <img
          src={category.image}
          alt={category.name}
          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            const target = e.currentTarget;
            if (!target.src.includes('photo-1518895949257')) {
              target.src = 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=600&q=80';
            }
          }}
        />
      </div>
      <span style={{ fontWeight: 400 }} className="text-[13px] sm:text-[14px] font-normal text-etsy-dark mt-2.5 sm:mt-3 leading-snug block line-clamp-1">
        {translateCategory(category.name, language)}
      </span>
    </Link>
  );
}

