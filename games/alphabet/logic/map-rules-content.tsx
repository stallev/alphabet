'use client';

import type { ReactNode } from 'react';

import {
  ALPHABET_BY_LOCALE,
  SCORE_EASY,
  SCORE_HARD,
  SCORE_MATCH,
  SCORE_MEDIUM,
} from '@/games/alphabet/constants';
import type { AlphabetDictionary } from '@/games/alphabet/i18n/en';
import type { Locale } from '@/shared/domain/locale';
import { format } from '@/shared/i18n/format';
import type { RulesContent } from '@/shared/game-kit/types';

export function mapAlphabetRulesContent(
  dictionary: AlphabetDictionary,
  locale: Locale,
): RulesContent {
  const r = dictionary.rulesPage;
  const cardCount = ALPHABET_BY_LOCALE[locale].length * 2;
  const pairCount = ALPHABET_BY_LOCALE[locale].length;

  return [
    {
      heading: r.section01Title,
      body: format(r.section01Text, { cardCount, pairCount }),
    },
    {
      heading: r.section02Title,
      body: (
        <>
          <p>{r.section02Intro}</p>
          <p className="mt-2 font-semibold">{r.matchTitle}</p>
          <ul className="mt-1 list-disc pl-5">
            <li>{format(r.matchItem1, { n: SCORE_MATCH })}</li>
            <li>{r.matchItem2}</li>
            <li>{r.matchItem3}</li>
            <li>{r.matchItem4}</li>
          </ul>
          <p className="mt-3 font-semibold">{r.missTitle}</p>
          <ul className="mt-1 list-disc pl-5">
            <li>{r.missItem1}</li>
            <li>{r.missItem2}</li>
            <li>{r.missItem3}</li>
          </ul>
        </>
      ),
    },
    {
      heading: r.section03Title,
      body: (
        <ul className="space-y-1">
          <li>
            {r.rowMatch}: {format(r.rowMatchPoints, { n: SCORE_MATCH })}
          </li>
          <li>
            {r.rowEasy}: {format(r.rowEasyPoints, { n: SCORE_EASY })}
          </li>
          <li>
            {r.rowMedium}: {format(r.rowMediumPoints, { n: SCORE_MEDIUM })}
          </li>
          <li>
            {r.rowHard}: {format(r.rowHardPoints, { n: SCORE_HARD })}
          </li>
        </ul>
      ),
    },
    {
      heading: r.section04Title,
      body: (
        <>
          <p>{r.section04Text}</p>
          <p className="mt-2">{r.section04Note}</p>
        </>
      ),
    },
    {
      heading: r.finishTitle,
      body: r.finishText,
    },
  ];
}
