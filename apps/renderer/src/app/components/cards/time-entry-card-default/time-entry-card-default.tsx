import type { TimeEntryWithIssue } from '@time-tracker/database';
import type { TimeEntryUpdates } from '@time-tracker/utils';
import { cn, SECONDS_PER_WORKDAY } from '@time-tracker/utils';
import { useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  EASE_CUBIC,
  EditTimeEntryForm,
  Progress,
  TransitionPanel,
  type ComboboxSelectItem,
} from '@time-tracker/ui';
import { PlayIcon, Trash2Icon } from 'lucide-react';
import { motion } from 'motion/react';
import useMeasure from 'react-use-measure';
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
      return 'border-green-500/20 bg-green-500/10';
    case 'ERROR':
      return 'border-destructive/20 bg-destructive/10';
    default:
      return 'border-border bg-card/20';
  }
}

const panelTransition = {
  x: { duration: 0.3, ease: EASE_CUBIC },
  opacity: { duration: 0.2, ease: EASE_CUBIC },
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
  const [measureRef, bounds] = useMeasure();

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
      position: 'absolute' as const,
      top: 0,
      width: '100%',
    }),
  };

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
        'hover:bg-card/70 hover:border-primary/20',
        'py-0 gap-0',
        state === 'edit' && 'border-primary/25 bg-card/70 hover:bg-card/70',
        className
      )}
    >
      <Progress
        value={progressValue}
        className="h-1 rounded-none bg-primary/15"
      />
      <TimeEntryCardHeader
        issueKey={issueKey}
        summary={entry.issue.summary ?? ''}
        truncate
        className={state === 'edit' ? 'cursor-default' : undefined}
      >
        {state === 'default' && (
          <TimeEntryCardActionsDropdown
            onView={() => onOpenInJira?.(issueKey)}
            onEdit={handleEdit}
            onDelete={() => onDelete?.(entry.id)}
          />
        )}
      </TimeEntryCardHeader>
      <motion.div
        initial={false}
        animate={{ height: bounds.height > 0 ? bounds.height : 'auto' }}
        transition={{ duration: 0.3, ease: EASE_CUBIC }}
        className="relative overflow-hidden"
      >
        <TransitionPanel
          activeIndex={state === 'edit' ? 1 : 0}
          variants={panelVariants}
          transition={panelTransition}
          custom={direction}
        >
          {/* Panel 0: View mode */}
          <div ref={measureRef}>
            <CardContent className="px-3 pt-0 pb-2.5 max-w-sm mx-auto">
              <TimeEntryCardSummary
                startDate={startDate}
                endDate={endDate}
                duration={duration}
              />
            </CardContent>

            <TimeEntryCardActionsFooter
              onView={() => onOpenInJira?.(issueKey)}
              onEdit={handleEdit}
            />
          </div>

          {/* Panel 1: Edit mode */}
          <div ref={measureRef}>
            <EditTimeEntryForm
              entry={entry}
              issues={issues}
              onSave={handleSave}
              onCancel={handleCancelEdit}
              onDelete={() => onDelete?.(entry.id)}
            />
          </div>
        </TransitionPanel>
        {state === 'edit' && (
          <Button
            variant="destructive"
            size="xs"
            className="absolute bottom-2.5 left-3"
            onClick={() => onDelete?.(entry.id)}
          >
            <Trash2Icon className="size-3" />
            Delete
          </Button>
        )}
        {state === 'default' && onResumeTimer && (
          <Button
            variant="outline"
            size="xs"
            className="absolute bottom-2.5 right-3"
            onClick={() => onResumeTimer(issueKey)}
          >
            <PlayIcon className="size-3" />
            Resume
          </Button>
        )}
      </motion.div>
    </Card>
  );
}
