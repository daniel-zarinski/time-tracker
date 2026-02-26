import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../query-keys';

export function useTempoConfig() {
  return useQuery({
    queryKey: queryKeys.tempo.config,
    queryFn: () => window.store.getTempoConfig(),
  });
}
