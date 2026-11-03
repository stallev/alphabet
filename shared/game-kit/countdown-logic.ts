export function getSecondsAfterTick(current: number): number {
  return Math.max(0, current - 1);
}

export function shouldFireElapsed(
  secondsLeft: number,
  running: boolean,
  elapsedFired: boolean,
): boolean {
  return running && secondsLeft <= 0 && !elapsedFired;
}

export function resetCountdownState(seconds: number): {
  secondsLeft: number;
  elapsedFired: boolean;
} {
  return { secondsLeft: seconds, elapsedFired: false };
}
