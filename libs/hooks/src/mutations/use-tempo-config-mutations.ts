import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '../query-keys';

const TOAST_ID = 'tempo-settings';

export function useTempoConfigMutations() {
  const queryClient = useQueryClient();

  const save = useMutation({
    mutationFn: (config: { token: string }) =>
      window.store.setTempoConfig(config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tempo.config });
      toast.success('Settings saved', { id: TOAST_ID });
    },
  });

  const testConnection = useMutation({
    mutationFn: (config?: { token: string }) =>
      window.tempo.testConnection(config),
    onMutate: () => {
      toast.loading('Testing connection…', { id: TOAST_ID });
    },
    onSuccess: () => {
      toast.success('Connected', { id: TOAST_ID });
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Connection failed';
      toast.error(message, { id: TOAST_ID });
    },
  });

  return { save, testConnection };
}
