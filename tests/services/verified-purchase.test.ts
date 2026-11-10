import { afterEach, describe, expect, it, vi } from 'vitest';
import { reviewService } from '@/server/services/review.service';
import { reviewRepository } from '@/server/repositories/review.repository';
import { productRepository } from '@/server/repositories/product.repository';
import { adminService } from '@/server/services/admin.service';
import { adminRepository } from '@/server/repositories/admin.repository';
import { orderRepository } from '@/server/repositories/order.repository';

const review = (userId: string, createdAt: string) => ({
  id: `r-${userId}`,
  userId,
  productId: 'p1',
  rating: 5,
  comment: 'Lovely',
  createdAt: new Date(createdAt),
  user: { id: userId, name: userId },
});

afterEach(() => vi.restoreAllMocks());

describe('Verified Purchase on reviews', () => {
  const list = async (reviews: ReturnType<typeof review>[], deliveries: { userId: string; deliveredAt: Date }[]) => {
    vi.spyOn(productRepository, 'findBySlugOrId').mockResolvedValue({ id: 'p1' } as any);
    vi.spyOn(reviewRepository, 'findPageByProductId').mockResolvedValue({ items: reviews as any, total: reviews.length });
    const find = vi.spyOn(reviewRepository, 'findDeliveries').mockResolvedValue(deliveries);
    const page = await reviewService.listByProduct('p1', 1);
    return { page, find };
  };

  it('marks a review written after the reviewer’s order of this product was delivered', async () => {
    const { page } = await list([review('asha', '2026-11-05')], [{ userId: 'asha', deliveredAt: new Date('2026-11-01') }]);
    expect(page.items[0].verifiedPurchase).toBe(true);
  });

  it('does not mark a review written before the delivery', async () => {
    const { page } = await list([review('asha', '2026-10-20')], [{ userId: 'asha', deliveredAt: new Date('2026-11-01') }]);
    expect(page.items[0].verifiedPurchase).toBe(false);
  });

  it('does not mark someone who never had it delivered here, but still shows their review', async () => {
    const { page } = await list([review('sam', '2026-11-05')], [{ userId: 'asha', deliveredAt: new Date('2026-11-01') }]);
    expect(page.items).toHaveLength(1);
    expect(page.items[0].verifiedPurchase).toBe(false);
  });

  it('checks every reviewer on the page with one lookup', async () => {
    const { find } = await list([review('asha', '2026-11-05'), review('sam', '2026-11-06'), review('asha', '2026-11-07')], []);
    expect(find).toHaveBeenCalledTimes(1);
    expect(find).toHaveBeenCalledWith('p1', ['asha', 'sam']);
  });

  it('marks a brand-new review straight away when it qualifies', async () => {
    vi.spyOn(productRepository, 'findBySlugOrId').mockResolvedValue({ id: 'p1' } as any);
    vi.spyOn(reviewRepository, 'findByUserAndProduct').mockResolvedValue(null);
    vi.spyOn(reviewRepository, 'hasDelivery').mockResolvedValue(true);
    vi.spyOn(reviewRepository, 'create').mockResolvedValue(review('asha', '2026-11-09') as any);
    vi.spyOn(reviewRepository, 'findDeliveries').mockResolvedValue([{ userId: 'asha', deliveredAt: new Date('2026-11-02') }]);

    const created = await reviewService.create('asha', 'p1', { rating: 5, comment: 'Lovely' } as any);
    expect(created.verifiedPurchase).toBe(true);
  });
});

describe('delivery date on orders', () => {
  const order = (overrides: Record<string, unknown> = {}) => ({ id: 'o1', status: 'SHIPPED', deliveredAt: null, refunds: [], ...overrides });
  const updated = { id: 'o1', createdAt: new Date(), shippingAddress: {}, items: [], status: 'DELIVERED', total: 1 };

  it('is set when the order is marked Delivered', async () => {
    vi.spyOn(orderRepository, 'findById').mockResolvedValue(order() as any);
    const save = vi.spyOn(adminRepository, 'updateOrderStatus').mockResolvedValue(updated as any);
    await adminService.updateOrderStatus('o1', { status: 'DELIVERED' } as any);
    expect(save.mock.calls[0][2]).toBeInstanceOf(Date);
  });

  it('keeps its first date when Delivered is saved again', async () => {
    const first = new Date('2026-11-01');
    vi.spyOn(orderRepository, 'findById').mockResolvedValue(order({ status: 'DELIVERED', deliveredAt: first }) as any);
    const save = vi.spyOn(adminRepository, 'updateOrderStatus').mockResolvedValue(updated as any);
    await adminService.updateOrderStatus('o1', { status: 'DELIVERED' } as any);
    expect(save.mock.calls[0][2]).toBe(first);
  });

  it('is cleared when the order is moved away from Delivered', async () => {
    vi.spyOn(orderRepository, 'findById').mockResolvedValue(order({ status: 'DELIVERED', deliveredAt: new Date() }) as any);
    const save = vi.spyOn(adminRepository, 'updateOrderStatus').mockResolvedValue({ ...updated, status: 'SHIPPED' } as any);
    await adminService.updateOrderStatus('o1', { status: 'SHIPPED' } as any);
    expect(save.mock.calls[0][2]).toBeNull();
  });
});
