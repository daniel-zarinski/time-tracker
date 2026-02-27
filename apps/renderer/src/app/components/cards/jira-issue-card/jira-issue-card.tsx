import { useState } from 'react';
import {
  BorderTrail,
  Card,
  Collapsible,
  CollapsibleContent,
} from '@time-tracker/ui';
import { cn } from '@time-tracker/utils';
import type { JiraIssueWithParent } from '@time-tracker/database';
import { JiraIssueCardHeader } from './jira-issue-card-header';
import { JiraIssueCardContent } from './jira-issue-card-content';
import { JiraIssueCardFooter } from './jira-issue-card-footer';

export interface JiraIssueCardProps {
  issue: JiraIssueWithParent;
  onOpenInJira?: (issueKey: string) => void | Promise<void>;
  onTrackTime?: (issueKey: string) => void | Promise<unknown>;
  showTrail?: boolean;
  defaultExpanded?: boolean;
  collapsible?: boolean;
  headerAction?: React.ReactNode;
}

export function JiraIssueCard({
  issue,
  defaultExpanded,
  onOpenInJira,
  onTrackTime,
  showTrail,
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
        'relative transition-all duration-200 border rounded-(--radius) shadow-none overflow-hidden',
        'border-border bg-card/30 hover:bg-card/40 hover:border-primary/20',
        'py-0',
        (collapsible ? showDetails : true) && 'border-primary/25 bg-card/45'
      )}
    >
      {showTrail && <BorderTrail size={80} />}
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
