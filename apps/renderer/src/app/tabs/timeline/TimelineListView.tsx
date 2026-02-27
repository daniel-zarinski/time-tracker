import type { TimeEntryWithIssue } from '@time-tracker/database';
import type { ComboboxSelectItem } from '@time-tracker/ui';
import { useTimeEntryMutations } from '@time-tracker/hooks';
import {
  AnimatedGroup,
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from '@time-tracker/ui';
import { Clock } from 'lucide-react';
import { TimeEntryCardActive } from '../../components/cards/time-entry-card-active';
import { TimeEntryCardDefault } from '../../components/cards/time-entry-card-default';

const staggerVariants = {
  container: {
    visible: { transition: { staggerChildren: 0.05 } },
  },
};

interface TimelineListViewProps {
  entries: TimeEntryWithIssue[];
  issues: ComboboxSelectItem[];
  dateKey: string;
}

export function TimelineListView({
  entries,
  issues,
  dateKey,
}: TimelineListViewProps) {
  const { startTracking, stopTracking, updateTimeEntry, deleteTimeEntry } =
    useTimeEntryMutations();

  const activeEntry = entries.find((e) => e.timeSpentSeconds === null);
  const completedEntries = entries.filter((e) => e.timeSpentSeconds !== null);

  if (entries.length === 0) {
    return (
      <Empty className="w-full max-w-md mx-auto">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Clock />
          </EmptyMedia>
          <EmptyTitle>No time entries</EmptyTitle>
          <EmptyDescription>
            No entries for the selected day.
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
            onStopTimer={(id) => stopTracking.mutate(id)}
          />
        </div>
      )}

      <div className="p-4 flex flex-col gap-3">
        <AnimatedGroup key={dateKey} as="ul" asChild="li" preset="slide" variants={staggerVariants} className="flex flex-col gap-2">
          {completedEntries.map((entry) => (
            <TimeEntryCardDefault
              key={entry.id}
              entry={entry}
              issues={issues}
              onOpenInJira={() => window.electron.openJiraExternal(entry.issueKey)}
              onResumeTimer={() => startTracking.mutate(entry.issueKey)}
              onSave={(entryId, updates) =>
                updateTimeEntry.mutate({ entryId, updates })
              }
              onDelete={(id) => deleteTimeEntry.mutate(id)}
            />
          ))}
        </AnimatedGroup>
      </div>
    </div>
  );
}
