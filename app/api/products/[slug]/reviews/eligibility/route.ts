import { reviewController } from '@/server/controllers/review.controller';
import { withAuth } from '@/server/middlewares/withAuth';

// Whether the signed-in customer can review this product: only after it's been delivered to them, and once.
export const GET = withAuth((_req, { user, params }) =>
  reviewController.eligibility(user, { params: Promise.resolve(params as { slug: string }) })
);
