import { PrismaClient, SyncStatus } from '@prisma/client';
import { getClient } from '@time-tracker/database';

export class TimeTrackingService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = getClient();
  }

  async startTracking(issueKey: string, description?: string) {
    const existingActiveTimeEntry = await this.prisma.timeEntry.findFirst({
      where: { issueKey, syncStatus: SyncStatus.LOCAL, timeSpentSeconds: null },
    });

    if (existingActiveTimeEntry) {
      throw new Error('Issue is already being tracked');
    }

    const timeEntry = await this.prisma.timeEntry.create({
      data: {
        issue: {
          connectOrCreate: {
            where: { key: issueKey },
            create: { key: issueKey },
          },
        },
        syncStatus: SyncStatus.LOCAL,
        startedAt: new Date(),
        description,
      },
    });

    return timeEntry;
  }

  async stopTracking(entryId: string) {
    const timeEntry = await this.prisma.timeEntry.findUniqueOrThrow({
      where: { id: entryId },
    });

    await this.prisma.timeEntry.update({
      where: { id: entryId },
      data: {
        timeSpentSeconds:
          Math.floor(Date.now() - timeEntry.startedAt.getTime()) / 1000,
      },
    });

    return timeEntry;
  }
}
