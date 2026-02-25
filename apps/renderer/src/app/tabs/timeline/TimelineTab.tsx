import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '../../store';
import {
  getEntriesWithGrid,
  computeEntryLayout,
  getWeekDays,
  isSameDay,
  formatSelection,
} from './timeline-utils';
import { useTimelineDrag } from './use-timeline-drag';
import { TimelineHeader } from './TimelineHeader';
import { TimelineGrid } from './TimelineGrid';

export function TimelineTab() {
  const setSelectedTimeEntry = useAppStore.use.setSelectedTimeEntry();
  const [date, setDate] = React.useState(() => new Date());
  const containerRef = React.useRef<HTMLDivElement>(null);
  const olRef = React.useRef<HTMLOListElement>(null);

  const {
    selection,
    clearSelection,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  } = useTimelineDrag(olRef, (_event, payload) => {
    if (payload.type === 'pointerUp') {
      if (!payload.selection) return;
      console.log('selection', formatSelection(payload.selection, date));
    }
  });

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
    clearSelection();
  }, [date, clearSelection]);

  // Auto-scroll to current time on mount / date change
  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scrollParent = container.closest('[data-slot="tabs-content"]');
    if (!scrollParent) return;

    const now = new Date();
    const scrollHour = isSameDay(date, now)
      ? Math.max(0, now.getHours() - 1)
      : 8;

    const pxPerHalfHour = 44.8;
    const scrollTarget = scrollHour * 2 * pxPerHalfHour;

    requestAnimationFrame(() => {
      scrollParent.scrollTop = scrollTarget;
    });
  }, [date]);

  return (
    <div className="flex flex-col">
      <TimelineHeader
        date={date}
        today={today}
        weekDays={weekDays}
        onNav={nav}
        onNavWeek={navWeek}
        onSelectDay={setDate}
        onToday={() => setDate(new Date())}
      />
      <TimelineGrid
        olRef={olRef}
        containerRef={containerRef}
        entriesWithLayout={entriesWithLayout}
        selection={selection}
        isToday={isToday}
        date={date}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onEntryClick={(entry) => setSelectedTimeEntry(entry, { view: 'edit' })}
        onClearSelection={clearSelection}
      />
    </div>
  );
}
