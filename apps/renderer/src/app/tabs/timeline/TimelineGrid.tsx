import * as React from 'react';
import type { TimeEntryUpdates } from '@time-tracker/utils';
import { InView, type ComboboxSelectItem } from '@time-tracker/ui';
import {
  QUARTER_HOUR_ROWS,
  type EntryWithLayout,
  formatSelection,
  type FormattedSelection,
} from './timeline-utils';
import { CurrentTimeIndicator } from './CurrentTimeIndicator';
import { TimelineEntryDialog } from './TimelineEntryDialog';
import { TimelineTimeLabels } from './TimelineTimeLabels';
import { TimelineSelectionHighlight } from './TimelineSelectionHighlight';
import { Selection } from './use-timeline-drag';

interface TimelineGridProps {
  olRef: React.RefObject<HTMLOListElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  entriesWithLayout: EntryWithLayout[];
  selection: Selection | null;
  isDragging: boolean;
  hoveredRow: number | null;
  isToday: boolean;
  date: Date;
  issues: ComboboxSelectItem[];
  onPointerDown: (e: React.PointerEvent<HTMLOListElement>) => void;
  onPointerMove: (e: React.PointerEvent<HTMLOListElement>) => void;
  onPointerUp: (e: React.PointerEvent<HTMLOListElement>) => void;
  onPointerLeave: () => void;
  onSaveEntry: (entryId: string, updates: TimeEntryUpdates) => Promise<void>;
  onDeleteEntry: (entryId: string) => Promise<void>;
  onResumeTimer?: (issueKey: string) => Promise<void>;
  onOpenInJira?: (issueKey: string) => void;
  onCreateEntry: (issueKey: string) => void | Promise<void>;
  onClearSelection: () => void;
}

export function TimelineGrid({
  olRef,
  containerRef,
  entriesWithLayout,
  selection,
  isDragging,
  hoveredRow,
  isToday,
  date,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerLeave,
  onSaveEntry,
  onDeleteEntry,
  onCreateEntry,
  onClearSelection,
  issues,
}: TimelineGridProps) {
  const formattedSelection = React.useMemo(() => {
    if (!selection) return null;

    return formatSelection(selection, date);
  }, [selection, date]);

  const formattedHover: FormattedSelection | null = React.useMemo(() => {
    if (hoveredRow == null || selection) return null;
    return formatSelection({ startRow: hoveredRow, endRow: hoveredRow }, date);
  }, [hoveredRow, selection, date]);

  return (
    <div ref={containerRef}>
      <div className="flex w-full flex-auto">
        {/* Gutter spacer for time labels */}
        <div className="w-14 flex-none" />

        {/* Grid container */}
        <div className="grid flex-auto grid-cols-1 grid-rows-1">
          {/* Grid A: horizontal lines + time labels */}
          <TimelineTimeLabels />

          {/* Grid B: events overlay */}
          <ol
            ref={olRef}
            className="relative col-start-1 col-end-2 row-start-1"
            style={{
              display: 'grid',
              gridTemplateRows: `repeat(${QUARTER_HOUR_ROWS}, minmax(0, 1fr))`,
              gridTemplateColumns: '1fr',
            }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerLeave}
          >
            {/* Hover highlight (renders behind entries) */}
            {formattedHover && (
              <TimelineSelectionHighlight
                variant="hover"
                formattedSelection={formattedHover}
              />
            )}

            {entriesWithLayout.map(
              ({ entry, gridRowStart, gridRowSpan, column, totalColumns }) => {
                const isActive = entry.timeSpentSeconds == null;

                return (
                  <InView
                    key={entry.id}
                    as="li"
                    variants={{
                      hidden: { opacity: 0, scale: 0.8 },
                      visible: { opacity: 1, scale: 1 },
                    }}
                    viewOptions={{ margin: '-120px 0px -24px 0px' }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="pointer-events-none relative"
                    style={{
                      gridRow: `${gridRowStart} / span ${gridRowSpan}`,
                      gridColumn: '1',
                    }}
                  >
                    <TimelineEntryDialog
                      entry={entry}
                      issues={issues}
                      gridRowSpan={gridRowSpan}
                      column={column}
                      totalColumns={totalColumns}
                      isActive={isActive}
                      onSave={onSaveEntry}
                      onDelete={onDeleteEntry}
                      onOpen={onClearSelection}
                    />
                  </InView>
                );
              }
            )}

            {/* Drag-to-select highlight */}
            {formattedSelection && (
              <TimelineSelectionHighlight
                formattedSelection={formattedSelection}
                isDragging={isDragging}
                issues={issues}
                onCreateEntry={onCreateEntry}
                onClearSelection={onClearSelection}
              />
            )}

            {/* Current time indicator */}
            {isToday && <CurrentTimeIndicator />}
          </ol>
        </div>
      </div>
    </div>
  );
}
