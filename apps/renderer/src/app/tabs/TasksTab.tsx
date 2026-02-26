import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
  toast,
  type ComboboxSelectItem,
} from '@time-tracker/ui';
import { Clock } from 'lucide-react';
import { useMemo } from 'react';
import { TimeEntryCardActive } from '../components/cards/time-entry-card-active';
import { TimeEntryCardDefault } from '../components/cards/time-entry-card-default';

export function TasksTab() {
  const timeEntriesQuery = useQuery({
    queryKey: ['time-entries'],
    queryFn: () => window.database.getTimeEntries(),
    retry: false,
  });

  const { data: jiraIssues = [] } = useQuery({
    queryKey: ['jira', 'my-issues'],
    queryFn: () => window.database.getMyJiraIssues(),
    retry: false,
  });

  const issueItems: ComboboxSelectItem[] = useMemo(
    () =>
      jiraIssues
        .filter((i) => i.key != null)
        .map((i) => ({
          value: i.key!,
          label: i.key!,
          description: i.summary ?? undefined,
        })),
    [jiraIssues]
  );
  const startTracking = useMutation({
    mutationFn: (issueKey: string) =>
      window.timeTracking.startTracking(issueKey),
    onSuccess: () => {
      timeEntriesQuery.refetch();
      toast.success('Time entry started');
    },
    onError: () => {
      toast.error('Failed to start time entry');
    },
  });

  const stopTracking = useMutation({
    mutationFn: (id: string) => window.timeTracking.stopTracking(id),
    onSuccess: () => {
      timeEntriesQuery.refetch();
      toast.success('Time entry stopped');
    },
    onError: () => {
      toast.error('Failed to stop time entry');
    },
  });

  const deleteTimeEntryMutation = useMutation({
    mutationFn: (entryId: string) => window.database.deleteTimeEntry(entryId),
    onSuccess: () => {
      timeEntriesQuery.refetch();
      toast.success('Time entry deleted');
    },
    onError: () => {
      toast.error('Failed to delete time entry');
    },
  });

  const updateTimeEntryMutation = useMutation({
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
      timeEntriesQuery.refetch();
      toast.success('Time entry updated');
    },
    onError: () => {
      toast.error('Failed to update time entry');
    },
  });

  const entries = timeEntriesQuery.data ?? [];
  const activeEntry = entries.find((e) => e.timeSpentSeconds === null);
  const completedEntries = entries.filter((e) => e.timeSpentSeconds !== null);

  if (timeEntriesQuery.isLoading) {
    return (
      <Empty className="w-full max-w-md mx-auto">
        <EmptyHeader>
          <EmptyTitle>Loading time entries…</EmptyTitle>
        </EmptyHeader>
      </Empty>
    );
  }

  if (entries.length === 0) {
    return (
      <Empty className="w-full max-w-md mx-auto">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Clock />
          </EmptyMedia>
          <EmptyTitle>No time entries</EmptyTitle>
          <EmptyDescription>
            Start tracking time from a Jira issue to see entries here.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col">
      {activeEntry && (
        <div className="sticky top-0 z-30 border-b border-border bg-background px-4 py-2">
          <TimeEntryCardActive
            entry={activeEntry}
            onStopTimer={stopTracking.mutateAsync}
          />
        </div>
      )}

      <div className="p-4 flex flex-col gap-3">
        <ul className="flex flex-col gap-2">
          {completedEntries.map((entry) => (
            <li key={entry.id}>
              <TimeEntryCardDefault
                entry={entry}
                issues={issueItems}
                onOpenInJira={() => window.electron.openJiraExternal(entry.issueKey)}
                onResumeTimer={() => startTracking.mutateAsync(entry.issueKey)}
                onSave={async (entryId, updates) => {
                  await updateTimeEntryMutation.mutateAsync({
                    entryId,
                    updates: {
                      startedAt: updates.startedAt,
                      timeSpentSeconds: updates.timeSpentSeconds,
                      description: updates.description,
                      // issueKey: updates.issueKey, // TODO: add this back in once implemented
                    },
                  });
                }}
                onDelete={(id) => deleteTimeEntryMutation.mutateAsync(id)}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
