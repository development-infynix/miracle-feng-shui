import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { authService } from '@/server/services/auth.service';
import { userRepository } from '@/server/repositories/user.repository';

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
        } catch {
          return null;
        }
      },

    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
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
        token.role = (user as any).role || 'CUSTOMER';
        token.phone = (user as any).phone || null;
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
