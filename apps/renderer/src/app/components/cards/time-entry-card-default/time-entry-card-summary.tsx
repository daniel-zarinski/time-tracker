import {
  formatDuration,
  formatRelativeDate,
  formatTime,
} from '@time-tracker/utils'

interface TimeEntryCardSummaryProps {
  startDate: Date
  endDate: Date
  duration: number
}

export function TimeEntryCardSummary({
  startDate,
  endDate,
  duration,
}: TimeEntryCardSummaryProps) {
  return (
    <div className="flex items-center text-xs text-muted-foreground">
      <span>{formatRelativeDate(startDate)}</span>
      <span className="mx-auto">
        {formatTime(startDate)} → {formatTime(endDate)}
      </span>
      <span>
        {formatDuration(duration)}
      </span>
    </div>
  )
}
