import { HALF_HOUR_ROWS, formatHour } from './timeline-utils';

export function TimelineTimeLabels() {
  return (
    <div
      className="col-start-1 col-end-2 row-start-1 divide-y divide-border/50"
      style={{
        display: 'grid',
        gridTemplateRows: `repeat(${HALF_HOUR_ROWS}, minmax(2.8rem, 1fr))`,
      }}
    >
      {Array.from({ length: HALF_HOUR_ROWS }, (_, i) => (
        <div key={i} className="relative">
          {i % 2 === 0 && (
            <span className="sticky left-0 -ml-14 -mt-2.5 inline-block w-14 pr-2 text-right text-[10px] text-muted-foreground">
              {formatHour(i / 2)}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
