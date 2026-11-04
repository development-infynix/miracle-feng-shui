'use client';

import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { StoreProvider } from '@/context/StoreContext';
import { CartProvider } from '@/context/CartContext';
import { LocaleProvider } from '@/context/CurrencyContext';
import { ProductDrawerProvider } from '@/shop/components/ProductDrawerProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <LocaleProvider>
        <StoreProvider>
          <CartProvider>
            <ProductDrawerProvider>{children}</ProductDrawerProvider>
          </CartProvider>
        </StoreProvider>
      </LocaleProvider>
    </SessionProvider>
  );
}
