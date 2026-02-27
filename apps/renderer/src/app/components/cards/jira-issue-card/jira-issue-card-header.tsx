import { Badge, CardHeader } from '@time-tracker/ui';
import type { JiraIssueWithParent } from '@time-tracker/database';
import { JiraIssueKeyBadge } from '../../jira-issue-key-badge';
import { JiraIssueTypeBadge } from '../../jira-issue-type-badge';

export const badgeClassName =
  'shrink-0 w-fit text-[9px] font-bold tracking-wide px-1.5 py-0 h-4 text-muted-foreground/70';

interface JiraIssueCardHeaderProps {
  issue: JiraIssueWithParent;
  headerAction?: React.ReactNode;
}

export function JiraIssueCardHeader({
  issue,
  headerAction,
}: JiraIssueCardHeaderProps) {
  return (
    <CardHeader className="px-3 flex flex-row items-center gap-3 space-y-0">
      <div className="flex flex-1 min-w-0 items-center gap-3 py-4">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <JiraIssueKeyBadge issueKey={issue.key ?? '—'} />
            <JiraIssueTypeBadge issueType={issue.issueType} />
            <Badge variant="outline" className={badgeClassName}>
              {issue.status ?? 'Unknown'}
            </Badge>
          </div>
          <span className="font-semibold text-foreground wrap-break-word">
            {issue.summary ?? ''}
          </span>
        </div>
      </div>
      {headerAction}
    </CardHeader>
  );
}
