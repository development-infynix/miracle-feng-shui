import { NextRequest } from 'next/server';
import { handleError } from '@/server/middlewares/handleError';
import { adminController } from '@/server/controllers/admin.controller';

export const GET = async (req: NextRequest) => {
  try {
    return await adminController.getOrders(req);
  } catch (error) {
    return handleError(error);
  }
};
