import * as React from 'react';
import { QUARTER_HOUR_ROWS, clamp } from './timeline-utils';

export interface Selection {
  startRow: number;
  endRow: number;
}

export type EventType = 'pointerDown' | 'pointerMove' | 'pointerUp' | 'escape';
export type PointerUpPayload = {
  pointerId: number;
  type: 'pointerUp';
  selection: Selection | null;
};
export type PointerMovePayload = {
  clientY: number;
  row: number;
  type: 'pointerMove';
};
export type PointerDownPayload = {
  clientY: number;
  pointerId: number;
  row: number;
  type: 'pointerDown';
};
export type EventHandler = (
  event: EventType,
  payload: PointerUpPayload | PointerMovePayload | PointerDownPayload
) => void;

export function useTimelineDrag(
  olRef: React.RefObject<HTMLOListElement | null>,
  onEvent?: EventHandler
) {
  const [selection, setSelection] = React.useState<Selection | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const draggingRef = React.useRef(false);

  const clearSelection = React.useCallback(() => setSelection(null), []);

  const clientYToRow = React.useCallback(
    (clientY: number): number => {
      const ol = olRef.current;
      if (!ol) return 2;
      const relativeY = clientY - ol.getBoundingClientRect().top;
      const quarterHeight = ol.clientHeight / QUARTER_HOUR_ROWS;
      return clamp(Math.floor(relativeY / quarterHeight) + 1, 1, 96);
    },
    [olRef]
  );

  const handlePointerDown = React.useCallback(
    (e: React.PointerEvent<HTMLOListElement>) => {
      if ((e.target as HTMLElement).closest('button')) return;
      e.preventDefault();
      const clientY = e.clientY;
      const pointerId = e.pointerId;
      const row = clientYToRow(clientY);
      setSelection({ startRow: row, endRow: row });
      draggingRef.current = true;
      setIsDragging(true);
      olRef.current?.setPointerCapture(pointerId);
      onEvent?.('pointerDown', {
        clientY,
        pointerId,
        row,
        type: 'pointerDown',
      });
    },
    [clientYToRow, olRef]
  );

  const handlePointerMove = React.useCallback(
    (e: React.PointerEvent<HTMLOListElement>) => {
      if (!draggingRef.current) return;
      const clientY = e.clientY;
      const row = clientYToRow(clientY);
      onEvent?.('pointerMove', { clientY, row, type: 'pointerMove' });
      setSelection((prev) => (prev ? { ...prev, endRow: row } : null));
    },
    [clientYToRow]
  );

  const handlePointerUp = React.useCallback(
    (e: React.PointerEvent<HTMLOListElement>) => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      setIsDragging(false);
      const pointerId = e.pointerId;
      olRef.current?.releasePointerCapture(pointerId);
      onEvent?.('pointerUp', {
        pointerId,
        type: 'pointerUp',
        selection: selection ?? null,
      });
    },
    [olRef, selection]
  );

  // Clear selection on Escape
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelection(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return {
    selection,
    isDragging,
    clearSelection,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  };
}
