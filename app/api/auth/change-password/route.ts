import { NextRequest } from 'next/server';
import { authController } from '@/server/controllers/auth.controller';
import { withAuth } from '@/server/middlewares/withAuth';

export const POST = withAuth((req: NextRequest, { user }) => authController.changePassword(req, user));
