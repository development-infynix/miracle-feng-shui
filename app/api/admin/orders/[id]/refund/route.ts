import { NextRequest } from 'next/server';
import { refundController } from '@/server/controllers/refund.controller';
import { withRole } from '@/server/middlewares/withAuth';

// This route moves money, so it checks the role itself as well as relying on the middleware.
export const POST = withRole('ADMIN', (req: NextRequest, { user, params }) =>
  refundController.approve(req, user, (params as { id: string }).id)
);
