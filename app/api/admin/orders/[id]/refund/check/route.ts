import { NextRequest } from 'next/server';
import { refundController } from '@/server/controllers/refund.controller';
import { withRole } from '@/server/middlewares/withAuth';

export const POST = withRole('ADMIN', (req: NextRequest, { params }) =>
  refundController.check(req, (params as { id: string }).id)
);
