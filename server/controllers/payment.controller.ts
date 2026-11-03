import { NextRequest } from 'next/server';
import { createPaymentOrderSchema, verifyPaymentSchema } from '../validators/payment.validator';
import { paymentService } from '../services/payment.service';
import { apiResponse } from '../utils/apiResponse';
import { handleError } from '../middlewares/handleError';
import { AuthenticatedUser } from '../middlewares/withAuth';

export const paymentController = {
  async createOrder(req: NextRequest, user: AuthenticatedUser) {
    try {
      const body = await req.json();
      const input = createPaymentOrderSchema.parse(body);
      const result = await paymentService.createRazorpayOrder(user.id, input);
      return apiResponse.created(result);
    } catch (error) {
      return handleError(error);
    }
  },

  async verify(req: NextRequest, user: AuthenticatedUser) {
    try {
      const body = await req.json();
      const input = verifyPaymentSchema.parse(body);
      const result = await paymentService.verifyPayment(user.id, input);
      return apiResponse.ok(result);
    } catch (error) {
      return handleError(error);
    }
  },

  async webhook(req: NextRequest) {
    try {
      const rawBody = await req.text();
      const signature = req.headers.get('x-razorpay-signature') || '';
      const result = await paymentService.handleWebhook(rawBody, signature);
      return apiResponse.ok(result);
    } catch (error) {
      return handleError(error);
    }
  },
};
