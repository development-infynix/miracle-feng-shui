import { withRole } from '@/server/middlewares/withAuth';
import { handleError } from '@/server/middlewares/handleError';
import { adminController } from '@/server/controllers/admin.controller';

export const GET = withRole('ADMIN', async (_req, { params }) =>
  handleError(() => adminController.getCustomerProfile(params))
);

/** Body { active: boolean }: deactivates or reactivates the customer. */
export const PATCH = withRole('ADMIN', async (req, { params }) =>
  handleError(() => adminController.setCustomerActive(req, params))
);
