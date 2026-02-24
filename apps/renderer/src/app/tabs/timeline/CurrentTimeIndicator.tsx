import * as React from 'react';

export function CurrentTimeIndicator() {
  const [now, setNow] = React.useState(() => new Date());

  React.useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const hours = now.getHours();
  const minutes = now.getMinutes();
  const quarterSlot = hours * 4 + Math.floor(minutes / 15);
  const gridRow = quarterSlot + 1;

  return (
    <li
      className="pointer-events-none relative z-20"
      style={{ gridRow: `${gridRow} / span 1`, gridColumn: '1' }}
    >
      <div className="absolute inset-x-0 top-0 flex items-center">
        <div className="size-2 rounded-full bg-red-500" />
        <div className="h-px flex-1 bg-red-500" />
      </div>
    </li>
  );
}
