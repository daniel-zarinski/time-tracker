import type { TimeEntryWithIssue } from '@time-tracker/database';
import {
  BorderTrail,
  MorphingDialogSubtitle,
  MorphingDialogTitle,
} from '@time-tracker/ui';
import { cn } from '@time-tracker/utils';
import { TimeEntryEditDialog } from '../../components/time-entry-edit-dialog/time-entry-edit-dialog';
import { formatEntryTime } from './timeline-utils';
import { useTimelineEntryActions } from './timeline-context';

interface TimelineEntryDialogProps {
  entry: TimeEntryWithIssue;
  gridRowSpan: number;
  column: number;
  totalColumns: number;
  isActive: boolean;
}

export function TimelineEntryDialog({
  entry,
  gridRowSpan,
  column,
  totalColumns,
  isActive,
}: TimelineEntryDialogProps) {
  const { clearSelection } = useTimelineEntryActions();

  const issueKey = entry.issue.key ?? entry.issueKey;
  const entryEnd = entry.timeSpentSeconds
    ? new Date(
        new Date(entry.startedAt).getTime() + entry.timeSpentSeconds * 1000
      )
    : null;

  const trigger = (
    <>
      {isActive && <BorderTrail size={100} variant="red" />}
      <div className="truncate text-xs text-foreground flex items-center">
        <MorphingDialogTitle className="font-semibold">
          {issueKey}
        </MorphingDialogTitle>
        {entry.issue.summary && (
          <MorphingDialogSubtitle className="ml-1.5 text-foreground/60">
            {entry.issue.summary}
          </MorphingDialogSubtitle>
        )}
      </div>
      {gridRowSpan >= 2 && (
        <p className="mt-0.5 text-[10px] text-foreground/60">
          {formatEntryTime(new Date(entry.startedAt))}
          {entryEnd ? ` - ${formatEntryTime(entryEnd)}` : ''}
        </p>
      )}
    </>
  );

  return (
    <TimeEntryEditDialog
      entry={entry}
      trigger={trigger}
      triggerClassName={cn(
        'pointer-events-auto absolute inset-y-0.5 inset-x-[22px] px-2 pt-0 pb-2 text-left transition-colors',
        isActive
          ? 'border border-primary/30 bg-primary/10 hover:bg-primary/15 hover:border-primary/50'
          : 'border border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/50',
        totalColumns > 1 && 'inset-y-0.5'
      )}
      triggerStyle={{
        borderRadius: 'var(--radius)',
        ...(totalColumns > 1
          ? {
              left: `calc(${(column / totalColumns) * 100}% + ${
                column === 0 ? '22px' : '0.25rem'
              })`,
              right: `calc(${
                ((totalColumns - column - 1) / totalColumns) * 100
              }% + ${column === totalColumns - 1 ? '22px' : '0.25rem'})`,
            }
          : undefined),
      }}
      onOpenChange={(open) => {
        if (open) clearSelection();
      }}
    />
  );
}
