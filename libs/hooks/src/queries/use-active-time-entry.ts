import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../query-keys';

export function useActiveTimeEntry() {
  return useQuery({
    queryKey: queryKeys.timeEntries.active,
    queryFn: () => window.database.getActiveTimeEntry(),
    retry: false,
  });
}
