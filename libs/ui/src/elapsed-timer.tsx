'use client';
import { forwardRef, useEffect, useState } from 'react';
import { cn } from '@time-tracker/utils';
import { SlidingNumber } from './shadcn/sliding-number';

export function useElapsedSeconds(
  startedAt: Date | string,
  timeSpentSeconds?: number | null
): number {
  const [, setTick] = useState(0);

  useEffect(() => {
    if (timeSpentSeconds != null) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [timeSpentSeconds]);

  return (
    timeSpentSeconds ??
    Math.floor(
      (new Date().getTime() - new Date(startedAt).getTime()) / 1000
    )
  );
}

interface ElapsedTimerDisplayProps {
  elapsedSeconds: number;
  className?: string;
}

export const ElapsedTimerDisplay = forwardRef<
  HTMLSpanElement,
  ElapsedTimerDisplayProps
>(function ElapsedTimerDisplay({ elapsedSeconds, className }, ref) {
  return (
    <span
      ref={ref}
      className={cn('font-mono flex items-center', className)}
    >
      <SlidingNumber value={Math.floor(elapsedSeconds / 3600)} padStart />
      <span>:</span>
      <SlidingNumber
        value={Math.floor((elapsedSeconds % 3600) / 60)}
        padStart
      />
      <span>:</span>
      <SlidingNumber value={elapsedSeconds % 60} padStart />
    </span>
  );
});
