import { NextRequest } from 'next/server';
import { z } from 'zod';
import { DEV_ADMIN_ID, withRole } from '@/server/middlewares/withAuth';
import { handleError } from '@/server/middlewares/handleError';
import { settingsService } from '@/server/services/settings.service';
import { apiResponse } from '@/server/utils/apiResponse';

const updateSchema = z.object({ cancellationAllowed: z.boolean() });

export const GET = withRole('ADMIN', async () => handleError(async () => apiResponse.ok(await settingsService.getPublic())));

/** Body { cancellationAllowed: boolean }. Applies to orders placed from now on. */
export const PATCH = withRole('ADMIN', async (req: NextRequest, { user }) =>
  handleError(async () => {
    const { cancellationAllowed } = updateSchema.parse(await req.json());
    const adminId = user.id === DEV_ADMIN_ID ? null : user.id;
    return apiResponse.ok(await settingsService.setCancellationAllowed(cancellationAllowed, adminId));
  })
);
