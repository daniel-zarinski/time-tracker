import type { TimeEntryWithIssue } from '@time-tracker/database';
import {
  cn,
  formatDuration,
  formatRelativeDate,
  formatTime,
} from '@time-tracker/utils';
import {
  EyeIcon,
  MoreHorizontalIcon,
  PlayIcon,
  Trash2Icon,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Progress } from '../ui/progress';

export interface TimeEntryUpdates {
  startedAt?: Date;
  endedAt?: Date;
  timeSpentSeconds?: number;
  description?: string;
}

interface TimeEntryCardDefaultProps {
  entry: TimeEntryWithIssue;
  /** Hours per day for progress calculation (default: 7) */
  hoursPerDay?: number;
  onResumeTimer?: (issueKey: string) => void | Promise<void>;
  onSave?: (entryId: string, updates: TimeEntryUpdates) => void | Promise<void>;
  onDelete?: (entryId: string) => void | Promise<void>;
  onOpenInJira?: (issueKey: string) => void | Promise<void>;
  className?: string;
}

function syncStatusStyles(status: string) {
  switch (status) {
    case 'SYNCED':
      return 'border-green-500/20 bg-green-500/5';
    case 'ERROR':
      return 'border-destructive/20 bg-destructive/5';
    default:
      return 'border-border bg-card/30';
  }
}

export function TimeEntryCardDefault({
  entry,
  hoursPerDay = 7,
  onResumeTimer,
  onDelete,
  onOpenInJira,
  className,
}: TimeEntryCardDefaultProps) {
  const [expanded, setExpanded] = useState(false);

  const startDate = new Date(entry.startedAt);
  const duration = entry.timeSpentSeconds ?? 0;
  const endDate = new Date(startDate.getTime() + duration * 1000);

  const secondsPerDay = hoursPerDay * 3600;
  const progressValue = Math.min(100, (duration / secondsPerDay) * 100);

  return (
    <Card
      className={cn(
        'transition-all duration-200 border rounded-(--radius) shadow-none overflow-hidden',
        syncStatusStyles(entry.syncStatus),
        'hover:bg-card/40 hover:border-primary/20',
        'py-0 gap-0',
        expanded && 'border-primary/25 bg-card/45',
        className
      )}
    >
      <Progress
        value={progressValue}
        className="h-1 rounded-none bg-primary/15"
      />
      <Collapsible open={expanded} onOpenChange={setExpanded}>
        <CollapsibleTrigger asChild>
          <div className="cursor-pointer select-none">
            <CardHeader className="px-3 py-2.5 gap-0.5">
              <CardTitle className="flex items-center gap-1.5">
                <Badge
                  variant="outline"
                  className="shrink-0 text-[9px] font-bold tracking-wide px-1.5 py-0 h-4 text-muted-foreground/70"
                >
                  {entry.issue.key ?? entry.issueKey}
                </Badge>
              </CardTitle>
              <CardDescription
                className={cn('text-xs', !expanded && 'truncate')}
              >
                {entry.issue.summary ?? ''}
              </CardDescription>
              {!expanded && (
                <CardAction>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontalIcon className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenInJira?.(entry.issue.key ?? entry.issueKey);
                        }}
                      >
                        <EyeIcon className="size-4" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete?.(entry.id);
                        }}
                      >
                        <Trash2Icon className="size-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardAction>
              )}
            </CardHeader>
          </div>
        </CollapsibleTrigger>

        <CardContent className="px-3 pt-0 pb-2.5 max-w-sm mx-auto">
          <div className="flex items-center text-xs text-muted-foreground">
            <span>{formatRelativeDate(startDate)}</span>
            <span className="mx-auto">
              {formatTime(startDate)} → {formatTime(endDate)}
            </span>
            <span className="font-bold text-foreground">
              {formatDuration(duration)}
            </span>
          </div>
        </CardContent>

        <CollapsibleContent>
          <div className="px-3 py-2 text-xs text-muted-foreground/50 italic">
            {/* placeholder — future content TBD */}
          </div>
          <CardFooter className="px-3 pb-2.5 gap-2">
            <Button
              variant="outline"
              size="xs"
              onClick={() => onResumeTimer?.(entry.issue.key ?? entry.issueKey)}
            >
              <PlayIcon className="size-3" />
              Resume
            </Button>
            <Button
              variant="outline"
              size="xs"
              onClick={() => onOpenInJira?.(entry.issue.key ?? entry.issueKey)}
            >
              <EyeIcon className="size-3" />
              View
            </Button>
            <div className="flex-1" />
            <Button
              variant="destructive"
              size="xs"
              onClick={() => onDelete?.(entry.id)}
            >
              <Trash2Icon className="size-3" />
              Delete
            </Button>
          </CardFooter>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
