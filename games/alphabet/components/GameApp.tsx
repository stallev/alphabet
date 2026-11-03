'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { ALPHABET_MANIFEST } from '@/games/alphabet/manifest-data';
import { useGameStore } from '@/games/alphabet/store';
import type { Locale } from '@/shared/domain/locale';
import { useGameT } from '@/games/alphabet/i18n/use-game-t';
import { getGamePhase } from '@/games/alphabet/logic/game-phase';
import { mapAlphabetRulesContent } from '@/games/alphabet/logic/map-rules-content';
import { GameShell } from '@/shared/game-kit';
import { useLocale } from '@/shared/i18n/I18nProvider';

import { GameSettings } from './GameSettings';
import { ScoreBoard } from './ScoreBoard';
import { Card } from './Card';
import { LevelSelectModal } from './LevelSelectModal';
import { QuestionModal } from './QuestionModal';
import { RulesPage } from './RulesPage';
import { QuestionEditor } from './QuestionEditor';
import { VictoryScreen } from './VictoryScreen';
import { PromptPage } from './PromptPage';
import { AIGenerator } from './AIGenerator';
import { QuestionLibraryPage } from './QuestionLibraryPage';
import { OperatorGuide } from './OperatorGuide';
import { Timer } from './Timer';
import type { QuestionsSuite } from '@/games/alphabet/types';

const TurnTransition: React.FC<{ teamName: string; visible: boolean; label: string }> = ({
  teamName,
  visible,
  label,
}) => {
  if (!visible) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pointer-events-none fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.5, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 2, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="rounded-3xl border-4 border-blue-500 bg-white/90 px-6 py-4 text-center shadow-[0_0_60px_rgba(37,99,235,0.6)]"
      >
        <div className="mb-2 text-sm font-black uppercase tracking-widest text-slate-400">{label}</div>
        <div className="whitespace-nowrap text-2xl font-black uppercase italic tracking-tighter text-blue-900 md:text-3xl">
          {teamName}
        </div>
      </motion.div>
    </motion.div>
  );
};

interface GameAppProps {
  locale: Locale;
  initialSuites?: QuestionsSuite[];
}

