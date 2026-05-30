'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from './store';
import { GameSettings } from './components/GameSettings';
import { ScoreBoard } from './components/ScoreBoard';
import { Card } from './components/Card';
import { LevelSelectModal } from './components/LevelSelectModal';
import { QuestionModal } from './components/QuestionModal';
import { RulesPage } from './components/RulesPage';
import { QuestionEditor } from './components/QuestionEditor';
import { VictoryScreen } from './components/VictoryScreen';
import { PromptPage } from './components/PromptPage';
import { AIGenerator } from './components/AIGenerator';
import { QuestionLibraryPage } from './components/QuestionLibraryPage';
import { OperatorGuide } from './components/OperatorGuide';
import { AdminSettings } from './components/AdminSettings';
import { Timer } from './components/Timer';
import { TRANSLATIONS } from './constants';

const HOME_CONFIRM: Record<import('./types').Locale, string> = {
  ru: "Вернуться на главную страницу? Текущий прогресс игры будет сброшен.",
  en: "Return to home? Current game progress will be lost.",
  uk: "Повернутись на головну сторінку? Поточний прогрес гри буде скинуто.",
  de: "Zur Startseite zurückkehren? Der aktuelle Spielfortschritt geht verloren.",
  ro: "Reveniți la pagina principală? Progresul curent al jocului va fi resetat.",
};

const HomeButton: React.FC<{ visible: boolean }> = ({ visible }) => {
  const { resetGame, locale } = useGameStore();
  if (!visible) return null;

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => {
        if (window.confirm(HOME_CONFIRM[locale])) {
          resetGame();
          window.location.hash = '';
        }
      }}
      className="fixed bottom-8 right-8 z-[200] bg-white text-blue-600 w-14 h-14 rounded-2xl shadow-2xl flex items-center justify-center border-2 border-blue-100 hover:border-blue-600 transition-colors group"
      title="Home"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    </motion.button>
  );
};

const TurnTransition: React.FC<{ teamName: string; visible: boolean; label: string }> = ({ teamName, visible, label }) => {
  if (!visible) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none bg-black/40 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.5, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 2, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="bg-white/90 border-4 border-blue-500 px-6 py-4 rounded-3xl shadow-[0_0_60px_rgba(37,99,235,0.6)] text-center transform"
      >
        <div className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2">{label}</div>
        <div className="text-2xl md:text-3xl font-black text-blue-900 uppercase italic tracking-tighter whitespace-nowrap">
          {teamName}
        </div>
      </motion.div>
    </motion.div>
  );
};

interface AppProps {
  initialSuites?: import('./types').QuestionsSuite[];
}

