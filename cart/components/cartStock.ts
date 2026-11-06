import type { CartItem } from '@/context/CartContext';

/** The product was archived after it was added: it's hidden from the store and can't be ordered. */
export function isCartItemUnavailable(item: CartItem) {
  return item.product.isActive === false;
}

/** The order is refused if an item is no longer sold or has too little stock, so the cart says so before checkout. */
export function isCartItemBlocked(item: CartItem) {
  const { stock } = item.product;
  return isCartItemUnavailable(item) || (stock !== undefined && item.quantity > stock);
}
