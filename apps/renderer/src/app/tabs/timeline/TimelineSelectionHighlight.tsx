import type { ComboboxSelectItem } from '@time-tracker/ui';
import { formatEntryTime } from './timeline-utils';
import { TimelineCreatePopover } from './TimelineCreatePopover';

interface FormattedSelection {
  minRow: number;
  span: number;
  startTime: Date;
  endTime: Date;
  duration: string;
}

interface TimelineSelectionHighlightProps {
  formattedSelection: FormattedSelection;
  isDragging: boolean;
  issues: ComboboxSelectItem[];
  onCreateEntry: (issueKey: string) => void | Promise<void>;
  onClearSelection: () => void;
}

export function TimelineSelectionHighlight({
  formattedSelection,
  isDragging,
  issues,
  onCreateEntry,
  onClearSelection,
}: TimelineSelectionHighlightProps) {
  return (
    <li
      className="pointer-events-none relative z-10"
      style={{
        gridRow: `${formattedSelection.minRow} / span ${formattedSelection.span}`,
        gridColumn: '1',
      }}
    >
      <div className="pointer-events-auto absolute inset-y-1 inset-x-[22px] flex items-center justify-center rounded-lg border border-dashed border-primary/40 bg-primary/10">
        <span className="text-xs font-medium text-primary/70">
          {formatEntryTime(formattedSelection.startTime)} –{' '}
          {formatEntryTime(formattedSelection.endTime)} (
          {formattedSelection.duration})
        </span>
        {!isDragging && (
          <TimelineCreatePopover
            issues={issues}
            onSubmit={onCreateEntry}
            onCancel={onClearSelection}
          />
        )}
      </div>
    </li>
  );
}
