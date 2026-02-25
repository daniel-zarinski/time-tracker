import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ComboboxSelectItem } from '@time-tracker/ui';
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

  const queryClient = useQueryClient();

  const {
    selection,
    isDragging,
    clearSelection,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  } = useTimelineDrag(olRef);

  const { data: entries = [] } = useQuery({
    queryKey: ['time-entries'],
    queryFn: () => window.database.getTimeEntries(),
    retry: false,
  });

  const { data: jiraIssues = [] } = useQuery({
    queryKey: ['jira', 'my-issues'],
    queryFn: () => window.database.getMyJiraIssues(),
    retry: false,
  });

  const issueItems: ComboboxSelectItem[] = React.useMemo(
    () =>
      jiraIssues
        .filter((i) => i.key != null)
        .map((i) => ({
          value: i.key!,
          label: i.key!,
          description: i.summary ?? undefined,
        })),
    [jiraIssues]
  );

  const createEntryMutation = useMutation({
    mutationFn: async (issueKey: string) => {
      if (!selection) return;
      const sel = formatSelection(selection, date);
      const entry = await window.timeTracking.startTracking(issueKey);
      const timeSpentSeconds = Math.round(
        (sel.endTime.getTime() - sel.startTime.getTime()) / 1000
      );
      await window.database.updateTimeEntry(entry.id, {
        startedAt: sel.startTime,
        timeSpentSeconds,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
      clearSelection();
    },
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
        isDragging={isDragging}
        isToday={isToday}
        date={date}
        issues={issueItems}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onEntryClick={(entry) => setSelectedTimeEntry(entry, { view: 'edit' })}
        onCreateEntry={(issueKey) => createEntryMutation.mutate(issueKey)}
        onClearSelection={clearSelection}
      />
    </div>
  );
}
