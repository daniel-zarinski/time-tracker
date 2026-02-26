import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../query-keys';

export function useJiraMyIssues() {
  return useQuery({
    queryKey: queryKeys.jira.myIssues,
    queryFn: () => window.database.getMyJiraIssues(),
    retry: false,
  });
}
