import prisma from '@/lib/prisma';
import { reviewRepository } from '../repositories/review.repository';
import { productRepository } from '../repositories/product.repository';
import { CreateReviewInput } from '../validators/review.validator';
import { ApiError } from '../utils/ApiError';

export const reviewService = {
  formatReview(r: any) {
    return {
      id: r.id,
      author: r.user?.name || 'Verified Buyer',
      avatar:
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80',
      rating: r.rating,
      date: new Date(r.createdAt).toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      comment: r.comment,
      productVariation: r.productVariation || undefined,
      productId: r.productId,
      userId: r.userId,
    };
  },

  async listByProduct(productId: string) {
    const reviews = await reviewRepository.findByProductId(productId);
    return reviews.map(this.formatReview);
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

    const review = await prisma.$transaction(async (tx) => {
      const newReview = await reviewRepository.create(userId, product.id, input, tx);
      const allReviews = await tx.review.findMany({
        where: { productId: product.id },
        select: { rating: true },
      });

      const count = allReviews.length;
      const sum = allReviews.reduce((acc, curr) => acc + curr.rating, 0);
      const avg = Number((sum / count).toFixed(1));

      await tx.product.update({
        where: { id: product.id },
        data: {
          ratingAvg: avg,
          ratingCount: count,
        },
      });

      return newReview;
    });

    return this.formatReview(review);
  },
};
