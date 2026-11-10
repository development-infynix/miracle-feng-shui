import { reviewController } from '@/server/controllers/review.controller';
import { withAuth } from '@/server/middlewares/withAuth';

// The signed-in customer deletes their own review of this product for good, so they can write a new one.
export const DELETE = withAuth((_req, { user, params }) =>
  reviewController.deleteOwn(user, { params: Promise.resolve(params as { slug: string }) })
);
