import { Suspense } from 'react';
import { connection } from 'next/server';
import { getAllSuites } from '@/src/data/suites/get-suites.server';
import { SuitesTable } from '@/components/admin/SuitesTable';
import Link from 'next/link';

export const metadata = { title: 'Question Suites — Admin Alphabet' };

async function SuitesContent() {
  await connection();
  const suites = await getAllSuites();
  return (
    <>
      <p className="text-slate-500 text-xs mt-1">{suites.length} наборов в базе</p>
      <div className="mt-8">
        <SuitesTable suites={suites} />
      </div>
    </>
  );
}

function SuitesSkeleton() {
  return (
    <>
      <p className="text-slate-500 text-xs mt-1">Загрузка...</p>
      <div className="mt-8 space-y-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-12 bg-slate-900 rounded-xl animate-pulse" />
        ))}
      </div>
    </>
  );
}

export default function AdminSuitesPage() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-black text-white uppercase tracking-tighter">
          Наборы вопросов
        </h1>
        <Link
          href="/admin/suites/import"
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm uppercase tracking-wide transition-all"
        >
          + Импорт JSON
        </Link>
      </div>
      <Suspense fallback={<SuitesSkeleton />}>
        <SuitesContent />
      </Suspense>
    </div>
  );
}
