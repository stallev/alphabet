'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store';
import { TRANSLATIONS } from '../constants';
import type { Locale } from '../types';

const PROMPT_TEXTS: Record<Locale, string> = {
  ru: `Действуй как эксперт-методист библейских викторин для продвинутых христиан. Составь набор вопросов для игры "Алфавит" в формате JSON.
ЯЗЫК: [ВСТАВЬ ЯЗЫК: ru, en, uk, de, ro]
Тематика: [ВСТАВЬ ТЕМАТИКУ]
Уровень аудитории: "Advanced/Knowledgeable Christians" (Сложный).

Требования к JSON структуре:
{
  "title": "Название набора",
  "language": "код_языка",
  "questionsList": [
    {
      "id": число,
      "questionContent": "Текст вопроса на выбранном языке",
      "complexityLevel": "easy" | "medium" | "hard",
      "answerType": "ID",
      "answersList": [
        {"id": 1, "value": "Вариант 1"},
        {"id": 2, "value": "Вариант 2"},
        {"id": 3, "value": "Вариант 3"},
        {"id": 4, "value": "Вариант 4"}
      ],
      "rightAnswerId": 1
    }
  ]
}

Богословские ограничения и сложность:
1. Использовать авторитетный перевод (Синодальный для RU, ESV/NIV для EN).
2. ИСКЛЮЧИ любые вопросы по католическому и православному преданию.
3. ВАЖНО: Вопросы должны быть СЛОЖНЫМИ.
   - 'easy': Неочевидные факты, требует хорошего знания текста Библии. Не спрашивать простые вещи вроде "Кто построил ковчег?". Спрашивать детали, имена, локации.
   - 'medium': Требует знания хронологии, богословских связей, второстепенных персонажей.
   - 'hard': Очень сложные вопросы. Редкие имена, точные цифры, специфические географические детали, ветхозаветные прообразы.
4. РАНДОМИЗАЦИЯ: Обеспечь случайное положение правильного ответа в списке вариантов (он не должен быть всегда первым).
5. ЧИСТОТА: Текст вопроса НИКОГДА не должен содержать правильный ответ или подсказку (например, в скобках). Плохо: "Кто построил ковчег (Ной)?". Хорошо: "Кто построил ковчег?".
6. Составь ровно 150 УНИКАЛЬНЫХ вопросов.
7. РАСПРЕДЕЛЕНИЕ: Строго поровну: 50 easy, 50 medium, 50 hard.
8. ТИПЫ ОТВЕТОВ: 100% тест (ID).`,

  en: `Act as a Bible quiz expert for advanced Christians. Generate a question set for the "Alphabet" game in JSON format.
LANGUAGE: [INSERT LANGUAGE: ru, en, uk, de, ro]
Topic: [INSERT TOPIC]
Audience level: "Advanced/Knowledgeable Christians" (Hard).

JSON structure requirements:
{
  "title": "Suite name",
  "language": "language_code",
  "questionsList": [
    {
      "id": number,
      "questionContent": "Question text in the chosen language",
      "complexityLevel": "easy" | "medium" | "hard",
      "answerType": "ID",
      "answersList": [
        {"id": 1, "value": "Option 1"},
        {"id": 2, "value": "Option 2"},
        {"id": 3, "value": "Option 3"},
        {"id": 4, "value": "Option 4"}
      ],
      "rightAnswerId": 1
    }
  ]
}

Theological constraints and difficulty:
1. Use an authoritative translation (Synodal for RU, ESV/NIV for EN).
2. EXCLUDE any questions on Catholic or Orthodox tradition.
3. IMPORTANT: Questions must be DIFFICULT.
   - 'easy': Non-obvious facts, requires good knowledge of Scripture. Do not ask trivial things like "Who built the ark?". Ask about details, names, locations.
   - 'medium': Requires knowledge of chronology, theological connections, minor characters.
   - 'hard': Very difficult questions. Rare names, exact numbers, specific geographical details, Old Testament types.
4. RANDOMIZATION: Ensure the correct answer is placed at a random position in the options list (not always first).
5. CLEANLINESS: The question text must NEVER contain the correct answer or a hint (e.g., in parentheses). Bad: "Who built the ark (Noah)?". Good: "Who built the ark?".
6. Generate exactly 150 UNIQUE questions.
7. DISTRIBUTION: Strictly equal: 50 easy, 50 medium, 50 hard.
8. ANSWER TYPES: 100% multiple choice (ID).`,

  uk: `Дій як експерт-методист біблійних вікторин для просунутих християн. Склади набір запитань для гри "Алфавіт" у форматі JSON.
МОВА: [ВСТАВ МОВУ: ru, en, uk, de, ro]
Тематика: [ВСТАВ ТЕМАТИКУ]
Рівень аудиторії: "Advanced/Knowledgeable Christians" (Складний).

Вимоги до структури JSON:
{
  "title": "Назва набору",
  "language": "код_мови",
  "questionsList": [
    {
      "id": число,
      "questionContent": "Текст запитання обраною мовою",
      "complexityLevel": "easy" | "medium" | "hard",
      "answerType": "ID",
      "answersList": [
        {"id": 1, "value": "Варіант 1"},
        {"id": 2, "value": "Варіант 2"},
        {"id": 3, "value": "Варіант 3"},
        {"id": 4, "value": "Варіант 4"}
      ],
      "rightAnswerId": 1
    }
  ]
}

Богословські обмеження та складність:
1. Використовувати авторитетний переклад (Синодальний для RU, ESV/NIV для EN).
2. ВИКЛЮЧИ будь-які запитання про католицьке та православне передання.
3. ВАЖЛИВО: Запитання мають бути СКЛАДНИМИ.
   - 'easy': Неочевидні факти, вимагає гарного знання тексту Біблії. Не запитувати простих речей на кшталт "Хто побудував ковчег?". Запитувати деталі, імена, локації.
   - 'medium': Вимагає знання хронології, богословських зв'язків, другорядних персонажів.
   - 'hard': Дуже складні запитання. Рідкісні імена, точні цифри, специфічні географічні деталі, старозавітні прообрази.
4. РАНДОМІЗАЦІЯ: Забезпечи випадкове положення правильної відповіді у списку варіантів (вона не має бути завжди першою).
5. ЧИСТОТА: Текст запитання НІКОЛИ не повинен містити правильну відповідь або підказку (наприклад, у дужках). Погано: "Хто побудував ковчег (Ной)?". Добре: "Хто побудував ковчег?".
6. Склади рівно 150 УНІКАЛЬНИХ запитань.
7. РОЗПОДІЛ: Строго порівно: 50 easy, 50 medium, 50 hard.
8. ТИПИ ВІДПОВІДЕЙ: 100% тест (ID).`,

  de: `Agiere als Bibelquiz-Experte für fortgeschrittene Christen. Erstelle einen Fragensatz für das Spiel "Alphabet" im JSON-Format.
SPRACHE: [SPRACHE EINFÜGEN: ru, en, uk, de, ro]
Thema: [THEMA EINFÜGEN]
Zielgruppe: "Advanced/Knowledgeable Christians" (Schwer).

JSON-Strukturanforderungen:
{
  "title": "Name des Fragesets",
  "language": "Sprachcode",
  "questionsList": [
    {
      "id": Zahl,
      "questionContent": "Fragetext in der gewählten Sprache",
      "complexityLevel": "easy" | "medium" | "hard",
      "answerType": "ID",
      "answersList": [
        {"id": 1, "value": "Option 1"},
        {"id": 2, "value": "Option 2"},
        {"id": 3, "value": "Option 3"},
        {"id": 4, "value": "Option 4"}
      ],
      "rightAnswerId": 1
    }
  ]
}

Theologische Einschränkungen und Schwierigkeit:
1. Autorisierten Bibeltext verwenden (Synodal für RU, Lutherbibel/ESV für DE).
2. AUSSCHLIESSEN aller Fragen zu katholischen und orthodoxen Traditionen.
3. WICHTIG: Fragen müssen SCHWIERIG sein.
   - 'easy': Nicht offensichtliche Fakten, erfordert gute Bibelkenntnis. Keine einfachen Fragen wie "Wer baute die Arche?". Nach Details, Namen, Orten fragen.
   - 'medium': Erfordert Wissen über Chronologie, theologische Zusammenhänge, Nebenfiguren.
   - 'hard': Sehr schwierige Fragen. Seltene Namen, genaue Zahlen, spezifische geografische Details, alttestamentliche Vorbilder.
4. RANDOMISIERUNG: Sicherstellen, dass die richtige Antwort an einer zufälligen Position steht (nicht immer an erster Stelle).
5. SAUBERKEIT: Der Fragetext darf die richtige Antwort oder einen Hinweis NIEMALS enthalten (z.B. in Klammern). Schlecht: "Wer baute die Arche (Noah)?". Gut: "Wer baute die Arche?".
6. Erstelle genau 150 EINZIGARTIGE Fragen.
7. VERTEILUNG: Strikt gleichmäßig: 50 easy, 50 medium, 50 hard.
8. ANTWORTTYPEN: 100% Multiple Choice (ID).`,

  ro: `Acționează ca expert în quiz-uri biblice pentru creștini avansați. Generează un set de întrebări pentru jocul "Alfabet" în format JSON.
LIMBĂ: [INTRODUCEȚI LIMBA: ru, en, uk, de, ro]
Subiect: [INTRODUCEȚI SUBIECTUL]
Nivelul audienței: "Advanced/Knowledgeable Christians" (Dificil).

Cerințe pentru structura JSON:
{
  "title": "Numele setului",
  "language": "cod_limbă",
  "questionsList": [
    {
      "id": număr,
      "questionContent": "Textul întrebării în limba aleasă",
      "complexityLevel": "easy" | "medium" | "hard",
      "answerType": "ID",
      "answersList": [
        {"id": 1, "value": "Opțiunea 1"},
        {"id": 2, "value": "Opțiunea 2"},
        {"id": 3, "value": "Opțiunea 3"},
        {"id": 4, "value": "Opțiunea 4"}
      ],
      "rightAnswerId": 1
    }
  ]
}

Constrângeri teologice și dificultate:
1. Utilizați o traducere autorizată (Sinodal pentru RU, Cornilescu/NTR pentru RO, ESV/NIV pentru EN).
2. EXCLUDEȚI orice întrebări despre tradiția catolică și ortodoxă.
3. IMPORTANT: Întrebările trebuie să fie DIFICILE.
   - 'easy': Fapte neevidente, necesită cunoaștere bună a Scripturii. Nu întrebați lucruri simple de genul "Cine a construit arca?". Întrebați despre detalii, nume, locații.
   - 'medium': Necesită cunoașterea cronologiei, conexiunilor teologice, personajelor secundare.
   - 'hard': Întrebări foarte dificile. Nume rare, numere exacte, detalii geografice specifice, tipurile Vechiului Testament.
4. RANDOMIZARE: Asigurați că răspunsul corect se află pe o poziție aleatorie în lista de opțiuni (nu întotdeauna primul).
5. CURĂȚENIE: Textul întrebării NU trebuie să conțină niciodată răspunsul corect sau un indiciu (de ex., în paranteze). Rău: "Cine a construit arca (Noe)?". Bine: "Cine a construit arca?".
6. Generați exact 150 de întrebări UNICE.
7. DISTRIBUȚIE: Strict egal: 50 easy, 50 medium, 50 hard.
8. TIPURI DE RĂSPUNSURI: 100% test (ID).`,
};

