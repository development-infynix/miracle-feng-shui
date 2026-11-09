import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { authService } from '@/server/services/auth.service';
import { userRepository } from '@/server/repositories/user.repository';
import { ACCOUNT_DEACTIVATED } from './authErrors';

const isDeactivatedError = (error: unknown) => error instanceof Error && error.message === ACCOUNT_DEACTIVATED;

/** Google sign-in is on only when its keys are set; until then the button stays hidden. */
export const googleSignInEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await authService.validateCredentials({
            email: credentials.email,
            password: credentials.password,
          });
          return user;
        } catch (error) {
          // A thrown error reaches the sign-in form as its code, so it can say the account is deactivated.
          if (isDeactivatedError(error)) throw new Error(ACCOUNT_DEACTIVATED);
          return null;
        }
      },

    }),
    ...(googleSignInEnabled
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            // Always offer the account chooser, so a shared computer doesn't sign in the last person silently.
            authorization: { params: { prompt: 'select_account' } },
          }),
        ]
      : []),
  ],
  callbacks: {
    async signIn({ account, profile, user }) {
      if (account?.provider !== 'google') return true;
      const google = profile as { sub?: string; email?: string; email_verified?: boolean; name?: string } | undefined;
      try {
        const customer = await authService.signInWithGoogle({
          googleId: google?.sub || account.providerAccountId,
          email: google?.email,
          emailVerified: google?.email_verified,
          name: google?.name,
        });
        // From here on the session uses our account, not Google's profile.
        Object.assign(user, { id: customer.id, name: customer.name, email: customer.email, role: customer.role, phone: customer.phone, sessionVersion: customer.sessionVersion });
        return true;
      } catch (error) {
        if (isDeactivatedError(error)) return `/login?error=${ACCOUNT_DEACTIVATED}`;
        console.error('[auth] Google sign-in failed:', error instanceof Error ? error.message : error);
        return '/login?error=GoogleSignIn';
      }
    },
    async jwt({ token, user, trigger }) {
      // Every request re-checks an open session, so deactivating (or deleting) an account, or signing out
      // its other devices, ends the session at once. Throwing makes NextAuth drop the session and clear its
      // cookie. A database error keeps the session.
      if (!user && token.id) {
        let status: { deactivatedAt: Date | null; sessionVersion: number } | null | undefined;
        try {
          status = await userRepository.findSessionStatus(token.id as string);
        } catch {
          status = undefined;
        }
        if (status === null || status?.deactivatedAt) throw new Error(ACCOUNT_DEACTIVATED);
        // Sessions from before the change have no version, which counts as 0, the starting value.
        if (status && status.sessionVersion !== ((token.sessionVersion as number | undefined) ?? 0)) {
          throw new Error('SessionEnded');
        }
      }
      // Refreshes from the database, never from what the browser sent, after the customer edits their profile.
      if (trigger === 'update' && token.id) {
        const fresh = await userRepository.findById(token.id as string);
        if (fresh) {
          token.name = fresh.name;
          token.phone = fresh.phone;
        }
      }
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.role = (user as any).role || 'CUSTOMER';
        token.phone = (user as any).phone || null;
        token.sessionVersion = (user as any).sessionVersion ?? 0;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        session.user.name = token.name;
        (session.user as any).role = token.role as 'CUSTOMER' | 'ADMIN';
        (session.user as any).phone = token.phone as string | null;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
};
