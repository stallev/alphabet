import type { GamePhase } from '@/shared/game-kit/types';

export interface GamePhaseState {
  isLoading: boolean;
  isSettingsStage: boolean;
  isGameOver: boolean;
  isPaused: boolean;
  showEditor: boolean;
  showPrompt: boolean;
  showAIGenerator: boolean;
  showLibrary: boolean;
  showGuide: boolean;
}

export function getGamePhase(state: GamePhaseState): GamePhase {
  const inLobbySubpage =
    state.showEditor ||
    state.showPrompt ||
    state.showAIGenerator ||
    state.showLibrary ||
    state.showGuide;

  if (state.isLoading || state.isSettingsStage || inLobbySubpage) {
    return 'lobby';
  }
  if (state.isGameOver) {
    return 'finished';
  }
  if (state.isPaused) {
    return 'paused';
  }
  return 'playing';
}
