import { cn } from '@time-tracker/utils'
import { Badge } from '../../ui/badge'
import {
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../ui/card'

interface TimeEntryCardHeaderProps {
  issueKey: string
  summary: string
  truncate?: boolean
  className?: string
  /** Rendered in CardAction slot (e.g. dropdown menu) when provided */
  children?: React.ReactNode
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
      <CardTitle className="flex items-center gap-1.5">
        <Badge
          variant="outline"
          className="shrink-0 text-[9px] font-bold tracking-wide px-1.5 py-0 h-4 text-muted-foreground/70"
        >
          {issueKey}
        </Badge>
      </CardTitle>
      <CardDescription
        className={cn('text-xs', truncate && 'truncate')}
      >
        {summary}
      </CardDescription>
      {children && <CardAction>{children}</CardAction>}
    </CardHeader>
  )
}