export const PromptPage: React.FC = () => {
  const { locale, setShowPrompt } = useGameStore();
  const t = TRANSLATIONS[locale];
  const [copied, setCopied] = useState(false);

  const promptText = PROMPT_TEXTS[locale];

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(promptText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 flex flex-col items-center">
      <div className="max-w-3xl w-full bg-white rounded-3xl shadow-xl p-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black text-blue-900 uppercase italic">
            {t.promptPageTitle}
          </h1>
          <button
            onClick={() => setShowPrompt(false)}
            className="text-slate-400 hover:text-slate-600 font-bold transition-colors"
          >
            {t.close}
          </button>
        </div>
        <p className="text-slate-600 mb-6 leading-relaxed">{t.promptPageDesc}</p>
        <div className="relative group">
          <pre className="bg-slate-900 text-slate-300 p-6 rounded-2xl overflow-x-auto text-sm font-mono whitespace-pre-wrap border-4 border-slate-800">
            {promptText}
          </pre>
          <button
            onClick={copyPrompt}
            className="absolute top-4 right-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-black shadow-lg transition-colors"
          >
            <motion.span
              key={copied ? 'copied' : 'copy'}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
            >
              {copied ? t.promptPageCopied : t.promptPageCopy}
            </motion.span>
          </button>
        </div>
      </div>
    </div>
  );
};
