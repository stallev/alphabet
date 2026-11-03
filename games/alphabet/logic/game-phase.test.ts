import { describe, expect, it } from 'vitest';

import { getGamePhase } from './game-phase';

const base = {
  isLoading: false,
  isSettingsStage: false,
  isGameOver: false,
  isPaused: false,
  showEditor: false,
  showPrompt: false,
  showAIGenerator: false,
  showLibrary: false,
  showGuide: false,
};

describe('getGamePhase', () => {
  it('maps loading and settings to lobby', () => {
    expect(getGamePhase({ ...base, isLoading: true })).toBe('lobby');
    expect(getGamePhase({ ...base, isSettingsStage: true })).toBe('lobby');
  });

  it('maps editor subpages to lobby', () => {
    expect(getGamePhase({ ...base, showEditor: true })).toBe('lobby');
    expect(getGamePhase({ ...base, showLibrary: true })).toBe('lobby');
  });

  it('maps game over to finished', () => {
    expect(getGamePhase({ ...base, isGameOver: true })).toBe('finished');
  });

  it('maps pause to paused', () => {
    expect(getGamePhase({ ...base, isPaused: true })).toBe('paused');
  });

  it('maps active play to playing', () => {
    expect(getGamePhase(base)).toBe('playing');
  });
});
