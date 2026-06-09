import { Suspense } from 'react';
import { connection } from 'next/server';
import { getAllSuitesForGame } from '@/src/data/suites/get-suites.server';
import { GameApp } from '@/components/GameApp';
import { ComplexityLevel } from '@/types';
import type { QuestionsSuite } from '@/types';

export const metadata = {
  title: 'Alphabet: Play',
};

async function GameContent() {
  await connection();
  const suites = await getAllSuitesForGame();

  const initialSuites: QuestionsSuite[] = suites.map((suite) => ({
    title: suite.title,
    language: suite.language,
    isSystem: suite.isSystem,
    questionsList: suite.questions.map((q) => ({
      id: q.legacyId ?? 0,
      questionContent: q.questionContent,
      complexityLevel: q.complexityLevel as ComplexityLevel,
      answerType: q.answerType as 'ID' | 'String',
      answersList: q.answersList as { id: number; value: string }[] | null,
      rightAnswerId: q.rightAnswerId ?? undefined,
      rightAnswerString: q.rightAnswerString ?? undefined,
    })),
  }));

  return <GameApp initialSuites={initialSuites} />;
}

function GameFallback() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6" />
      <h2 className="text-2xl font-black uppercase italic tracking-tighter animate-pulse">
        Loading...
      </h2>
    </div>
  );
}

export default function GamePage() {
  return (
    <Suspense fallback={<GameFallback />}>
      <GameContent />
    </Suspense>
  );
}
