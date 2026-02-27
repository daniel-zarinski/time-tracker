'use client';

import { Fragment, useEffect, useState } from 'react';
import {
  AnimatedGroup,
  AnimatedNumber,
} from '@time-tracker/ui';
import {
  cn,
  formatDuration,
  formatRelativeDate,
  formatTime,
} from '@time-tracker/utils';
import type { TimeEntryWithIssue } from '@time-tracker/database';
import { TimeEntryEditDialog } from '../../time-entry-edit-dialog/time-entry-edit-dialog';

const GRID_COLS = 'grid-cols-[1fr_1fr_1fr_minmax(11ch,auto)]';

function AnimatedDurationTotal({ totalSeconds }: { totalSeconds: number }) {
  const [displaySeconds, setDisplaySeconds] = useState(0);

  useEffect(() => {
    setDisplaySeconds(totalSeconds);
  }, [totalSeconds]);

  const springOptions = {
    bounce: 0,
    duration: 1500,
  };

  return (
    <span className="tabular-nums">
      <AnimatedNumber
        value={displaySeconds}
        springOptions={springOptions}
        formatter={formatDuration}
      />
    </span>
  );
}

interface JiraIssueTimeEntriesTableProps {
  entries: TimeEntryWithIssue[];
}

export function JiraIssueTimeEntriesTable({
  entries,
}: JiraIssueTimeEntriesTableProps) {
  const totalSeconds = entries.reduce(
    (sum, entry) => sum + (entry.timeSpentSeconds ?? 0),
    0
  );

  return (
    <div className="text-xs">
      <div
        className={`grid w-full ${GRID_COLS} gap-0 border-b border-border/50 [&>div]:h-7 [&>div]:px-1.5 [&>div]:py-1`}
      >
        <div className="text-muted-foreground font-medium">Date</div>
        <div className="text-muted-foreground font-medium tabular-nums">
          Start time
        </div>
        <div className="text-muted-foreground font-medium tabular-nums">
          End time
        </div>
        <div className="text-muted-foreground font-medium">Duration</div>
      </div>
      <AnimatedGroup
        as="div"
        asChild="div"
        preset="slide"
        className="[&>div:last-child]:border-b-0"
      >
        {entries.map((entry) => {
          const startDate = new Date(entry.startedAt);
          const duration = entry.timeSpentSeconds ?? 0;
          const endDate = new Date(startDate.getTime() + duration * 1000);
          const isActive = entry.timeSpentSeconds == null;

          const trigger = (
            <>
              <span className="p-1.5 text-muted-foreground">
                {formatRelativeDate(startDate)}
              </span>
              <span className="p-1.5 tabular-nums text-muted-foreground">
                {formatTime(startDate)}
              </span>
              <span className="p-1.5 tabular-nums text-muted-foreground">
                {isActive ? '—' : formatTime(endDate)}
              </span>
              <span className="min-w-[11ch] p-1.5 font-medium text-foreground tabular-nums">
                {isActive ? 'In progress' : formatDuration(duration)}
              </span>
            </>
          );

          return (
            <Fragment key={entry.id}>
              <TimeEntryEditDialog
                entry={entry}
                trigger={trigger}
                triggerClassName={cn(
                  `grid w-full ${GRID_COLS} gap-0 cursor-pointer text-left border-b border-border/50 transition-colors [&>span]:py-1`,
                  isActive
                    ? 'bg-red-500/10 border-l-2 border-l-red-500 hover:bg-red-500/15'
                    : 'hover:bg-muted/50'
                )}
              />
            </Fragment>
          );
        })}
      </AnimatedGroup>
      <div
        className={`grid w-full ${GRID_COLS} gap-0 border-t border-border/50 bg-muted/50 font-medium [&>div]:h-7 [&>div]:px-1.5 [&>div]:py-1`}
      >
        <div className="text-muted-foreground">Total</div>
        <div />
        <div />
        <div className="text-foreground tabular-nums">
          <AnimatedDurationTotal totalSeconds={totalSeconds} />
        </div>
      </div>
    </div>
  );
}
