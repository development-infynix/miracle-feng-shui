import { handleError } from '@/server/middlewares/handleError';
import { settingsService } from '@/server/services/settings.service';
import { apiResponse } from '@/server/utils/apiResponse';

export const dynamic = 'force-dynamic';

/** Store settings the storefront needs, such as whether orders can be cancelled. */
export const GET = () => handleError(async () => apiResponse.ok(await settingsService.getPublic()));
