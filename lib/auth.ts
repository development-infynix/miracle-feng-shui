import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { authService } from '@/server/services/auth.service';

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || 'miracle-feng-shui-super-secret-jwt-key-2026',
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
          const rawEmail = credentials.email.trim().toLowerCase();
          const cleanEmail = rawEmail === 'admin' ? 'admin@miraclefengshui.com' : rawEmail;
          const user = await authService.validateCredentials({
            email: cleanEmail,
            password: credentials.password.trim(),
          });
          return user;
        } catch {
          return null;
        }
      },

    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
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
