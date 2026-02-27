import {
  Button,
  CardFooter,
} from '@time-tracker/ui';
import { ExternalLinkIcon, TimerIcon } from 'lucide-react';

interface JiraIssueCardFooterProps {
  issueKey: string;
  onOpenInJira?: (issueKey: string) => void | Promise<void>;
  onTrackTime?: (issueKey: string) => void | Promise<unknown>;
}

export function JiraIssueCardFooter({
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
