import { NextRequest } from 'next/server';
import { withRole } from '@/server/middlewares/withAuth';
import { handleError } from '@/server/middlewares/handleError';
import { adminController } from '@/server/controllers/admin.controller';

export const PATCH = withRole('ADMIN', async (req: NextRequest, { params }: any) => {
  try {
    return await adminController.updateProduct(req, params);
  } catch (error) {
    return handleError(error);
  }
});

export const DELETE = withRole('ADMIN', async (req: NextRequest, { params }: any) => {
  try {
    return await adminController.deleteProduct(req, params);
  } catch (error) {
    return handleError(error);
  }
});
