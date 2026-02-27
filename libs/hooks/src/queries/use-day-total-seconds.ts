import { useQuery } from '@tanstack/react-query';
import { SECONDS_PER_WORKDAY } from '@time-tracker/utils';
import { queryKeys } from '../query-keys';

export function useDayProgress(date: Date): number {
  const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  const { data: totalSeconds = 0 } = useQuery({
    queryKey: queryKeys.timeEntries.dayTotal(dateKey),
    queryFn: () => window.timeTracking.getTotalSecondsForDay(date),
    retry: false,
  });
  return totalSeconds / SECONDS_PER_WORKDAY;
}
