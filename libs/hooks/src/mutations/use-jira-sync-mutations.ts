import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '../query-keys';

const TOAST_ID = 'jira-settings';

export function useJiraSyncMutations() {
  const queryClient = useQueryClient();

  const fetchAllMyIssues = useMutation({
    mutationFn: () => window.jira.fetchMyIssues(),
    onSuccess: (issues) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jira.all });
      toast.success(
        `Synced ${issues.length} issue${issues.length === 1 ? '' : 's'}`,
        { id: TOAST_ID }
      );
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error ? err.message : 'Failed to fetch issues';
      toast.error(message, { id: TOAST_ID });
    },
  });

  const fetchMissingIssues = useMutation({
    mutationFn: () => window.jira.fetchMissingIssues(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jira.all });
      toast.success('Missing issues synced', { id: TOAST_ID });
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error ? err.message : 'Failed to sync missing issues';
      toast.error(message, { id: TOAST_ID });
    },
  });

  const syncStatuses = useMutation({
    mutationFn: () => window.jira.fetchStatuses(),
    onSuccess: (statuses) => {
      toast.success(
        `Synced ${statuses.length} status${statuses.length === 1 ? '' : 'es'}`,
        { id: TOAST_ID }
      );
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error ? err.message : 'Failed to sync statuses';
      toast.error(message, { id: TOAST_ID });
    },
  });

  const syncMyIssues = useMutation({
    mutationKey: ['jira', 'sync-my-issues'],
    mutationFn: () => window.jira.syncMyIssues(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jira.myIssues });
    },
  });

  return { fetchAllMyIssues, fetchMissingIssues, syncStatuses, syncMyIssues };
}
