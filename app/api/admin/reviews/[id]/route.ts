import { NextRequest } from 'next/server';
import { DEV_ADMIN_ID, withRole } from '@/server/middlewares/withAuth';
import { reviewController } from '@/server/controllers/review.controller';

// Hide a review (it moves to the Archive) or restore it. Reviews are never deleted.
export const PATCH = withRole('ADMIN', (req: NextRequest, { params, user }: any) =>
  reviewController.setHidden(req, params.id, user.id === DEV_ADMIN_ID ? undefined : user.id)
);
