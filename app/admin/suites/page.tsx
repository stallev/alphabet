import { getAllSuites } from '@/src/data/suites/get-suites.server';
import { SuitesTable } from '@/components/admin/SuitesTable';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Наборы вопросов — Admin Алфавит' };

export default async function AdminSuitesPage() {
  const suites = await getAllSuites();

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tighter">
            Наборы вопросов
          </h1>
          <p className="text-slate-500 text-xs mt-1">{suites.length} наборов в базе</p>
        </div>
        <Link
          href="/admin/suites/import"
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm uppercase tracking-wide transition-all"
        >
          + Импорт JSON
        </Link>
      </div>

      <SuitesTable suites={suites} />
    </div>
  );
}
