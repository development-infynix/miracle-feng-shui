import { NextRequest } from 'next/server';
import { reviewController } from '@/server/controllers/review.controller';
import { withAuth } from '@/server/middlewares/withAuth';

export const GET = (req: NextRequest, context: { params: Promise<{ slug: string }> }) =>
  reviewController.list(req, context);

export const POST = withAuth((req: NextRequest, { user, params }) =>
  reviewController.create(req, user, { params: Promise.resolve(params as { slug: string }) })
);
