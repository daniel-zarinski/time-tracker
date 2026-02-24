import * as React from 'react';
import { QUARTER_HOUR_ROWS, clamp } from './timeline-utils';

export interface Selection {
  startRow: number;
  endRow: number;
}

export function useTimelineDrag(olRef: React.RefObject<HTMLOListElement | null>) {
  const [selection, setSelection] = React.useState<Selection | null>(null);
  const draggingRef = React.useRef(false);

  const clearSelection = React.useCallback(() => setSelection(null), []);

  const clientYToRow = React.useCallback((clientY: number): number => {
    const ol = olRef.current;
    if (!ol) return 2;
    const relativeY = clientY - ol.getBoundingClientRect().top;
    const quarterHeight = ol.clientHeight / QUARTER_HOUR_ROWS;
    return clamp(Math.floor(relativeY / quarterHeight) + 1, 1, 96);
  }, [olRef]);

  const handlePointerDown = React.useCallback(
    (e: React.PointerEvent<HTMLOListElement>) => {
      if ((e.target as HTMLElement).closest('button')) return;
      e.preventDefault();
      const row = clientYToRow(e.clientY);
      setSelection({ startRow: row, endRow: row });
      draggingRef.current = true;
      olRef.current?.setPointerCapture(e.pointerId);
    },
    [clientYToRow, olRef]
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
    [olRef]
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
    clearSelection,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  };
}
