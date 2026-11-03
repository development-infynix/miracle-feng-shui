import { NextRequest } from 'next/server';
import { favoriteController } from '@/server/controllers/favorite.controller';
import { withAuth } from '@/server/middlewares/withAuth';

export const GET = withAuth((req: NextRequest, { user }) => favoriteController.list(req, user));
export const POST = withAuth((req: NextRequest, { user }) => favoriteController.toggle(req, user));
