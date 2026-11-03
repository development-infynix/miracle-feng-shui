import { withRole } from '@/server/middlewares/withAuth';
import { handleError } from '@/server/middlewares/handleError';
import { adminController } from '@/server/controllers/admin.controller';

export const GET = withRole('ADMIN', async () =>
  handleError(() => adminController.getDashboard())
);
