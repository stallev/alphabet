import { SuiteImportForm } from '@/components/admin/SuiteImportForm';

export const metadata = { title: 'Import Suite — Admin Alphabet' };

export default function AdminSuiteImportPage() {
  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white uppercase tracking-tighter">
          Импорт набора вопросов
        </h1>
        <p className="text-slate-500 text-xs mt-1">
          Загрузить набор из JSON или вставить текст напрямую
        </p>
      </div>

      {/* Format hint */}
      <div className="bg-slate-900 border border-emerald-500/10 rounded-2xl p-5 mb-6 text-xs font-mono">
        <div className="text-emerald-500/60 uppercase tracking-widest mb-3 text-[10px]">
          Ожидаемый формат JSON
        </div>
        <pre className="text-slate-400 overflow-x-auto leading-relaxed">{`{
  "title": "Название набора",
  "language": "ru",
  "questionsList": [
    {
      "id": 1,
      "questionContent": "Текст вопроса?",
      "complexityLevel": "easy",
      "answerType": "ID",
      "answersList": [
        { "id": 1, "value": "Вариант А" },
        { "id": 2, "value": "Вариант Б" }
      ],
      "rightAnswerId": 2,
      "rightAnswerString": null
    }
  ]
}`}</pre>
      </div>

      <SuiteImportForm />
    </div>
  );
}
