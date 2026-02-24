import type { TimeEntryWithIssue } from '@time-tracker/database';
import { cn } from '@time-tracker/utils';
import { SquareIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardHeader } from '../ui/card';
import { formatDurationTimer } from './time-entry-card';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

interface TimeEntryCardActiveProps {
  entry: TimeEntryWithIssue;
  elapsedSeconds?: number; // TODO: Remove
  onStopTimer?: (entryId: string) => void | Promise<void>;
  className?: string;
}

export function TimeEntryCardActive({
  entry,
  onStopTimer,
  className,
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
        'border-l-2 border-primary bg-card/30',
        'py-0',
        className
      )}
    >
      <CardHeader className="px-3 py-2.5 flex flex-row items-center gap-3 space-y-0">
        <span className="relative flex size-2 shrink-0">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex size-2 rounded-full bg-primary" />
        </span>

        <Badge
          variant="outline"
          className="shrink-0 text-[9px] font-bold tracking-wide px-1.5 py-0 h-4 text-muted-foreground/70"
        >
          {entry.issue.key}
        </Badge>

        <Tooltip>
          <TooltipTrigger asChild>
            <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
              {entry.issue.summary ?? ''}
            </span>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {entry.issue.summary ?? ''}
          </TooltipContent>
        </Tooltip>

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
          Stop
        </Button>
      </CardHeader>
    </Card>
  );
}
