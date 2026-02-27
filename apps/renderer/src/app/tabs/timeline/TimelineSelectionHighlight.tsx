import type { ComboboxSelectItem } from '@time-tracker/ui';
import { type FormattedSelection, formatEntryTime } from './timeline-utils';
import { TimelineCreatePopover } from './TimelineCreatePopover';

type SelectionVariantProps = {
  variant?: 'selection';
  formattedSelection: FormattedSelection;
  isDragging: boolean;
  issues: ComboboxSelectItem[];
  onCreateEntry: (issueKey: string) => void | Promise<void>;
  onClearSelection: () => void;
};

type HoverVariantProps = {
  variant: 'hover';
  formattedSelection: FormattedSelection;
};

type TimelineSelectionHighlightProps =
  | SelectionVariantProps
  | HoverVariantProps;

export function TimelineSelectionHighlight(
  props: TimelineSelectionHighlightProps
) {
  const { formattedSelection } = props;
  const isHover = props.variant === 'hover';

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
        {!isHover && !props.isDragging && (
          <TimelineCreatePopover
            issues={props.issues}
            onSubmit={props.onCreateEntry}
            onCancel={props.onClearSelection}
          />
        )}
      </div>
    </li>
  );
}
