import type { TimeEntryWithIssue } from '@time-tracker/database';
import { cn } from '@time-tracker/utils';
import { SquareIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardHeader } from '../ui/card';
import { formatDurationTimer } from '@time-tracker/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { Progress } from '../ui/progress';

interface TimeEntryCardActiveProps {
  entry: TimeEntryWithIssue;
  /** Hours per day for progress calculation (default: 7) */
  hoursPerDay?: number;
  onStopTimer?: (entryId: string) => void | Promise<void>;
  onCardClick?: () => void;
  renderIssueKey?: (key: string) => React.ReactNode;
  className?: string;
}

export function TimeEntryCardActive({
  entry,
  hoursPerDay = 7,
  className,
  onStopTimer,
  onCardClick,
  renderIssueKey,
}: TimeEntryCardActiveProps) {
  const [, setTick] = useState(0);

  useEffect(() => {
    if (entry.timeSpentSeconds != null) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [entry.timeSpentSeconds]);

  const elapsedSeconds =
    entry.timeSpentSeconds ??
    Math.floor(
      (new Date().getTime() - new Date(entry.startedAt).getTime()) / 1000
    );

  const secondsPerDay = hoursPerDay * 3600;
  const progressValue = Math.min(100, (elapsedSeconds / secondsPerDay) * 100);

  const issueKey = entry.issue.key ?? entry.issueKey;

  return (
    <Card
      className={cn(
        'transition-all duration-200 border rounded-(--radius) shadow-none overflow-hidden',
        'border-l-2 border-accent bg-card/30',
        'py-0 gap-0',
        onCardClick && 'hover:bg-card/60 cursor-pointer',
        className
      )}
      onClick={onCardClick}
      role="button"
      tabIndex={0}
    >
      <Progress
        value={progressValue}
        className="h-1 rounded-none bg-primary/15"
        indicatorClassName="animate-pulse"
      />
      <CardHeader className="px-3 py-2.5 flex flex-row items-center gap-3 space-y-0">
        {/* <span className="relative flex size-2 shrink-0">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex size-2 rounded-full bg-primary" />
        </span> */}

        <div className="min-w-0 flex-1 flex flex-col gap-0.5">
          {renderIssueKey ? (
            renderIssueKey(issueKey)
          ) : (
            <Badge
              variant="outline"
              className="shrink-0 w-fit text-[9px] font-bold tracking-wide px-1.5 py-0 h-4 text-muted-foreground/70"
            >
              {issueKey}
            </Badge>
          )}
          <span className="text-sm text-foreground/90 wrap-break-word">
            {entry.issue.summary ?? ''}
          </span>
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <span className="shrink-0 tabular-nums font-bold text-primary text-sm font-mono">
              {formatDurationTimer(elapsedSeconds)}
            </span>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            Started at {entry.startedAt.toLocaleTimeString()}
          </TooltipContent>
        </Tooltip>

        <Button
          variant="destructive"
          className="hover:bg-destructive/10 cursor-pointer"
          size="icon"
          onClick={() => onStopTimer?.(entry.id)}
        >
          <SquareIcon className="size-5" />
        </Button>
      </CardHeader>
    </Card>
  );
}
