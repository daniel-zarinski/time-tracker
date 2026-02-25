import type { Prisma, PrismaClient } from '@prisma/client';
import { SyncStatus } from '@prisma/client';

export type TimeEntryWithIssue = Prisma.TimeEntryGetPayload<{
  include: { issue: { include: { parent: true } } };
}>;

const timeEntryInclude = {
  issue: { include: { parent: true } },
} as const;

export async function getActiveTimeEntry(
  prisma: PrismaClient
): Promise<TimeEntryWithIssue | null> {
  return prisma.timeEntry.findFirst({
    where: { syncStatus: SyncStatus.LOCAL, timeSpentSeconds: null },
    include: timeEntryInclude,
  });
}

export async function getTimeEntries(
  prisma: PrismaClient,
  options?: { limit?: number }
): Promise<TimeEntryWithIssue[]> {
  return prisma.timeEntry.findMany({
    include: timeEntryInclude,
    orderBy: { startedAt: 'desc' },
    take: options?.limit,
  });
}

export interface CreateTimeEntryInput {
  issueKey: string;
  description?: string;
}

export async function createTimeEntry(
  prisma: PrismaClient,
  input: CreateTimeEntryInput
): Promise<TimeEntryWithIssue> {
  const timeEntry = await prisma.timeEntry.create({
    data: {
      issue: {
        connectOrCreate: {
          where: { key: input.issueKey },
          create: { key: input.issueKey },
        },
      },
      syncStatus: SyncStatus.LOCAL,
      startedAt: new Date(),
      description: input.description,
    },
    include: timeEntryInclude,
  });
  return timeEntry;
}

export async function stopTimeEntry(
  prisma: PrismaClient,
  entryId: string
): Promise<TimeEntryWithIssue> {
  const timeEntry = await prisma.timeEntry.findUniqueOrThrow({
    where: { id: entryId },
  });

  const timeSpentSeconds = Math.floor(
    (Date.now() - timeEntry.startedAt.getTime()) / 1000
  );

  return prisma.timeEntry.update({
    where: { id: entryId },
    data: { timeSpentSeconds },
    include: timeEntryInclude,
  });
}

export async function deleteTimeEntry(
  prisma: PrismaClient,
  entryId: string
): Promise<TimeEntryWithIssue> {
  return prisma.timeEntry.delete({
    where: { id: entryId },
    include: timeEntryInclude,
  });
}

export async function getLastTimeEntryFromIssue(
  prisma: PrismaClient,
  issueKey: string,
  syncStatus?: SyncStatus
) {
  return prisma.timeEntry.findFirst({
    where: { issueKey, syncStatus },
    orderBy: { startedAt: 'desc' },
  });
}

export async function getTimeEntriesByIssueKey(
  prisma: PrismaClient,
  issueKey: string,
  syncStatus?: SyncStatus
) {
  return prisma.timeEntry.findMany({
    where: { issueKey, syncStatus },
    orderBy: { startedAt: 'desc' },
  });
}
