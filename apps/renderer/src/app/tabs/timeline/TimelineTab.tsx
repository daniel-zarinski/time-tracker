import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  queryKeys,
  useJiraMyIssues,
  useTimeEntries,
  useTimeEntryMutations,
} from '@time-tracker/hooks';
import type { ComboboxSelectItem } from '@time-tracker/ui';
import * as React from 'react';
import { TimelineGrid } from './TimelineGrid';
import { TimelineHeader } from './TimelineHeader';
import { TimelineListView } from './TimelineListView';
import { TimelineView } from './timeline-types';
import {
  computeEntryLayout,
  formatSelection,
  getEntriesWithGrid,
  isSameDay,
} from './timeline-utils';
import { useTimelineDrag } from './use-timeline-drag';

export function TimelineTab() {
  const [date, setDate] = React.useState(() => new Date());
  const [view, setView] = React.useState(TimelineView.Timeline);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const olRef = React.useRef<HTMLOListElement>(null);

  const queryClient = useQueryClient();
  const { startTracking, stopTracking, deleteTimeEntry, updateTimeEntry } =
    useTimeEntryMutations();

  const {
    selection,
    isDragging,
    hoveredRow,
    clearSelection,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerLeave,
  } = useTimelineDrag(olRef);

  const { data: entries = [] } = useTimeEntries();
  const { data: jiraIssues = [] } = useJiraMyIssues();

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
      queryClient.invalidateQueries({ queryKey: queryKeys.timeEntries.all });
      clearSelection();
    },
  });

  const filteredEntries = React.useMemo(
    () => entries.filter((e) => isSameDay(new Date(e.startedAt), date)),
    [entries, date]
  );

  const entriesWithGrid = React.useMemo(
    () => getEntriesWithGrid(entries, date),
    [entries, date]
  );
  const entriesWithLayout = React.useMemo(
    () => computeEntryLayout(entriesWithGrid),
    [entriesWithGrid]
  );
  const today = React.useMemo(() => new Date(), []);
  const isToday = isSameDay(date, today);

  const previousWeek = React.useCallback(() => {
    const next = new Date(date);
    next.setDate(next.getDate() - 7);
    setDate(next);
  }, [date]);

  const nextWeek = React.useCallback(() => {
    const next = new Date(date);
    next.setDate(next.getDate() + 7);
    setDate(next);
  }, [date]);

  // Clear selection on date change
  React.useEffect(() => {
    clearSelection();
  }, [date, clearSelection]);

  // Auto-scroll to current time on mount / date change (timeline view only)
  React.useEffect(() => {
    if (view !== TimelineView.Timeline) return;

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
  }, [date, view]);

  return (
    <div className="flex flex-col">
      <TimelineHeader
        date={date}
        view={view}
        onViewChange={setView}
        onPreviousWeek={previousWeek}
        onNextWeek={nextWeek}
        onSelectDay={setDate}
      />
      {view === TimelineView.Timeline ? (
        <TimelineGrid
          olRef={olRef}
          containerRef={containerRef}
          entriesWithLayout={entriesWithLayout}
          selection={selection}
          isDragging={isDragging}
          hoveredRow={hoveredRow}
          isToday={isToday}
          date={date}
          issues={issueItems}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerLeave}
          onSaveEntry={async (entryId, updates) => {
            await updateTimeEntry.mutateAsync({
              entryId,
              updates: {
                startedAt: updates.startedAt,
                timeSpentSeconds: updates.timeSpentSeconds,
                description: updates.description,
              },
            });
          }}
          onDeleteEntry={async (id) => {
            await deleteTimeEntry.mutateAsync(id);
          }}
          onResumeTimer={async (key) => {
            await startTracking.mutateAsync(key);
          }}
          onOpenInJira={(key) => window.electron.openJiraExternal(key)}
          onCreateEntry={(issueKey) => createEntryMutation.mutate(issueKey)}
          onClearSelection={clearSelection}
        />
      ) : (
        <TimelineListView
          entries={filteredEntries}
          issues={issueItems}
          dateKey={date.toDateString()}
          onStopTracking={(id) => stopTracking.mutateAsync(id)}
          onStartTracking={(issueKey) => startTracking.mutateAsync(issueKey)}
          onUpdateEntry={(entryId, updates) =>
            updateTimeEntry.mutateAsync({
              entryId,
              updates: {
                startedAt: updates.startedAt,
                timeSpentSeconds: updates.timeSpentSeconds,
                description: updates.description,
              },
            })
          }
          onDeleteEntry={(id) => deleteTimeEntry.mutateAsync(id)}
          onOpenInJira={(issueKey) =>
            window.electron.openJiraExternal(issueKey)
          }
        />
      )}
    </div>
  );
}
