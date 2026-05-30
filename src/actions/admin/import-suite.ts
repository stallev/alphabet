'use server';
import 'server-only';

import { revalidateTag } from 'next/cache';
import { auth } from '@/lib/auth';
import { suiteImportSchema } from '@/lib/validators/suite-import';
import { importSuiteFromJson } from '@/src/data/suites/import-suite.server';

type ImportResult =
  | { success: true; data: { id: string; title: string; language: string; questionsCount: number } }
  | { success: false; error: string };

export async function importSuiteAction(rawJson: unknown): Promise<ImportResult> {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return { success: false, error: 'Доступ запрещён. Требуется роль admin.' };
  }

  const parsed = suiteImportSchema.safeParse(rawJson);
  if (!parsed.success) {
    const firstError = parsed.error.errors[0];
    const errorMessage = firstError
      ? `${firstError.path.join('.')}: ${firstError.message}`
      : 'Неверный формат JSON';
    return { success: false, error: errorMessage };
  }

  try {
    const result = await importSuiteFromJson(parsed.data, {
      createdById: session.user.id,
    });

    revalidateTag('suites', 'max');
    return { success: true, data: result };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Ошибка сервера';
    return { success: false, error: message };
  }
}
