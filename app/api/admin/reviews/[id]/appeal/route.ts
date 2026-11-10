import { NextRequest } from 'next/server';
import { DEV_ADMIN_ID, withRole } from '@/server/middlewares/withAuth';
import { reviewController } from '@/server/controllers/review.controller';

// Keep a hidden review hidden and answer the customer's request to look again.
// To accept the request instead, restore the review (PATCH /api/admin/reviews/[id]).
export const POST = withRole('ADMIN', (req: NextRequest, { params, user }: any) =>
  reviewController.declineAppeal(req, params.id, user.id === DEV_ADMIN_ID ? undefined : user.id)
);
