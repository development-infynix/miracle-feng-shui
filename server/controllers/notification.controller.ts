import { NextRequest } from 'next/server';
import { markNotificationsReadSchema } from '../validators/notification.validator';
import { notificationService } from '../services/notification.service';
import { apiResponse } from '../utils/apiResponse';
import { handleError } from '../middlewares/handleError';
import { AuthenticatedUser } from '../middlewares/withAuth';

export const notificationController = {
  /** The latest notifications and the unread count, or just the count with `?count=1` for the header badge. */
  async list(req: NextRequest, user: AuthenticatedUser) {
    try {
      if (req.nextUrl.searchParams.get('count') === '1') {
        return apiResponse.ok(await notificationService.unreadCount(user.id));
      }
      return apiResponse.ok(await notificationService.list(user.id));
    } catch (error) {
      return handleError(error);
    }
  },

  async markRead(req: NextRequest, user: AuthenticatedUser) {
    try {
      const body = await req.json().catch(() => ({}));
      const { id } = markNotificationsReadSchema.parse(body ?? {});
      return apiResponse.ok(await notificationService.markRead(user.id, id));
    } catch (error) {
      return handleError(error);
    }
  },

  async clearAll(user: AuthenticatedUser) {
    try {
      return apiResponse.ok(await notificationService.clearAll(user.id));
    } catch (error) {
      return handleError(error);
    }
  },
};
