import { Suspense } from 'react';
import type { Metadata } from 'next';
import OrderConfirmationView from '@/order-confirmation/components/OrderConfirmationView';

export const metadata: Metadata = {
  title: 'Your order | Miracle feng shui',
  description: 'Your order details and confirmation.',
  robots: { index: false },
};

export default function OrderConfirmationPage() {
  return (
    <Suspense>
      <OrderConfirmationView />
    </Suspense>
  );
}
