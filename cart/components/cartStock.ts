import type { CartItem } from '@/context/CartContext';

/** The product was archived after it was added. Archiving removes it from carts, so this is only a moment's leftover. */
export function isCartItemUnavailable(item: CartItem) {
  return item.product.isActive === false;
}

/** The product was paused after it was added: it stays in the cart, but checkout leaves it out for now. */
export function isCartItemPaused(item: CartItem) {
  return item.product.isPaused === true;
}

/** Whether checkout includes this item. Paused (and archived) products stay out of the order and its total. */
export function isCartItemInCheckout(item: CartItem) {
  return !isCartItemUnavailable(item) && !isCartItemPaused(item);
}

/** An item checkout would include, but with too little stock for its quantity: the order is refused until it's fixed. */
export function isCartItemBlocked(item: CartItem) {
  const { stock } = item.product;
  return isCartItemUnavailable(item) || (!isCartItemPaused(item) && stock !== undefined && item.quantity > stock);
}

/** Checkout can't go ahead: an item needs fixing, or nothing in the cart can be ordered right now. */
export function isCheckoutBlocked(items: CartItem[]) {
  return items.some(isCartItemBlocked) || !items.some(isCartItemInCheckout);
}
