import 'server-only';

import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';

interface CredentialsInput {
  email?: unknown;
  password?: unknown;
  [key: string]: unknown;
}

export async function verifyAdminCredentials(credentials: CredentialsInput) {
  const email = credentials.email;
  const password = credentials.password;

  if (!email || typeof email !== 'string') return null;
  if (!password || typeof password !== 'string') return null;

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      passwordHash: true,
    },
  });

  if (!user) return null;

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}
