'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface CreditsGateOverlayProps {
  lockedCount: number;
  locale: string;
}

const TEXTS = {
  ru: {
    badge: 'DEMO РЕЖИМ',
    title: 'Полный набор заблокирован',
    description: 'Показаны первые 3 вопроса из 150. Полная генерация доступна авторизованным пользователям с кредитами.',
    feature1: '150 вопросов за одну генерацию',
    feature2: '5 языков: RU, EN, UK, DE, RO',
    feature3: '3 уровня сложности · Тесты с 4 вариантами',
    feature4: 'Сохранение в библиотеку',
    comingSoon: 'Кредиты для пользователей — скоро',
    ctaSignIn: 'Войти как администратор',
    ctaLearnMore: 'Узнать больше',
    lockedLabel: (n: number) => `+${n} вопросов заблокировано`,
  },
  en: {
    badge: 'DEMO MODE',
    title: 'Full suite locked',
    description: 'Showing the first 3 of 150 questions. Full generation is available to authorized users with credits.',
    feature1: '150 questions per generation',
    feature2: '5 languages: RU, EN, UK, DE, RO',
    feature3: '3 difficulty levels · 4-option multiple choice',
    feature4: 'Save to library',
    comingSoon: 'Credits for users — coming soon',
    ctaSignIn: 'Sign in as administrator',
    ctaLearnMore: 'Learn more',
    lockedLabel: (n: number) => `+${n} questions locked`,
  },
};

export const CreditsGateOverlay: React.FC<CreditsGateOverlayProps> = ({
  lockedCount,
  locale,
}) => {
  const lang = locale === 'ru' ? 'ru' : 'en';
  const tx = TEXTS[lang];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative rounded-3xl overflow-hidden border-2 border-slate-200 bg-white shadow-xl"
    >
      {/* Blurred locked questions preview */}
      <div className="select-none pointer-events-none px-8 pt-6 pb-2 space-y-3 blur-[6px] opacity-40">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 bg-slate-100 rounded-2xl border-2 border-slate-200" />
        ))}
      </div>

      {/* Overlay card */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm px-6 py-8">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="w-full max-w-lg text-center"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            {tx.badge}
          </div>

          {/* Lock icon */}
          <div className="w-14 h-14 rounded-2xl bg-slate-100 border-2 border-slate-200 flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>

          <h3 className="text-xl font-black text-slate-900 mb-2">{tx.title}</h3>
          <p className="text-slate-500 text-sm leading-relaxed mb-2">{tx.description}</p>

          {/* Locked count pill */}
          <div className="inline-block bg-slate-100 text-slate-500 text-[11px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-6 border border-slate-200">
            {tx.lockedLabel(lockedCount)}
          </div>

          {/* Features grid */}
          <div className="grid grid-cols-2 gap-2 mb-6 text-left">
            {[tx.feature1, tx.feature2, tx.feature3, tx.feature4].map((feat, i) => (
              <div key={i} className="flex items-start gap-2 bg-slate-50 rounded-xl p-3 border border-slate-100">
                <span className="text-emerald-500 mt-0.5 shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </span>
                <span className="text-xs font-bold text-slate-600 leading-snug">{feat}</span>
              </div>
            ))}
          </div>

          {/* Coming soon notice */}
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-5">
            {tx.comingSoon}
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/admin/login"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/20"
            >
              {tx.ctaSignIn}
            </Link>
            <a
              href="/docs/architecture/ADR-002-ai-generator.md"
              target="_blank"
              rel="noreferrer"
              className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all"
            >
              {tx.ctaLearnMore}
            </a>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
