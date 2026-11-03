import { NextRequest } from 'next/server';
import { registerSchema } from '../validators/auth.validator';
import { authService } from '../services/auth.service';
import { apiResponse } from '../utils/apiResponse';
import { handleError } from '../middlewares/handleError';

export const authController = {
  async register(req: NextRequest) {
    try {
      const body = await req.json();
      const input = registerSchema.parse(body);
      const user = await authService.register(input);
      return apiResponse.created(user);
    } catch (error) {
      return handleError(error);
    }
  },

  async forgotPassword(req: NextRequest) {
    try {
      const body = await req.json();
      if (!body.email) {
        return apiResponse.error('Email is required.', 400);
      }
      const result = await authService.requestPasswordReset(body.email);
      return apiResponse.ok(result);
    } catch (error) {
      return handleError(error);
    }
  },

  async resetPassword(req: NextRequest) {
    try {
      const body = await req.json();
      const { token, password } = body;
      const result = await authService.resetPassword(token, password);
      return apiResponse.ok(result);
    } catch (error) {
      return handleError(error);
    }
  },
};
