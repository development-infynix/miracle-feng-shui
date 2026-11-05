import { NextRequest } from 'next/server';
import { refundController } from '@/server/controllers/refund.controller';
import { withAuth } from '@/server/middlewares/withAuth';

export const POST = withAuth((req: NextRequest, { user, params }) =>
  refundController.request(req, user, (params as { id: string }).id)
);
