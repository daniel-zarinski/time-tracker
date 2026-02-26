import { useQueries } from '@tanstack/react-query';
import { SECONDS_PER_WORKDAY } from '@time-tracker/utils';
import { queryKeys } from '../query-keys';

function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

export function useWeekDayProgress(weekDays: Date[]) {
  const queries = useQueries({
    queries: weekDays.map((day) => ({
      queryKey: queryKeys.timeEntries.dayTotal(toDateKey(day)),
      queryFn: () => window.timeTracking.getTotalSecondsForDay(day),
      retry: false,
    })),
  });

  const progress = new Map<number, number>();
  for (let i = 0; i < queries.length; i++) {
    const seconds = queries[i].data ?? 0;
    progress.set(i, seconds / SECONDS_PER_WORKDAY);
  }
  return progress;
}
