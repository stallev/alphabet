'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Locale } from '../types';
import { LOCALE_META, ALPHABET_BY_LOCALE } from '../constants';
import { useGameStore } from '../store';

// Temporarily active locales — only languages with question suites in the DB.
// Full list (uk, de, ro) is preserved in types.ts, constants.ts, and LOCALE_META.
const LOCALES: Locale[] = ['ru', 'en'];

function getAlphabetHint(locale: Locale): string {
  const letters = ALPHABET_BY_LOCALE[locale];
  return letters.slice(0, 3).join('') + '…';
}

export const LocaleSelector: React.FC = () => {
  const { locale, setLocale } = useGameStore();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const current = LOCALE_META[locale];

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  // Закрыть при клике вне компонента
  useEffect(() => {
    if (!open) return;
    function onOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close();
      }
    }
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, [open, close]);

  // Клавиатурная навигация
  function handleTriggerKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
    }
  }

  function handleListKeyDown(e: React.KeyboardEvent) {
    const idx = LOCALES.indexOf(locale);
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setLocale(LOCALES[(idx + 1) % LOCALES.length]);
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setLocale(LOCALES[(idx - 1 + LOCALES.length) % LOCALES.length]);
    }
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); close(); }
    if (e.key === 'Tab') close();
  }

  function select(l: Locale) {
    setLocale(l);
    close();
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        ref={triggerRef}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={handleTriggerKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Язык интерфейса: ${current.label}`}
        className="w-full flex items-center justify-between gap-2 bg-white/10 hover:bg-white/20 active:bg-white/25 border border-white/20 rounded-xl px-3.5 py-3 text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-xs font-black shrink-0 opacity-80">
            {current.shortLabel}
          </span>
          <span className="text-xs font-bold truncate">{current.label}</span>
        </div>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-white/50 shrink-0 text-[10px]"
          aria-hidden="true"
        >
          ▾
        </motion.span>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            aria-label="Выбор языка"
            onKeyDown={handleListKeyDown}
            tabIndex={-1}
            initial={{ opacity: 0, y: -6, scaleY: 0.92 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -6, scaleY: 0.92 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            style={{ transformOrigin: 'top' }}
            className="absolute top-full mt-1.5 left-0 right-0 z-50 bg-blue-900 border border-white/15 rounded-xl overflow-hidden shadow-2xl shadow-black/40"
          >
            {LOCALES.map((l) => {
              const meta = LOCALE_META[l];
              const isSelected = l === locale;
              const hint = getAlphabetHint(l);

              return (
                <li
                  key={l}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => select(l)}
                  className={`
                    flex items-center justify-between gap-2 px-3.5 py-2.5 cursor-pointer
                    transition-colors select-none
                    ${isSelected
                      ? 'bg-white/15 text-white'
                      : 'text-white/75 hover:bg-white/10 hover:text-white'
                    }
                  `}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-xs font-black shrink-0 opacity-80">
                      {meta.shortLabel}
                    </span>
                    <span className="text-xs font-bold truncate">{meta.label}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-white/35 font-mono tracking-wide">
                      {hint}
                    </span>
                    {isSelected && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-emerald-400 text-xs leading-none"
                        aria-hidden="true"
                      >
                        ✓
                      </motion.span>
                    )}
                  </div>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};
