import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '../query-keys';

const TOAST_ID = 'jira-settings';

export function useDatabaseMutations() {
  const queryClient = useQueryClient();

  const deleteDatabase = useMutation({
    mutationFn: () => window.database.delete(),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.database.path });
      if (result.success) {
        toast.success('Database deleted. Restart the app to continue.', {
          id: TOAST_ID,
          position: 'bottom-center',
        });
      } else {
        toast.error(result.error ?? 'Failed to delete database', {
          id: TOAST_ID,
          position: 'bottom-center',
        });
      }
    },
    onError: () => {
      toast.error('Failed to delete database', {
        id: TOAST_ID,
        position: 'bottom-center',
      });
    },
  });

  return { deleteDatabase };
}
