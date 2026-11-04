import { afterEach, describe, expect, it, vi } from 'vitest';
import { REVIEW_PAGE_SIZE, reviewService } from '@/server/services/review.service';
import { reviewRepository } from '@/server/repositories/review.repository';
import { productRepository } from '@/server/repositories/product.repository';

const review = {
  id: 'r1',
  userId: 'user-1',
  productId: 'prod-1',
  rating: 4,
  comment: 'Lovely',
  productVariation: null,
  createdAt: new Date('2026-11-01T00:00:00Z'),
  user: { id: 'user-1', name: 'Asha' },
};

afterEach(() => vi.restoreAllMocks());

describe('reviewService.listByProduct', () => {
  it('returns the exact total for the product found by slug or id', async () => {
    vi.spyOn(productRepository, 'findBySlugOrId').mockResolvedValue({ id: 'prod-1' } as any);
    const findPage = vi
      .spyOn(reviewRepository, 'findPageByProductId')
      .mockResolvedValue({ items: [review] as any, total: 21 });

    const result = await reviewService.listByProduct('some-slug', 1);

    expect(findPage).toHaveBeenCalledWith('prod-1', { skip: 0, take: REVIEW_PAGE_SIZE });
    expect(result.total).toBe(21);
    expect(result.hasMore).toBe(true);
  });

  it('reports zero for a product with no reviews', async () => {
    vi.spyOn(productRepository, 'findBySlugOrId').mockResolvedValue({ id: 'prod-1' } as any);
    vi.spyOn(reviewRepository, 'findPageByProductId').mockResolvedValue({ items: [], total: 0 });

    const result = await reviewService.listByProduct('prod-1', 1);

    expect(result).toMatchObject({ items: [], total: 0, hasMore: false });
  });

  it('does not expose the reviewer id or invent an avatar', async () => {
    vi.spyOn(productRepository, 'findBySlugOrId').mockResolvedValue({ id: 'prod-1' } as any);
    vi.spyOn(reviewRepository, 'findPageByProductId').mockResolvedValue({ items: [review] as any, total: 1 });

    const { items } = await reviewService.listByProduct('prod-1', 1);

    expect(items[0].author).toBe('Asha');
    expect(items[0]).not.toHaveProperty('userId');
    expect(items[0]).not.toHaveProperty('avatar');
  });

  it('rejects an unknown product', async () => {
    vi.spyOn(productRepository, 'findBySlugOrId').mockResolvedValue(null);

    await expect(reviewService.listByProduct('missing', 1)).rejects.toThrow('Product not found');
  });
});

describe('reviewService.create', () => {
  it('saves the review without touching the product rating', async () => {
    vi.spyOn(productRepository, 'findBySlugOrId').mockResolvedValue({ id: 'prod-1', ratingAvg: 4.9 } as any);
    vi.spyOn(reviewRepository, 'findByUserAndProduct').mockResolvedValue(null);
    const create = vi.spyOn(reviewRepository, 'create').mockResolvedValue(review as any);

    await reviewService.create('user-1', 'prod-1', { rating: 1, comment: 'Not for me' } as any);

    expect(create).toHaveBeenCalledTimes(1);
    expect(productRepository).not.toHaveProperty('updateRating');
  });
});
