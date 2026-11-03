'use client';

import { useEffect, useRef, useState } from 'react';

import {
  getSecondsAfterTick,
  resetCountdownState,
  shouldFireElapsed,
} from './countdown-logic';

export interface UseCountdownOptions {
  seconds: number;
  running: boolean;
  onElapsed: () => void;
}

export function useCountdown({
  seconds,
  running,
  onElapsed,
}: UseCountdownOptions): number {
  const [secondsLeft, setSecondsLeft] = useState(seconds);
  const onElapsedRef = useRef(onElapsed);
  const elapsedFiredRef = useRef(false);

  useEffect(() => {
    onElapsedRef.current = onElapsed;
  }, [onElapsed]);

  useEffect(() => {
    const reset = resetCountdownState(seconds);
    setSecondsLeft(reset.secondsLeft);
    elapsedFiredRef.current = reset.elapsedFired;
  }, [seconds]);

  useEffect(() => {
    if (!running) {
      return;
    }

    if (shouldFireElapsed(secondsLeft, running, elapsedFiredRef.current)) {
      elapsedFiredRef.current = true;
      onElapsedRef.current();
      return;
    }

    if (secondsLeft <= 0) {
      return;
    }

    const timerId = window.setInterval(() => {
      setSecondsLeft((previous) => getSecondsAfterTick(previous));
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [running, secondsLeft]);

  return secondsLeft;
}
