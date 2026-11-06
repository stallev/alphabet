import { Suspense } from 'react';
import { connection } from 'next/server';
import Link from 'next/link';

import { Button } from '@/shared/ui/Button';
import { getAllSuites } from '@/games/alphabet/server/suites/get-suites.server';
import { SuitesTable } from '@/app/admin/_components/SuitesTable';

export const metadata = { title: 'Question Suites' };

async function SuitesContent() {
  await connection();
  const suites = await getAllSuites();
  return (
    <>
      <p className="mt-1 text-sm text-fg-muted">{suites.length} наборов в базе</p>
      <div className="mt-8">
        <SuitesTable suites={suites} />
      </div>
    </>
  );
}

function SuitesSkeleton() {
  return (
    <>
      <p className="mt-1 text-sm text-fg-muted">Загрузка...</p>
      <div className="mt-8 space-y-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-12 animate-pulse rounded-ctl bg-surface-muted" />
        ))}
      </div>
    </>
  );
}

export default function AdminSuitesPage() {
  return (
    <div className="p-8">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-fg">Наборы вопросов</h1>
        <Link href="/admin/suites/import">
          <Button variant="secondary" size="sm">
            Импорт JSON
          </Button>
        </Link>
      </div>
      <Suspense fallback={<SuitesSkeleton />}>
        <SuitesContent />
      </Suspense>
    </div>
  );
}
