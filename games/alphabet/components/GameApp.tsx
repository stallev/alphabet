'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Pause } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { ALPHABET_MANIFEST } from '@/games/alphabet/manifest-data';
import { useGameStore } from '@/games/alphabet/store';
import type { Locale } from '@/shared/domain/locale';
import { useGameT } from '@/games/alphabet/i18n/use-game-t';
import { getGamePhase } from '@/games/alphabet/logic/game-phase';
import { mapAlphabetRulesContent } from '@/games/alphabet/logic/map-rules-content';
import { GameShell, Timer } from '@/shared/game-kit';
import { useLocale } from '@/shared/i18n/I18nProvider';
import { Button } from '@/shared/ui/Button';

import { Card } from './Card';
import { LevelSelectContainer } from './LevelSelectContainer';
import { QuestionModalContainer } from './QuestionModalContainer';
import { ScoreBoardContainer } from './ScoreBoardContainer';
import { SettingsContainer } from './SettingsContainer';
import { TurnTransition } from './TurnTransition';
import { VictoryScreenContainer } from './VictoryScreenContainer';
import { AIGenerator } from './AIGenerator';
import { OperatorGuide } from './OperatorGuide';
import { PromptPage } from './PromptPage';
import { QuestionEditor } from './QuestionEditor';
import { QuestionLibraryPage } from './QuestionLibraryPage';
import { RulesPage } from './RulesPage';
import type { QuestionsSuite } from '@/games/alphabet/types';

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
      const timer = window.setTimeout(() => setShowTurnTransition(false), 1500);
      return () => window.clearTimeout(timer);
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
  else if (isSettingsStage) mainContent = <SettingsContainer />;
  else {
    const isFlipTimerActive =
      !isGameOver &&
      !temp.showLevelSelect &&
      !temp.showQuestionModal &&
      !temp.isProcessing &&
      !isPaused;
    const matchedCount = cards.filter((card) => card.isMatched).length;
    const totalCards = cards.length;
    const progressPercent = totalCards > 0 ? Math.round((matchedCount / totalCards) * 100) : 0;
    const isRussian = cards.length === 66;
    const gridClass = isRussian
      ? 'grid-cols-6 sm:grid-cols-8 lg:grid-cols-11'
      : 'grid-cols-4 sm:grid-cols-7 lg:grid-cols-13';
    const timerKey = `${currentTeamIndex}-${turnIdentifier}`;

    mainContent = (
      <div className="relative flex max-h-screen min-h-0 flex-col overflow-hidden bg-bg">
        {suiteFallbackMessage ? (
          <p className="bg-accent/15 px-4 py-2 text-center text-sm font-semibold text-fg">
            {suiteFallbackMessage}
          </p>
        ) : null}
        <ScoreBoardContainer />
        <div className="sticky top-0 z-20 h-2 w-full shrink-0 overflow-hidden bg-surface-muted">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ type: 'spring', stiffness: 40, damping: 15 }}
            className="relative h-full bg-success"
          />
        </div>
        <div className="relative flex h-full w-full flex-1 overflow-hidden">
          <div
            className={`flex flex-1 flex-col items-center justify-center p-2 transition-all duration-500 lg:pl-[50px] lg:pr-4 ${isPaused ? 'scale-95 opacity-60' : ''}`}
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
                className={`pointer-events-auto flex justify-center rounded-card border border-border bg-surface p-4 shadow-card transition-all ${isFlipTimerActive ? 'opacity-100' : 'opacity-40'}`}
              >
                <Timer
                  key={timerKey}
                  seconds={settings.flipTimer}
                  running={isFlipTimerActive}
                  onElapsed={handleTurnTimeout}
                  variant="ring"
                  tone="primary"
                  label={t.flipTimer}
                />
              </div>
            </aside>
          ) : null}
          {isFlipTimerActive && !isDesktop ? (
            <div className="fixed right-2 top-1/2 z-40 flex h-16 w-16 -translate-y-1/2 items-center justify-center rounded-full border-2 border-border bg-surface shadow-card lg:hidden">
              <Timer
                key={`mobile-${timerKey}`}
                seconds={settings.flipTimer}
                running={isFlipTimerActive}
                onElapsed={handleTurnTimeout}
                variant="ring"
                tone="primary"
                label={t.flipTimer}
              />
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
                className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-fg/50 text-surface"
              >
                <Pause className="mb-6 size-16" aria-hidden />
                <h2 className="mb-4 text-4xl font-extrabold">{t.pause}</h2>
                <Button size="lg" onClick={togglePause}>
                  {t.resume}
                </Button>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
        <footer className="shrink-0 border-t border-border bg-surface p-2 text-center text-xs font-semibold text-fg-muted lg:p-4">
          {matchedCount}/{totalCards}
        </footer>
        <LevelSelectContainer />
        <QuestionModalContainer />
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
      {isGameOver ? <VictoryScreenContainer /> : null}
    </GameShell>
  );
}
