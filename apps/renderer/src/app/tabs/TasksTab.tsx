import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
  type ComboboxSelectItem,
} from '@time-tracker/ui';
import {
  useTimeEntries,
  useJiraMyIssues,
  useTimeEntryMutations,
} from '@time-tracker/hooks';
import { Clock } from 'lucide-react';
import { useMemo } from 'react';
import { TimeEntryCardActive } from '../components/cards/time-entry-card-active';
import { TimeEntryCardDefault } from '../components/cards/time-entry-card-default';

export function TasksTab() {
  const timeEntriesQuery = useTimeEntries();
  const { data: jiraIssues = [] } = useJiraMyIssues();
  const { startTracking, stopTracking, deleteTimeEntry, updateTimeEntry } =
    useTimeEntryMutations();

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
                  await updateTimeEntry.mutateAsync({
                    entryId,
                    updates: {
                      startedAt: updates.startedAt,
                      timeSpentSeconds: updates.timeSpentSeconds,
                      description: updates.description,
                    },
                  });
                }}
                onDelete={(id) => deleteTimeEntry.mutateAsync(id)}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
