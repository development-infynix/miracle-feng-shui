import { NextRequest } from 'next/server';
import { cartController } from '@/server/controllers/cart.controller';
import { withAuth } from '@/server/middlewares/withAuth';

export const GET = withAuth((req: NextRequest, { user }) => cartController.get(req, user));
export const POST = withAuth((req: NextRequest, { user }) => cartController.add(req, user));
export const DELETE = withAuth((req: NextRequest, { user }) => cartController.clear(req, user));
