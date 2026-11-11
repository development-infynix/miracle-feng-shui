import { NextRequest } from 'next/server';
import { withAuth } from '@/server/middlewares/withAuth';
import { notificationController } from '@/server/controllers/notification.controller';

// The signed-in customer's notifications. DELETE clears them all.
export const GET = withAuth((req: NextRequest, { user }) => notificationController.list(req, user));
export const DELETE = withAuth((_req: NextRequest, { user }) => notificationController.clearAll(user));
