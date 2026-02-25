import type { Prisma, PrismaClient } from '@prisma/client';

export type JiraIssueWithParent = Prisma.JiraIssueGetPayload<{
  include: { parent: true };
}>;

export interface JiraIssueUpsertInput {
  key?: string | null;
  jiraId?: number | null;
  summary: string;
  status: string;
  issueType: string;
  priority: string;
  epicKey?: string | null;
  assigneeEmail?: string | null;
  // rank?: number | null; // built in to kanban board
}

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

const ACTIVE_STATUSES = ['In Progress', 'In Review'];
const IGNORE_STATUSES = [
  'Cancelled',
  'Done',
  'Closed',
  'Inactive',
  'DEV COMPLETED',
  'To Do',
];

export async function getRelevantJiraIssues(
  prisma: PrismaClient,
  email: string,
  options?: { limit?: number }
): Promise<JiraIssueWithParent[]> {
  const limit = options?.limit ?? 5;

  // Get recently tracked issue keys for ranking
  const recentEntries = await prisma.timeEntry.findMany({
    where: {
      issue: {
        assigneeEmail: email,
        status: { notIn: IGNORE_STATUSES },
      },
    },
    distinct: ['issueKey'],
    orderBy: { startedAt: 'desc' },
    select: { issueKey: true },
    take: limit,
  });

  const recentKeys = recentEntries.map((e) => e.issueKey);

  // Fetch all non-terminal issues assigned to user
  const issues = await prisma.jiraIssue.findMany({
    where: {
      key: { not: null },
      assigneeEmail: email,
      status: { notIn: IGNORE_STATUSES },
    },
    include: { parent: true },
    take: limit * 2,
  });

  // Rank: recently tracked first, then active statuses, then rest
  const keyOrder = new Map(recentKeys.map((k, i) => [k, i]));
  const activeSet = new Set(ACTIVE_STATUSES);

  issues.sort((a, b) => {
    const aRecent = a.key != null ? keyOrder.get(a.key) ?? Infinity : Infinity;
    const bRecent = b.key != null ? keyOrder.get(b.key) ?? Infinity : Infinity;
    if (aRecent !== bRecent) return aRecent - bRecent;

    const aActive = a.status && activeSet.has(a.status) ? 0 : 1;
    const bActive = b.status && activeSet.has(b.status) ? 0 : 1;
    return aActive - bActive;
  });

  return issues.slice(0, limit);
}
