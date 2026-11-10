import { NextRequest } from 'next/server';
import { reviewController } from '@/server/controllers/review.controller';
import { withAuth } from '@/server/middlewares/withAuth';

// The author of a taken-down review asks the store to look again. One request per take-down.
export const POST = withAuth((req: NextRequest, { user, params }) =>
  reviewController.appeal(req, user, { params: Promise.resolve(params as { slug: string }) })
);
