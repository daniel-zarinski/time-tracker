import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../query-keys';

export function useDatabasePath() {
  return useQuery({
    queryKey: queryKeys.database.path,
    queryFn: () => window.database.getPath(),
  });
}
