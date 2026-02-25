import type { TimeEntryWithIssue } from '@time-tracker/database'

export interface TimeEntryUpdates {
  startedAt?: Date
  endedAt?: Date
  timeSpentSeconds?: number
  description?: string
}

export type CardState = 'default' | 'expanded' | 'edit'

export interface TimeEntryCardDefaultProps {
  entry: TimeEntryWithIssue
  /** Hours per day for progress calculation (default: 7) */
  hoursPerDay?: number
  /** Start with actions expanded (default: false) */
  defaultExpanded?: boolean
  onResumeTimer?: (issueKey: string) => unknown | Promise<unknown>
  onSave?: (entryId: string, updates: TimeEntryUpdates) => void | Promise<void>
  onDelete?: (entryId: string) => void | Promise<void>
  onOpenInJira?: (issueKey: string) => void | Promise<void>
  className?: string
}
