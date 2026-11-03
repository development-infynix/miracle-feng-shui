import { NextRequest } from 'next/server';
import { addToCartSchema, updateCartItemSchema } from '../validators/cart.validator';
import { cartService } from '../services/cart.service';
import { apiResponse } from '../utils/apiResponse';
import { handleError } from '../middlewares/handleError';
import { AuthenticatedUser } from '../middlewares/withAuth';

export const cartController = {
  async get(_req: NextRequest, user: AuthenticatedUser) {
    try {
      const cart = await cartService.getCart(user.id);
      return apiResponse.ok(cart);
    } catch (error) {
      return handleError(error);
    }
  },

  async add(req: NextRequest, user: AuthenticatedUser) {
    try {
      const body = await req.json();
      const input = addToCartSchema.parse(body);
      const cart = await cartService.addItem(user.id, input);
      return apiResponse.ok(cart);
    } catch (error) {
      return handleError(error);
    }
  },

  async update(
    req: NextRequest,
    user: AuthenticatedUser,
    context: { params: Promise<{ itemId: string }> }
  ) {
    try {
      const resolved = await context.params;
      const body = await req.json();
      const input = updateCartItemSchema.parse(body);
      const cart = await cartService.updateItemQty(user.id, resolved.itemId, input.quantity);
      return apiResponse.ok(cart);
    } catch (error) {
      return handleError(error);
    }
  },

  async remove(
    _req: NextRequest,
    user: AuthenticatedUser,
    context: { params: Promise<{ itemId: string }> }
  ) {
    try {
      const resolved = await context.params;
      const cart = await cartService.removeItem(user.id, resolved.itemId);
      return apiResponse.ok(cart);
    } catch (error) {
      return handleError(error);
    }
  },

  async clear(_req: NextRequest, user: AuthenticatedUser) {
    try {
      const cart = await cartService.clearCart(user.id);
      return apiResponse.ok(cart);
    } catch (error) {
      return handleError(error);
    }
  },
};
