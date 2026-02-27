import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '../query-keys';

export function useTimeEntryMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.timeEntries.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.timeEntries.active });
  };

  const startTracking = useMutation({
    mutationFn: (issueKey: string) =>
      window.timeTracking.startTracking(issueKey),
    onSuccess: () => {
      invalidate();
      toast.success('Time entry started');
    },
    onError: () => {
      toast.error('Failed to start time entry');
    },
  });

  const stopTracking = useMutation({
    mutationFn: (id: string) => window.timeTracking.stopTracking(id),
    onSuccess: () => {
      invalidate();
      toast.success('Time entry stopped');
    },
    onError: () => {
      toast.error('Failed to stop time entry');
    },
  });

  const deleteTimeEntry = useMutation({
    mutationFn: (entryId: string) => window.database.deleteTimeEntry(entryId),
    onSuccess: () => {
      invalidate();
      toast.success('Time entry deleted');
    },
    onError: () => {
      toast.error('Failed to delete time entry');
    },
  });

  const updateTimeEntry = useMutation({
    mutationFn: ({
      entryId,
      updates,
    }: {
      entryId: string;
      updates: {
        startedAt?: Date;
        timeSpentSeconds?: number;
        description?: string;
      };
    }) => window.database.updateTimeEntry(entryId, updates),
    onSuccess: () => {
      invalidate();
      toast.success('Time entry updated');
    },
    onError: () => {
      toast.error('Failed to update time entry');
    },
  });

  const createTimeEntry = useMutation({
    mutationFn: async ({
      issueKey,
      startedAt,
      timeSpentSeconds,
    }: {
      issueKey: string;
      startedAt: Date;
      timeSpentSeconds: number;
    }) => {
      const entry = await window.timeTracking.startTracking(issueKey);
      await window.database.updateTimeEntry(entry.id, {
        startedAt,
        timeSpentSeconds,
      });
      return entry;
    },
    onSuccess: () => {
      invalidate();
      toast.success('Time entry created');
    },
    onError: () => {
      toast.error('Failed to create time entry');
    },
  });

  return {
    startTracking,
    stopTracking,
    deleteTimeEntry,
    updateTimeEntry,
    createTimeEntry,
  };
}
