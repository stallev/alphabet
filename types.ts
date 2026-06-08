
export enum ComplexityLevel {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard'
}

export type Locale = 'ru' | 'en' | 'uk' | 'de' | 'ro';

export interface Question {
  id: number;
  questionContent: string;
  complexityLevel: ComplexityLevel;
  answersList: { id: number; value: string; }[] | null;
  answerType: 'ID' | 'String';
  rightAnswerId?: number;
  rightAnswerString?: string;
}

export interface QuestionsSuite {
  title: string;
  questionsList: Question[];
  language?: string;
  isSystem?: boolean;
}

export interface LibrarySuite extends QuestionsSuite {
  id: string;
  createdAt: number;
  expiresAt: number;
}

export interface CardData {
  id: number;
  letter: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export enum GameMode {
  WITH_QUESTIONS = 'withQuestions',
  WITHOUT_QUESTIONS = 'withoutQuestions'
}

export interface GameSettings {
  teamsCount: number;
  teamNames: string[];
  gameMode: GameMode;
  questionsTopic: string;
  levelSelectTimer: number;
  answerTimer: number;
  flipTimer: number;
}

export interface GameState {
  isLoading: boolean;
  locale: Locale;
  settings: GameSettings;
  cards: CardData[];
  currentTeamIndex: number;
  turnIdentifier: number;
  teamScores: number[];
  isGameActive: boolean;
  isPaused: boolean;
  isMuted: boolean; // New sound setting
  isSettingsStage: boolean;
  isGameOver: boolean;
  showEditor: boolean;
  showPrompt: boolean;
  showAIGenerator: boolean;
  showLibrary: boolean;
  showGuide: boolean;
  library: LibrarySuite[];
  systemSuites: QuestionsSuite[];
  questions: {
    currentSuite: QuestionsSuite | null;
    answeredQuestionIds: number[];
  };
  temp: {
    firstSelectedCardId: number | null;
    secondSelectedCardId: number | null;
    currentQuestion: Question | null;
    isProcessing: boolean;
    showLevelSelect: boolean;
    showQuestionModal: boolean;
  };
}
