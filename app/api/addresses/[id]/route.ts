import { NextRequest } from 'next/server';
import { addressController } from '@/server/controllers/address.controller';
import { withAuth } from '@/server/middlewares/withAuth';

export const PATCH = withAuth((req: NextRequest, { user, params }) =>
  addressController.update(req, user, {
    params: Promise.resolve(params as { id: string }),
  })
);

export const DELETE = withAuth((req: NextRequest, { user, params }) =>
  addressController.delete(req, user, {
    params: Promise.resolve(params as { id: string }),
  })
);
