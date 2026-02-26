import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

const TOAST_ID = 'tempo-settings';

export function useTempoSyncMutations() {
  const syncWorklogs = useMutation({
    mutationFn: () => window.tempo.syncWorklogs(),
    onSuccess: (count) => {
      const message =
        count === 0
          ? 'No worklogs found for the last 14 days'
          : `Synced ${count} worklog${count === 1 ? '' : 's'}`;
      toast.success(message, { id: TOAST_ID });
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === 'object' && err !== null && 'message' in err
            ? String((err as { message: unknown }).message)
            : 'Failed to sync worklogs';
      toast.error(message, { id: TOAST_ID });
    },
  });

  return { syncWorklogs };
}
