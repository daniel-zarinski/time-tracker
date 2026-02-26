import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../query-keys';

export function useTimeEntries() {
  return useQuery({
    queryKey: queryKeys.timeEntries.all,
    queryFn: () => window.database.getTimeEntries(),
    retry: false,
  });
}
