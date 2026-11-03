import { NextRequest } from 'next/server';
import { paymentController } from '@/server/controllers/payment.controller';

export const POST = (req: NextRequest) => paymentController.webhook(req);
