import {
  getClient,
  getActiveTimeEntry,
  createTimeEntry,
  stopTimeEntry,
  getLastTimeEntryFromIssue as getLastTimeEntryFromIssueDb,
} from '@time-tracker/database';
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
      await stopTimeEntry(prisma, active.id);
    }

    return createTimeEntry(prisma, { issueKey, description });
  }

  async getLastTimeEntryFromIssue(issueKey: string, syncStatus?: SyncStatus) {
    return getLastTimeEntryFromIssueDb(getClient(), issueKey, syncStatus);
  }

  async stopTracking(entryId: string): Promise<TimeEntryWithIssue> {
    return stopTimeEntry(getClient(), entryId);
  }
}
