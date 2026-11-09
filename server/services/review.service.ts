import { reviewRepository } from '../repositories/review.repository';
import { productRepository } from '../repositories/product.repository';
import { CreateReviewInput } from '../validators/review.validator';
import { ApiError } from '../utils/ApiError';

export const REVIEW_PAGE_SIZE = 20;

export const reviewService = {
  /**
   * A review is a verified purchase when its author had this product delivered from this shop before
   * writing it. Anyone can still review (they may have bought it elsewhere); this only marks the ones we can vouch for.
   */
  async markVerified<T extends { userId: string; productId: string; createdAt: Date | string }>(productId: string, reviews: T[]) {
    const deliveries = await reviewRepository.findDeliveries(productId, [...new Set(reviews.map((r) => r.userId))]);
    return reviews.map((review) => ({
      ...review,
      verifiedPurchase: deliveries.some(
        (d) => d.userId === review.userId && d.deliveredAt.getTime() <= new Date(review.createdAt).getTime()
      ),
    }));
  },

  formatReview(r: any) {
    return {
      id: r.id,
      author: r.user?.name || 'Customer',
      rating: r.rating,
      date: new Date(r.createdAt).toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      comment: r.comment,
      productVariation: r.productVariation || undefined,
      productId: r.productId,
      verifiedPurchase: Boolean(r.verifiedPurchase),
    };
  },

  async listByProduct(identifier: string, page: number) {
    const product = await productRepository.findBySlugOrId(identifier);
    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    const { items, total } = await reviewRepository.findPageByProductId(product.id, {
      skip: (page - 1) * REVIEW_PAGE_SIZE,
      take: REVIEW_PAGE_SIZE,
    });

    const verified = await this.markVerified(product.id, items);
    return {
      items: verified.map((review) => this.formatReview(review)),
      total,
      page,
      hasMore: page * REVIEW_PAGE_SIZE < total,
    };
  },

  async create(userId: string, productId: string, input: CreateReviewInput) {
    const product = await productRepository.findBySlugOrId(productId);
    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    const existing = await reviewRepository.findByUserAndProduct(userId, product.id);
    if (existing) {
      throw ApiError.conflict('You have already submitted a review for this product');
    }

    // Reviews don't change a product's rating. Admins set the rating themselves.
    const review = await reviewRepository.create(userId, product.id, input);

    const [verified] = await this.markVerified(product.id, [review]);
    return this.formatReview(verified);
  },
};
