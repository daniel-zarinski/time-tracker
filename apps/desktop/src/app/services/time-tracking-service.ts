import {
  getClient,
  getActiveTimeEntry,
  createTimeEntry,
  stopTimeEntry,
  getLastTimeEntryFromIssue as _getLastTimeEntryFromIssue,
  getTimeEntryById,
  getTotalTimeSpentSecondsForDay as _getTotalTimeSpentSecondsForDay,
} from '@time-tracker/database';
import { startOfDay, endOfDay } from '@time-tracker/utils';
import type { SyncStatus } from '@prisma/client';
import type { TimeEntryWithIssue } from '@time-tracker/database';

export class TimeTrackingService {
  async startTracking(
    issueKey: string,
    description?: string
  ): Promise<TimeEntryWithIssue> {
    const prisma = getClient();
    const active = await getActiveTimeEntry(prisma);

    if (active) {
      if (active.issueKey === issueKey) return active;
      await this.stopTracking(active.id);
    }

    return createTimeEntry(prisma, { issueKey, description });
  }

  async getLastTimeEntryFromIssue(issueKey: string, syncStatus?: SyncStatus) {
    return _getLastTimeEntryFromIssue(getClient(), issueKey, syncStatus);
  }

  async getTotalTimeSpentSecondsForDay(date: Date): Promise<number> {
    const start = startOfDay(date);
    const end = endOfDay(date);
    return _getTotalTimeSpentSecondsForDay(getClient(), start, end);
  }

  async stopTracking(entryId: string): Promise<TimeEntryWithIssue> {
    const prisma = getClient();
    const entry = await getTimeEntryById(prisma, entryId);

    if (!entry) throw new Error('Time entry not found');
    if (entry.timeSpentSeconds != null)
      throw new Error('Time entry already stopped');

    const timeSpentSeconds = Math.floor(
      (Date.now() - entry.startedAt.getTime()) / 1000
    );

    return stopTimeEntry(prisma, entryId, timeSpentSeconds);
  }
}
