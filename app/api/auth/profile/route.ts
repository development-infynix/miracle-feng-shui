import { NextRequest } from 'next/server';
import { authController } from '@/server/controllers/auth.controller';
import { withAuth } from '@/server/middlewares/withAuth';

export const GET = withAuth((req: NextRequest, { user }) => authController.getProfile(req, user));
export const PATCH = withAuth((req: NextRequest, { user }) => authController.updateProfile(req, user));
