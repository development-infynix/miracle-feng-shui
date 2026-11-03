import { NextRequest } from 'next/server';
import { authController } from '@/server/controllers/auth.controller';

export const POST = (req: NextRequest) => authController.register(req);
