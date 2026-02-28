import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '../query-keys';

const TOAST_ID = 'jira-settings';

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (
    err &&
    typeof err === 'object' &&
    'message' in err &&
    typeof (err as { message?: unknown }).message === 'string'
  ) {
    return (err as { message: string }).message;
  }
  if (typeof err === 'string') return err;
  return 'Failed to save Jira settings';
}

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
      toast.error(getErrorMessage(err), { id: TOAST_ID });
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
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err) || 'Connection failed', { id: TOAST_ID });
    },
  });

  return { save, testConnection };
}
