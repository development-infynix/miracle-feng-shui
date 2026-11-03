import { NextRequest } from 'next/server';
import { cartController } from '@/server/controllers/cart.controller';
import { withAuth } from '@/server/middlewares/withAuth';

export const PATCH = withAuth((req: NextRequest, { user, params }) =>
  cartController.update(req, user, { params: Promise.resolve(params as { itemId: string }) })
);

export const DELETE = withAuth((req: NextRequest, { user, params }) =>
  cartController.remove(req, user, { params: Promise.resolve(params as { itemId: string }) })
);
