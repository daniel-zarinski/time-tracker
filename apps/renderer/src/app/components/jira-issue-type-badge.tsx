import { cn } from '@time-tracker/utils';

interface JiraIssueTypeBadgeProps {
  issueType?: string | null;
  className?: string;
}

const issueTypeColors: Record<string, string> = {
  Task: 'border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400',
  'Sub-task':
    'border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400',
  Story:
    'border-green-500/30 bg-green-300/10 text-green-600 dark:text-green-400',
  Bug: 'border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400',
  Epic: 'border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400',
  Initiative:
    'border-yellow-500/30 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
  'Meetings and Admin':
    'border-orange-500/30 bg-orange-500/10 text-orange-600 dark:text-orange-400',
};

const defaultColor = 'border-border text-muted-foreground/70';

const baseStyles =
  'inline-flex items-center justify-center rounded-full border text-[9px] font-bold tracking-wide px-1.5 py-0 h-4 shrink-0 w-fit whitespace-nowrap';

export function JiraIssueTypeBadge({
  issueType,
  className,
}: JiraIssueTypeBadgeProps) {
  if (!issueType) return null;

  const colorStyles = issueTypeColors[issueType] ?? defaultColor;

  return (
    <span className={cn(baseStyles, colorStyles, className)}>{issueType}</span>
  );
}
