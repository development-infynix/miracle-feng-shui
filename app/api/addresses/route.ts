import { NextRequest } from 'next/server';
import { addressController } from '@/server/controllers/address.controller';
import { withAuth } from '@/server/middlewares/withAuth';

export const GET = withAuth((req: NextRequest, { user }) => addressController.list(req, user));
export const POST = withAuth((req: NextRequest, { user }) => addressController.create(req, user));
