'use server';
import 'server-only';

import { revalidateTag } from 'next/cache';
import { auth } from '@/server/auth/auth';
import { deleteSuite } from '@/games/alphabet/server/suites/get-suites.server';

type DeleteResult = { success: true } | { success: false; error: string };

export async function deleteSuiteAction(id: string): Promise<DeleteResult> {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return { success: false, error: 'Доступ запрещён.' };
  }

  try {
    await deleteSuite(id);
    revalidateTag('suites', 'max');
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Ошибка удаления';
    return { success: false, error: message };
  }
}
