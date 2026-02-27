import { Fragment } from 'react';
import {
  AnimatedGroup,
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

interface JiraIssueTimeEntriesTableProps {
  entries: TimeEntryWithIssue[];
}

export function JiraIssueTimeEntriesTable({
  entries,
}: JiraIssueTimeEntriesTableProps) {
  const totalSeconds = entries.reduce(
    (sum, entry) => sum + (entry.timeSpentSeconds ?? 0),
    0
  )

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
          <TableHead className="h-7 px-1.5 text-muted-foreground font-medium text-right">
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

          return (
            <Fragment key={entry.id}>
              <TableCell className="p-1.5 text-muted-foreground">
                {formatRelativeDate(startDate)}
              </TableCell>
              <TableCell className="p-1.5 text-muted-foreground">
                {formatTime(startDate)}
              </TableCell>
              <TableCell className="p-1.5 text-muted-foreground">
                {isActive ? '—' : formatTime(endDate)}
              </TableCell>
              <TableCell className="p-1.5 text-right font-medium text-foreground">
                {isActive ? 'In progress' : formatDuration(duration)}
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
          <TableCell className="p-1.5 text-right font-medium text-foreground">
            {formatDuration(totalSeconds)}
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}
