import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@time-tracker/ui';
import { cn } from '@time-tracker/utils';
import type { TimeEntryWithIssue } from '@time-tracker/database';
import { useAppStore } from '../store';

// --- Constants ---
const HALF_HOUR_ROWS = 48;
const QUARTER_HOUR_ROWS = 96;
const QUARTER_MS = 15 * 60 * 1000;

// --- Types ---
interface GridPosition {
  gridRowStart: number;
  gridRowSpan: number;
}

interface EntryWithGrid extends GridPosition {
  entry: TimeEntryWithIssue;
}

interface EntryWithLayout extends EntryWithGrid {
  column: number;
  totalColumns: number;
}

// --- Helpers ---

function getDayBounds(date: Date) {
  const y = date.getFullYear();
  const m = date.getMonth();
  const d = date.getDate();
  return {
    start: new Date(y, m, d, 0, 0, 0).getTime(),
    end: new Date(y, m, d + 1, 0, 0, 0).getTime(),
  };
}

function getEntriesWithGrid(
  entries: TimeEntryWithIssue[],
  date: Date
): EntryWithGrid[] {
  const { start: dayStart, end: dayEnd } = getDayBounds(date);
  const result: EntryWithGrid[] = [];

  for (const entry of entries) {
    const entryStart = new Date(entry.startedAt).getTime();
    if (Number.isNaN(entryStart)) continue;

    const entryEnd =
      entry.timeSpentSeconds == null
        ? Date.now()
        : entryStart + entry.timeSpentSeconds * 1000;

    if (entryEnd <= dayStart || entryStart >= dayEnd) continue;

    const visibleStart = Math.max(entryStart, dayStart);
    const visibleEnd = Math.min(entryEnd, dayEnd);

    const gridRowStart =
      1 + Math.floor((visibleStart - dayStart) / QUARTER_MS);
    const gridRowSpan = Math.max(
      1,
      Math.ceil((visibleEnd - visibleStart) / QUARTER_MS)
    );

    result.push({ entry, gridRowStart, gridRowSpan });
  }

  return result;
}

function collides(a: GridPosition, b: GridPosition): boolean {
  return (
    a.gridRowStart < b.gridRowStart + b.gridRowSpan &&
    b.gridRowStart < a.gridRowStart + a.gridRowSpan
  );
}

function computeEntryLayout(
  entriesWithGrid: EntryWithGrid[]
): EntryWithLayout[] {
  if (!entriesWithGrid.length) return [];

  const indexed = entriesWithGrid
    .map((item, originalIndex) => ({ ...item, originalIndex }))
    .sort((a, b) =>
      a.gridRowStart !== b.gridRowStart
        ? a.gridRowStart - b.gridRowStart
        : a.gridRowStart + a.gridRowSpan - (b.gridRowStart + b.gridRowSpan)
    );

  const layoutMap = new Map<number, { column: number; totalColumns: number }>();
  const columns: Array<Array<GridPosition & { originalIndex: number }>> = [];
  let lastEnd: number | null = null;

  const flush = () => {
    const n = columns.length;
    columns.forEach((col, colIdx) =>
      col.forEach((item) =>
        layoutMap.set(item.originalIndex, { column: colIdx, totalColumns: n })
      )
    );
    columns.length = 0;
    lastEnd = null;
  };

  for (const ev of indexed) {
    const evEnd = ev.gridRowStart + ev.gridRowSpan;
    if (lastEnd !== null && ev.gridRowStart >= lastEnd) flush();

    const colIdx = columns.findIndex(
      (col) => !collides(col[col.length - 1], ev)
    );
    if (colIdx >= 0) columns[colIdx].push(ev);
    else columns.push([ev]);

    lastEnd = lastEnd === null || evEnd > lastEnd ? evEnd : lastEnd;
  }
  if (columns.length) flush();

  return entriesWithGrid.map((item, i) => ({
    ...item,
    ...(layoutMap.get(i) ?? { column: 0, totalColumns: 1 }),
  }));
}

function getWeekDays(date: Date): Date[] {
  const d = new Date(date);
  const day = d.getDay();
  // Monday = 0 offset, Sunday = 6 offset
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + mondayOffset);
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    return day;
  });
}

function formatHour(hour: number): string {
  if (hour === 0 || hour === 24) return '12AM';
  if (hour === 12) return '12PM';
  if (hour < 12) return `${hour}AM`;
  return `${hour - 12}PM`;
}

function formatEntryTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

const DAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// --- Component ---

function gridRowToTime(row: number, date: Date): Date {
  const quarterIndex = row - 1;
  const totalMinutes = quarterIndex * 15;
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    Math.floor(totalMinutes / 60),
    totalMinutes % 60
  );
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function TimelineTab() {
  const setSelectedIssue = useAppStore.use.setSelectedIssue();
  const [date, setDate] = React.useState(() => new Date());
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Drag-to-select state
  const [selection, setSelection] = React.useState<{
    startRow: number;
    endRow: number;
  } | null>(null);
  const draggingRef = React.useRef(false);
  const olRef = React.useRef<HTMLOListElement>(null);

  const { data: entries = [] } = useQuery({
    queryKey: ['time-entries'],
    queryFn: () => window.database.getTimeEntries(),
    retry: false,
  });

  const entriesWithGrid = React.useMemo(
    () => getEntriesWithGrid(entries, date),
    [entries, date]
  );

  const entriesWithLayout = React.useMemo(
    () => computeEntryLayout(entriesWithGrid),
    [entriesWithGrid]
  );

  const weekDays = React.useMemo(() => getWeekDays(date), [date]);
  const today = React.useMemo(() => new Date(), []);
  const isToday = isSameDay(date, today);

  const nav = React.useCallback(
    (delta: number) => {
      const next = new Date(date);
      next.setDate(next.getDate() + delta);
      setDate(next);
    },
    [date]
  );

  const navWeek = React.useCallback(
    (delta: number) => {
      const next = new Date(date);
      next.setDate(next.getDate() + delta * 7);
      setDate(next);
    },
    [date]
  );

  // Clear selection on date change
  React.useEffect(() => {
    setSelection(null);
  }, [date]);

  // Clear selection on Escape
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelection(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Convert clientY to grid row number (2–97)
  // Use Grid A's geometry (no header offset) since it aligns with time labels
  const clientYToRow = React.useCallback((clientY: number): number => {
    const ol = olRef.current;
    if (!ol) return 2;
    const relativeY = clientY - ol.getBoundingClientRect().top;
    const quarterHeight = ol.clientHeight / QUARTER_HOUR_ROWS;
    return clamp(Math.floor(relativeY / quarterHeight) + 1, 1, 96);
  }, []);

  const handlePointerDown = React.useCallback(
    (e: React.PointerEvent<HTMLOListElement>) => {
      // Don't start drag if clicking an entry button
      if ((e.target as HTMLElement).closest('button')) return;
      e.preventDefault();
      const row = clientYToRow(e.clientY);
      setSelection({ startRow: row, endRow: row });
      draggingRef.current = true;
      olRef.current?.setPointerCapture(e.pointerId);
    },
    [clientYToRow]
  );

  const handlePointerMove = React.useCallback(
    (e: React.PointerEvent<HTMLOListElement>) => {
      if (!draggingRef.current) return;
      const row = clientYToRow(e.clientY);
      setSelection((prev) =>
        prev ? { ...prev, endRow: row } : null
      );
    },
    [clientYToRow]
  );

  const handlePointerUp = React.useCallback(
    (e: React.PointerEvent<HTMLOListElement>) => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      olRef.current?.releasePointerCapture(e.pointerId);
    },
    []
  );

  // Auto-scroll to current time on mount / date change
  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Find the scrollable TabsContent ancestor
    const scrollParent = container.closest('[data-slot="tabs-content"]');
    if (!scrollParent) return;

    const now = new Date();
    let scrollHour: number;

    if (isSameDay(date, now)) {
      scrollHour = Math.max(0, now.getHours() - 1);
    } else {
      scrollHour = 8;
    }

    const pxPerHalfHour = 44.8; // 2.8rem * 16px
    const scrollTarget = scrollHour * 2 * pxPerHalfHour;

    requestAnimationFrame(() => {
      scrollParent.scrollTop = scrollTarget;
    });
  }, [date]);

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background px-4 py-3">
        <div className="flex items-center gap-1">
          <h2 className="text-sm font-semibold">
            {date.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </h2>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => nav(-1)}>
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDate(new Date())}
          >
            Today
          </Button>
          <Button variant="ghost" size="icon" onClick={() => nav(1)}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      {/* Week day selector */}
      <div className="sticky top-[49px] z-30 flex items-center border-b border-border bg-background px-2 py-2">
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={() => navWeek(-1)}
        >
          <ChevronLeft className="size-3.5" />
        </Button>
        <div className="flex flex-1 justify-around">
          {weekDays.map((d, i) => {
            const isSelected = isSameDay(d, date);
            const isDayToday = isSameDay(d, today);
            return (
              <button
                key={i}
                onClick={() => setDate(d)}
                className={cn(
                  'flex flex-col items-center gap-0.5 rounded-lg px-2 py-1 text-xs transition-colors',
                  !isSelected && !isDayToday && 'text-foreground hover:bg-muted',
                  !isSelected && isDayToday && 'text-primary hover:bg-muted',
                  isSelected && 'bg-primary text-primary-foreground'
                )}
              >
                <span className="font-medium">{DAY_LETTERS[i]}</span>
                <span
                  className={cn(
                    'flex size-6 items-center justify-center rounded-full text-xs font-semibold',
                    isSelected && 'bg-primary-foreground/20'
                  )}
                >
                  {d.getDate()}
                </span>
              </button>
            );
          })}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={() => navWeek(1)}
        >
          <ChevronRight className="size-3.5" />
        </Button>
      </div>

      {/* Calendar grid */}
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
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
            >
              {entriesWithLayout.map(
                ({
                  entry,
                  gridRowStart,
                  gridRowSpan,
                  column,
                  totalColumns,
                }) => (
                  <li
                    key={entry.id}
                    className="relative"
                    style={{
                      gridRow: `${gridRowStart} / span ${gridRowSpan}`,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setSelection(null);
                        setSelectedIssue(entry.issue);
                      }}
                      className={cn(
                        'absolute inset-y-1 inset-x-[9px] overflow-hidden rounded-lg border border-primary/20 bg-primary/10 p-2 text-left transition-colors hover:bg-primary/15',
                        totalColumns > 1 && 'inset-y-1'
                      )}
                      style={
                        totalColumns > 1
                          ? {
                              left: `calc(${(column / totalColumns) * 100}% + 0.25rem)`,
                              right: `calc(${((totalColumns - column - 1) / totalColumns) * 100}% + 0.25rem)`,
                            }
                          : undefined
                      }
                    >
                      <p className="truncate text-xs font-semibold text-primary">
                        {entry.issue.key ?? entry.issueKey}
                      </p>
                      {gridRowSpan >= 2 && (
                        <p className="truncate text-[10px] text-primary/70">
                          {entry.issue.summary ?? ''}
                        </p>
                      )}
                      {gridRowSpan >= 3 && (
                        <p className="mt-0.5 text-[10px] text-primary/60">
                          {formatEntryTime(new Date(entry.startedAt))}
                        </p>
                      )}
                    </button>
                  </li>
                )
              )}

              {/* Drag-to-select highlight */}
              {selection && (() => {
                const minRow = Math.min(selection.startRow, selection.endRow);
                const maxRow = Math.max(selection.startRow, selection.endRow);
                const span = maxRow - minRow + 1;
                const startTime = gridRowToTime(minRow, date);
                const endTime = gridRowToTime(maxRow + 1, date);
                const totalMinutes = span * 15;
                const hours = Math.floor(totalMinutes / 60);
                const minutes = totalMinutes % 60;
                const duration = hours > 0
                  ? minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
                  : `${minutes}m`;
                return (
                  <li
                    className="pointer-events-none relative z-10"
                    style={{ gridRow: `${minRow} / span ${span}` }}
                  >
                    <div className="absolute inset-y-1 inset-x-[9px] flex items-center justify-center rounded-lg border border-dashed border-primary/40 bg-primary/10">
                      <span className="text-xs font-medium text-primary/70">
                        {formatEntryTime(startTime)} – {formatEntryTime(endTime)} ({duration})
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
    </div>
  );
}

function CurrentTimeIndicator() {
  const [now, setNow] = React.useState(() => new Date());

  React.useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const hours = now.getHours();
  const minutes = now.getMinutes();
  const quarterSlot = hours * 4 + Math.floor(minutes / 15);
  const gridRow = quarterSlot + 1;

  return (
    <li
      className="pointer-events-none relative z-20"
      style={{ gridRow: `${gridRow} / span 1` }}
    >
      <div className="absolute inset-x-0 top-0 flex items-center">
        <div className="size-2 rounded-full bg-red-500" />
        <div className="h-px flex-1 bg-red-500" />
      </div>
    </li>
  );
}
