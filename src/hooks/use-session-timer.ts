"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Direction = "up" | "down";

interface UseSessionTimerOptions {
  targetSeconds: number;
  direction: Direction;
  totalSets: number;
  preCountdownSeconds?: number;
}

const playBeep = (frequency = 880, duration = 120) => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const audioContext = new AudioContextClass();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    gainNode.gain.value = 0.08;

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();
    setTimeout(() => {
      oscillator.stop();
      audioContext.close();
    }, duration);
  } catch (error) {
    console.warn("Audio beep failed:", error);
  }
};

const playFinishSound = () => {
  playBeep(900, 120);
  setTimeout(() => playBeep(1100, 140), 170);
  setTimeout(() => playBeep(1300, 180), 370);
};

export function useSessionTimer({
  targetSeconds,
  direction,
  totalSets,
  preCountdownSeconds = 10,
}: UseSessionTimerOptions) {
  const [isRunning, setIsRunning] = useState(false);
  const [isPreCountdownActive, setIsPreCountdownActive] = useState(false);
  const [hasMainSessionStarted, setHasMainSessionStarted] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(preCountdownSeconds);
  const [currentSet, setCurrentSet] = useState(1);
  const [seconds, setSeconds] = useState(direction === "down" ? targetSeconds : 0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setSeconds(direction === "down" ? targetSeconds : 0);
    setCountdownSeconds(preCountdownSeconds);
    setCurrentSet(1);
    setIsPreCountdownActive(false);
    setHasMainSessionStarted(false);
    setIsRunning(false);
  }, [targetSeconds, direction, preCountdownSeconds]);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    stop();
    setCurrentSet(1);
    setSeconds(direction === "down" ? targetSeconds : 0);
    setCountdownSeconds(preCountdownSeconds);
    setIsPreCountdownActive(false);
    setHasMainSessionStarted(false);
  }, [direction, stop, targetSeconds, preCountdownSeconds]);

  const tick = useCallback(() => {
    setSeconds((prev) => {
      const next = direction === "down" ? prev - 1 : prev + 1;
      const reachedEnd = direction === "down" ? next <= 0 : next >= targetSeconds;

      const remaining = direction === "down" ? Math.max(next, 0) : Math.max(targetSeconds - next, 0);
      const elapsed = direction === "up" ? next : targetSeconds - next;

      if (!reachedEnd) {
        if (remaining > 0 && remaining <= 10) {
          playBeep(1200, 90);
        } else if (elapsed > 0 && elapsed % 60 === 0) {
          playBeep(850, 120);
        }
        return next;
      }

      playFinishSound();

      setCurrentSet((prevSet) => {
        if (prevSet >= totalSets) {
          stop();
          return prevSet;
        }

        return prevSet + 1;
      });

      return direction === "down" ? targetSeconds : 0;
    });
  }, [direction, stop, targetSeconds, totalSets]);

  const start = useCallback(() => {
    if (isRunning) return;

    if (!hasMainSessionStarted) {
      setIsPreCountdownActive(true);
      setCountdownSeconds(preCountdownSeconds);
    }

    setIsRunning(true);
  }, [isRunning, hasMainSessionStarted, preCountdownSeconds]);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    if (isPreCountdownActive) {
      intervalRef.current = setInterval(() => {
        setCountdownSeconds((prev) => {
          const next = prev - 1;

          if (next > 0) {
            playBeep(1300, 90);
            return next;
          }

          playBeep(1500, 120);
          setIsPreCountdownActive(false);
          setHasMainSessionStarted(true);
          return 0;
        });
      }, 1000);
    } else {
      intervalRef.current = setInterval(tick, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, isPreCountdownActive, tick]);

  return {
    isRunning,
    isPreCountdownActive,
    countdownSeconds,
    currentSet,
    seconds,
    start,
    pause,
    reset,
    setCurrentSet,
  };
}
