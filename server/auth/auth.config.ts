import type { NextAuthConfig } from 'next-auth';

/**
 * Edge-safe Auth.js config — без Prisma.
 * Используется в proxy.ts (Next.js 16 request interception).
 * НЕ импортировать auth.ts здесь.
 */
const authConfig: NextAuthConfig = {
  trustHost: true,
  pages: {
    signIn: '/admin/login',
  },
  session: {
    strategy: 'jwt',
  },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user?.role) {
        token.role = user.role as string;
      }
      if (user?.id) {
        token.sub = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? '';
        session.user.role = (token.role as string) ?? 'subscriber';
      }
      return session;
    },
  },
};

export default authConfig;
