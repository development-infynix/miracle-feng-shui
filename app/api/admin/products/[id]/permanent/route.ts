import { NextRequest } from 'next/server';
import { withRole } from '@/server/middlewares/withAuth';
import { handleError } from '@/server/middlewares/handleError';
import { adminController } from '@/server/controllers/admin.controller';

// Deletes an archived product for good, two weeks after it was archived. DELETE on the product itself archives.
export const DELETE = withRole('ADMIN', async (req: NextRequest, { params }: any) => {
  try {
    return await adminController.deleteProductPermanently(req, params);
  } catch (error) {
    return handleError(error);
  }
});
