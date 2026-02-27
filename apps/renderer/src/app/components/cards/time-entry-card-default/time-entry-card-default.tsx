import type { TimeEntryWithIssue } from '@time-tracker/database';
import type { TimeEntryUpdates } from '@time-tracker/utils';
import { cn, SECONDS_PER_WORKDAY } from '@time-tracker/utils';
import { useState } from 'react';
import {
  Card,
  CardContent,
  EditTimeEntryForm,
  Progress,
  TransitionPanel,
  type ComboboxSelectItem,
} from '@time-tracker/ui';
import { TimeEntryCardActionsDropdown } from './time-entry-card-actions';
import { TimeEntryCardActionsFooter } from './time-entry-card-actions';
import { TimeEntryCardHeader } from './time-entry-card-header';
import { TimeEntryCardSummary } from './time-entry-card-summary';

interface TimeEntryCardDefaultProps {
  entry: TimeEntryWithIssue;
  issues?: ComboboxSelectItem[];
  onResumeTimer?: (issueKey: string) => unknown | Promise<unknown>;
  onSave?: (entryId: string, updates: TimeEntryUpdates) => void | Promise<void>;
  onDelete?: (entryId: string) => void | Promise<void>;
  onOpenInJira?: (issueKey: string) => void | Promise<void>;
  className?: string;
}

function syncStatusStyles(status: string) {
  switch (status) {
    case 'SYNCED':
      return 'border-green-500/20 bg-green-500/5';
    case 'ERROR':
      return 'border-destructive/20 bg-destructive/5';
    default:
      return 'border-border bg-card/30';
  }
}

const panelVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 64 : -64,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 64 : -64,
    opacity: 0,
  }),
};

const panelTransition = {
  x: { type: 'spring' as const, stiffness: 300, damping: 30 },
  opacity: { duration: 0.2 },
};

export function TimeEntryCardDefault({
  entry,
  issues,
  onResumeTimer,
  onSave,
  onDelete,
  onOpenInJira,
  className,
}: TimeEntryCardDefaultProps) {
  const [state, setState] = useState<'default' | 'edit'>('default');
  const [direction, setDirection] = useState(1);

  const startDate = new Date(entry.startedAt);
  const duration = entry.timeSpentSeconds ?? 0;
  const endDate = new Date(startDate.getTime() + duration * 1000);

  const progressValue = Math.min(100, (duration / SECONDS_PER_WORKDAY) * 100);

  const issueKey = entry.issue.key ?? entry.issueKey;

  function handleEdit() {
    setDirection(1);
    setState('edit');
  }

  function handleCancelEdit() {
    setDirection(-1);
    setState('default');
  }

  async function handleSave(entryId: string, updates: TimeEntryUpdates) {
    if (!onSave) return;
    await onSave(entryId, updates);
    setDirection(-1);
    setState('default');
  }

  return (
    <Card
      className={cn(
        'transition-colors duration-200 border rounded-(--radius) shadow-none',
        syncStatusStyles(entry.syncStatus),
        'hover:bg-card/40 hover:border-primary/20',
        'py-0 gap-0',
        state === 'edit' && 'border-primary/25 bg-card/45',
        className
      )}
    >
      <Progress
        value={progressValue}
        className="h-1 rounded-none bg-primary/15"
      />
      <TransitionPanel
        className="overflow-hidden"
        activeIndex={state === 'edit' ? 1 : 0}
        variants={panelVariants}
        transition={panelTransition}
        custom={direction}
      >
        {/* Panel 0: View mode */}
        <div>
          <TimeEntryCardHeader
            issueKey={issueKey}
            summary={entry.issue.summary ?? ''}
            truncate
            children={
              <TimeEntryCardActionsDropdown
                onView={() => onOpenInJira?.(issueKey)}
                onEdit={handleEdit}
                onDelete={() => onDelete?.(entry.id)}
              />
            }
          />

          <CardContent className="px-3 pt-0 pb-2.5 max-w-sm mx-auto">
            <TimeEntryCardSummary
              startDate={startDate}
              endDate={endDate}
              duration={duration}
            />
          </CardContent>

          <TimeEntryCardActionsFooter
            onResume={onResumeTimer ? () => onResumeTimer(issueKey) : undefined}
            onView={() => onOpenInJira?.(issueKey)}
            onEdit={handleEdit}
            onDelete={() => onDelete?.(entry.id)}
          />
        </div>

        {/* Panel 1: Edit mode */}
        <div>
          <TimeEntryCardHeader
            issueKey={issueKey}
            summary={entry.issue.summary ?? ''}
            truncate
            className="cursor-default"
          />
          <EditTimeEntryForm
            entry={entry}
            issues={issues}
            onSave={handleSave}
            onCancel={handleCancelEdit}
            onDelete={onDelete}
          />
        </div>
      </TransitionPanel>
    </Card>
  );
}
