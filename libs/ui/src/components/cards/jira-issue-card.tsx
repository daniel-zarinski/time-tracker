import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '../ui/card';
import { Badge } from '../ui/badge';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '../ui/collapsible';
import { ChevronDownIcon, ExternalLinkIcon, TimerIcon } from 'lucide-react';
import { cn } from '@time-tracker/utils';
import type { JiraIssueWithParent } from '@time-tracker/database';

interface JiraIssueCardHeaderProps {
  issue: JiraIssueWithParent;
  showChevron?: boolean;
  expanded?: boolean;
  headerAction?: React.ReactNode;
  showInlineBadges?: boolean;
}

interface JiraIssueCardContentProps {
  issue: JiraIssueWithParent;
  parentLabel: string;
}

interface JiraIssueCardFooterProps {
  issueKey: string;
  onOpenInJira?: (issueKey: string) => void | Promise<void>;
  onTrackTime?: (issueKey: string) => void | Promise<unknown>;
}

export interface JiraIssueCardProps {
  issue: JiraIssueWithParent;
  onOpenInJira?: (issueKey: string) => void | Promise<void>;
  onTrackTime?: (issueKey: string) => void | Promise<unknown>;
  defaultExpanded?: boolean;
  collapsible?: boolean;
  headerAction?: React.ReactNode;
}

const badgeClassName =
  'shrink-0 w-fit text-[9px] font-bold tracking-wide px-1.5 py-0 h-4 text-muted-foreground/70';

function JiraIssueCardHeader({
  issue,
  showChevron = false,
  expanded = false,
  headerAction,
  showInlineBadges = false,
}: JiraIssueCardHeaderProps) {
  const keyAndSummary = (
    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge variant="outline" className={badgeClassName}>
          {issue.key ?? '—'}
        </Badge>
        {showInlineBadges && (
          <>
            {issue.issueType && (
              <Badge variant="outline" className={badgeClassName}>
                {issue.issueType}
              </Badge>
            )}
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

function JiraIssueCardContent({
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
          <Badge
            variant="outline"
            className="text-[9px] font-bold tracking-wide px-1.5 py-0 h-4 text-muted-foreground/70 shrink-0"
          >
            {issue.epicKey}
          </Badge>
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
          <Badge
            variant="outline"
            className="text-[9px] font-bold tracking-wide px-1.5 py-0 h-4 text-muted-foreground/70 w-fit"
          >
            {issue.issueType ?? ''}
          </Badge>
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

function JiraIssueCardFooter({
  issueKey,
  onOpenInJira,
  onTrackTime,
}: JiraIssueCardFooterProps) {
  async function handleOpenInJira() {
    await onOpenInJira?.(issueKey);
  }

  async function handleTrackTime() {
    await onTrackTime?.(issueKey);
  }

  return (
    <CardFooter className="flex justify-center px-3 pb-2 gap-6 mt-4">
      <Button size="sm" onClick={handleTrackTime} className="flex-1">
        <TimerIcon className="h-4 w-4" />
        Track Time
      </Button>

      <Button variant="outline" size="sm" onClick={handleOpenInJira}>
        <ExternalLinkIcon className="h-4 w-4" />
        Open in Jira
      </Button>
    </CardFooter>
  );
}

export function JiraIssueCard({
  issue,
  defaultExpanded,
  onOpenInJira,
  onTrackTime,
  collapsible = true,
  headerAction,
}: JiraIssueCardProps) {
  const [showDetails, setShowDetails] = useState(defaultExpanded ?? false);

  const parentIssueType = issue.parent?.issueType ?? '';
  const parentLabel =
    parentIssueType === 'Epic'
      ? 'Epic'
      : parentIssueType === 'Story'
      ? 'Story'
      : 'Parent';

  const contentAndFooter = (
    <>
      <JiraIssueCardContent issue={issue} parentLabel={parentLabel} />
      <JiraIssueCardFooter
        issueKey={issue.key ?? ''}
        onOpenInJira={onOpenInJira}
        onTrackTime={onTrackTime}
      />
    </>
  );

  const effectiveHeaderAction =
    collapsible && !showDetails ? headerAction : undefined;

  return (
    <Card
      className={cn(
        'transition-all duration-200 border rounded-(--radius) shadow-none overflow-hidden',
        'border-border bg-card/30 hover:bg-card/40 hover:border-primary/20',
        'py-0',
        (collapsible ? showDetails : true) && 'border-primary/25 bg-card/45'
      )}
    >
      {collapsible ? (
        <Collapsible open={showDetails} onOpenChange={setShowDetails}>
          <JiraIssueCardHeader
            issue={issue}
            showChevron
            expanded={showDetails}
            headerAction={effectiveHeaderAction}
            showInlineBadges={!showDetails}
          />
          <CollapsibleContent>{contentAndFooter}</CollapsibleContent>
        </Collapsible>
      ) : (
        <>
          <JiraIssueCardHeader
            issue={issue}
            showChevron={false}
            headerAction={effectiveHeaderAction}
            showInlineBadges={false}
          />
          {contentAndFooter}
        </>
      )}
    </Card>
  );
}
