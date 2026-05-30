import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getAllSuites } from '@/src/data/suites/get-suites.server';
import { importSuiteFromJson } from '@/src/data/suites/import-suite.server';
import { suiteImportSchema } from '@/lib/validators/suite-import';
import { revalidateTag } from 'next/cache';

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') return null;
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const suites = await getAllSuites();
  return NextResponse.json(suites);
}

export async function POST(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = suiteImportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  try {
    const result = await importSuiteFromJson(parsed.data, {
      createdById: session.user.id,
    });

    revalidateTag('suites', 'max');
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    console.error('[POST /api/admin/suites]', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
