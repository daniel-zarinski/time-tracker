import type { Prisma, PrismaClient } from '@prisma/client';
import type { JiraIssueUpsertInput } from '@time-tracker/schema';

export type JiraIssueWithParent = Prisma.JiraIssueGetPayload<{
  include: { parent: true };
}>;

export async function upsertJiraIssue(
  prisma: PrismaClient,
  issue: JiraIssueUpsertInput
): Promise<void> {
  const key = issue.key?.trim() || null;
  const jiraId = issue.jiraId ?? null;

  if (!key && jiraId == null) {
    throw new Error('JiraIssueUpsertInput requires at least key or jiraId');
  }

  const where = key
    ? ({ key } as const)
    : ({ jiraId: jiraId as number } as const);
  const keyData = issue.key ?? undefined;

  await prisma.jiraIssue.upsert({
    where,
    update: {
      key: keyData,
      jiraId: issue.jiraId ?? undefined,
      summary: issue.summary,
      status: issue.status,
      issueType: issue.issueType,
      priority: issue.priority,
      epicKey: issue.epicKey ?? undefined,
      assigneeEmail: issue.assigneeEmail ?? undefined,
      syncedAt: new Date(),
      jiraStatus: issue.statusId
        ? {
            connectOrCreate: {
              where: { id: issue.statusId },
              create: {
                id: issue.statusId,
                name: issue.status,
                categoryKey: issue.categoryKey ?? undefined,
              },
            },
          }
        : undefined,
      parent:
        issue.epicKey && issue.epicKey !== ''
          ? {
              connectOrCreate: {
                where: { key: issue.epicKey },
                create: {
                  key: issue.epicKey,
                  issueType: 'Epic',
                },
              },
            }
          : undefined,
    },
    create: {
      key: keyData,
      jiraId: issue.jiraId ?? undefined,
      summary: issue.summary,
      status: issue.status,
      issueType: issue.issueType,
      priority: issue.priority,
      epicKey: issue.epicKey ?? undefined,
      syncedAt: new Date(),
      jiraStatus: issue.statusId
        ? {
            connectOrCreate: {
              where: { id: issue.statusId },
              create: {
                id: issue.statusId,
                name: issue.status,
                categoryKey: issue.categoryKey ?? undefined,
              },
            },
          }
        : undefined,
      parent:
        issue.epicKey && issue.epicKey !== ''
          ? {
              connectOrCreate: {
                where: { key: issue.epicKey },
                create: {
                  key: issue.epicKey,
                  issueType: 'Epic',
                },
              },
            }
          : undefined,
      assigneeEmail: issue.assigneeEmail ?? undefined,
    },
  });

  if (issue.statusId != null && issue.categoryKey != null) {
    await prisma.jiraStatus.update({
      where: { id: issue.statusId },
      data: { categoryKey: issue.categoryKey },
    });
  }
}

export async function getJiraIssues(
  prisma: PrismaClient
): Promise<JiraIssueWithParent[]> {
  return prisma.jiraIssue.findMany({
    where: { key: { not: null } },
    include: { parent: true },
    orderBy: { updatedAt: 'desc' },
  });
}

export async function getJiraIssuesByEmail(
  prisma: PrismaClient,
  email: string
): Promise<JiraIssueWithParent[]> {
  return prisma.jiraIssue.findMany({
    where: { assigneeEmail: email, key: { not: null } },
    include: { parent: true },
    orderBy: { updatedAt: 'desc' },
  });
}

export async function getJiraIssuesUnsynced(
  prisma: PrismaClient
): Promise<JiraIssueWithParent[]> {
  return prisma.jiraIssue.findMany({
    where: { syncedAt: null },
    include: { parent: true },
    orderBy: { updatedAt: 'desc' },
  });
}

// categoryKey values for "not done" — covers both API formats (new/indeterminate vs TODO/IN_PROGRESS)
const RELEVANT_CATEGORY_KEYS = ['TODO', 'IN_PROGRESS', 'new', 'indeterminate'];
const RELEVENT_ISSUE_TYPES = ['Story', 'Task', 'Bug', 'Sub-task'];

export async function getRelevantJiraIssues(
  prisma: PrismaClient,
  email: string,
  options?: { limit?: number }
): Promise<JiraIssueWithParent[]> {
  const limit = options?.limit ?? 5;

  const recentEntries = await prisma.timeEntry.findMany({
    where: {
      issue: {
        assigneeEmail: email,
        jiraStatus: { categoryKey: { in: RELEVANT_CATEGORY_KEYS } },
      },
    },
    distinct: ['issueKey'],
    orderBy: { startedAt: 'desc' },
    select: { issueKey: true },
    take: limit,
  });

  const recentKeys = recentEntries.map((e) => e.issueKey);
  const keyOrder = new Map(recentKeys.map((k, i) => [k, i]));

  const issues = await prisma.jiraIssue.findMany({
    where: {
      key: { not: null },
      assigneeEmail: email,
      jiraStatus: { categoryKey: { in: RELEVANT_CATEGORY_KEYS } },
      issueType: { in: RELEVENT_ISSUE_TYPES },
    },
    include: { parent: true, jiraStatus: true },
    take: limit,
  });

  const isInProgress = (key: string | null) =>
    key === 'IN_PROGRESS' || key === 'indeterminate';

  issues.sort((a, b) => {
    const aRecent = a.key != null ? keyOrder.get(a.key) ?? Infinity : Infinity;
    const bRecent = b.key != null ? keyOrder.get(b.key) ?? Infinity : Infinity;
    if (aRecent !== bRecent) return aRecent - bRecent;

    const aActive = isInProgress(a.jiraStatus?.categoryKey ?? null) ? 0 : 1;
    const bActive = isInProgress(b.jiraStatus?.categoryKey ?? null) ? 0 : 1;
    return aActive - bActive;
  });

  return issues.slice(0, limit);
}
