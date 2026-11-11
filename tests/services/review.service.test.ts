import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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
// No reviewer here has a delivered order; verified-purchase.test.ts covers the ones who do.
beforeEach(() => {
  vi.spyOn(reviewRepository, 'findDeliveries').mockResolvedValue([]);
});

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
    vi.spyOn(reviewRepository, 'hasDelivery').mockResolvedValue(true);
    const create = vi.spyOn(reviewRepository, 'create').mockResolvedValue(review as any);

    await reviewService.create('user-1', 'prod-1', { rating: 1, comment: 'Not for me' } as any);

    expect(create).toHaveBeenCalledTimes(1);
    expect(productRepository).not.toHaveProperty('updateRating');
  });
});

describe('only buyers can review', () => {
  it('refuses a customer who has not had the product delivered', async () => {
    vi.spyOn(productRepository, 'findBySlugOrId').mockResolvedValue({ id: 'prod-1' } as any);
    vi.spyOn(reviewRepository, 'findByUserAndProduct').mockResolvedValue(null);
    vi.spyOn(reviewRepository, 'hasDelivery').mockResolvedValue(false);
    const create = vi.spyOn(reviewRepository, 'create');

    await expect(reviewService.create('user-1', 'prod-1', { rating: 1, comment: 'Bad' } as any)).rejects.toMatchObject({ statusCode: 403 });
    expect(create).not.toHaveBeenCalled();
  });

  it('tells the shop whether to offer the review form', async () => {
    vi.spyOn(productRepository, 'findBySlugOrId').mockResolvedValue({ id: 'prod-1' } as any);
    const existing = vi.spyOn(reviewRepository, 'findByUserAndProduct').mockResolvedValue(null);
    const delivered = vi.spyOn(reviewRepository, 'hasDelivery').mockResolvedValue(false);

    await expect(reviewService.eligibility('user-1', 'prod-1')).resolves.toEqual({ canReview: false, reason: 'not_delivered' });
    delivered.mockResolvedValue(true);
    await expect(reviewService.eligibility('user-1', 'prod-1')).resolves.toEqual({ canReview: true, reason: null });
    existing.mockResolvedValue({ id: 'r1' } as any);
    await expect(reviewService.eligibility('user-1', 'prod-1')).resolves.toEqual({ canReview: false, reason: 'already_reviewed' });
  });

  it('shows the store reply with the review', () => {
    const formatted = reviewService.formatReview({ ...review, reply: 'Sorry, sending a new one', repliedAt: new Date('2026-11-05') });
    expect(formatted.reply).toMatchObject({ text: 'Sorry, sending a new one' });
    expect(reviewService.formatReview(review).reply).toBeNull();
  });
});

