import { PrismaClient, SyncStatus } from '@prisma/client';
import { JiraService, resolveConfig } from './jira-service';
import { getClient } from '@time-tracker/database';

export class TimeTrackingService {
  private prisma: PrismaClient;
  private jira?: JiraService;

  constructor() {
    this.prisma = getClient();

    try {
      this.jira = new JiraService(resolveConfig());
    } catch (error) {
      console.error('Error initializing JiraService:', error);
    }
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
}
