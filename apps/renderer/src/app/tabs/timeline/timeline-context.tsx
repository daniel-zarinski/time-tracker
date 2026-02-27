import * as React from 'react';
import type { ComboboxSelectItem } from '@time-tracker/ui';
import type { TimeEntryUpdates } from '@time-tracker/utils';
import {
  type EntryWithLayout,
  type FormattedSelection,
  formatSelection,
} from './timeline-utils';
import type { Selection } from './use-timeline-drag';

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
  isToday: boolean;
  issues: ComboboxSelectItem[];
  // Entry action callbacks
  onSaveEntry: (entryId: string, updates: TimeEntryUpdates) => Promise<void>;
  onDeleteEntry: (entryId: string) => Promise<void>;
  onCreateEntry: (issueKey: string) => void | Promise<void>;
}

const TimelineContext = React.createContext<TimelineContextValue | null>(null);

interface TimelineProviderProps {
  olRef: React.RefObject<HTMLOListElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  selection: Selection | null;
  hoveredRow: number | null;
  isDragging: boolean;
  date: Date;
  handlePointerDown: (e: React.PointerEvent<HTMLOListElement>) => void;
  handlePointerMove: (e: React.PointerEvent<HTMLOListElement>) => void;
  handlePointerUp: (e: React.PointerEvent<HTMLOListElement>) => void;
  handlePointerLeave: () => void;
  clearSelection: () => void;
  entriesWithLayout: EntryWithLayout[];
  isToday: boolean;
  issues: ComboboxSelectItem[];
  onSaveEntry: (entryId: string, updates: TimeEntryUpdates) => Promise<void>;
  onDeleteEntry: (entryId: string) => Promise<void>;
  onCreateEntry: (issueKey: string) => void | Promise<void>;
  children: React.ReactNode;
}

export function TimelineProvider({
  olRef,
  containerRef,
  selection,
  hoveredRow,
  isDragging,
  date,
  handlePointerDown,
  handlePointerMove,
  handlePointerUp,
  handlePointerLeave,
  clearSelection,
  entriesWithLayout,
  isToday,
  issues,
  onSaveEntry,
  onDeleteEntry,
  onCreateEntry,
  children,
}: TimelineProviderProps) {
  const formattedSelection = React.useMemo(() => {
    if (!selection) return null;
    return formatSelection(selection, date);
  }, [selection, date]);

  const formattedHover: FormattedSelection | null = React.useMemo(() => {
    if (hoveredRow == null || selection) return null;
    return formatSelection({ startRow: hoveredRow, endRow: hoveredRow }, date);
  }, [hoveredRow, selection, date]);

  const value = React.useMemo<TimelineContextValue>(
    () => ({
      olRef,
      containerRef,
      handlePointerDown,
      handlePointerMove,
      handlePointerUp,
      handlePointerLeave,
      formattedSelection,
      formattedHover,
      isDragging,
      clearSelection,
      entriesWithLayout,
      isToday,
      issues,
      onSaveEntry,
      onDeleteEntry,
      onCreateEntry,
    }),
    [
      olRef,
      containerRef,
      handlePointerDown,
      handlePointerMove,
      handlePointerUp,
      handlePointerLeave,
      formattedSelection,
      formattedHover,
      isDragging,
      clearSelection,
      entriesWithLayout,
      isToday,
      issues,
      onSaveEntry,
      onDeleteEntry,
      onCreateEntry,
    ]
  );

  return (
    <TimelineContext.Provider value={value}>
      {children}
    </TimelineContext.Provider>
  );
}

function useTimelineContext() {
  const ctx = React.useContext(TimelineContext);
  if (!ctx) {
    throw new Error('useTimeline* hooks must be used within a TimelineProvider');
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
    isToday: ctx.isToday,
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
    onSaveEntry: ctx.onSaveEntry,
    onDeleteEntry: ctx.onDeleteEntry,
    clearSelection: ctx.clearSelection,
  };
}
