import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { apiResponse } from '../utils/apiResponse';

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: 'CUSTOMER' | 'ADMIN';
  phone?: string | null;
}

export type AuthenticatedRouteHandler = (
  req: NextRequest,
  context: { user: AuthenticatedUser; params?: any }
) => Promise<Response>;

/** The opt-in local bypass's stand-in admin. It has no account, so nothing should store its id. */
export const DEV_ADMIN_ID = 'dev-admin';

const DEV_ADMIN: AuthenticatedUser = {
  id: DEV_ADMIN_ID,
  name: 'Dev Admin',
  email: 'dev@local',
  role: 'ADMIN',
};

// Opt-in only. Never keyed off NODE_ENV alone, so a mis-set build can't leak it.
const allowDevAdmin = () => process.env.ALLOW_DEV_ADMIN === 'true';

export function withAuth(handler: AuthenticatedRouteHandler) {
  return async (req: NextRequest, segmentData?: any) => {
    if (allowDevAdmin()) {
      const resolvedParams = segmentData?.params ? await segmentData.params : undefined;
      return handler(req, { user: DEV_ADMIN, params: resolvedParams });
    }

    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return apiResponse.error('Authentication required', 401);
    }

    const user = session.user as AuthenticatedUser;
    const resolvedParams = segmentData?.params ? await segmentData.params : undefined;
    return handler(req, { user, params: resolvedParams });
  };
}

export function withRole(role: 'ADMIN', handler: AuthenticatedRouteHandler) {
  return async (req: NextRequest, segmentData?: any) => {
    if (allowDevAdmin()) {
      const resolvedParams = segmentData?.params ? await segmentData.params : undefined;
      return handler(req, { user: DEV_ADMIN, params: resolvedParams });
    }

    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return apiResponse.error('Authentication required', 401);
    }

    const user = session.user as AuthenticatedUser;
    if (user.role !== role) {
      return apiResponse.error('Forbidden: insufficient permissions', 403);
    }

    const resolvedParams = segmentData?.params ? await segmentData.params : undefined;
    return handler(req, { user, params: resolvedParams });
  };
}