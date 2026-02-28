import type { RefObject } from 'react';
import { useRef, useState } from 'react';
import { motion, MotionConfig } from 'motion/react';
import { SquareIcon } from 'lucide-react';
import { cn } from '@time-tracker/utils';
import {
  Button,
  DEFAULT_TRANSITION,
  ElapsedTimerDisplay,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  useElapsedSeconds,
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
  const elapsedSeconds = useElapsedSeconds(
    entry?.startedAt ?? new Date(),
    entry?.timeSpentSeconds
  );

  useClickOutside(containerRef as RefObject<HTMLElement>, () => {
    setIsOpen(false);
  });

  if (!entry) return null;

  const issueKey = entry.issue?.key ?? entry.issueKey;
  const startedAtStr = new Date(entry.startedAt).toLocaleTimeString();
  const tooltipContent = issueKey ? issueKey : `Started at ${startedAtStr}`;

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
              <TooltipTrigger asChild>
                <ElapsedTimerDisplay
                  elapsedSeconds={elapsedSeconds}
                  className="shrink-0 font-bold text-primary text-sm"
                />
              </TooltipTrigger>
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