export function GameApp({ locale: _pageLocale, initialSuites }: GameAppProps) {
  const locale = useLocale();
  const t = useGameT();
  const rulesPausedRef = useRef(false);
  const {
    isLoading,
    loadSystemSuites,
    setSystemSuites,
    applyLocale,
    isSettingsStage,
    cards,
    flipCard,
    temp,
    isGameActive,
    showEditor,
    showPrompt,
    showAIGenerator,
    showLibrary,
    showGuide,
    isGameOver,
    isPaused,
    togglePause,
    settings,
    currentTeamIndex,
    handleTurnTimeout,
    turnIdentifier,
    resetGame,
  } = useGameStore();

  const [showRules, setShowRules] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [showTurnTransition, setShowTurnTransition] = useState(false);
  const [suiteFallbackMessage, setSuiteFallbackMessage] = useState<string | null>(null);

  const phase = getGamePhase({
    isLoading,
    isSettingsStage,
    isGameOver,
    isPaused,
    showEditor,
    showPrompt,
    showAIGenerator,
    showLibrary,
    showGuide,
  });

  const rulesContent = useMemo(
    () => mapAlphabetRulesContent(t, locale),
    [t, locale],
  );

  useEffect(() => {
    if (isGameActive && !isSettingsStage && !isGameOver) {
      setShowTurnTransition(true);
      const timer = setTimeout(() => setShowTurnTransition(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [currentTeamIndex, isGameActive, isSettingsStage, isGameOver]);

  useEffect(() => {
    if (initialSuites) {
      setSystemSuites(initialSuites, locale);
    } else {
      void loadSystemSuites(locale);
    }
  }, [initialSuites, loadSystemSuites, locale, setSystemSuites]);

  useEffect(() => {
    const usedFallback = applyLocale(locale);
    setSuiteFallbackMessage(usedFallback ? t.localeSuiteFallback : null);
  }, [applyLocale, locale, t.localeSuiteFallback]);

  useEffect(() => {
    const handleHash = () => setShowRules(window.location.hash === '#rules');
    window.addEventListener('hashchange', handleHash);
    handleHash();

    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);

    return () => {
      window.removeEventListener('hashchange', handleHash);
      window.removeEventListener('resize', checkDesktop);
    };
  }, []);

  const handleRulesOpenChange = (open: boolean) => {
    if (open && isGameActive && !isSettingsStage && !isGameOver && !isPaused) {
      rulesPausedRef.current = true;
      togglePause();
      return;
    }
    if (!open && rulesPausedRef.current) {
      rulesPausedRef.current = false;
      togglePause();
    }
  };

  if (isLoading) {
    return (
      <GameShell manifest={ALPHABET_MANIFEST} phase="lobby" pausedOverlay={false}>
        <div className="flex min-h-[50vh] flex-col items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
            className="mb-6 h-16 w-16 rounded-full border-4 border-primary border-t-transparent"
          />
        </div>
      </GameShell>
    );
  }

  let mainContent;
  if (showRules) mainContent = <RulesPage />;
  else if (showPrompt) mainContent = <PromptPage />;
  else if (showEditor) mainContent = <QuestionEditor />;
  else if (showAIGenerator) mainContent = <AIGenerator />;
  else if (showLibrary) mainContent = <QuestionLibraryPage />;
  else if (showGuide) mainContent = <OperatorGuide />;
  else if (isSettingsStage) mainContent = <GameSettings />;
  else {
    const isFlipTimerActive =
      !isGameOver &&
      !temp.showLevelSelect &&
      !temp.showQuestionModal &&
      !temp.isProcessing &&
      !isPaused;
    const matchedCount = cards.filter((c) => c.isMatched).length;
    const totalCards = cards.length;
    const progressPercent = totalCards > 0 ? Math.round((matchedCount / totalCards) * 100) : 0;
    const isRussian = cards.length === 66;
    const gridClass = isRussian
      ? 'grid-cols-6 sm:grid-cols-8 lg:grid-cols-11'
      : 'grid-cols-4 sm:grid-cols-7 lg:grid-cols-13';
    const timerKey = `${currentTeamIndex}-${turnIdentifier}`;

    mainContent = (
      <div className="relative flex max-h-screen min-h-0 flex-col overflow-hidden bg-slate-100">
        {suiteFallbackMessage ? (
          <p className="bg-amber-100 px-4 py-2 text-center text-sm font-semibold text-amber-950">
            {suiteFallbackMessage}
          </p>
        ) : null}
        <ScoreBoard />
        <div className="sticky top-0 z-20 h-2 w-full shrink-0 overflow-hidden bg-slate-200 shadow-inner">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ type: 'spring', stiffness: 40, damping: 15 }}
            className="relative h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.7)]"
          >
            <div className="absolute inset-0 animate-pulse bg-white/20" />
          </motion.div>
        </div>
        <div className="relative flex h-full w-full flex-1 overflow-hidden">
          <div
            className={`flex flex-1 flex-col items-center justify-center p-2 transition-all duration-500 lg:pl-[50px] lg:pr-4 ${isPaused ? 'scale-95 grayscale blur-xl' : ''}`}
          >
            <div
              className={`grid h-full w-full gap-1.5 ${gridClass}`}
              style={{
                height: isDesktop ? 'calc(100vh - 160px)' : 'auto',
                alignContent: 'stretch',
                justifyContent: 'center',
              }}
            >
              {cards.map((card) => (
                <Card
                  key={card.id}
                  data={card}
                  onClick={flipCard}
                  disabled={
                    temp.isProcessing ||
                    !isGameActive ||
                    isGameOver ||
                    isPaused ||
                    showTurnTransition
                  }
                />
              ))}
            </div>
          </div>
          {isDesktop ? (
            <aside className="pointer-events-none relative z-30 flex h-full w-32 shrink-0 flex-col items-center justify-center">
              <div
                className={`pointer-events-auto flex justify-center rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-2xl backdrop-blur-md transition-all duration-500 ${isFlipTimerActive ? 'scale-100 opacity-100' : 'scale-95 opacity-20 grayscale'}`}
              >
                <Timer
                  key={timerKey}
                  duration={settings.flipTimer}
                  onTimeUp={handleTurnTimeout}
                  isActive={isFlipTimerActive}
                  color="bg-blue-600"
                  variant="clock"
                />
              </div>
            </aside>
          ) : null}
          {isFlipTimerActive && !isDesktop ? (
            <div className="fixed right-2 top-1/2 z-40 flex h-16 w-16 -translate-y-1/2 items-center justify-center rounded-full border-4 border-blue-100 bg-white/90 shadow-xl backdrop-blur lg:hidden">
              <div className="h-full w-full p-1">
                <Timer
                  key={`mobile-${timerKey}`}
                  duration={settings.flipTimer}
                  onTimeUp={handleTurnTimeout}
                  isActive={isFlipTimerActive}
                  color="bg-blue-600"
                  variant="clock"
                />
              </div>
            </div>
          ) : null}
          <AnimatePresence>
            {showTurnTransition ? (
              <TurnTransition
                teamName={settings.teamNames[currentTeamIndex]}
                visible={showTurnTransition}
                label={t.turnTransition}
              />
            ) : null}
          </AnimatePresence>
          <AnimatePresence>
            {isPaused ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-slate-900/40 text-white backdrop-blur-md"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="mb-8 text-9xl"
                >
                  ⏸
                </motion.div>
                <h2 className="mb-4 text-6xl font-black uppercase italic tracking-tighter">{t.pause}</h2>
                <button
                  type="button"
                  onClick={togglePause}
                  className="rounded-3xl bg-emerald-500 px-12 py-5 text-2xl font-black uppercase tracking-widest text-white shadow-2xl transition-all hover:bg-emerald-600 active:scale-95"
                >
                  {t.resume}
                </button>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
        <footer className="shrink-0 border-t border-slate-200 bg-white/80 p-2 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 lg:p-4">
          {matchedCount}/{totalCards}
        </footer>
        <LevelSelectModal />
        <QuestionModal />
      </div>
    );
  }

  return (
    <GameShell
      manifest={ALPHABET_MANIFEST}
      phase={phase}
      onRestart={resetGame}
      rules={rulesContent}
      onRulesOpenChange={handleRulesOpenChange}
      pausedOverlay={false}
    >
      {mainContent}
      {isGameOver ? <VictoryScreen /> : null}
    </GameShell>
  );
}
