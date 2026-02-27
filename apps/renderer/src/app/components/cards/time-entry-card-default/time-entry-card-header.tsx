import { cn } from '@time-tracker/utils';
import {
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@time-tracker/ui';
import { JiraIssueKeyBadge } from '../../jira-issue-key-badge';

interface TimeEntryCardHeaderProps {
  issueKey: string;
  summary: string;
  truncate?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function TimeEntryCardHeader({
  issueKey,
  summary,
  truncate = true,
  className,
  children,
}: TimeEntryCardHeaderProps) {
  return (
    <CardHeader className={cn('px-3 py-2.5 gap-0.5', className)}>
      <CardTitle>
        <JiraIssueKeyBadge issueKey={issueKey} />
      </CardTitle>
      <CardDescription className={cn('text-xs', truncate && 'truncate')}>
        {summary}
      </CardDescription>
      {children && <CardAction>{children}</CardAction>}
    </CardHeader>
  );
}
