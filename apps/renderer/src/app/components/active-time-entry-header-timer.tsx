import type { RefObject } from 'react';
import { useEffect, useRef, useState } from 'react';
import { motion, MotionConfig } from 'motion/react';
import { SquareIcon } from 'lucide-react';
import { cn } from '@time-tracker/utils';
import {
  Button,
  DEFAULT_TRANSITION,
  SlidingNumber,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@time-tracker/ui';
import {
  useActiveTimeEntry,
  useClickOutside,
  useTimeEntryMutations,
} from '@time-tracker/hooks';

export function ActiveTimeEntryHeaderTimer() {
  const { data: entry } = useActiveTimeEntry();
  const { stopTracking } = useTimeEntryMutations();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [, setTick] = useState(0);

  useClickOutside(containerRef as RefObject<HTMLElement>, () => {
    setIsOpen(false);
  });

  useEffect(() => {
    if (!entry || entry.timeSpentSeconds != null) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [entry?.timeSpentSeconds, entry]);

  if (!entry) return null;

  const elapsedSeconds =
    entry.timeSpentSeconds ??
    Math.floor(
      (new Date().getTime() - new Date(entry.startedAt).getTime()) / 1000
    );

  const issueKey = entry.issue?.key ?? entry.issueKey;
  const startedAtStr = new Date(entry.startedAt).toLocaleTimeString();
  const tooltipContent = issueKey ? issueKey : `Started at ${startedAtStr}`;

  const timerContent = (
    <span className="shrink-0 font-bold text-primary text-sm font-mono flex items-center">
      <SlidingNumber value={Math.floor(elapsedSeconds / 3600)} padStart />
      <span>:</span>
      <SlidingNumber
        value={Math.floor((elapsedSeconds % 3600) / 60)}
        padStart
      />
      <span>:</span>
      <SlidingNumber value={elapsedSeconds % 60} padStart />
    </span>
  );

  return (
    <MotionConfig transition={DEFAULT_TRANSITION}>
      <div
        ref={containerRef}
        role="button"
        tabIndex={0}
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={(e) =>
          (e.key === 'Enter' || e.key === ' ') && setIsOpen((prev) => !prev)
        }
        className={cn(
          'rounded-lg border border-border bg-background transition-colors',
          !isOpen &&
            'cursor-pointer hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
        )}
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        aria-label={isOpen ? undefined : 'Expand timer'}
      >
        <motion.div
          animate={{ width: isOpen ? 108 : 78 }}
          initial={false}
          className="overflow-hidden"
        >
          <div className="flex items-center gap-1 pl-1.5 pr-0.5 py-1">
            <Tooltip>
              <TooltipTrigger asChild>{timerContent}</TooltipTrigger>
              <TooltipContent side="left">{tooltipContent}</TooltipContent>
            </Tooltip>
            {isOpen && (
              <Button
                variant="destructive"
                className="hover:bg-destructive/10 shrink-0 cursor-pointer"
                size="icon-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  stopTracking.mutate(entry.id);
                }}
                aria-label="Stop timer"
              >
                <SquareIcon />
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </MotionConfig>
  );
}
