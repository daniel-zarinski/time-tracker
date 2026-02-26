import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../query-keys';

export function useJiraRelevantIssues(options?: { limit?: number }) {
  return useQuery({
    queryKey: queryKeys.jira.relevantIssues,
    queryFn: () =>
      window.database.getRelevantJiraIssues({ limit: options?.limit ?? 5 }),
    retry: false,
  });
}
