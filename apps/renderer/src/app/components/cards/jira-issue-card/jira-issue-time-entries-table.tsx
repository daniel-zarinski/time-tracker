'use client';

import { Fragment, useEffect, useState } from 'react';
import {
  AnimatedGroup,
  AnimatedNumber,
  Table,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@time-tracker/ui';
import {
  formatDuration,
  formatRelativeDate,
  formatTime,
} from '@time-tracker/utils';
import type { TimeEntryWithIssue } from '@time-tracker/database';
import { TimeEntryEditDialog } from '../../time-entry-edit-dialog/time-entry-edit-dialog';

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
    <span className="inline-flex min-w-[11ch] items-baseline justify-end tabular-nums">
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
    <Table className="text-xs">
      <TableHeader>
        <TableRow>
          <TableHead className="h-7 px-1.5 text-muted-foreground font-medium">
            Date
          </TableHead>
          <TableHead className="h-7 px-1.5 text-muted-foreground font-medium">
            Start time
          </TableHead>
          <TableHead className="h-7 px-1.5 text-muted-foreground font-medium">
            End time
          </TableHead>
          <TableHead className="h-7 min-w-[11ch] px-1.5 text-muted-foreground font-medium text-right">
            Duration
          </TableHead>
        </TableRow>
      </TableHeader>
      <AnimatedGroup
        as="tbody"
        asChild="tr"
        preset="slide"
        className="[&_tr:last-child]:border-0 [&_tr]:border-b [&_tr]:border-border/50 [&_tr]:transition-colors [&_tr:hover]:bg-muted/50"
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
              <span className="p-1.5 text-muted-foreground">
                {formatTime(startDate)}
              </span>
              <span className="p-1.5 text-muted-foreground">
                {isActive ? '—' : formatTime(endDate)}
              </span>
              <span className="min-w-[11ch] p-1.5 text-right font-medium text-foreground">
                {isActive ? 'In progress' : formatDuration(duration)}
              </span>
            </>
          );

          return (
            <Fragment key={entry.id}>
              <TableCell colSpan={4} className="p-0 align-top">
                <TimeEntryEditDialog
                  entry={entry}
                  trigger={trigger}
                  triggerClassName="grid w-full grid-cols-[1fr_1fr_1fr_minmax(11ch,auto)] gap-0 cursor-pointer hover:bg-muted/50 text-left border-b border-border/50 last:border-0 transition-colors"
                />
              </TableCell>
            </Fragment>
          );
        })}
      </AnimatedGroup>
      <TableFooter>
        <TableRow className="border-border/50 hover:bg-transparent">
          <TableCell colSpan={3} className="p-1.5 text-muted-foreground">
            Total
          </TableCell>
          <TableCell className="min-w-[11ch] p-1.5 text-right font-medium text-foreground">
            <AnimatedDurationTotal totalSeconds={totalSeconds} />
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}
