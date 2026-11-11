import { NextRequest } from 'next/server';
import { withAuth } from '@/server/middlewares/withAuth';
import { notificationController } from '@/server/controllers/notification.controller';

// Marks one notification read ({ id }) or all of them (no body).
export const POST = withAuth((req: NextRequest, { user }) => notificationController.markRead(req, user));
