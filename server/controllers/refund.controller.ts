import { NextRequest } from 'next/server';
import { refundService } from '../services/refund.service';
import { apiResponse } from '../utils/apiResponse';
import { handleError } from '../middlewares/handleError';
import { AuthenticatedUser } from '../middlewares/withAuth';

export const refundController = {
  async request(_req: NextRequest, user: AuthenticatedUser, orderId: string) {
    try {
      return apiResponse.ok(await refundService.requestRefund(orderId, user.id));
    } catch (error) {
      return handleError(error);
    }
  },

  async approve(_req: NextRequest, user: AuthenticatedUser, orderId: string) {
    try {
      return apiResponse.ok(await refundService.approveRefund(orderId, user.id));
    } catch (error) {
      return handleError(error);
    }
  },

  async check(_req: NextRequest, orderId: string) {
    try {
      return apiResponse.ok(await refundService.checkRefundStatus(orderId));
    } catch (error) {
      return handleError(error);
    }
  },
};