describe('moderating reviews', () => {
  it('hides a review with its reason and who did it, without deleting it', async () => {
    vi.spyOn(reviewRepository, 'findById').mockResolvedValue({ id: 'r1', hiddenAt: null, reply: null } as any);
    const save = vi.spyOn(reviewRepository, 'setHidden').mockResolvedValue(true);

    await reviewService.setHidden('r1', { hidden: true, reason: 'SPAM', note: 'link to another shop' }, 'admin-1');

    expect(save).toHaveBeenCalledWith('r1', { reason: 'SPAM', note: 'link to another shop' }, 'admin-1');
    expect(reviewRepository).not.toHaveProperty('delete');
  });

  it('restores a hidden review', async () => {
    vi.spyOn(reviewRepository, 'findById').mockResolvedValue({ id: 'r1', hiddenAt: new Date(), reply: null } as any);
    const save = vi.spyOn(reviewRepository, 'setHidden').mockResolvedValue(true);

    await reviewService.setHidden('r1', { hidden: false }, 'admin-1');
    expect(save).toHaveBeenCalledWith('r1', null, 'admin-1');
  });

  it('says so when the review is already in that state', async () => {
    vi.spyOn(reviewRepository, 'findById').mockResolvedValue({ id: 'r1', hiddenAt: new Date(), reply: null } as any);
    vi.spyOn(reviewRepository, 'setHidden').mockResolvedValue(false);

    await expect(reviewService.setHidden('r1', { hidden: true, reason: 'SPAM' }, 'admin-1')).rejects.toMatchObject({ statusCode: 409 });
  });

  it('has no "negative" or rating-based reason to hide a review', async () => {
    const { setReviewHiddenSchema, REVIEW_HIDE_REASONS } = await import('@/server/validators/review.validator');
    expect(REVIEW_HIDE_REASONS).not.toContain('NEGATIVE');
    expect(setReviewHiddenSchema.safeParse({ hidden: true, reason: 'NEGATIVE' }).success).toBe(false);
    expect(setReviewHiddenSchema.safeParse({ hidden: true, reason: 'OTHER' }).success).toBe(false);
    expect(setReviewHiddenSchema.safeParse({ hidden: true, reason: 'OTHER', note: 'duplicate' }).success).toBe(true);
  });

  it('saves a reply, and an empty one removes it', async () => {
    vi.spyOn(reviewRepository, 'findById').mockResolvedValue({ id: 'r1', hiddenAt: null, reply: 'old' } as any);
    const save = vi.spyOn(reviewRepository, 'setReply').mockResolvedValue({ id: 'r1', reply: null, repliedAt: null });

    await reviewService.setReply('r1', '  Thanks!  ', 'admin-1');
    expect(save).toHaveBeenLastCalledWith('r1', 'Thanks!', 'admin-1');
    await reviewService.setReply('r1', '   ', 'admin-1');
    expect(save).toHaveBeenLastCalledWith('r1', null, 'admin-1');
  });
});

describe('taken-down reviews, for their author', () => {
  const hiddenOwn = (fields: Record<string, unknown> = {}) => ({
    id: 'r1',
    rating: 2,
    comment: 'Call me on 98...',
    hiddenAt: new Date(),
    hiddenReason: 'PERSONAL_DETAILS',
    hiddenNote: 'private admin note',
    ...fields,
  });

  it('shows the author their hidden review with the reason, never the private note', async () => {
    vi.spyOn(productRepository, 'findBySlugOrId').mockResolvedValue({ id: 'prod-1' } as any);
    vi.spyOn(reviewRepository, 'findByUserAndProduct').mockResolvedValue(hiddenOwn() as any);

    const result: any = await reviewService.eligibility('user-1', 'prod-1');

    expect(result).toMatchObject({ canReview: false, reason: 'hidden' });
    expect(result.hiddenReview).toMatchObject({ reasonCode: 'PERSONAL_DETAILS', because: expect.stringContaining('personal details') });
    expect(JSON.stringify(result)).not.toContain('private admin note');
  });

  it('lets the author delete their own review for good', async () => {
    vi.spyOn(productRepository, 'findBySlugOrId').mockResolvedValue({ id: 'prod-1' } as any);
    vi.spyOn(reviewRepository, 'findByUserAndProduct').mockResolvedValue(hiddenOwn() as any);
    const del = vi.spyOn(reviewRepository, 'deleteOwn').mockResolvedValue(true);

    await expect(reviewService.deleteOwn('user-1', 'prod-1')).resolves.toEqual({ deleted: true });
    expect(del).toHaveBeenCalledWith('r1', 'user-1');
  });

  it('emails the author on take-down with the customer-facing reason', async () => {
    vi.spyOn(reviewRepository, 'findById').mockResolvedValue({ id: 'r1', hiddenAt: null } as any);
    vi.spyOn(reviewRepository, 'setHidden').mockResolvedValue(true);
    const notify = vi.spyOn(reviewService, 'notifyAuthor').mockImplementation(() => {});

    await reviewService.setHidden('r1', { hidden: true, reason: 'OFF_TOPIC', note: 'secret' }, 'admin-1');
    expect(notify).toHaveBeenCalledWith('r1', { kind: 'hidden', because: "it wasn't about this product" });
  });
});
