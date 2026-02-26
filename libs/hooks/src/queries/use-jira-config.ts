import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../query-keys';

export function useJiraConfig() {
  return useQuery({
    queryKey: queryKeys.jira.config,
    queryFn: () => window.store.getJiraConfig(),
  });
}
