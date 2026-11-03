import { describe, expect, it } from 'vitest';

import {
  getSecondsAfterTick,
  resetCountdownState,
  shouldFireElapsed,
} from './countdown-logic';

describe('countdown logic', () => {
  it('ticks down each second', () => {
    expect(getSecondsAfterTick(3)).toBe(2);
    expect(getSecondsAfterTick(1)).toBe(0);
  });

  it('does not fire elapsed while paused at zero check', () => {
    expect(shouldFireElapsed(3, false, false)).toBe(false);
  });

  it('resumes countdown sequence', () => {
    let secondsLeft = 3;
    secondsLeft = getSecondsAfterTick(secondsLeft);
    expect(secondsLeft).toBe(2);
    secondsLeft = getSecondsAfterTick(secondsLeft);
    secondsLeft = getSecondsAfterTick(secondsLeft);
    expect(secondsLeft).toBe(0);
    expect(shouldFireElapsed(secondsLeft, true, false)).toBe(true);
    expect(shouldFireElapsed(secondsLeft, true, true)).toBe(false);
  });

  it('fires onElapsed exactly once at zero', () => {
    let elapsedFired = false;
    let elapsedCount = 0;
    const fire = () => {
      if (shouldFireElapsed(0, true, elapsedFired)) {
        elapsedFired = true;
        elapsedCount += 1;
      }
    };
    fire();
    fire();
    expect(elapsedCount).toBe(1);
  });

  it('resets when seconds change', () => {
    const first = resetCountdownState(5);
    const second = resetCountdownState(2);
    expect(first.secondsLeft).toBe(5);
    expect(second.secondsLeft).toBe(2);
    expect(second.elapsedFired).toBe(false);
  });
});
