import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '../query-keys';

const TOAST_ID = 'jira-settings';

export function useJiraConfigMutations() {
  const queryClient = useQueryClient();

  const save = useMutation({
    mutationFn: (config: { company: string; email: string; token: string }) =>
      window.jira.saveConfig(config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jira.config });
      toast.success('Settings saved', { id: TOAST_ID });
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error ? err.message : 'Failed to save Jira settings';
      toast.error(message, { id: TOAST_ID });
    },
  });

  const testConnection = useMutation({
    mutationFn: (config: { company: string; email: string; token: string }) =>
      window.jira.testConnection(config),
    onMutate: () => {
      toast.loading('Testing connection…', { id: TOAST_ID });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jira.config });
      toast.success('Connected', { id: TOAST_ID });
    },
    onError: () => {
      toast.error('Connection failed', { id: TOAST_ID });
    },
  });

  return { save, testConnection };
}
