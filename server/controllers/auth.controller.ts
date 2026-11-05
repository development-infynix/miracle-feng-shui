import { NextRequest } from 'next/server';
import {
  changePasswordSchema,
  registerSchema,
  updateProfileSchema,
  verifyPasswordSchema,
} from '../validators/auth.validator';
import { authService } from '../services/auth.service';
import { apiResponse } from '../utils/apiResponse';
import { handleError } from '../middlewares/handleError';
import { AuthenticatedUser } from '../middlewares/withAuth';

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

  async getProfile(_req: NextRequest, user: AuthenticatedUser) {
    try {
      return apiResponse.ok(await authService.getProfile(user.id));
    } catch (error) {
      return handleError(error);
    }
  },

  async updateProfile(req: NextRequest, user: AuthenticatedUser) {
    try {
      const input = updateProfileSchema.parse(await req.json());
      return apiResponse.ok(await authService.updateProfile(user.id, input));
    } catch (error) {
      return handleError(error);
    }
  },

  async verifyPassword(req: NextRequest, user: AuthenticatedUser) {
    try {
      const { currentPassword } = verifyPasswordSchema.parse(await req.json());
      await authService.verifyCurrentPassword(user.id, currentPassword);
      return apiResponse.ok({ verified: true });
    } catch (error) {
      return handleError(error);
    }
  },

  async changePassword(req: NextRequest, user: AuthenticatedUser) {
    try {
      const { currentPassword, newPassword } = changePasswordSchema.parse(await req.json());
      return apiResponse.ok(await authService.changePassword(user.id, currentPassword, newPassword));
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
