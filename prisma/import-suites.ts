import { config } from 'dotenv';
config({ path: '.env.local' });
config();

import { PrismaClient } from '../generated/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { readFileSync } from 'fs';
import { join } from 'path';
import { suiteImportSchema } from '../lib/validators/suite-import';

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function upsertSuiteFromFile(filePath: string, adminId: string): Promise<void> {
  const raw = readFileSync(filePath, 'utf-8');
  const json = JSON.parse(raw);
  const parsed = suiteImportSchema.safeParse(json);

  if (!parsed.success) {
    const first = parsed.error.errors[0];
    throw new Error(
      `${filePath}: ${first ? `${first.path.join('.')}: ${first.message}` : 'Invalid JSON'}`
    );
  }

  const data = parsed.data;
  const existing = await prisma.questionSuite.findFirst({
    where: { title: data.title, language: data.language },
  });

  await prisma.$transaction(async (tx) => {
    let suiteId: string;

    if (existing) {
      await tx.question.deleteMany({ where: { suiteId: existing.id } });
      await tx.questionSuite.update({
        where: { id: existing.id },
        data: {
          description: data.description,
          isSystem: true,
          sourceType: 'system',
        },
      });
      suiteId = existing.id;
      console.log(`  ↻ Updated: ${data.title} (${data.language})`);
    } else {
      const created = await tx.questionSuite.create({
        data: {
          title: data.title,
          language: data.language,
          description: data.description,
          isSystem: true,
          sourceType: 'system',
          createdById: adminId,
        },
      });
      suiteId = created.id;
      console.log(`  ✓ Created: ${data.title} (${data.language})`);
    }

    const questions = data.questionsList.map((q, idx) => ({
      suiteId,
      legacyId: q.id,
      questionContent: q.questionContent,
      complexityLevel: q.complexityLevel,
      answerType: q.answerType,
      answersList: q.answersList ? JSON.parse(JSON.stringify(q.answersList)) : null,
      rightAnswerId: q.rightAnswerId ?? null,
      rightAnswerString: q.rightAnswerString ?? null,
      sortOrder: idx,
    }));

    await tx.question.createMany({ data: questions });
    console.log(`    → ${questions.length} questions imported`);
  });
}

async function main() {
  const files = process.argv.slice(2);
  if (files.length === 0) {
    console.error('Usage: tsx prisma/import-suites.ts <file.json> [...]');
    process.exit(1);
  }

  const admin = await prisma.user.findFirst({ where: { role: 'admin' } });
  if (!admin) {
    throw new Error('No admin user found. Run db:seed first.');
  }

  console.log(`Importing ${files.length} file(s)...\n`);

  for (const file of files) {
    const filePath = join(process.cwd(), file);
    await upsertSuiteFromFile(filePath, admin.id);
  }

  console.log('\n✅ Import complete!');
}

main()
  .catch((err) => {
    console.error('Import failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
