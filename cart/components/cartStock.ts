import type { CartItem } from '@/context/CartContext';

/** The order is refused if an item has too little stock, so the cart says so before checkout. */
export function isCartItemBlocked(item: CartItem) {
  const { stock } = item.product;
  return stock !== undefined && item.quantity > stock;
}
