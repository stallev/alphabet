import 'server-only';

import { prisma } from '@/lib/db';
import type { QuestionSuite } from '@/generated/client';

export async function getAllSuites(): Promise<QuestionSuite[]> {
  return prisma.questionSuite.findMany({
    orderBy: [{ isSystem: 'desc' }, { createdAt: 'desc' }],
  });
}

export async function getSuiteWithQuestions(id: string) {
  return prisma.questionSuite.findUnique({
    where: { id },
    include: {
      questions: {
        orderBy: { sortOrder: 'asc' },
      },
    },
  });
}

export async function getPublicSuites() {
  return prisma.questionSuite.findMany({
    where: { isSystem: true },
    orderBy: { createdAt: 'asc' },
    include: {
      questions: {
        orderBy: { sortOrder: 'asc' },
      },
    },
  });
}

export async function getAllSuitesForGame() {
  return prisma.questionSuite.findMany({
    orderBy: [{ isSystem: 'desc' }, { createdAt: 'desc' }],
    include: {
      questions: {
        orderBy: { sortOrder: 'asc' },
      },
    },
  });
}

export async function deleteSuite(id: string) {
  return prisma.questionSuite.delete({ where: { id } });
}
