import type { TimeEntryWithIssue } from '@time-tracker/database';
import type { TimeEntryUpdates } from '@time-tracker/utils';
import { cn, SECONDS_PER_WORKDAY } from '@time-tracker/utils';
import { useState } from 'react';
import { motion } from 'motion/react';
import useMeasure from 'react-use-measure';
import {
  Card,
  CardContent,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
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
  defaultExpanded?: boolean;
  defaultView?: 'expanded' | 'edit';
  onResumeTimer?: (issueKey: string) => unknown | Promise<unknown>;
  onSave?: (entryId: string, updates: TimeEntryUpdates) => void | Promise<void>;
  onDelete?: (entryId: string) => void | Promise<void>;
  onCancel?: () => void;
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
    x: direction > 0 ? -64 : 64,
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
  defaultExpanded = false,
  defaultView,
  onResumeTimer,
  onSave,
  onDelete,
  onCancel,
  onOpenInJira,
  className,
}: TimeEntryCardDefaultProps) {
  const [state, setState] = useState<'default' | 'expanded' | 'edit'>(
    defaultView === 'edit'
      ? 'edit'
      : defaultExpanded
        ? 'expanded'
        : 'default'
  );
  const [direction, setDirection] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [measureRef, bounds] = useMeasure();
  const expanded = state === 'expanded' || state === 'edit';

  const startDate = new Date(entry.startedAt);
  const duration = entry.timeSpentSeconds ?? 0;
  const endDate = new Date(startDate.getTime() + duration * 1000);

  const progressValue = Math.min(100, (duration / SECONDS_PER_WORKDAY) * 100);

  const issueKey = entry.issue.key ?? entry.issueKey;

  function handleSetState(next: 'default' | 'expanded' | 'edit') {
    setDirection(next === 'edit' ? 1 : -1);
    setIsTransitioning(true);
    setState(next);
  }

  async function handleSave(entryId: string, updates: TimeEntryUpdates) {
    if (!onSave) return;
    await onSave(entryId, updates);
    handleSetState('default');
  }

  function handleCancelEdit() {
    if (onCancel) {
      onCancel();
    } else {
      handleSetState('expanded');
    }
  }

  return (
    <Card
      className={cn(
        'transition-all duration-200 border rounded-(--radius) shadow-none overflow-hidden',
        syncStatusStyles(entry.syncStatus),
        'hover:bg-card/40 hover:border-primary/20',
        'py-0 gap-0',
        expanded && 'border-primary/25 bg-card/45',
        className
      )}
    >
      <Progress
        value={progressValue}
        className="h-1 rounded-none bg-primary/15"
      />
      <motion.div
        animate={{
          height: isTransitioning && bounds.height > 0 ? bounds.height : 'auto',
        }}
        transition={{ type: 'spring' as const, stiffness: 300, damping: 30 }}
        onAnimationComplete={() => setIsTransitioning(false)}
        style={{ overflow: isTransitioning ? 'hidden' : 'visible' }}
      >
        <div ref={measureRef}>
          <TransitionPanel
            activeIndex={state === 'edit' ? 1 : 0}
            variants={panelVariants}
            transition={panelTransition}
            custom={direction}
          >
            {/* Panel 0: View mode */}
            <Collapsible
              open={state === 'expanded'}
              onOpenChange={(open) =>
                setState(open ? 'expanded' : 'default')
              }
            >
              <CollapsibleTrigger asChild>
                <div className="cursor-pointer select-none">
                  <TimeEntryCardHeader
                    issueKey={issueKey}
                    summary={entry.issue.summary ?? ''}
                    truncate={state !== 'expanded'}
                    children={
                      state === 'default' ? (
                        <TimeEntryCardActionsDropdown
                          onView={() => onOpenInJira?.(issueKey)}
                          onEdit={() => handleSetState('edit')}
                          onDelete={() => onDelete?.(entry.id)}
                        />
                      ) : undefined
                    }
                  />
                </div>
              </CollapsibleTrigger>

              <CardContent className="px-3 pt-0 pb-2.5 max-w-sm mx-auto">
                <TimeEntryCardSummary
                  startDate={startDate}
                  endDate={endDate}
                  duration={duration}
                />
              </CardContent>

              <CollapsibleContent>
                <div className="px-3 py-2 text-xs text-muted-foreground/50 italic">
                  {/* placeholder — future content TBD */}
                </div>
                <TimeEntryCardActionsFooter
                  onResume={
                    onResumeTimer ? () => onResumeTimer(issueKey) : undefined
                  }
                  onView={() => onOpenInJira?.(issueKey)}
                  onEdit={() => handleSetState('edit')}
                  onDelete={() => onDelete?.(entry.id)}
                />
              </CollapsibleContent>
            </Collapsible>

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
        </div>
      </motion.div>
    </Card>
  );
}
