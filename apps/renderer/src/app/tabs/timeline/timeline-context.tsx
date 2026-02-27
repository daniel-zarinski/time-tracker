import type { TimeEntryWithIssue } from '@time-tracker/database';
import { useTimeEntryMutations } from '@time-tracker/hooks';
import type { ComboboxSelectItem } from '@time-tracker/ui';
import * as React from 'react';
import {
  type EntryWithLayout,
  type FormattedSelection,
  computeEntryLayout,
  formatSelection,
  getEntriesWithGrid,
  isSameDay,
} from './timeline-utils';
import { useTimelineDrag } from './use-timeline-drag';

interface TimelineContextValue {
  // Refs
  olRef: React.RefObject<HTMLOListElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  // Pointer handlers
  handlePointerDown: (e: React.PointerEvent<HTMLOListElement>) => void;
  handlePointerMove: (e: React.PointerEvent<HTMLOListElement>) => void;
  handlePointerUp: (e: React.PointerEvent<HTMLOListElement>) => void;
  handlePointerLeave: () => void;
  // Derived selection/hover
  formattedSelection: FormattedSelection | null;
  formattedHover: FormattedSelection | null;
  isDragging: boolean;
  clearSelection: () => void;
  // Entry data
  entriesWithLayout: EntryWithLayout[];
  issues: ComboboxSelectItem[];
  date: Date;
  // Entry action callbacks
  onCreateEntry: (issueKey: string) => void;
}

const TimelineContext = React.createContext<TimelineContextValue | null>(null);

interface TimelineProviderProps {
  date: Date;
  entries: TimeEntryWithIssue[];
  issues: ComboboxSelectItem[];
  children: React.ReactNode;
}

export function TimelineProvider({
  date,
  entries,
  issues,
  children,
}: TimelineProviderProps) {
  const olRef = React.useRef<HTMLOListElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

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

  const { createTimeEntry } = useTimeEntryMutations();

  // Compute layout
  const entriesWithGrid = React.useMemo(
    () => getEntriesWithGrid(entries, date),
    [entries, date]
  );
  const entriesWithLayout = React.useMemo(
    () => computeEntryLayout(entriesWithGrid),
    [entriesWithGrid]
  );

  // Derive formatted selection / hover
  const formattedSelection = React.useMemo(() => {
    if (!selection) return null;
    return formatSelection(selection, date);
  }, [selection, date]);

  const formattedHover: FormattedSelection | null = React.useMemo(() => {
    if (hoveredRow == null || selection) return null;

    const isOverEntry = entriesWithLayout.some(
      ({ gridRowStart, gridRowSpan }) =>
        hoveredRow >= gridRowStart &&
        hoveredRow < gridRowStart + gridRowSpan
    );
    if (isOverEntry) return null;

    return formatSelection({ startRow: hoveredRow, endRow: hoveredRow }, date);
  }, [hoveredRow, selection, date, entriesWithLayout]);

  const onCreateEntry = React.useCallback(
    (issueKey: string) => {
      if (!selection) return;
      const sel = formatSelection(selection, date);
      const timeSpentSeconds = Math.round(
        (sel.endTime.getTime() - sel.startTime.getTime()) / 1000
      );
      createTimeEntry.mutate(
        { issueKey, startedAt: sel.startTime, timeSpentSeconds },
        { onSuccess: () => clearSelection() }
      );
    },
    [selection, date, createTimeEntry, clearSelection]
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
    <TimelineContext.Provider
      value={{
        olRef,
        containerRef,
        formattedSelection,
        formattedHover,
        isDragging,
        entriesWithLayout,
        issues,
        date,
        handlePointerDown,
        handlePointerMove,
        handlePointerUp,
        handlePointerLeave,
        clearSelection,
        onCreateEntry,
      }}
    >
      {children}
    </TimelineContext.Provider>
  );
}

function useTimelineContext() {
  const ctx = React.useContext(TimelineContext);
  if (!ctx) {
    throw new Error(
      'useTimeline* hooks must be used within a TimelineProvider'
    );
  }
  return ctx;
}

export function useTimelineInteraction() {
  const ctx = useTimelineContext();
  return {
    olRef: ctx.olRef,
    containerRef: ctx.containerRef,
    handlePointerDown: ctx.handlePointerDown,
    handlePointerMove: ctx.handlePointerMove,
    handlePointerUp: ctx.handlePointerUp,
    handlePointerLeave: ctx.handlePointerLeave,
    formattedSelection: ctx.formattedSelection,
    formattedHover: ctx.formattedHover,
    entriesWithLayout: ctx.entriesWithLayout,
    date: ctx.date,
  };
}

export function useTimelineSelection() {
  const ctx = useTimelineContext();
  return {
    isDragging: ctx.isDragging,
    issues: ctx.issues,
    onCreateEntry: ctx.onCreateEntry,
    clearSelection: ctx.clearSelection,
  };
}

export function useTimelineEntryActions() {
  const ctx = useTimelineContext();
  return {
    issues: ctx.issues,
    clearSelection: ctx.clearSelection,
  };
}
