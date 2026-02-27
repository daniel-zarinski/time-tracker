import type { TimeEntryWithIssue } from '@time-tracker/database';
import type { TimeEntryUpdates } from '@time-tracker/utils';
import type { ComboboxSelectItem } from '@time-tracker/ui';
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
  onStopTracking: (id: string) => void;
  onStartTracking: (issueKey: string) => void;
  onUpdateEntry: (entryId: string, updates: TimeEntryUpdates) => void;
  onDeleteEntry: (id: string) => void;
  onOpenInJira: (issueKey: string) => void;
}

export function TimelineListView({
  entries,
  issues,
  dateKey,
  onStopTracking,
  onStartTracking,
  onUpdateEntry,
  onDeleteEntry,
  onOpenInJira,
}: TimelineListViewProps) {
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
            onStopTimer={onStopTracking}
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
              onOpenInJira={() => onOpenInJira(entry.issueKey)}
              onResumeTimer={() => onStartTracking(entry.issueKey)}
              onSave={(entryId, updates) => onUpdateEntry(entryId, updates)}
              onDelete={(id) => onDeleteEntry(id)}
            />
          ))}
        </AnimatedGroup>
      </div>
    </div>
  );
}
