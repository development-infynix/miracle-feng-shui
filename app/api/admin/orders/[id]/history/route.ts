import { withRole } from '@/server/middlewares/withAuth';
import { handleError } from '@/server/middlewares/handleError';
import { adminController } from '@/server/controllers/admin.controller';

/** Every status change on the order, oldest first, with who made it. */
export const GET = withRole('ADMIN', async (_req, { params }) =>
  handleError(() => adminController.getOrderHistory(params))
);
