import { NextRequest } from 'next/server';
import {
  createReviewSchema,
  declineAppealSchema,
  reviewAppealSchema,
  reviewListQuerySchema,
  reviewReplySchema,
  setReviewHiddenSchema,
} from '../validators/review.validator';
import { reviewService } from '../services/review.service';
import { apiResponse } from '../utils/apiResponse';
import { handleError } from '../middlewares/handleError';
import { AuthenticatedUser } from '../middlewares/withAuth';

export const reviewController = {
  async list(req: NextRequest, context: { params: Promise<{ id?: string; slug?: string }> }) {
    try {
      const resolved = await context.params;
      const productId = (resolved.slug || resolved.id)!;
      const { page } = reviewListQuerySchema.parse({
        page: req.nextUrl.searchParams.get('page') ?? undefined,
      });
      const reviews = await reviewService.listByProduct(productId, page);
      return apiResponse.ok(reviews);
    } catch (error) {
      return handleError(error);
    }
  },

  async eligibility(user: AuthenticatedUser, context: { params: Promise<{ id?: string; slug?: string }> }) {
    try {
      const resolved = await context.params;
      return apiResponse.ok(await reviewService.eligibility(user.id, (resolved.slug || resolved.id)!));
    } catch (error) {
      return handleError(error);
    }
  },

  async deleteOwn(user: AuthenticatedUser, context: { params: Promise<{ id?: string; slug?: string }> }) {
    try {
      const resolved = await context.params;
      return apiResponse.ok(await reviewService.deleteOwn(user.id, (resolved.slug || resolved.id)!));
    } catch (error) {
      return handleError(error);
    }
  },

  async appeal(req: NextRequest, user: AuthenticatedUser, context: { params: Promise<{ id?: string; slug?: string }> }) {
    try {
      const resolved = await context.params;
      const { message } = reviewAppealSchema.parse(await req.json());
      return apiResponse.ok(await reviewService.appeal(user.id, (resolved.slug || resolved.id)!, message));
    } catch (error) {
      return handleError(error);
    }
  },

  async declineAppeal(req: NextRequest, id: string, adminId?: string) {
    try {
      const { response } = declineAppealSchema.parse(await req.json());
      return apiResponse.ok(await reviewService.declineAppeal(id, response, adminId));
    } catch (error) {
      return handleError(error);
    }
  },

  async setHidden(req: NextRequest, id: string, adminId?: string) {
    try {
      const input = setReviewHiddenSchema.parse(await req.json());
      return apiResponse.ok(await reviewService.setHidden(id, input, adminId));
    } catch (error) {
      return handleError(error);
    }
  },

  async setReply(req: NextRequest, id: string, adminId?: string) {
    try {
      const { reply } = reviewReplySchema.parse(await req.json());
      return apiResponse.ok(await reviewService.setReply(id, reply, adminId));
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
