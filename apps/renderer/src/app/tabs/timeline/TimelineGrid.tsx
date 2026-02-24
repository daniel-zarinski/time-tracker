import * as React from 'react';
import { cn } from '@time-tracker/utils';
import type { TimeEntryWithIssue } from '@time-tracker/database';
import {
  HALF_HOUR_ROWS,
  QUARTER_HOUR_ROWS,
  formatHour,
  formatEntryTime,
  gridRowToTime,
  type EntryWithLayout,
} from './timeline-utils';
import type { Selection } from './use-timeline-drag';
import { CurrentTimeIndicator } from './CurrentTimeIndicator';

interface TimelineGridProps {
  olRef: React.RefObject<HTMLOListElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  entriesWithLayout: EntryWithLayout[];
  selection: Selection | null;
  isToday: boolean;
  date: Date;
  onPointerDown: (e: React.PointerEvent<HTMLOListElement>) => void;
  onPointerMove: (e: React.PointerEvent<HTMLOListElement>) => void;
  onPointerUp: (e: React.PointerEvent<HTMLOListElement>) => void;
  onEntryClick: (issue: TimeEntryWithIssue['issue']) => void;
  onClearSelection: () => void;
}

export function TimelineGrid({
  olRef,
  containerRef,
  entriesWithLayout,
  selection,
  isToday,
  date,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onEntryClick,
  onClearSelection,
}: TimelineGridProps) {
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
                        onEntryClick(entry.issue);
                      }}
                      className={cn(
                        'pointer-events-auto absolute inset-y-0.5 inset-x-[9px] max-w-[75%] overflow-hidden rounded-lg border px-2 pt-0 pb-2 text-left transition-colors',
                        isActive
                          ? 'border-l-4 border-accent bg-primary/15 animate-pulse'
                          : 'border border-primary/20 bg-primary/10 hover:bg-primary/15',
                        totalColumns > 1 && 'inset-y-0.5'
                      )}
                      style={
                        totalColumns > 1
                          ? {
                              left: `calc(${
                                (column / totalColumns) * 100
                              }% + 0.25rem)`,
                              right: `calc(${
                                ((totalColumns - column - 1) / totalColumns) *
                                100
                              }% + 0.25rem)`,
                            }
                          : undefined
                      }
                    >
                      <p className="truncate text-xs text-primary">
                        <span className="font-semibold">
                          {entry.issue.key ?? entry.issueKey}
                        </span>
                        {entry.issue.summary && (
                          <span className="ml-1.5 text-primary/60">
                            {entry.issue.summary}
                          </span>
                        )}
                      </p>
                      {gridRowSpan >= 3 && (
                        <p className="mt-0.5 text-[10px] text-primary/60">
                          {formatEntryTime(new Date(entry.startedAt))}
                        </p>
                      )}
                    </button>
                  </li>
                );
              }
            )}

            {/* Drag-to-select highlight */}
            {selection &&
              (() => {
                const minRow = Math.min(selection.startRow, selection.endRow);
                const maxRow = Math.max(selection.startRow, selection.endRow);
                const span = maxRow - minRow + 1;
                const startTime = gridRowToTime(minRow, date);
                const endTime = gridRowToTime(maxRow + 1, date);
                const totalMinutes = span * 15;
                const hours = Math.floor(totalMinutes / 60);
                const minutes = totalMinutes % 60;
                const duration =
                  hours > 0
                    ? minutes > 0
                      ? `${hours}h ${minutes}m`
                      : `${hours}h`
                    : `${minutes}m`;
                return (
                  <li
                    className="pointer-events-none relative z-10"
                    style={{
                      gridRow: `${minRow} / span ${span}`,
                      gridColumn: '1',
                    }}
                  >
                    <div className="absolute inset-y-1 inset-x-[9px] flex items-center justify-center rounded-lg border border-dashed border-primary/40 bg-primary/10">
                      <span className="text-xs font-medium text-primary/70">
                        {formatEntryTime(startTime)} –{' '}
                        {formatEntryTime(endTime)} ({duration})
                      </span>
                    </div>
                  </li>
                );
              })()}

            {/* Current time indicator */}
            {isToday && <CurrentTimeIndicator />}
          </ol>
        </div>
      </div>
    </div>
  );
}
