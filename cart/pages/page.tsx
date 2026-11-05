import type { Metadata } from 'next';
import CartView from '@/cart/components/CartView';

export const metadata: Metadata = {
  title: 'Your cart | Miracle feng shui',
  description: 'Review the items in your cart and continue to checkout.',
};

export default function CartPage() {
  return <CartView />;
}
