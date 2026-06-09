
import { create } from 'zustand';
import { 
  GameState, 
  ComplexityLevel, 
  GameMode, 
  CardData, 
  Question,
  QuestionsSuite,
  LibrarySuite,
  AIConfig,
  Locale
} from './types';
import { 
  ALPHABET_BY_LOCALE,
  DEFAULT_SETTINGS, 
  SCORE_MATCH, 
  SCORE_EASY, 
  SCORE_MEDIUM, 
  SCORE_HARD 
} from './constants';
import { playSound } from './utils/audio';

const TTL_MS = 3 * 24 * 60 * 60 * 1000;
const LOCALE_STORAGE_KEY = 'alphabet_locale';
// Temporarily active locales — only languages with question suites in the DB.
// Extend this list when uk/de/ro suites are added.
const VALID_LOCALES: Locale[] = ['ru', 'en'];

const getInitialLocale = (): Locale => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale | null;
    if (saved && VALID_LOCALES.includes(saved)) return saved;
  }
  if (typeof navigator === 'undefined') return 'en';
  const lang = (navigator.language || (navigator as any).userLanguage || '').toLowerCase();
  if (lang.startsWith('ru')) return 'ru';
  return 'en';
};

const INITIAL_DATA = {
  isLoading: true,
  locale: getInitialLocale(),
  settings: { ...DEFAULT_SETTINGS },
  aiConfig: {
    provider: 'openrouter' as const,
    model: 'qwen/qwen-2.5-72b-instruct:free'
  },
  cards: [] as CardData[],
  currentTeamIndex: 0,
  turnIdentifier: 0,
  teamScores: [] as number[],
  isGameActive: false,
  isPaused: false,
  isMuted: false,
  isSettingsStage: true,
  isGameOver: false,
  showEditor: false,
  showPrompt: false,
  showAIGenerator: false,
  showLibrary: false,
  showGuide: false,
  showAdmin: false,
  library: [] as LibrarySuite[],
  systemSuites: [] as QuestionsSuite[],
  questions: {
    currentSuite: null as QuestionsSuite | null,
    answeredQuestionIds: [] as number[],
  },
  temp: {
    firstSelectedCardId: null as number | null,
    secondSelectedCardId: null as number | null,
    currentQuestion: null as Question | null,
    isProcessing: false,
    showLevelSelect: false,
    showQuestionModal: false,
  },
};

interface GameActions {
  setLocale: (locale: Locale) => void;
  setSystemSuites: (suites: QuestionsSuite[]) => void;
  loadSystemSuites: () => Promise<void>;
  initializeGame: (settings: GameState['settings']) => void;
  resetGame: () => void;
  finishGame: () => void;
  togglePause: () => void;
  toggleMute: () => void;
  flipCard: (cardId: number) => void;
  nextTurn: () => void;
  handleTurnTimeout: () => void;
  selectComplexity: (level: ComplexityLevel) => void;
  answerQuestion: (isCorrect: boolean, complexity: ComplexityLevel) => void;
  closeLevelSelect: () => void;
  closeQuestionModal: () => void;
  setEditorOpen: (isOpen: boolean) => void;
  setShowPrompt: (isOpen: boolean) => void;
  setAIGeneratorOpen: (isOpen: boolean) => void;
  setLibraryOpen: (isOpen: boolean) => void;
  setGuideOpen: (isOpen: boolean) => void;
  setAdminOpen: (isOpen: boolean) => void;
  closeAllModals: () => void;
  updateAIConfig: (config: Partial<AIConfig>) => void;
  loadCustomQuestions: (suite: QuestionsSuite) => void;
  updateCurrentSuiteTitle: (title: string) => void;
  addQuestion: (q: Question) => void;
  updateQuestion: (id: number, q: Question) => void;
  deleteQuestion: (id: number) => void;
  saveToLibrary: (suite: QuestionsSuite) => boolean;
  updateLibrarySuite: (id: string, suite: Partial<LibrarySuite>) => void;
  deleteFromLibrary: (id: string) => void;
  cleanupLibrary: () => void;
}

const shuffle = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const createInitialCards = (locale: Locale): CardData[] => {
  const alphabet = ALPHABET_BY_LOCALE[locale] ?? ALPHABET_BY_LOCALE.en;
  const letters = [...alphabet, ...alphabet];
  const shuffledLetters = shuffle(letters);
  return shuffledLetters.map((letter, index) => ({
    id: index + 1,
    letter,
    isFlipped: false,
    isMatched: false,
  }));
};

