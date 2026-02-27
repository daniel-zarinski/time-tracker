import { InView } from '@time-tracker/ui';
import { QUARTER_HOUR_ROWS } from './timeline-utils';
import { CurrentTimeIndicator } from './CurrentTimeIndicator';
import { TimelineEntryDialog } from './TimelineEntryDialog';
import { TimelineTimeLabels } from './TimelineTimeLabels';
import { TimelineSelectionHighlight } from './TimelineSelectionHighlight';
import { useTimelineInteraction } from './timeline-context';

export function TimelineGrid() {
  const {
    olRef,
    containerRef,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerLeave,
    formattedSelection,
    formattedHover,
    entriesWithLayout,
    isToday,
  } = useTimelineInteraction();

  return (
    <div ref={containerRef}>
      <div className="flex w-full flex-auto">
        {/* Gutter spacer for time labels */}
        <div className="w-14 flex-none" />

        {/* Grid container */}
        <div className="grid flex-auto grid-cols-1 grid-rows-1">
          {/* Grid A: horizontal lines + time labels */}
          <TimelineTimeLabels />

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
            onPointerLeave={handlePointerLeave}
          >
            {/* Hover highlight (renders behind entries) */}
            {formattedHover && (
              <TimelineSelectionHighlight
                variant="hover"
                formattedSelection={formattedHover}
              />
            )}

            {entriesWithLayout.map(
              ({ entry, gridRowStart, gridRowSpan, column, totalColumns }) => {
                const isActive = entry.timeSpentSeconds == null;

                return (
                  <InView
                    key={entry.id}
                    as="li"
                    variants={{
                      hidden: { opacity: 0, scale: 0.8 },
                      visible: { opacity: 1, scale: 1 },
                    }}
                    viewOptions={{ margin: '-120px 0px -24px 0px' }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="pointer-events-none relative"
                    style={{
                      gridRow: `${gridRowStart} / span ${gridRowSpan}`,
                      gridColumn: '1',
                    }}
                  >
                    <TimelineEntryDialog
                      entry={entry}
                      gridRowSpan={gridRowSpan}
                      column={column}
                      totalColumns={totalColumns}
                      isActive={isActive}
                    />
                  </InView>
                );
              }
            )}

            {/* Drag-to-select highlight */}
            {formattedSelection && (
              <TimelineSelectionHighlight
                formattedSelection={formattedSelection}
              />
            )}

            {/* Current time indicator */}
            {isToday && <CurrentTimeIndicator />}
          </ol>
        </div>
      </div>
    </div>
  );
}
