import type { TimeEntryWithIssue } from '@time-tracker/database';
import { cn } from '@time-tracker/utils';
import { SquareIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardHeader } from '../ui/card';
import { formatDurationTimer } from '@time-tracker/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

interface TimeEntryCardActiveProps {
  entry: TimeEntryWithIssue;
  elapsedSeconds?: number; // TODO: Remove
  onStopTimer?: (entryId: string) => void | Promise<void>;
  onCardClick?: () => void;
  className?: string;
}

export function TimeEntryCardActive({
  entry,
  className,
  onStopTimer,
  onCardClick,
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

  return (
    <Card
      className={cn(
        'transition-all duration-200 border rounded-(--radius) shadow-none overflow-hidden',
        'border-l-2 border-accent bg-card/30',
        'py-0',
        onCardClick && 'hover:bg-card/60 cursor-pointer',
        className
      )}
      onClick={onCardClick}
      role="button"
      tabIndex={0}
    >
      <CardHeader className="px-3 py-2.5 flex flex-row items-center gap-3 space-y-0">
        <span className="relative flex size-2 shrink-0">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex size-2 rounded-full bg-primary" />
        </span>

        <div className="min-w-0 flex-1 flex flex-col gap-0.5">
          <Badge
            variant="outline"
            className="shrink-0 w-fit text-[9px] font-bold tracking-wide px-1.5 py-0 h-4 text-muted-foreground/70"
          >
            {entry.issue.key}
          </Badge>
          <span className="text-sm text-muted-foreground wrap-break-word">
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
          size="xs"
          onClick={() => onStopTimer?.(entry.id)}
        >
          <SquareIcon className="size-3" />
        </Button>
      </CardHeader>
    </Card>
  );
}
