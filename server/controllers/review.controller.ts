import { NextRequest } from 'next/server';
import { createReviewSchema } from '../validators/review.validator';
import { reviewService } from '../services/review.service';
import { apiResponse } from '../utils/apiResponse';
import { handleError } from '../middlewares/handleError';
import { AuthenticatedUser } from '../middlewares/withAuth';

export const reviewController = {
  async list(_req: NextRequest, context: { params: Promise<{ id?: string; slug?: string }> }) {
    try {
      const resolved = await context.params;
      const productId = (resolved.slug || resolved.id)!;
      const reviews = await reviewService.listByProduct(productId);
      return apiResponse.ok(reviews);
    } catch (error) {
      return handleError(error);
    }
  },

  async create(
    req: NextRequest,
    user: AuthenticatedUser,
    context: { params: Promise<{ id?: string; slug?: string }> }
  ) {
    try {
      const resolved = await context.params;
      const productId = (resolved.slug || resolved.id)!;
      const body = await req.json();
      const input = createReviewSchema.parse(body);
      const review = await reviewService.create(user.id, productId, input);
      return apiResponse.created(review);
    } catch (error) {
      return handleError(error);
    }
  },
};
