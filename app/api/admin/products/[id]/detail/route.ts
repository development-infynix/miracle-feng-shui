import { NextRequest } from 'next/server';
import { withRole } from '@/server/middlewares/withAuth';
import { handleError } from '@/server/middlewares/handleError';
import { adminController } from '@/server/controllers/admin.controller';

export const GET = withRole('ADMIN', (async (
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  try {
    const resolvedParams = await context.params;
    return await adminController.getProduct(req, resolvedParams);
  } catch (error) {
    return handleError(error);
  }
}) as any);
