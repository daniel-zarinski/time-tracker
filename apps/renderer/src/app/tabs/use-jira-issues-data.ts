import { useMemo } from 'react';
import { useJiraMyIssues } from '@time-tracker/hooks';
import type { JiraIssueWithParent } from '@time-tracker/database';
import { OTHER_STATUS_SET, sortStatuses } from './jira-issues-utils';

export function useJiraIssuesData() {
  const getIssuesQuery = useJiraMyIssues();

  const isConfigError =
    getIssuesQuery.isError &&
    (getIssuesQuery.error as { message?: string })?.message?.includes(
      'not configured'
    );

  const issues = getIssuesQuery.data ?? [];

  const { groupedByStatus, statuses } = useMemo(() => {
    const grouped = issues.reduce<Record<string, JiraIssueWithParent[]>>(
      (acc, issue) => {
        const status = issue.status ?? 'Unknown';
        const displayStatus = (OTHER_STATUS_SET as Set<string>).has(status)
          ? 'Other'
          : status;
        if (!acc[displayStatus]) acc[displayStatus] = [];
        acc[displayStatus].push(issue);
        return acc;
      },
      {}
    );
    return {
      groupedByStatus: grouped,
      statuses: sortStatuses(Object.keys(grouped)),
    };
  }, [issues]);

  return {
    issues,
    groupedByStatus,
    statuses,
    isLoading: getIssuesQuery.isLoading || getIssuesQuery.isFetching,
    isError: getIssuesQuery.isError,
    isConfigError,
    error: getIssuesQuery.error,
    isRefetching: getIssuesQuery.isRefetching,
    refetch: getIssuesQuery.refetch,
  };
}
