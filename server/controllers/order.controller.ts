import { NextRequest } from 'next/server';
import { createOrderSchema } from '../validators/order.validator';
import { orderService } from '../services/order.service';
import { apiResponse } from '../utils/apiResponse';
import { handleError } from '../middlewares/handleError';
import { AuthenticatedUser } from '../middlewares/withAuth';

export const orderController = {
  async create(req: NextRequest, user: AuthenticatedUser) {
    try {
      const body = await req.json();
      const input = createOrderSchema.parse(body);
      const order = await orderService.createFromCart(user.id, input);
      return apiResponse.created(order);
    } catch (error) {
      return handleError(error);
    }
  },

  async list(_req: NextRequest, user: AuthenticatedUser) {
    try {
      const orders = await orderService.getUserOrders(user.id);
      return apiResponse.ok(orders);
    } catch (error) {
      return handleError(error);
    }
  },

  async getDetail(
    _req: NextRequest,
    user: AuthenticatedUser,
    context: { params: Promise<{ id: string }> }
  ) {
    try {
      const resolved = await context.params;
      const order = await orderService.getOrderById(resolved.id, user.id, user.role);
      return apiResponse.ok(order);
    } catch (error) {
      return handleError(error);
    }
  },
};
