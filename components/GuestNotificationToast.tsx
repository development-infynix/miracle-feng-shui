'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';

export function GuestNotificationToast() {
  const pathname = usePathname();
  const { guestToast, closeGuestToast, userLoggedIn } = useCart();

  // Auto-dismiss toast after 7 seconds
  useEffect(() => {
    if (guestToast?.open) {
      const timer = setTimeout(() => {
        closeGuestToast();
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [guestToast, closeGuestToast]);

  if (pathname?.startsWith('/admin') || !guestToast?.open || userLoggedIn) return null;

  const triggerAuth = (mode: 'signin' | 'register') => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('open-auth-modal', { detail: { mode } })
      );
    }
    closeGuestToast();
  };

  const getIcon = () => {
    if (guestToast.type === 'cart') {
      return <i className="fa-solid fa-bag-shopping text-[12px]" />;
    }
    if (guestToast.type === 'favorite') {
      return <i className="fa-solid fa-heart text-[12px]" />;
    }
    return <i className="fa-regular fa-clock text-[12px]" />;
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-[490px] animate-in slide-in-from-bottom-5 duration-300 pointer-events-auto select-none"
    >
      <div className="bg-[#4D6325] text-white p-3.5 sm:p-4 rounded-2xl shadow-2xl flex items-center gap-3.5 border border-white/15 backdrop-blur-xs">
        {/* Left Circular Badge */}
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#222222] text-white flex items-center justify-center shrink-0 shadow-inner">
          {getIcon()}
        </div>

        {/* Text Content */}
        <div className="flex-grow text-[12.5px] sm:text-[13px] leading-snug text-left">
          <p className="font-bold text-[13.5px] sm:text-[14px] text-white tracking-tight">
            {guestToast.title || (guestToast.type === 'cart' ? "Don't lose this item!" : "Don't lose this favourite!")}
          </p>
          <p className="text-white/95 text-[12px] sm:text-[12.5px] mt-0.5">
            <button
              type="button"
              onClick={() => triggerAuth('register')}
              className="underline font-bold hover:text-yellow-200 cursor-pointer transition-colors"
            >
              Register
            </button>{' '}
            or{' '}
            <button
              type="button"
              onClick={() => triggerAuth('signin')}
              className="underline font-bold hover:text-yellow-200 cursor-pointer transition-colors"
            >
              sign in
            </button>{' '}
            {guestToast.subtitle || (guestToast.type === 'cart' ? 'to add to your basket.' : 'to add to your wishlist.')}
          </p>
        </div>

        {/* Dismiss Button */}
        <button
          type="button"
          onClick={closeGuestToast}
          className="text-white/75 hover:text-white text-[19px] leading-none px-1.5 py-0.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer shrink-0"
          aria-label="Dismiss message"
        >
          ×
        </button>
      </div>
    </div>
  );
}
