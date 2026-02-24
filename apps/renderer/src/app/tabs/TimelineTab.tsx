import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button, Card, ScrollArea } from '@time-tracker/ui';
import { formatTime } from '@time-tracker/utils';
import type { TimeEntryWithIssue } from '@time-tracker/database';
import { useAppStore } from '../store';

const SLOT_MINUTES = 15;
const DAY_START_HOUR = 6;
const DAY_END_HOUR = 22;
const SLOT_COUNT = ((DAY_END_HOUR - DAY_START_HOUR) * 60) / SLOT_MINUTES;
const ROW_HEIGHT = 24;
const SLOT_MS = SLOT_MINUTES * 60 * 1000;

const slotToDate = (i: number) =>
  new Date(
    2000,
    0,
    1,
    DAY_START_HOUR + Math.floor((i * SLOT_MINUTES) / 60),
    (i * SLOT_MINUTES) % 60
  );

interface SlotSpan {
  minSlot: number;
  span: number;
}

interface EntryWithSlots extends SlotSpan {
  entry: TimeEntryWithIssue;
}

interface EntryWithLayout extends EntryWithSlots {
  column: number;
  totalColumns: number;
}

function getDayBounds(date: Date) {
  const y = date.getFullYear();
  const m = date.getMonth();
  const d = date.getDate();
  return {
    start: new Date(y, m, d, DAY_START_HOUR, 0, 0).getTime(),
    end: new Date(y, m, d, DAY_END_HOUR, 0, 0).getTime(),
  };
}

function getEntriesWithSlots(
  entries: TimeEntryWithIssue[],
  date: Date
): EntryWithSlots[] {
  const { start: dayStart, end: dayEnd } = getDayBounds(date);
  const result: EntryWithSlots[] = [];

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
    const minSlot = Math.floor((visibleStart - dayStart) / SLOT_MS);
    const span = Math.ceil((visibleEnd - visibleStart) / SLOT_MS);
    if (span < 1) continue;

    result.push({
      entry,
      minSlot: Math.max(0, Math.min(SLOT_COUNT - 1, minSlot)),
      span: Math.max(1, Math.min(SLOT_COUNT - minSlot, span)),
    });
  }

  return result;
}

function collides(a: SlotSpan, b: SlotSpan): boolean {
  return a.minSlot < b.minSlot + b.span && b.minSlot < a.minSlot + a.span;
}

function computeEntryLayout(
  entriesWithSlots: EntryWithSlots[]
): EntryWithLayout[] {
  if (!entriesWithSlots.length) return [];

  const indexed = entriesWithSlots
    .map((item, originalIndex) => ({ ...item, originalIndex }))
    .sort((a, b) =>
      a.minSlot !== b.minSlot
        ? a.minSlot - b.minSlot
        : a.minSlot + a.span - (b.minSlot + b.span)
    );

  const layoutMap = new Map<number, { column: number; totalColumns: number }>();
  const columns: Array<Array<SlotSpan & { originalIndex: number }>> = [];
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
    const evEnd = ev.minSlot + ev.span;
    if (lastEnd !== null && ev.minSlot >= lastEnd) flush();

    const colIdx = columns.findIndex(
      (col) => !collides(col[col.length - 1], ev)
    );
    if (colIdx >= 0) columns[colIdx].push(ev);
    else columns.push([ev]);

    lastEnd = lastEnd === null || evEnd > lastEnd ? evEnd : lastEnd;
  }
  if (columns.length) flush();

  return entriesWithSlots.map((item, i) => ({
    ...item,
    ...(layoutMap.get(i) ?? { column: 0, totalColumns: 1 }),
  }));
}

