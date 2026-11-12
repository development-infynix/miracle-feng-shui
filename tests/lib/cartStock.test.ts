import { describe, expect, it } from 'vitest';
import { isCartItemBlocked, isCartItemInCheckout, isCheckoutBlocked } from '@/cart/components/cartStock';

const item = (product: Record<string, unknown>, quantity = 1) =>
  ({ id: String(product.id), quantity, product: { id: 'p', price: 100, stock: 5, isActive: true, isPaused: false, ...product } }) as any;

describe('which cart items checkout includes', () => {
  it('leaves paused items out without blocking checkout', () => {
    const paused = item({ id: 'paused', isPaused: true, stock: 0 }, 3);
    const bell = item({ id: 'bell' });
    expect(isCartItemInCheckout(paused)).toBe(false);
    expect(isCartItemBlocked(paused)).toBe(false);
    expect(isCheckoutBlocked([paused, bell])).toBe(false);
  });

  it('blocks when only paused items are left, since there is nothing to order', () => {
    expect(isCheckoutBlocked([item({ id: 'paused', isPaused: true })])).toBe(true);
  });

  it('still blocks an item with too little stock', () => {
    expect(isCheckoutBlocked([item({ id: 'bell', stock: 1 }, 2)])).toBe(true);
  });
});
