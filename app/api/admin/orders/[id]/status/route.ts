import { NextRequest } from 'next/server';
import { DEV_ADMIN_ID, withRole } from '@/server/middlewares/withAuth';
import { handleError } from '@/server/middlewares/handleError';
import { adminController } from '@/server/controllers/admin.controller';

export const PATCH = withRole('ADMIN', async (req: NextRequest, { params, user }: any) => {
  try {
    return await adminController.updateOrderStatus(req, params, user.id === DEV_ADMIN_ID ? undefined : user.id);
  } catch (error) {
    return handleError(error);
  }
});
