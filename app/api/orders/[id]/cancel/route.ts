import { NextRequest } from 'next/server';
import { orderController } from '@/server/controllers/order.controller';
import { withAuth } from '@/server/middlewares/withAuth';

export const POST = withAuth((req: NextRequest, { user, params }) =>
  orderController.requestCancellation(req, user, (params as { id: string }).id)
);
