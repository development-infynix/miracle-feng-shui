import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const getServerSession = vi.hoisted(() => vi.fn());
const db = vi.hoisted(() => ({
  product: { findFirst: vi.fn(), update: vi.fn() },
  review: { findUnique: vi.fn(), create: vi.fn() },
  orderItem: { findMany: vi.fn().mockResolvedValue([]) },
}));

vi.mock('next-auth', () => ({ getServerSession }));
vi.mock('@/lib/auth', () => ({ authOptions: {} }));
vi.mock('@/lib/prisma', () => ({ default: db, prisma: db }));

import { POST } from '@/app/api/products/[slug]/reviews/route';

const post = (body: unknown) =>
  POST(
    new NextRequest('http://localhost/api/products/p1/reviews', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
    { params: Promise.resolve({ slug: 'p1' }) }
  );

describe('POST /api/products/[slug]/reviews', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getServerSession.mockResolvedValue({ user: { id: 'u1', name: 'Asha', role: 'CUSTOMER' } });
    db.product.findFirst.mockResolvedValue({ id: 'p1', ratingAvg: 4.9 });
    db.review.findUnique.mockResolvedValue(null);
    db.orderItem.findMany.mockResolvedValue([]);
    db.review.create.mockResolvedValue({
      id: 'r1',
      userId: 'u1',
      rating: 5,
      comment: 'Lovely piece',
      createdAt: new Date('2026-11-04T00:00:00Z'),
      productId: 'p1',
      user: { id: 'u1', name: 'Asha' },
    });
  });

  it('requires a logged-in customer', async () => {
    getServerSession.mockResolvedValue(null);

    const res = await post({ rating: 5, comment: 'Lovely piece' });

    expect(res.status).toBe(401);
    expect(db.review.create).not.toHaveBeenCalled();
  });

  it('saves the review for the logged-in customer without changing the product rating', async () => {
    const res = await post({ rating: 5, comment: '  Lovely piece  ', userId: 'someone-else' });

    expect(res.status).toBe(201);
    expect(db.review.create.mock.calls[0][0].data).toMatchObject({
      userId: 'u1',
      productId: 'p1',
      rating: 5,
      comment: 'Lovely piece',
    });
    expect(db.product.update).not.toHaveBeenCalled();
  });

  it("saves a review from a customer who hasn't bought it, without Verified Purchase", async () => {
    db.orderItem.findMany.mockResolvedValue([]);

    const res = await post({ rating: 3, comment: 'Never bought it' });

    expect(res.status).toBe(201);
    expect((await res.json()).data.verifiedPurchase).toBe(false);
  });

  it('marks it Verified Purchase when the product was delivered to them before the review', async () => {
    db.orderItem.findMany.mockResolvedValue([{ order: { userId: 'u1', deliveredAt: new Date('2026-11-01T00:00:00Z') } }]);

    const res = await post({ rating: 5, comment: 'Lovely piece' });

    expect((await res.json()).data.verifiedPurchase).toBe(true);
  });

  it('rejects a second review of the same product', async () => {
    db.review.findUnique.mockResolvedValue({ id: 'r0' });

    const res = await post({ rating: 4, comment: 'Second try' });

    expect(res.status).toBe(409);
    expect(db.review.create).not.toHaveBeenCalled();
  });

  it.each([
    [{ rating: 0, comment: 'Lovely piece' }],
    [{ rating: 6, comment: 'Lovely piece' }],
    [{ rating: 5, comment: '   ' }],
  ])('rejects invalid input %j', async (body) => {
    const res = await post(body);

    expect(res.status).toBe(400);
    expect(db.review.create).not.toHaveBeenCalled();
  });
});
