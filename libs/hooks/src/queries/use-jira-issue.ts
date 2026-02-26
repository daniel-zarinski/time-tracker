import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../query-keys';

export function useJiraIssue(key: string | null) {
  return useQuery({
    queryKey: queryKeys.jira.issue(key ?? ''),
    queryFn: () => window.database.getJiraIssueByKey(key!),
    enabled: !!key,
  });
}
