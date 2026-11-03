import { NextRequest } from 'next/server';
import { paymentController } from '@/server/controllers/payment.controller';
import { withAuth } from '@/server/middlewares/withAuth';

export const POST = withAuth((req: NextRequest, { user }) => paymentController.verify(req, user));
