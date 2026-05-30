import { NextResponse } from 'next/server';
import { getAllSuitesForGame } from '@/src/data/suites/get-suites.server';

/**
 * Public API — игра загружает все наборы вопросов из БД.
 * Заменяет статические /data/*.json файлы.
 */
export async function GET() {
  try {
    const suites = await getAllSuitesForGame();

    // Map DB model to game format (compatible with QuestionsSuite type)
    const gameData = suites.map((suite) => ({
      id: suite.id,
      title: suite.title,
      language: suite.language,
      isSystem: suite.isSystem,
      questionsList: (suite as any).questions?.map((q: any) => ({
        id: q.legacyId ?? q.id,
        questionContent: q.questionContent,
        complexityLevel: q.complexityLevel,
        answerType: q.answerType,
        answersList: q.answersList,
        rightAnswerId: q.rightAnswerId,
        rightAnswerString: q.rightAnswerString,
      })) ?? [],
    }));

    return NextResponse.json(gameData, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (err) {
    console.error('[GET /api/suites]', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
