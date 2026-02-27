import { cn } from '@time-tracker/utils';
import type { TimeEntryUpdates } from '@time-tracker/utils';
import type { TimeEntryWithIssue } from '@time-tracker/database';
import {
  BorderTrail,
  EditTimeEntryForm,
  MorphingDialog,
  MorphingDialogTrigger,
  MorphingDialogContainer,
  MorphingDialogContent,
  MorphingDialogClose,
  MorphingDialogTitle,
  MorphingDialogSubtitle,
  ScrollArea,
  useMorphingDialog,
  type ComboboxSelectItem,
} from '@time-tracker/ui';
import { TimeEntryCardHeader } from '../../components/cards/time-entry-card-default/time-entry-card-header';
import { formatEntryTime } from './timeline-utils';

interface TimelineEntryDialogProps {
  entry: TimeEntryWithIssue;
  issues: ComboboxSelectItem[];
  gridRowSpan: number;
  column: number;
  totalColumns: number;
  isActive: boolean;
  onSave: (entryId: string, updates: TimeEntryUpdates) => Promise<void>;
  onDelete: (entryId: string) => Promise<void>;
  onOpen?: () => void;
}

function TimelineEntryDialogForm({
  entry,
  issues,
  onSave,
  onDelete,
}: {
  entry: TimeEntryWithIssue;
  issues: ComboboxSelectItem[];
  onSave: (entryId: string, updates: TimeEntryUpdates) => Promise<void>;
  onDelete: (entryId: string) => Promise<void>;
}) {
  const { setIsOpen } = useMorphingDialog();
  const close = () => setIsOpen(false);

  return (
    <EditTimeEntryForm
      entry={entry}
      issues={issues}
      onSave={async (id, u) => {
        await onSave(id, u);
        close();
      }}
      onCancel={close}
      onDelete={async (id) => {
        await onDelete(id);
        close();
      }}
    />
  );
}

export function TimelineEntryDialog({
  entry,
  issues,
  gridRowSpan,
  column,
  totalColumns,
  isActive,
  onSave,
  onDelete,
  onOpen,
}: TimelineEntryDialogProps) {
  const issueKey = entry.issue.key ?? entry.issueKey;
  const entryEnd = entry.timeSpentSeconds
    ? new Date(
        new Date(entry.startedAt).getTime() + entry.timeSpentSeconds * 1000
      )
    : null;

  return (
    <MorphingDialog
      transition={{
        type: 'spring',
        bounce: 0.05,
        duration: 0.5,
      }}
      onOpenChange={(open) => {
        if (open) onOpen?.();
      }}
    >
      <MorphingDialogTrigger
        className={cn(
          'pointer-events-auto absolute inset-y-0.5 inset-x-[22px] px-2 pt-0 pb-2 text-left transition-colors',
          isActive
            ? 'border border-primary/30 bg-accent/15 hover:bg-primary/10'
            : 'border border-primary/20 bg-primary/5 hover:bg-primary/10',
          totalColumns > 1 && 'inset-y-0.5'
        )}
        style={{
          borderRadius: 'var(--radius)',
          ...(totalColumns > 1
            ? {
                left: `calc(${
                  (column / totalColumns) * 100
                }% + ${column === 0 ? '22px' : '0.25rem'})`,
                right: `calc(${
                  ((totalColumns - column - 1) / totalColumns) * 100
                }% + ${
                  column === totalColumns - 1 ? '22px' : '0.25rem'
                })`,
              }
            : undefined),
        }}
      >
        {isActive && <BorderTrail size={100} />}
        <div className="truncate text-xs text-primary flex items-center">
          <MorphingDialogTitle className="font-semibold">
            {issueKey}
          </MorphingDialogTitle>
          {entry.issue.summary && (
            <MorphingDialogSubtitle className="ml-1.5 text-primary/60">
              {entry.issue.summary}
            </MorphingDialogSubtitle>
          )}
        </div>
        {gridRowSpan >= 2 && (
          <p className="mt-0.5 text-[10px] text-primary/60">
            {formatEntryTime(new Date(entry.startedAt))}
            {entryEnd ? ` - ${formatEntryTime(entryEnd)}` : ''}
          </p>
        )}
      </MorphingDialogTrigger>
      <MorphingDialogContainer>
        <MorphingDialogContent
          className="relative h-auto w-full max-w-md border border-border bg-background"
          style={{ borderRadius: 'var(--radius)' }}
        >
          <ScrollArea className="max-h-[85vh]" type="scroll">
            <TimeEntryCardHeader
              issueKey={issueKey}
              summary={entry.issue.summary ?? ''}
              truncate
              className="cursor-default"
            />
            <TimelineEntryDialogForm
              entry={entry}
              issues={issues}
              onSave={onSave}
              onDelete={onDelete}
            />
          </ScrollArea>
          <MorphingDialogClose className="text-muted-foreground" />
        </MorphingDialogContent>
      </MorphingDialogContainer>
    </MorphingDialog>
  );
}
