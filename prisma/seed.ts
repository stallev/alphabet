import { config } from 'dotenv';
config({ path: '.env.local' });
config();

import { PrismaClient } from '../generated/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import bcrypt from 'bcryptjs';
import { readFileSync } from 'fs';
import { join } from 'path';

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

interface JsonQuestion {
  id: number;
  questionContent: string;
  complexityLevel: 'easy' | 'medium' | 'hard';
  answerType: 'ID' | 'String';
  answersList: { id: number; value: string }[] | null;
  rightAnswerId?: number | null;
  rightAnswerString?: string | null;
}

interface JsonSuite {
  title: string;
  language?: string;
  questionsList: JsonQuestion[];
}

async function seedAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@alphabet.local';
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'alphabet-admin-2026';

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash,
      name: 'Administrator',
      role: 'admin',
    },
  });

  console.log(`✓ Admin user: ${admin.email}`);
  return admin;
}

async function seedSuiteFromFile(
  filePath: string,
  adminId: string
): Promise<void> {
  let data: JsonSuite;

  try {
    const raw = readFileSync(filePath, 'utf-8');
    data = JSON.parse(raw);
  } catch (err) {
    console.warn(`⚠ Skipped ${filePath}: ${err}`);
    return;
  }

  const existing = await prisma.questionSuite.findFirst({
    where: { title: data.title, isSystem: true },
  });

  if (existing) {
    console.log(`  ↳ Skip (exists): ${data.title}`);
    return;
  }

  await prisma.$transaction(async (tx) => {
    const suite = await tx.questionSuite.create({
      data: {
        title: data.title,
        language: data.language ?? 'ru',
        isSystem: true,
        sourceType: 'system',
        createdById: adminId,
      },
    });

    const questions = data.questionsList.map((q, idx) => ({
      suiteId: suite.id,
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

    console.log(`  ✓ Seeded: ${data.title} (${questions.length} questions)`);
  });
}

async function main() {
  console.log('🌱 Starting seed...\n');

  const admin = await seedAdmin();

  console.log('\n📚 Seeding system suites from data/...');

  const dataDir = join(process.cwd(), 'data');
  const systemFiles = [
    'christmas.json',
    'acts_en.json',
    'acts.json',
    'acts_of_apostles.json',
    'genesis_en.json',
    'kings_en.json',
    'kings_ru.json',
    'gospels_en.json',
    'life_of_jesus_en.json',
    'life_of_paul_ru.json',
    'life_of_david_ru.json',
    'life_of_joseph_ru.json',
    'miracles_ru.json',
    'proverbs_en.json',
    'proverbs_ru.json',
    'sermon_ru.json',
  ];

  for (const file of systemFiles) {
    await seedSuiteFromFile(join(dataDir, file), admin.id);
  }

  console.log('\n✅ Seed complete!');
  console.log(`\nAdmin credentials:`);
  console.log(`  Email:    ${process.env.ADMIN_EMAIL ?? 'admin@alphabet.local'}`);
  console.log(`  Password: ${process.env.ADMIN_PASSWORD ?? 'alphabet-admin-2026'}`);
  console.log(`\n⚠ Change password in production!`);
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
