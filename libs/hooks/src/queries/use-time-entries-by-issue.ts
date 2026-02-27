import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../query-keys';

export function useTimeEntriesByIssue(
  issueKey: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: queryKeys.timeEntries.byIssue(issueKey),
    queryFn: () => window.database.getTimeEntriesByIssueKey(issueKey),
    enabled: (options?.enabled ?? true) && !!issueKey,
    retry: false,
  });
}