const App: React.FC<AppProps> = ({ initialSuites }) => {
  const { 
    isLoading, loadSystemSuites, setSystemSuites, isSettingsStage, cards, flipCard, temp, 
    isGameActive, showEditor, showPrompt, showAIGenerator, showLibrary, 
    showGuide, showAdmin, isGameOver, isPaused, togglePause, settings, 
    currentTeamIndex, handleTurnTimeout, locale, turnIdentifier 
  } = useGameStore();

  const t = TRANSLATIONS[locale];
  const [showRules, setShowRules] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const [showTurnTransition, setShowTurnTransition] = useState(false);

  // Track turn changes to show transition animation
  useEffect(() => {
    if (isGameActive && !isSettingsStage && !isGameOver) {
      setShowTurnTransition(true);
      const timer = setTimeout(() => setShowTurnTransition(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [currentTeamIndex, isGameActive, isSettingsStage, isGameOver]);

  useEffect(() => {
    if (initialSuites) {
      setSystemSuites(initialSuites);
    } else {
      loadSystemSuites();
    }

    const handleHash = () => setShowRules(window.location.hash === '#rules');
    window.addEventListener('hashchange', handleHash);
    handleHash();

    // Check for desktop size to conditionally render only ONE timer
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);

    return () => {
      window.removeEventListener('hashchange', handleHash);
      window.removeEventListener('resize', checkDesktop);
    };
  }, [initialSuites, loadSystemSuites, setSystemSuites]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mb-6"
        />
        <h2 className="text-2xl font-black uppercase italic tracking-tighter animate-pulse">
          {locale === 'ru' ? 'Загрузка данных...' : 'Loading Data...'}
        </h2>
      </div>
    );
  }

  const isAnyModalOpen = showRules || showAdmin || showPrompt || showEditor || showAIGenerator || showLibrary || showGuide;
  const showGlobalHome = (!isSettingsStage || isAnyModalOpen) && !isGameOver;

  let mainContent;
  if (showRules) mainContent = <RulesPage />;
  else if (showAdmin) mainContent = <AdminSettings />;
  else if (showPrompt) mainContent = <PromptPage />;
  else if (showEditor) mainContent = <QuestionEditor />;
  else if (showAIGenerator) mainContent = <AIGenerator />;
  else if (showLibrary) mainContent = <QuestionLibraryPage />;
  else if (showGuide) mainContent = <OperatorGuide />;
  else if (isSettingsStage) mainContent = <GameSettings />;
  else {
    const isFlipTimerActive = !isGameOver && !temp.showLevelSelect && !temp.showQuestionModal && !temp.isProcessing && !isPaused;
    const matchedCount = cards.filter(c => c.isMatched).length;
    const totalCards = cards.length;
    const progressPercent = totalCards > 0 ? Math.round((matchedCount / totalCards) * 100) : 0;

    const isRussian = cards.length === 66;
    const gridClass = isRussian
      ? 'grid-cols-6 sm:grid-cols-8 lg:grid-cols-11'  // 11 cols = 6 rows
      : 'grid-cols-4 sm:grid-cols-7 lg:grid-cols-13'; // 13 cols = 4 rows
    
    const timerKey = `${currentTeamIndex}-${turnIdentifier}`;

    mainContent = (
      <div className="min-h-screen max-h-screen bg-slate-100 flex flex-col relative overflow-hidden">
        <ScoreBoard />
        
        {/* Progress Bar */}
        <div className="w-full bg-slate-200 h-2 sticky top-0 z-20 shadow-inner overflow-hidden shrink-0">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ type: 'spring', stiffness: 40, damping: 15 }}
            className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.7)] relative"
          >
             <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
          </motion.div>
        </div>
        
        {/* Main Game Area */}
        <div className="flex-1 flex relative w-full h-full overflow-hidden">
          
          <main className={`flex-1 flex flex-col items-center justify-center p-2 lg:pl-[50px] lg:pr-4 transition-all duration-500 ${isPaused ? 'blur-xl scale-95 grayscale' : ''}`}>
            <div 
              className={`grid gap-1.5 w-full h-full ${gridClass}`}
              style={{
                height: isDesktop ? 'calc(100vh - 160px)' : 'auto', 
                alignContent: 'stretch',
                justifyContent: 'center'
              }}
            >
              {cards.map(card => (
                <Card 
                  key={card.id} 
                  data={card} 
                  onClick={flipCard} 
                  disabled={temp.isProcessing || !isGameActive || isGameOver || isPaused || showTurnTransition} 
                />
              ))}
            </div>
          </main>

          {/* Desktop Timer Sidebar */}
          {isDesktop && (
            <aside className="w-32 shrink-0 h-full flex flex-col items-center justify-center relative z-30 pointer-events-none">
               <div className={`pointer-events-auto bg-white/90 backdrop-blur-md border border-slate-200 shadow-2xl rounded-3xl p-4 flex justify-center transition-all duration-500 ${isFlipTimerActive ? 'opacity-100 scale-100' : 'opacity-20 grayscale scale-95'}`}>
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
          )}

          {/* Mobile Floating Timer */}
          {isFlipTimerActive && !isDesktop && (
             <div className="lg:hidden fixed top-1/2 -translate-y-1/2 right-2 z-40 w-16 h-16 bg-white/90 backdrop-blur rounded-full shadow-xl flex items-center justify-center border-4 border-blue-100">
               <div className="w-full h-full p-1">
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
          )}

          <AnimatePresence>
            {showTurnTransition && (
              <TurnTransition 
                teamName={settings.teamNames[currentTeamIndex]} 
                visible={showTurnTransition}
                label={t.turnTransition}
              />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isPaused && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-40 bg-slate-900/40 backdrop-blur-md flex flex-col items-center justify-center text-white"
              >
                <motion.div 
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="text-9xl mb-8"
                >
                  ⏸
                </motion.div>
                <h2 className="text-6xl font-black uppercase italic tracking-tighter mb-4">{t.pause}</h2>
                <button 
                  onClick={togglePause}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-12 py-5 rounded-3xl text-2xl font-black shadow-2xl transition-all active:scale-95 uppercase tracking-widest"
                >
                  {t.resume}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <footer className="p-2 lg:p-4 bg-white/80 border-t border-slate-200 text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest shrink-0">
          EdenGames Alphabet • {locale.toUpperCase()} Edition • {matchedCount}/{totalCards} Pairs Found
        </footer>

        <LevelSelectModal />
        <QuestionModal />
      </div>
    );
  }

  return (
    <>
      {mainContent}
      {isGameOver && <VictoryScreen />}
      <HomeButton visible={showGlobalHome} />
    </>
  );
};

export default App;
