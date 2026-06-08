import 'server-only';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

const FALLBACK_CHAIN = [
  'qwen/qwen-2.5-72b-instruct:free',
  'mistralai/mistral-7b-instruct:free',
  'deepseek/deepseek-chat:free',
];

const LANGUAGE_META: Record<string, { label: string; translation: string }> = {
  ru: { label: 'Русский', translation: 'Синодальный перевод' },
  en: { label: 'English', translation: 'ESV / NIV' },
  uk: { label: 'Українська', translation: 'Переклад Огієнка' },
  de: { label: 'Deutsch', translation: 'Luther 2017 / Elberfelder' },
  ro: { label: 'Română', translation: 'Cornilescu' },
};

function buildPrompt(topic: string, lang: string): string {
  const langMeta = LANGUAGE_META[lang] ?? LANGUAGE_META.en;
  const translationInstruction =
    lang === 'ru'
      ? 'Используй Синодальный перевод как основной источник.'
      : `Use the most authoritative and modern Bible translation for ${langMeta.label} (e.g., ${langMeta.translation}).`;

  return `Act as an expert Bible quiz methodologist for advanced Christians. Generate content in: ${langMeta.label.toUpperCase()}.
TOPIC: ${topic}

STRICT REQUIREMENTS:
1. LANGUAGE: All questions and answers MUST be strictly in ${langMeta.label}.
2. COUNT: Generate exactly 150 UNIQUE questions.
3. DISTRIBUTION: Strictly equal: 50 easy, 50 medium, 50 hard.
4. SOURCE: ${translationInstruction}
5. FOCUS: Facts, events, names, geography.
6. FORBIDDEN: Do NOT use questions about Greek/Hebrew word meanings.
7. ANSWER TYPES: 100% multiple choice (ID) with 4 options.
8. PURITY: The question text (questionContent) MUST NEVER contain the correct answer or a hint.
   Bad: "In which country was 'Silent Night' written (Austria)?"
   Good: "In which country was 'Silent Night' written?"

DIFFICULTY REQUIREMENTS:
- 'easy': Non-obvious facts, requires good knowledge of Bible text. Do NOT ask "Who built the ark?" or "Where was Jesus born?". Ask about details, names, locations.
- 'medium': Requires knowledge of chronology, theological connections, secondary characters.
- 'hard': Very difficult for advanced Christians. Rare names, exact numbers, specific geographic details, OT typology.

RANDOMIZATION: Ensure random placement of the correct answer in answersList. The rightAnswerId MUST NOT always be at the same position.

JSON FORMAT (respond with valid JSON only, no markdown):
{
  "title": "${topic}",
  "language": "${lang}",
  "questionsList": [
    {
      "id": 1,
      "questionContent": "question text in ${langMeta.label} (WITHOUT the answer inside)",
      "complexityLevel": "easy|medium|hard",
      "answerType": "ID",
      "answersList": [
        {"id":1,"value":"option A"},
        {"id":2,"value":"option B"},
        {"id":3,"value":"option C"},
        {"id":4,"value":"option D"}
      ],
      "rightAnswerId": 1
    }
  ]
}`;
}

async function callOpenRouter(
  modelId: string,
  prompt: string,
  signal: AbortSignal
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY is not configured');

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    signal,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.PUBLIC_SITE_URL ?? 'https://alphabet.local',
      'X-Title': 'Alphabet Bible Game',
    },
    body: JSON.stringify({
      model: modelId,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    }),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error?.message ?? `OpenRouter error ${response.status}`);
  }
  return result.choices[0].message.content as string;
}

function cleanJsonResponse(text: string): string {
  const match = text.match(/\{[\s\S]*\}/);
  if (match) return match[0];
  return text.replace(/```json/g, '').replace(/```/g, '').trim();
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let body: { topic?: string; lang?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const topic = body.topic?.trim();
  const lang = body.lang ?? 'ru';

  if (!topic) {
    return NextResponse.json({ error: 'topic is required' }, { status: 400 });
  }

  const prompt = buildPrompt(topic, lang);
  const abortController = new AbortController();

  let jsonText = '';
  let lastError: Error | null = null;

  for (const modelId of FALLBACK_CHAIN) {
    try {
      jsonText = await callOpenRouter(modelId, prompt, abortController.signal);
      if (jsonText) break;
    } catch (err) {
      lastError = err as Error;
      if ((err as Error).name === 'AbortError') break;
    }
  }

  if (!jsonText) {
    return NextResponse.json(
      { error: lastError?.message ?? 'All AI providers failed' },
      { status: 502 }
    );
  }

  try {
    const suite = JSON.parse(cleanJsonResponse(jsonText));
    suite.language = lang;
    return NextResponse.json({ suite });
  } catch {
    return NextResponse.json({ error: 'Failed to parse AI response as JSON' }, { status: 502 });
  }
}
