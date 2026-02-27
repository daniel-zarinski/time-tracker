import {
  Badge,
  CardContent,
} from '@time-tracker/ui';
import type { JiraIssueWithParent } from '@time-tracker/database';
import { JiraIssueKeyBadge } from '../../jira-issue-key-badge';
import { JiraIssueTypeBadge } from '../../jira-issue-type-badge';

interface JiraIssueCardContentProps {
  issue: JiraIssueWithParent;
  parentLabel: string;
}

export function JiraIssueCardContent({
  issue,
  parentLabel,
}: JiraIssueCardContentProps) {
  return (
    <CardContent className="px-3 pt-0 pb-0">
      <div className="flex flex-col gap-1 items-start mb-2 min-w-0 w-full overflow-hidden">
        <div className="flex items-center gap-1.5 min-w-0 w-full">
          <span className="text-[10px] text-muted-foreground/50 uppercase tracking-wider font-medium shrink-0">
            Parent {parentLabel}
          </span>
          <JiraIssueKeyBadge issueKey={issue.epicKey ?? ''} />
        </div>
        {issue.parent?.summary && (
          <span className="text-xs text-muted-foreground/80 truncate w-full min-w-0 block">
            {issue.parent.summary}
          </span>
        )}
      </div>
      <div className="grid grid-cols-3 gap-x-2 gap-y-4">
        <div className="flex flex-col gap-1 items-center">
          <span className="text-[10px] text-muted-foreground/50 uppercase tracking-wider font-medium">
            Type
          </span>
          <JiraIssueTypeBadge issueType={issue.issueType} />
        </div>
        <div className="flex flex-col gap-1 items-center">
          <span className="text-[10px] text-muted-foreground/50 uppercase tracking-wider font-medium">
            Status
          </span>
          <Badge
            variant="outline"
            className="text-[9px] font-bold tracking-wide px-1.5 py-0 h-4 text-muted-foreground/70 w-fit"
          >
            {issue.status ?? 'Unknown'}
          </Badge>
        </div>
        <div className="flex flex-col gap-1 items-center">
          <span className="text-[10px] text-muted-foreground/50 uppercase tracking-wider font-medium">
            Priority
          </span>
          <Badge
            variant="outline"
            className="text-[9px] font-bold tracking-wide px-1.5 py-0 h-4 text-muted-foreground/70 w-fit"
          >
            {issue.priority ?? ''}
          </Badge>
        </div>
      </div>
    </CardContent>
  );
}
