import { NextRequest } from 'next/server';
import { encode, getToken } from 'next-auth/jwt';
import { authOptions } from '@/lib/auth';
import { withAuth } from '@/server/middlewares/withAuth';
import { handleError } from '@/server/middlewares/handleError';
import { authService } from '@/server/services/auth.service';
import { apiResponse } from '@/server/utils/apiResponse';

const DEFAULT_MAX_AGE = 30 * 24 * 60 * 60;

/**
 * Signs this account out everywhere except here: raising the session version ends every other session
 * on its next request, and this browser gets its session back with the new version so it stays in.
 */
export const POST = withAuth(async (req: NextRequest, { user }) => {
  try {
    const secret = process.env.NEXTAUTH_SECRET!;
    const token = await getToken({ req, secret });
    if (!token) return apiResponse.error('Authentication required', 401);

    const { sessionVersion } = await authService.signOutOtherDevices(user.id);

    const maxAge = authOptions.session?.maxAge ?? DEFAULT_MAX_AGE;
    const secure = (process.env.NEXTAUTH_URL ?? '').startsWith('https://');
    const response = apiResponse.ok({ signedOutOtherDevices: true });
    response.cookies.set(`${secure ? '__Secure-' : ''}next-auth.session-token`, await encode({ token: { ...token, sessionVersion }, secret, maxAge }), {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure,
      maxAge,
    });
    return response;
  } catch (error) {
    return handleError(error);
  }
});
