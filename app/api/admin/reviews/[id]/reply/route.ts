import { NextRequest } from 'next/server';
import { DEV_ADMIN_ID, withRole } from '@/server/middlewares/withAuth';
import { reviewController } from '@/server/controllers/review.controller';

// The store's public reply under a review. An empty reply removes it.
export const PUT = withRole('ADMIN', (req: NextRequest, { params, user }: any) =>
  reviewController.setReply(req, params.id, user.id === DEV_ADMIN_ID ? undefined : user.id)
);
