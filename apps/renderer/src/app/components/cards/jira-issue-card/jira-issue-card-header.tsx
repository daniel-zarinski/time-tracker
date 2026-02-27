import {
  Badge,
  CardHeader,
  CollapsibleTrigger,
} from '@time-tracker/ui';
import { ChevronDownIcon } from 'lucide-react';
import { cn } from '@time-tracker/utils';
import type { JiraIssueWithParent } from '@time-tracker/database';
import { JiraIssueKeyBadge } from '../../jira-issue-key-badge';
import { JiraIssueTypeBadge } from '../../jira-issue-type-badge';

export const badgeClassName =
  'shrink-0 w-fit text-[9px] font-bold tracking-wide px-1.5 py-0 h-4 text-muted-foreground/70';

interface JiraIssueCardHeaderProps {
  issue: JiraIssueWithParent;
  showChevron?: boolean;
  expanded?: boolean;
  headerAction?: React.ReactNode;
  showInlineBadges?: boolean;
}

export function JiraIssueCardHeader({
  issue,
  showChevron = false,
  expanded = false,
  headerAction,
  showInlineBadges = false,
}: JiraIssueCardHeaderProps) {
  const keyAndSummary = (
    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
      <div className="flex flex-wrap items-center gap-1.5">
        <JiraIssueKeyBadge issueKey={issue.key ?? '—'} />
        {showInlineBadges && (
          <>
            <JiraIssueTypeBadge issueType={issue.issueType} />
            <Badge variant="outline" className={badgeClassName}>
              {issue.status ?? 'Unknown'}
            </Badge>
          </>
        )}
      </div>
      <span className="font-semibold text-foreground wrap-break-word">
        {issue.summary ?? ''}
      </span>
    </div>
  );

  return (
    <CardHeader className="px-3 flex flex-row items-center gap-3 space-y-0">
      {showChevron ? (
        <CollapsibleTrigger asChild>
          <div
            className={cn(
              'flex flex-1 min-w-0 cursor-pointer items-center gap-3 select-none rounded-sm -m-1 p-1 transition-colors',
              expanded ? 'py-3' : 'py-4'
            )}
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            <ChevronDownIcon
              className={cn(
                'h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200',
                expanded && 'rotate-180'
              )}
            />
            {keyAndSummary}
          </div>
        </CollapsibleTrigger>
      ) : (
        <div className="flex flex-1 min-w-0 items-center gap-3 py-4">
          {keyAndSummary}
        </div>
      )}
      {headerAction}
    </CardHeader>
  );
}
