import 'server-only';

import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

import { verifyAdminCredentials } from '@/src/data/auth/verify-credentials.server';
import authConfig from './auth.config';

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        const user = await verifyAdminCredentials(credentials);
        if (!user) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name ?? user.email,
          role: user.role,
        };
      },
    }),
  ],
});
