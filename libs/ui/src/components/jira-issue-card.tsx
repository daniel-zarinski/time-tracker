import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardHeader, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from './ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from './ui/dropdown-menu';
import {
  ChevronDownIcon,
  ExternalLinkIcon,
  MoreHorizontal,
} from 'lucide-react';
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
        'border-border bg-card/30 hover:bg-card/40 hover:border-primary/20'
      )}
    >
      <Collapsible open={showDetails} onOpenChange={setShowDetails}>
        <CardHeader className="px-3 flex flex-row items-center gap-3 space-y-0 py-4">
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-(--radius) h-8 w-8 shrink-0"
              aria-label={showDetails ? 'Collapse' : 'Expand'}
            >
              <ChevronDownIcon
                className={cn(
                  'h-4 w-4 text-muted-foreground transition-transform duration-200',
                  showDetails && 'rotate-180'
                )}
              />
            </Button>
          </CollapsibleTrigger>

          <CollapsibleTrigger asChild>
            <div className="flex-1 min-w-0 cursor-pointer select-none rounded-sm -m-1 p-1 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-1.5 flex-wrap">
                <Badge
                  variant="outline"
                  className="shrink-0 text-[9px] font-bold tracking-wide px-1.5 py-0 h-4 text-muted-foreground/70"
                >
                  {issue.key}
                </Badge>
                <span
                  className={cn(
                    'font-semibold transition-colors text-foreground',
                    showDetails ? 'wrap-break-word' : 'truncate'
                  )}
                >
                  {issue.summary}
                </span>
              </div>
            </div>
          </CollapsibleTrigger>

          <div className="flex items-center gap-1.5 shrink-0">
            <Badge
              variant="outline"
              className="text-[9px] font-bold tracking-wide px-1.5 py-0 h-4 text-muted-foreground/70"
            >
              {issue.status}
            </Badge>
            <Badge
              variant="outline"
              className="text-[9px] font-bold tracking-wide px-1.5 py-0 h-4 text-muted-foreground/70"
            >
              {issue.priority}
            </Badge>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-(--radius)"
                  aria-label="More"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleOpenInJira}>
                  <ExternalLinkIcon className="h-4 w-4" />
                  Open in Jira
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="px-3 pt-0 pb-4">
            <div className="py-2 flex flex-col gap-4">
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
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
