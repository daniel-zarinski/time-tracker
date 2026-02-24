import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
  TimeEntryCardActive,
  TimeEntryCardDefault,
  toast,
  Separator,
} from '@time-tracker/ui';
import { Clock } from 'lucide-react';
import { useAppStore } from '../store';

export function TasksTab() {
  const setSelectedIssue = useAppStore.use.setSelectedIssue();
  const timeEntriesQuery = useQuery({
    queryKey: ['time-entries'],
    queryFn: () => window.database.getTimeEntries(),
    retry: false,
  });
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
    <div className="w-full max-w-2xl mx-auto p-4 flex flex-col gap-3">
      {activeEntry && (
        <div className="sticky top-0 z-10 bg-background pb-1">
          <TimeEntryCardActive
            entry={activeEntry}
            onStopTimer={stopTracking.mutateAsync}
          />
          {completedEntries.length > 0 && <Separator className="mt-3" />}
        </div>
      )}

      <ul className="flex flex-col gap-2">
        {completedEntries.map((entry) => (
          <li key={entry.id}>
            <TimeEntryCardDefault
              entry={entry}
              // onOpenInJira={(key) => window.electron.openJiraExternal(key)}
              onOpenInJira={() => setSelectedIssue(entry.issue)}
              onResumeTimer={() => startTracking.mutateAsync(entry.issueKey)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
