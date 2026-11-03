import { NextRequest } from 'next/server';
import { favoriteController } from '@/server/controllers/favorite.controller';
import { withAuth } from '@/server/middlewares/withAuth';

export const DELETE = withAuth((req: NextRequest, { user, params }) =>
  favoriteController.remove(req, user, {
    params: Promise.resolve(params as { productId: string }),
  })
);