export function TimelineTab() {
  const setSelectedIssue = useAppStore.use.setSelectedIssue();
  const [date, setDate] = React.useState(() => new Date());

  const { data: entries = [] } = useQuery({
    queryKey: ['time-entries'],
    queryFn: () => window.database.getTimeEntries(),
    retry: false,
  });

  const entriesWithSlots = React.useMemo(
    () => getEntriesWithSlots(entries, date),
    [entries, date]
  );

  const entriesWithLayout = React.useMemo(
    () => computeEntryLayout(entriesWithSlots),
    [entriesWithSlots]
  );

  const gridRef = React.useRef<HTMLDivElement>(null);
  const firstRowRef = React.useRef<HTMLDivElement>(null);
  const [slotHeight, setSlotHeight] = React.useState(ROW_HEIGHT);
  const dragRef = React.useRef<{ start: number; end: number } | null>(null);
  const [drag, setDrag] = React.useState<{ start: number; end: number } | null>(
    null
  );
  const setDragState = React.useCallback(
    (v: { start: number; end: number } | null) => {
      dragRef.current = v;
      setDrag(v);
    },
    []
  );

  React.useLayoutEffect(() => {
    const firstRow = firstRowRef.current;
    if (firstRow) {
      const height = firstRow.getBoundingClientRect().height;
      setSlotHeight(height);
    }
  }, []);

  const getSlot = React.useCallback((clientY: number) => {
    const firstRow = firstRowRef.current;
    if (!firstRow) return 0;
    const rowRect = firstRow.getBoundingClientRect();
    const relativeY = clientY - rowRect.top;
    const rowHeight = rowRect.height;
    const slot = Math.floor(relativeY / rowHeight);
    return Math.max(0, Math.min(SLOT_COUNT - 1, slot));
  }, []);

  const nav = React.useCallback(
    (delta: number) => {
      const next = new Date(date);
      next.setDate(next.getDate() + delta);
      setDate(next);
    },
    [date]
  );

  const preview: SlotSpan | null = drag
    ? {
        minSlot: Math.min(drag.start, drag.end),
        span: Math.abs(drag.end - drag.start) + 1,
      }
    : null;
  const isToday = date.toDateString() === new Date().toDateString();

  return (
    <div className="w-full max-w-2xl mx-auto p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => nav(-1)}>
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => nav(1)}>
            <ChevronRight className="size-4" />
          </Button>
          <span className="text-sm font-medium">
            {isToday
              ? 'Today'
              : date.toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
          </span>
          <span className="text-sm text-muted-foreground">
            {date.toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setDate(new Date())}>
          Today
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-10rem)]">
        <div
          ref={gridRef}
          className="relative min-w-[200px] select-none"
          onPointerMove={(e) => {
            const d = dragRef.current;
            if (d) setDragState({ ...d, end: getSlot(e.clientY) });
          }}
          onPointerUp={() => setDragState(null)}
          onPointerCancel={() => setDragState(null)}
        >
          <div className="flex flex-col">
            {Array.from({ length: SLOT_COUNT }, (_, i) => (
              <div
                key={i}
                ref={i === 0 ? firstRowRef : undefined}
                className="flex items-stretch border-b border-border/50"
                style={{ minHeight: ROW_HEIGHT }}
              >
                <span className="w-20 shrink-0 py-0.5 text-sm text-muted-foreground">
                  {i % 2 === 0 ? formatTime(slotToDate(i)) : ''}
                </span>
                <div
                  className="flex-1 cursor-crosshair"
                  onPointerDown={(e) => {
                    if (e.button !== 0) return;
                    gridRef.current?.setPointerCapture(e.pointerId);
                    const slot = getSlot(e.clientY);
                    setDragState({ start: slot, end: slot });
                  }}
                />
              </div>
            ))}
          </div>

          {entriesWithLayout.map(
            ({ entry, minSlot, span, column, totalColumns }) => (
              <Card
                key={entry.id}
                className="absolute z-10 cursor-pointer border-border bg-card py-1 px-2 hover:bg-card/80 hover:border-primary/30 transition-colors"
                style={{
                  top: minSlot * slotHeight,
                  height: span * slotHeight,
                  left: `calc(5rem + ${column} * (100% - 5rem) / ${totalColumns})`,
                  width: `calc((100% - 5rem) / ${totalColumns})`,
                }}
                onClick={() => setSelectedIssue(entry.issue)}
              >
                <div className="min-w-0 flex-1 flex flex-col gap-0.5 overflow-hidden h-full">
                  <span className="text-xs font-medium text-foreground line-clamp-1">
                    {entry.issue.key ?? entry.issueKey}
                  </span>
                  {span >= 2 && (
                    <span className="text-[10px] text-muted-foreground line-clamp-2">
                      {entry.issue.summary ?? ''}
                    </span>
                  )}
                </div>
              </Card>
            )
          )}

          {preview && (
            <Card
              className="absolute left-20 right-0 z-20 border-primary/50 bg-primary/10 py-1 px-2 pointer-events-none"
              style={{
                top: preview.minSlot * slotHeight,
                height: preview.span * slotHeight,
              }}
            >
              <span className="text-sm text-muted-foreground">
                {formatTime(slotToDate(preview.minSlot))} –{' '}
                {formatTime(slotToDate(preview.minSlot + preview.span))}
              </span>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
