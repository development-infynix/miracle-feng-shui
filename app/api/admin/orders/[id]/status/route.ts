import { NextRequest } from 'next/server';
import { handleError } from '@/server/middlewares/handleError';
import { adminController } from '@/server/controllers/admin.controller';

export const PATCH = async (
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  try {
    const resolvedParams = await context.params;
    return await adminController.updateOrderStatus(req, resolvedParams);
  } catch (error) {
    return handleError(error);
  }
};
