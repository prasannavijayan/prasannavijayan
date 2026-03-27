import { useEffect, useRef, useState } from "react";

export function useTimer(isPaused: boolean) {
  const [elapsed, setElapsed] = useState(0);
  const startTime = useRef(Date.now());
  const pausedAt = useRef<number | null>(null);

  useEffect(() => {
    if (isPaused) {
      pausedAt.current = Date.now();
      return;
    }

    // If resuming from pause, adjust start time to account for paused duration
    if (pausedAt.current !== null) {
      startTime.current += Date.now() - pausedAt.current;
      pausedAt.current = null;
    }

    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime.current) / 1000));
    }, 200);

    return () => clearInterval(interval);
  }, [isPaused]);

  return elapsed;
}

export function formatTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}
