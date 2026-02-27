import type { TimeEntryWithIssue } from '@time-tracker/database';
import { useTimeEntryMutations } from '@time-tracker/hooks';
import {
  BorderTrail,
  CardDescription,
  CardHeader,
  CardTitle,
  EditTimeEntryForm,
  MorphingDialog,
  MorphingDialogContainer,
  MorphingDialogContent,
  MorphingDialogSubtitle,
  MorphingDialogTitle,
  MorphingDialogTrigger,
  ScrollArea,
  useMorphingDialog,
  type ComboboxSelectItem,
} from '@time-tracker/ui';
import { cn } from '@time-tracker/utils';
import { JiraIssueKeyBadge } from '../../components/jira-issue-key-badge';
import { formatEntryTime } from './timeline-utils';
import { useTimelineEntryActions } from './timeline-context';

interface TimelineEntryDialogProps {
  entry: TimeEntryWithIssue;
  gridRowSpan: number;
  column: number;
  totalColumns: number;
  isActive: boolean;
}

function TimelineEntryDialogForm({
  entry,
  issues,
}: {
  entry: TimeEntryWithIssue;
  issues: ComboboxSelectItem[];
}) {
  const { setIsOpen } = useMorphingDialog();
  const { updateTimeEntry, deleteTimeEntry } = useTimeEntryMutations();
  const close = () => setIsOpen(false);

  return (
    <EditTimeEntryForm
      entry={entry}
      issues={issues}
      onSave={async (entryId, updates) => {
        await updateTimeEntry.mutateAsync({ entryId, updates });
        close();
      }}
      onCancel={close}
      onDelete={async (id) => {
        await deleteTimeEntry.mutateAsync(id);
        close();
      }}
    />
  );
}

export function TimelineEntryDialog({
  entry,
  gridRowSpan,
  column,
  totalColumns,
  isActive,
}: TimelineEntryDialogProps) {
  const { issues, clearSelection } = useTimelineEntryActions();

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
        if (open) clearSelection();
      }}
    >
      <MorphingDialogTrigger
        className={cn(
          'pointer-events-auto absolute inset-y-0.5 inset-x-[22px] px-2 pt-0 pb-2 text-left transition-colors',
          isActive
            ? 'border border-primary/30 bg-muted/70 hover:bg-card/60 hover:border-primary/50'
            : 'border border-primary/20 bg-card/50 hover:bg-card/60 hover:border-primary/50',
          totalColumns > 1 && 'inset-y-0.5'
        )}
        style={{
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
            <CardHeader className="px-3 py-2.5 gap-0.5 cursor-default">
              <MorphingDialogTitle>
                <CardTitle>
                  <JiraIssueKeyBadge issueKey={issueKey} />
                </CardTitle>
              </MorphingDialogTitle>
              <MorphingDialogSubtitle>
                <CardDescription className="text-xs truncate">
                  {entry.issue.summary ?? ''}
                </CardDescription>
              </MorphingDialogSubtitle>
            </CardHeader>
            <TimelineEntryDialogForm entry={entry} issues={issues} />
          </ScrollArea>
        </MorphingDialogContent>
      </MorphingDialogContainer>
    </MorphingDialog>
  );
}
