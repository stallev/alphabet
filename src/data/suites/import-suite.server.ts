import 'server-only';

import { prisma } from '@/lib/db';
import type { SuiteImportInput } from '@/lib/validators/suite-import';

export async function importSuiteFromJson(
  data: SuiteImportInput,
  options?: { createdById?: string; isSystem?: boolean }
) {
  const suite = await prisma.$transaction(async (tx) => {
    const created = await tx.questionSuite.create({
      data: {
        title: data.title,
        language: data.language ?? 'ru',
        description: data.description,
        isSystem: options?.isSystem ?? false,
        sourceType: 'json',
        createdById: options?.createdById,
      },
    });

    const questionsData = data.questionsList.map((q, index) => ({
      suiteId: created.id,
      legacyId: q.id,
      questionContent: q.questionContent,
      complexityLevel: q.complexityLevel,
      answerType: q.answerType,
      answersList: q.answersList ?? undefined,
      rightAnswerId: q.rightAnswerId ?? null,
      rightAnswerString: q.rightAnswerString ?? null,
      sortOrder: index,
    }));

    await tx.question.createMany({ data: questionsData });

    return created;
  });

  return {
    id: suite.id,
    title: suite.title,
    language: suite.language,
    questionsCount: data.questionsList.length,
  };
}
