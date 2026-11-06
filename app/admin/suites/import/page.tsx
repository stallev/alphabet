import { SuiteImportForm } from '@/app/admin/_components/SuiteImportForm';

export const metadata = { title: 'Import Suite' };

export default function AdminSuiteImportPage() {
  return (
    <div className="max-w-4xl p-8">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-fg">Импорт набора вопросов</h1>
        <p className="mt-1 text-sm text-fg-muted">
          Загрузить набор из JSON или вставить текст напрямую
        </p>
      </div>

      <div className="mb-6 rounded-card border border-border bg-surface p-5">
        <div className="mb-3 text-sm font-semibold text-fg-muted">
          Ожидаемый формат JSON
        </div>
        <pre className="overflow-x-auto text-xs leading-relaxed text-fg-muted">{`{
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
