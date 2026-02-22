import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardHeader, CardContent, CardFooter } from './ui/card';
import { Badge } from './ui/badge';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from './ui/collapsible';
import { ChevronDownIcon, ExternalLinkIcon } from 'lucide-react';
import { cn } from '@time-tracker/utils';
import type { JiraIssue } from '@time-tracker/jira';

export interface JiraIssueCardProps {
  issue: JiraIssue;
  onOpenInJira?: (issueKey: string) => void | Promise<void>;
}

export function JiraIssueCard({ issue, onOpenInJira }: JiraIssueCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  async function handleOpenInJira() {
    await onOpenInJira?.(issue.key);
  }

  const parentLabel =
    issue.parentIssueType === 'Epic'
      ? 'Epic'
      : issue.parentIssueType === 'Story'
      ? 'Story'
      : 'Parent';

  return (
    <Card
      className={cn(
        'transition-all duration-200 border rounded-(--radius) shadow-none overflow-hidden',
        'border-border bg-card/30 hover:bg-card/40 hover:border-primary/20',
        'py-0',
        showDetails && 'border-primary/25 bg-card/45'
      )}
    >
      <Collapsible open={showDetails} onOpenChange={setShowDetails}>
        <CardHeader className="px-3 flex flex-row items-center gap-3 space-y-0">
          <CollapsibleTrigger asChild>
            <div
              className="flex flex-1 min-w-0 cursor-pointer items-center gap-3 select-none rounded-sm -m-1 p-1 transition-colors py-8"
              aria-label={showDetails ? 'Collapse' : 'Expand'}
            >
              <ChevronDownIcon
                className={cn(
                  'h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200',
                  showDetails && 'rotate-180'
                )}
              />
              <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
                <Badge
                  variant="outline"
                  className="shrink-0 text-[9px] font-bold tracking-wide px-1.5 py-0 h-4 text-muted-foreground/70"
                >
                  {issue.key}
                </Badge>
                <span className="font-semibold text-foreground wrap-break-word">
                  {issue.summary}
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <Badge
                  variant="outline"
                  className="text-[9px] font-bold tracking-wide px-1.5 py-0 h-4 text-muted-foreground/70"
                >
                  {issue.priority}
                </Badge>
              </div>
            </div>
          </CollapsibleTrigger>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="px-3 pt-0 pb-2">
            <div className="py-1.5 flex flex-col gap-3">
              {issue.epicKey && (
                <div className="flex items-center gap-1.5 pt-2 border-t border-muted-foreground/5">
                  <span className="text-[10px] text-muted-foreground/50 uppercase tracking-wider font-medium">
                    {parentLabel}
                  </span>
                  <Badge
                    variant="outline"
                    className="text-[9px] font-bold tracking-wide px-1.5 py-0 h-4 text-muted-foreground/70"
                  >
                    {issue.epicKey}
                  </Badge>
                  {issue.epicSummary && (
                    <span className="text-xs text-muted-foreground/80">
                      {issue.epicSummary}
                    </span>
                  )}
                </div>
              )}
              <div className="flex items-center gap-1.5 pt-2 border-t border-muted-foreground/5">
                <span className="text-[10px] text-muted-foreground/50 uppercase tracking-wider font-medium">
                  Type
                </span>
                <Badge
                  variant="outline"
                  className="text-[9px] font-bold tracking-wide px-1.5 py-0 h-4 text-muted-foreground/70"
                >
                  {issue.issueType}
                </Badge>
              </div>
              <div className="flex items-center gap-1.5 pt-2 border-t border-muted-foreground/5">
                <span className="text-[10px] text-muted-foreground/50 uppercase tracking-wider font-medium">
                  Status
                </span>
                <Badge
                  variant="outline"
                  className="text-[9px] font-bold tracking-wide px-1.5 py-0 h-4 text-muted-foreground/70"
                >
                  {issue.status}
                </Badge>
              </div>
            </div>

            <CardFooter className="flex justify-end border-t border-muted-foreground/5 px-3 pt-2 pb-0">
              <div className="inline-flex rounded-(--radius) overflow-hidden [&>*:not(:first-child)]:-ml-px">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-none first:rounded-l-(--radius) last:rounded-r-(--radius)"
                  onClick={handleOpenInJira}
                >
                  <ExternalLinkIcon className="h-4 w-4" />
                  Open in Jira
                </Button>
              </div>
            </CardFooter>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
