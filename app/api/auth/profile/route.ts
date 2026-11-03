import { NextRequest } from 'next/server';
import { withAuth } from '@/server/middlewares/withAuth';
import { userRepository } from '@/server/repositories/user.repository';
import { apiResponse } from '@/server/utils/apiResponse';

export const GET = withAuth(async (req: NextRequest, { user }) => {
  try {
    const profile = await userRepository.findById(user.id);
    if (!profile) {
      return apiResponse.notFound('User profile not found');
    }
    const { passwordHash, resetToken, resetTokenExpiry, ...safeProfile } = profile;
    return apiResponse.success(safeProfile);
  } catch (error: any) {
    return apiResponse.serverError(error.message || 'Failed to fetch user profile');
  }
});

export const PATCH = withAuth(async (req: NextRequest, { user }) => {
  try {
    const body = await req.json();
    const { name, phone } = body;

    const updated = await userRepository.update(user.id, {
      ...(name !== undefined && { name: String(name).trim() }),
      ...(phone !== undefined && { phone: String(phone).trim() }),
    });

    return apiResponse.success(updated, 'Profile updated successfully');
  } catch (error: any) {
    return apiResponse.serverError(error.message || 'Failed to update profile');
  }
});