export const useGameStore = create<GameState & GameActions>()((set, get) => ({
  ...INITIAL_DATA,

  setLocale: (locale) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    }
    const { systemSuites, questions } = get();
    const matchingSuite = systemSuites.find((s) => s.language === locale);
    set({
      locale,
      questions: {
        ...questions,
        currentSuite: matchingSuite ?? questions.currentSuite,
      },
    });
  },

  setSystemSuites: (suites) => {
    const currentLocale = get().locale;
    const validSuites = suites.filter((s) => Array.isArray(s.questionsList));
    const initialSuite = validSuites.length > 0
      ? (validSuites.find((s) => s.language === currentLocale) ?? validSuites[0])
      : null;

    set({
      systemSuites: validSuites,
      isLoading: false,
      questions: {
        ...get().questions,
        currentSuite: initialSuite,
      },
    });
  },

  loadSystemSuites: async () => {
    try {
      // Load from DB via API (replaces static JSON files)
      const res = await fetch('/api/suites');
      if (!res.ok) throw new Error(`API error: ${res.status}`);

      const data: QuestionsSuite[] = await res.json();
      const validResults = data.filter((r): r is QuestionsSuite => r !== null && Array.isArray(r.questionsList));

      const currentLocale = get().locale;
      const initialSuite = validResults.length > 0
        ? (validResults.find(s => s.language === currentLocale) || validResults[0])
        : null;

      set({
        systemSuites: validResults,
        isLoading: false,
        questions: {
          ...get().questions,
          currentSuite: initialSuite
        }
      });
    } catch (error) {
      console.error('Failed to load suites from API:', error);
      set({ isLoading: false });
    }
  },

  initializeGame: (settings) => {
    const cards = createInitialCards(get().locale);
    playSound('click', get().isMuted);
    set((state) => ({
      ...state,
      settings,
      cards,
      teamScores: Array(settings.teamsCount).fill(0),
      isGameActive: true,
      isPaused: false,
      isSettingsStage: false,
      isGameOver: false,
      currentTeamIndex: 0,
      turnIdentifier: 0,
      questions: {
        ...state.questions,
        answeredQuestionIds: [],
      },
      temp: {
        ...INITIAL_DATA.temp
      }
    }));
  },

  resetGame: () => {
    playSound('click', get().isMuted);
    set((state) => ({
      ...INITIAL_DATA,
      locale: state.locale,
      isLoading: false,
      isMuted: state.isMuted,
      library: state.library,
      systemSuites: state.systemSuites,
      aiConfig: state.aiConfig,
      questions: {
        currentSuite: state.questions.currentSuite,
        answeredQuestionIds: [],
      }
    }));
  },

  togglePause: () => {
    playSound('click', get().isMuted);
    set(state => ({ isPaused: !state.isPaused }));
  },

  toggleMute: () => set(state => ({ isMuted: !state.isMuted })),

  finishGame: () => {
    playSound('win', get().isMuted);
    set((state) => ({ 
      ...state,
      isGameOver: true, 
      isGameActive: false,
      isPaused: false,
      isSettingsStage: false,
      showEditor: false,
      showPrompt: false,
      showAIGenerator: false,
      showLibrary: false, 
      showGuide: false, 
      showAdmin: false,
      temp: { 
        ...state.temp, 
        isProcessing: false,
        showLevelSelect: false,
        showQuestionModal: false,
        currentQuestion: null
      }
    }));
  },

  flipCard: (cardId) => {
    const { cards, temp, currentTeamIndex, teamScores, settings, isGameOver, isPaused, isMuted } = get();
    if (temp.isProcessing || isGameOver || isPaused) return;
    const selectedCard = cards.find(c => c.id === cardId);
    if (!selectedCard || selectedCard.isFlipped || selectedCard.isMatched) return;

    // playSound('flip', isMuted); Removed per request
    const updatedCards = cards.map(c => c.id === cardId ? { ...c, isFlipped: true } : c);

    if (temp.firstSelectedCardId === null) {
      set({ cards: updatedCards, temp: { ...temp, firstSelectedCardId: cardId } });
    } else {
      set({ cards: updatedCards, temp: { ...temp, secondSelectedCardId: cardId, isProcessing: true } });
      const firstCard = cards.find(c => c.id === temp.firstSelectedCardId);
      
      // Логика совпадения
      if (firstCard?.letter === selectedCard.letter) {
        playSound('match', isMuted);
        const matchedCards = updatedCards.map(c => 
          c.id === firstCard.id || c.id === selectedCard.id ? { ...c, isMatched: true } : c
        );
        const newScores = [...teamScores];
        newScores[currentTeamIndex] += SCORE_MATCH;
        
        const allMatched = matchedCards.every(c => c.isMatched);
        const showQuestions = !allMatched && settings.gameMode === GameMode.WITH_QUESTIONS;

        if (allMatched) playSound('win', isMuted);

        set((state) => ({
          cards: matchedCards,
          teamScores: newScores,
          isGameOver: allMatched,
          turnIdentifier: !showQuestions ? state.turnIdentifier + 1 : state.turnIdentifier,
          temp: { 
            ...temp, 
            firstSelectedCardId: null, 
            secondSelectedCardId: null, 
            isProcessing: false, 
            showLevelSelect: showQuestions 
          }
        }));
      } else {
        playSound('error', isMuted);
        // Логика несовпадения - переход хода через 1 сек
        setTimeout(() => {
          const { cards: currentCards, temp: currentTemp, currentTeamIndex: idx, settings: currentSettings, turnIdentifier: turnId } = get();
          const resetCards = currentCards.map(c => (c.id === currentTemp.firstSelectedCardId || c.id === cardId) && !c.isMatched ? { ...c, isFlipped: false } : c);
          
          const nextIdx = (idx + 1) % currentSettings.teamsCount;
          
          set({
            cards: resetCards,
            currentTeamIndex: nextIdx,
            turnIdentifier: turnId + 1,
            temp: { ...currentTemp, firstSelectedCardId: null, secondSelectedCardId: null, isProcessing: false }
          });
        }, 1000);
      }
    }
  },

  handleTurnTimeout: () => {
    const { temp, currentTeamIndex, settings, cards, isGameOver, isPaused, turnIdentifier, isMuted } = get();
    if (temp.showLevelSelect || temp.showQuestionModal || isGameOver || isPaused || temp.isProcessing) return;
    
    // Removed error sound on timeout as requested
    set({ temp: { ...temp, isProcessing: true } });
    
    const resetCards = cards.map(c => {
      if ((c.id === temp.firstSelectedCardId || c.id === temp.secondSelectedCardId) && !c.isMatched) {
        return { ...c, isFlipped: false };
      }
      return c;
    });
    
    const nextIdx = (currentTeamIndex + 1) % settings.teamsCount;
    
    set({
      cards: resetCards,
      currentTeamIndex: nextIdx,
      turnIdentifier: turnIdentifier + 1,
      temp: { 
        ...temp, 
        firstSelectedCardId: null, 
        secondSelectedCardId: null, 
        isProcessing: false,
        showLevelSelect: false, 
        showQuestionModal: false 
      }
    });
  },

  selectComplexity: (level) => {
    const { questions, temp, isMuted } = get();
    if (!questions.currentSuite) return;
    
    playSound('click', isMuted);
    
    // Filter out answered questions
    const available = questions.currentSuite.questionsList.filter(q => 
      q.complexityLevel === level && !questions.answeredQuestionIds.includes(q.id)
    );
    
    const fallback = questions.currentSuite.questionsList.filter(x => !questions.answeredQuestionIds.includes(x.id));
    const q = available.length > 0 ? available[Math.floor(Math.random() * available.length)] : (fallback.length > 0 ? fallback[0] : null);
    
    if (q) {
      const newAnsweredIds = [...questions.answeredQuestionIds, q.id];
      set({ 
        questions: { ...questions, answeredQuestionIds: newAnsweredIds },
        temp: { 
          ...temp, 
          showLevelSelect: false, 
          showQuestionModal: true, 
          currentQuestion: q 
        } 
      });
    } else {
      set((state) => ({ 
        temp: { ...temp, showLevelSelect: false },
        turnIdentifier: state.turnIdentifier + 1 
      }));
    }
  },

  answerQuestion: (isCorrect, complexity) => {
    const { teamScores, currentTeamIndex, temp, settings, turnIdentifier, isMuted } = get();
    
    if (isCorrect) playSound('correct', isMuted);
    else playSound('error', isMuted);

    let bonus = 0;
    if (isCorrect) {
      bonus = complexity === ComplexityLevel.EASY ? SCORE_EASY : complexity === ComplexityLevel.MEDIUM ? SCORE_MEDIUM : SCORE_HARD;
    }
    
    const newScores = [...teamScores];
    newScores[currentTeamIndex] += bonus;

    let nextTeamIdx = currentTeamIndex;
    if (!isCorrect) {
      nextTeamIdx = (currentTeamIndex + 1) % settings.teamsCount;
    }

    set({ 
      teamScores: newScores, 
      currentTeamIndex: nextTeamIdx,
      turnIdentifier: turnIdentifier + 1,
      temp: { ...temp, showQuestionModal: false, currentQuestion: null } 
    });
  },

  nextTurn: () => set((state) => ({ 
    currentTeamIndex: (state.currentTeamIndex + 1) % state.settings.teamsCount,
    turnIdentifier: state.turnIdentifier + 1
  })),
  
  closeLevelSelect: () => set({ temp: { ...get().temp, showLevelSelect: false } }),
  closeQuestionModal: () => set({ temp: { ...get().temp, showQuestionModal: false, currentQuestion: null } }),

  setEditorOpen: (isOpen) => set({ 
    showEditor: isOpen, 
    showPrompt: false, 
    showAIGenerator: false, 
    showLibrary: false, 
    showGuide: false, 
    showAdmin: false 
  }),
  setShowPrompt: (isOpen) => set({ showPrompt: isOpen, showEditor: false, showAIGenerator: false, showLibrary: false, showGuide: false, showAdmin: false }),
  setAIGeneratorOpen: (isOpen) => set({ showAIGenerator: isOpen, showEditor: false, showPrompt: false, showLibrary: false, showGuide: false, showAdmin: false }),
  setLibraryOpen: (isOpen) => set({ showLibrary: isOpen, showEditor: false, showPrompt: false, showAIGenerator: false, showGuide: false, showAdmin: false }),
  setGuideOpen: (isOpen) => set({ showGuide: isOpen, showEditor: false, showPrompt: false, showAIGenerator: false, showLibrary: false, showAdmin: false }),
  setAdminOpen: (isOpen) => set({ showAdmin: isOpen, showEditor: false, showPrompt: false, showAIGenerator: false, showLibrary: false, showGuide: false }),
  closeAllModals: () => set({ 
    showEditor: false, 
    showPrompt: false, 
    showAIGenerator: false, 
    showLibrary: false, 
    showGuide: false, 
    showAdmin: false 
  }),
  
  updateAIConfig: (config) => set({ aiConfig: { ...get().aiConfig, ...config } }),

  loadCustomQuestions: (suite) => set({ 
    questions: { currentSuite: JSON.parse(JSON.stringify(suite)), answeredQuestionIds: [] }, 
    settings: { ...get().settings, questionsTopic: suite.title || get().settings.questionsTopic } 
  }),
  
  updateCurrentSuiteTitle: (title) => {
    const suite = get().questions.currentSuite;
    if (suite) set({ questions: { ...get().questions, currentSuite: { ...suite, title } } });
  },

  addQuestion: (q) => {
    const suite = get().questions.currentSuite;
    if (suite) set({ questions: { ...get().questions, currentSuite: { ...suite, questionsList: [...suite.questionsList, q] } } });
  },
  updateQuestion: (id, q) => {
    const suite = get().questions.currentSuite;
    if (suite) set({ questions: { ...get().questions, currentSuite: { ...suite, questionsList: suite.questionsList.map(i => i.id === id ? q : i) } } });
  },
  deleteQuestion: (id) => {
    const suite = get().questions.currentSuite;
    if (suite) set({ questions: { ...get().questions, currentSuite: { ...suite, questionsList: suite.questionsList.filter(i => i.id !== id) } } });
  },
  saveToLibrary: (suite) => {
    const exists = get().library.some(s => s.title === suite.title);
    if (exists) return false;
    
    const entry = { ...suite, id: `suite-${Date.now()}`, createdAt: Date.now(), expiresAt: Date.now() + TTL_MS, isSystem: false };
    set({ library: [entry, ...get().library] });
    return true;
  },
  updateLibrarySuite: (id, updatedSuite) => {
    set({ library: get().library.map(s => s.id === id ? { ...s, ...updatedSuite } : s) });
  },
  deleteFromLibrary: (id) => {
    set({ library: get().library.filter(i => i.id !== id) });
  },
  cleanupLibrary: () => {
    const now = Date.now();
    set({ library: get().library.filter(i => i.expiresAt > now) });
  }
}));
