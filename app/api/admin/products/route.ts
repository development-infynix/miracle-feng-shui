import { NextRequest } from 'next/server';
import { withRole } from '@/server/middlewares/withAuth';
import { handleError } from '@/server/middlewares/handleError';
import { adminController } from '@/server/controllers/admin.controller';

export const GET = withRole('ADMIN', async (req: NextRequest) =>
  handleError(() => adminController.getProducts(req))
);

export const POST = withRole('ADMIN', async (req: NextRequest) =>
  handleError(() => adminController.createProduct(req))
);
