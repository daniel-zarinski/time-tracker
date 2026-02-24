import { useQuery } from '@tanstack/react-query';
import {
  ScrollArea,
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
  TimeEntryCardActive,
  TimeEntryCardDefault,
} from '@time-tracker/ui';
import { Clock } from 'lucide-react';

export function TasksTab() {
  const timeEntriesQuery = useQuery({
    queryKey: ['time-entries'],
    queryFn: () => window.database.getTimeEntries(),
    retry: false,
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
        <TimeEntryCardActive
          entry={activeEntry}
          onStopTimer={(id) => console.log('stop', id)}
        />
      )}

      <ScrollArea className="h-[calc(100vh-10rem)]">
        <ul className="flex flex-col gap-2 pr-4">
          {completedEntries.map((entry) => (
            <li key={entry.id}>
              <TimeEntryCardDefault
                entry={entry}
                onOpenInJira={(key) => window.electron.openJiraExternal(key)}
              />
            </li>
          ))}
        </ul>
      </ScrollArea>
    </div>
  );
}
