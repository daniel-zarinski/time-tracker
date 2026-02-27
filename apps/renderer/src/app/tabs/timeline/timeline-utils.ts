import type { TimeEntryWithIssue } from '@time-tracker/database';
import { Selection } from './use-timeline-drag';

// --- Constants ---
export const HALF_HOUR_ROWS = 48;
export const QUARTER_HOUR_ROWS = 96;
export const QUARTER_MS = 15 * 60 * 1000;

export const DAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

// --- Types ---
export interface GridPosition {
  gridRowStart: number;
  gridRowSpan: number;
}

export interface EntryWithGrid extends GridPosition {
  entry: TimeEntryWithIssue;
}

export interface EntryWithLayout extends EntryWithGrid {
  column: number;
  totalColumns: number;
}

// --- Helpers ---

export function getDayBounds(date: Date) {
  const y = date.getFullYear();
  const m = date.getMonth();
  const d = date.getDate();
  return {
    start: new Date(y, m, d, 0, 0, 0).getTime(),
    end: new Date(y, m, d + 1, 0, 0, 0).getTime(),
  };
}

export function getEntriesWithGrid(
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

    const gridRowStart = 1 + Math.floor((visibleStart - dayStart) / QUARTER_MS);
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

export function computeEntryLayout(
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

export function getWeekDays(date: Date): Date[] {
  const d = new Date(date);
  const day = d.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + mondayOffset);
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    return day;
  });
}

export function formatHour(hour: number): string {
  if (hour === 0 || hour === 24) return '12AM';
  if (hour === 12) return '12PM';
  if (hour < 12) return `${hour}AM`;
  return `${hour - 12}PM`;
}

export function formatEntryTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function gridRowToTime(row: number, date: Date): Date {
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

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export interface FormattedSelection {
  startTime: Date;
  endTime: Date;
  duration: string;
  span: number;
  minRow: number;
  maxRow: number;
}

export function formatSelection(
  selection: Selection,
  date: Date
): FormattedSelection {
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

  return {
    startTime,
    endTime,
    duration,
    span,
    minRow,
    maxRow,
  };
}
