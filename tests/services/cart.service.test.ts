import { afterEach, describe, expect, it, vi } from 'vitest';
import { cartService } from '@/server/services/cart.service';
import { cartRepository } from '@/server/repositories/cart.repository';
import { productRepository } from '@/server/repositories/product.repository';

describe('cartService, for a paused product', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('refuses to add it to the cart, and changes nothing', async () => {
    vi.spyOn(productRepository, 'findBySlugOrId').mockResolvedValueOnce({
      id: 'prod-1', stock: 5, isActive: true, isPaused: true,
    } as any);
    const addSpy = vi.spyOn(cartRepository, 'addItem');

    await expect(cartService.addItem('user-1', { productId: 'prod-1', quantity: 1 } as any)).rejects.toMatchObject({
      statusCode: 400,
      message: expect.stringContaining('currently unavailable'),
    });
    expect(addSpy).not.toHaveBeenCalled();
  });

  it('refuses to change its quantity in the cart', async () => {
    vi.spyOn(cartRepository, 'findOrCreateCart').mockResolvedValueOnce({
      id: 'cart-1',
      items: [{ id: 'item-1', product: { stock: 5, isPaused: true } }],
    } as any);
    const updateSpy = vi.spyOn(cartRepository, 'updateItemQty');

    await expect(cartService.updateItemQty('user-1', 'item-1', 2)).rejects.toThrow('currently unavailable');
    expect(updateSpy).not.toHaveBeenCalled();
  });
});
