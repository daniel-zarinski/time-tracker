import { type FormattedSelection, formatEntryTime } from './timeline-utils';
import { TimelineCreatePopover } from './TimelineCreatePopover';
import { useTimelineSelection } from './timeline-context';

interface TimelineSelectionHighlightProps {
  formattedSelection: FormattedSelection;
  variant?: 'hover' | 'selection';
}

export function TimelineSelectionHighlight({
  formattedSelection,
  variant = 'selection',
}: TimelineSelectionHighlightProps) {
  const isHover = variant === 'hover';
  const { isDragging, issues, onCreateEntry, clearSelection } =
    useTimelineSelection();

  return (
    <li
      className={
        isHover
          ? 'pointer-events-none relative z-0'
          : 'pointer-events-none relative z-10'
      }
      style={{
        gridRow: `${formattedSelection.minRow} / span ${formattedSelection.span}`,
        gridColumn: '1',
      }}
    >
      <div
        className={
          isHover
            ? 'pointer-events-none absolute inset-y-1 inset-x-[22px] flex items-center justify-center rounded-lg border border-dashed border-muted-foreground/20 bg-muted/30'
            : 'pointer-events-auto absolute inset-y-1 inset-x-[22px] flex items-center justify-center rounded-lg border border-dashed border-primary/40 bg-primary/10'
        }
      >
        <span
          className={
            isHover
              ? 'text-xs font-medium text-muted-foreground/50'
              : 'text-xs font-medium text-primary/70'
          }
        >
          {formatEntryTime(formattedSelection.startTime)} –{' '}
          {formatEntryTime(formattedSelection.endTime)} (
          {formattedSelection.duration})
        </span>
        {!isHover && !isDragging && (
          <TimelineCreatePopover
            issues={issues}
            onSubmit={onCreateEntry}
            onCancel={clearSelection}
          />
        )}
      </div>
    </li>
  );
}
