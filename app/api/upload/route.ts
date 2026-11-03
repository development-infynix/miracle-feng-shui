import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { handleError } from '@/server/middlewares/handleError';
import { uploadController } from '@/server/controllers/upload.controller';
import { apiResponse } from '@/server/utils/apiResponse';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      if (process.env.NODE_ENV !== 'development') {
        return apiResponse.error('Forbidden: Admin upload privileges required', 403);
      }
    }
    return await uploadController.handleUpload(req);
  } catch (error) {
    return handleError(error);
  }
}
