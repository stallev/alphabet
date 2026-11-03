import { Suspense } from "react";
import { connection } from "next/server";

import { AlphabetGameClient } from "@/games/alphabet/AlphabetGameClient";
import { en } from "@/games/alphabet/i18n/en";
import { ru } from "@/games/alphabet/i18n/ru";
import { ComplexityLevel } from "@/games/alphabet/types";
import type { QuestionsSuite } from "@/games/alphabet/types";
import type { GamePageProps } from "@/shared/game-kit/manifest";
import { getAllSuitesForGame } from "@/games/alphabet/server/suites/get-suites.server";

async function GameContent({ locale }: GamePageProps) {
  await connection();
  const suites = await getAllSuitesForGame();
  const dictionary = locale === "en" ? en : ru;

  const initialSuites: QuestionsSuite[] = suites.map((suite) => ({
    title: suite.title,
    language: suite.language,
    isSystem: suite.isSystem,
    questionsList: suite.questions.map((q) => ({
      id: q.legacyId ?? 0,
      questionContent: q.questionContent,
      complexityLevel: q.complexityLevel as ComplexityLevel,
      answerType: q.answerType as "ID" | "String",
      answersList: q.answersList as { id: number; value: string }[] | null,
      rightAnswerId: q.rightAnswerId ?? undefined,
      rightAnswerString: q.rightAnswerString ?? undefined,
    })),
  }));

  return (
    <AlphabetGameClient
      locale={locale}
      dictionary={dictionary}
      initialSuites={initialSuites}
    />
  );
}

function GameFallback() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-bg text-fg">
      <div className="mb-6 h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

export default function AlphabetGamePage({ locale }: GamePageProps) {
  return (
    <Suspense fallback={<GameFallback />}>
      <GameContent locale={locale} />
    </Suspense>
  );
}
