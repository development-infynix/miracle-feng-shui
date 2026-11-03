import { NextRequest } from 'next/server';
import { orderController } from '@/server/controllers/order.controller';
import { withAuth } from '@/server/middlewares/withAuth';

export const GET = withAuth((req: NextRequest, { user }) => orderController.list(req, user));
export const POST = withAuth((req: NextRequest, { user }) => orderController.create(req, user));
