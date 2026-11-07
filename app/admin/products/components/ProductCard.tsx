'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ADMIN_CARD_IMAGE_SIZES, canResizeImage } from '@/lib/images';
import { Product } from '@/lib/placeholder-data';
import { MdKeyboardDoubleArrowRight } from 'react-icons/md';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=600&q=80';

interface ProductCardProps {
  product: Product;
  onView: (product: Product) => void;
}

export default function ProductCard({ product, onView }: ProductCardProps) {
  const prod = product;
  const [imageFailed, setImageFailed] = useState(false);
  const imageSrc = !imageFailed && prod.images[0] ? prod.images[0] : FALLBACK_IMAGE;

  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-2xs overflow-hidden flex flex-col">
      <div className="relative w-full h-36 bg-gray-100">
        <Image
          src={imageSrc}
          alt={prod.name}
          fill
          sizes={ADMIN_CARD_IMAGE_SIZES}
          unoptimized={!canResizeImage(imageSrc)}
          className={`object-cover ${prod.isActive === false ? 'opacity-50 grayscale' : ''}`}
          onError={() => setImageFailed(true)}
        />
        {prod.isActive === false ? (
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#040404] text-white">Inactive</span>
        ) : prod.isPaused ? (
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-800 border border-amber-200">Paused</span>
        ) : null}
        {prod.stock === 0 ? (
          <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-50 text-rose-700 border border-rose-200">Out</span>
        ) : (prod.stock ?? 50) < 10 ? (
          <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-bold bg-gray-100 text-gray-800 border border-gray-300">Low: {prod.stock}</span>
        ) : null}
      </div>
      <div className="p-3 flex flex-col gap-1 flex-1">
        <div className="min-w-0">
          <span className="font-semibold text-gray-900 block truncate text-sm" title={prod.name}>{prod.name}</span>
          <span className="text-[10.5px] text-gray-400 block truncate">{prod.category}</span>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-t border-gray-100 bg-gray-50">
        <div className="min-w-0">
          <span className="font-bold text-gray-900 text-sm">₹{prod.price.toLocaleString('en-IN')}</span>
          {prod.originalPrice ? (
            <span className="text-[9.5px] text-gray-400 line-through ml-1.5">₹{prod.originalPrice.toLocaleString('en-IN')}</span>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => onView(prod)}
          className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-md bg-[#040404] text-white hover:bg-black transition-colors cursor-pointer"
          title="View product"
        >
          View
          <MdKeyboardDoubleArrowRight className="ml-1" />
        </button>
      </div>
    </div>
  );
}