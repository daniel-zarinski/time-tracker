import { Item, ItemContent, ItemActions } from '@time-tracker/ui';
import {
  formatDuration,
  formatRelativeDate,
  formatTime,
} from '@time-tracker/utils';
import type { TimeEntryWithIssue } from '@time-tracker/database';

interface JiraIssueTimeEntryRowProps {
  entry: TimeEntryWithIssue;
}

export function JiraIssueTimeEntryRow({ entry }: JiraIssueTimeEntryRowProps) {
  const startDate = new Date(entry.startedAt);
  const duration = entry.timeSpentSeconds ?? 0;
  const endDate = new Date(startDate.getTime() + duration * 1000);
  const isActive = entry.timeSpentSeconds == null;

  return (
    <Item size="sm" className="text-xs">
      <ItemContent className="gap-0 min-w-0">
        <span className="text-muted-foreground truncate">
          {formatRelativeDate(startDate)}
          {' · '}
          {formatTime(startDate)}
          {isActive ? '' : ` → ${formatTime(endDate)}`}
        </span>
      </ItemContent>
      <ItemActions>
        <span className="font-medium text-foreground shrink-0">
          {isActive ? 'In progress' : formatDuration(duration)}
        </span>
      </ItemActions>
    </Item>
  );
}
