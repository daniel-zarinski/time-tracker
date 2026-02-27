import type { TimeEntryWithIssue } from '@time-tracker/database';
import { cn, SECONDS_PER_WORKDAY } from '@time-tracker/utils';
import { SquareIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  Progress,
  SlidingNumber,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@time-tracker/ui';
import { JiraIssueKeyBadge } from '../jira-issue-key-badge';
import { JiraIssueTypeBadge } from '../jira-issue-type-badge';

interface TimeEntryCardActiveProps {
  entry: TimeEntryWithIssue;
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

  const progressValue = Math.min(100, (elapsedSeconds / SECONDS_PER_WORKDAY) * 100);

  const issueKey = entry.issue.key ?? entry.issueKey;

  return (
    <Card
      className={cn(
        'transition-all duration-200 border rounded-(--radius) shadow-none overflow-hidden',
        'border-l-2 border-accent bg-accent',
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
        <div className="min-w-0 flex-1 flex flex-col gap-0.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <JiraIssueKeyBadge issueKey={issueKey} />
            <JiraIssueTypeBadge issueType={entry.issue.issueType} />
            <Badge variant="outline" className="shrink-0 w-fit text-[9px] font-bold tracking-wide px-1.5 py-0 h-4 text-muted-foreground/70">
              {entry.issue.status ?? 'Unknown'}
            </Badge>
          </div>
          <span className="text-sm text-foreground/90 wrap-break-word">
            {entry.issue.summary ?? ''}
          </span>
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <span className="shrink-0 font-bold text-primary text-sm font-mono flex items-center">
              <SlidingNumber value={Math.floor(elapsedSeconds / 3600)} padStart />
              <span>:</span>
              <SlidingNumber value={Math.floor((elapsedSeconds % 3600) / 60)} padStart />
              <span>:</span>
              <SlidingNumber value={elapsedSeconds % 60} padStart />
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
