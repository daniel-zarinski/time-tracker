import * as React from 'react';
import { cn } from '@time-tracker/utils';
import type { TimeEntryWithIssue } from '@time-tracker/database';
import type { ComboboxSelectItem } from '@time-tracker/ui';
import {
  HALF_HOUR_ROWS,
  QUARTER_HOUR_ROWS,
  formatHour,
  formatEntryTime,
  type EntryWithLayout,
  formatSelection,
} from './timeline-utils';
import { CurrentTimeIndicator } from './CurrentTimeIndicator';
import { TimelineCreatePopover } from './TimelineCreatePopover';
import { Selection } from './use-timeline-drag';

interface TimelineGridProps {
  olRef: React.RefObject<HTMLOListElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  entriesWithLayout: EntryWithLayout[];
  selection: Selection | null;
  isDragging: boolean;
  isToday: boolean;
  date: Date;
  issues: ComboboxSelectItem[];
  onPointerDown: (e: React.PointerEvent<HTMLOListElement>) => void;
  onPointerMove: (e: React.PointerEvent<HTMLOListElement>) => void;
  onPointerUp: (e: React.PointerEvent<HTMLOListElement>) => void;
  onEntryClick: (entry: TimeEntryWithIssue) => void;
  onCreateEntry: (issueKey: string) => void | Promise<void>;
  onClearSelection: () => void;
}

export function TimelineGrid({
  olRef,
  containerRef,
  entriesWithLayout,
  selection,
  isDragging,
  isToday,
  date,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onEntryClick,
  onCreateEntry,
  onClearSelection,
  issues,
}: TimelineGridProps) {
  const formattedSelection = React.useMemo(() => {
    if (!selection) return null;

    return formatSelection(selection, date);
  }, [selection, date]);

  return (
    <div ref={containerRef}>
      <div className="flex w-full flex-auto">
        {/* Gutter spacer for time labels */}
        <div className="w-14 flex-none" />

        {/* Grid container */}
        <div className="grid flex-auto grid-cols-1 grid-rows-1">
          {/* Grid A: horizontal lines + time labels */}
          <div
            className="col-start-1 col-end-2 row-start-1 divide-y divide-border/50"
            style={{
              display: 'grid',
              gridTemplateRows: `repeat(${HALF_HOUR_ROWS}, minmax(2.8rem, 1fr))`,
            }}
          >
            {Array.from({ length: HALF_HOUR_ROWS }, (_, i) => (
              <div key={i} className="relative">
                {i % 2 === 0 && (
                  <span className="sticky left-0 -ml-14 -mt-2.5 inline-block w-14 pr-2 text-right text-[10px] text-muted-foreground">
                    {formatHour(i / 2)}
                  </span>
                )}
              </div>
            ))}
          </div>

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
          >
            {entriesWithLayout.map(
              ({ entry, gridRowStart, gridRowSpan, column, totalColumns }) => {
                const isActive = entry.timeSpentSeconds == null;
                const entryEnd = entry.timeSpentSeconds
                  ? new Date(
                      new Date(entry.startedAt).getTime() +
                        entry.timeSpentSeconds * 1000
                    )
                  : null;

                const issueKey = entry.issue.key ?? entry.issueKey;

                return (
                  <li
                    key={entry.id}
                    className="pointer-events-none relative"
                    style={{
                      gridRow: `${gridRowStart} / span ${gridRowSpan}`,
                      gridColumn: '1',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        onClearSelection();
                        onEntryClick(entry);
                      }}
                      className={cn(
                        'pointer-events-auto absolute inset-y-0.5 inset-x-[22px] overflow-hidden rounded-lg border px-2 pt-0 pb-2 text-left transition-colors',
                        isActive
                          ? 'border-l-4 border-accent bg-primary/15 animate-pulse'
                          : 'border border-primary/20 bg-primary/10 hover:bg-primary/15',
                        totalColumns > 1 && 'inset-y-0.5'
                      )}
                      style={
                        totalColumns > 1
                          ? {
                              left: `calc(${(column / totalColumns) * 100}% + ${
                                column === 0 ? '22px' : '0.25rem'
                              })`,
                              right: `calc(${
                                ((totalColumns - column - 1) / totalColumns) *
                                100
                              }% + ${
                                column === totalColumns - 1 ? '22px' : '0.25rem'
                              })`,
                            }
                          : undefined
                      }
                    >
                      <p className="truncate text-xs text-primary flex items-center">
                        <span className="font-semibold">{issueKey}</span>
                        {entry.issue.summary && (
                          <span className="ml-1.5 text-primary/60">
                            {entry.issue.summary}
                          </span>
                        )}
                      </p>
                      {gridRowSpan >= 2 && (
                        <p className="mt-0.5 text-[10px] text-primary/60">
                          {formatEntryTime(new Date(entry.startedAt))}
                          {entryEnd ? ` - ${formatEntryTime(entryEnd)}` : ''}
                        </p>
                      )}
                    </button>
                  </li>
                );
              }
            )}

            {/* Drag-to-select highlight */}
            {formattedSelection && (
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
            )}

            {/* Current time indicator */}
            {isToday && <CurrentTimeIndicator />}
          </ol>
        </div>
      </div>
    </div>
  );
}
