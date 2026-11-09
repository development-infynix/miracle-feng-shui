'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ADMIN_CARD_IMAGE_SIZES, canResizeImage } from '@/lib/images';
import { MdKeyboardDoubleArrowRight } from 'react-icons/md';
import { OrderItemData } from '../types';
import OrderStatusSelect from './OrderStatusSelect';

interface OrderCardProps {
  order: OrderItemData;
  onView: (order: OrderItemData) => void;
  /** Called after the status is changed from the card. */
  onSaved: (updated: OrderItemData) => void;
}

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=600&q=80';

export default function OrderCard({ order, onView, onSaved }: OrderCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const firstItem = order.items[0];
  const imageSrc = firstItem && !imageFailed ? firstItem.image : FALLBACK_IMAGE;
  const itemCount = order.items.reduce((sum, it) => sum + it.quantity, 0);

  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-2xs overflow-hidden flex flex-col">
      <div className="relative w-full h-36 bg-gray-100">
        <Image
          src={imageSrc}
          alt={firstItem ? firstItem.productName : order.orderNumber}
          fill
          sizes={ADMIN_CARD_IMAGE_SIZES}
          unoptimized={!canResizeImage(imageSrc)}
          className="object-cover"
          onError={() => setImageFailed(true)}
        />
        {(order.refund?.status === 'REQUESTED' || order.refund?.status === 'FAILED') && (
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
            {order.refund.status === 'FAILED' ? 'Refund failed' : 'Refund requested'}
          </span>
        )}
        <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#040404] text-white">
          {order.paymentStatus}
        </span>
      </div>
      <div className="p-3 flex flex-col gap-1 flex-1">
        <div className="min-w-0">
          <span className="font-semibold text-gray-900 block truncate text-sm" title={order.orderNumber}>
            #{order.orderNumber}
          </span>
          <span className="text-[10.5px] text-gray-400 block truncate">
            {order.customerName} · {order.city}
          </span>
        </div>
        <div className="mt-1">
          <OrderStatusSelect order={order} onSaved={onSaved} />
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-t border-gray-100 bg-gray-50">
        <div className="min-w-0">
          <span className="font-bold text-gray-900 text-sm whitespace-nowrap block leading-tight">
            ₹{order.totalAmount.toLocaleString('en-IN')}
          </span>
          <span className="text-[10.5px] text-gray-500 whitespace-nowrap block leading-tight">
            {itemCount} {itemCount === 1 ? 'item' : 'items'} · {order.date}
          </span>
        </div>
        <button
          type="button"
          onClick={() => onView(order)}
          className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-md bg-[#040404] text-white hover:bg-black transition-colors cursor-pointer"
          title="View order"
        >
          View
          <MdKeyboardDoubleArrowRight className="ml-1" />
        </button>
      </div>
    </div>
  );
}
