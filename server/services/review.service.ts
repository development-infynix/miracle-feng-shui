import { reviewRepository } from '../repositories/review.repository';
import { productRepository } from '../repositories/product.repository';
import { CreateReviewInput } from '../validators/review.validator';
import { ApiError } from '../utils/ApiError';

export const REVIEW_PAGE_SIZE = 20;

export const reviewService = {
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

    return {
      items: items.map(this.formatReview),
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

    return this.formatReview(review);
  },
};
