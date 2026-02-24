import type { Prisma, PrismaClient } from '@prisma/client';

export type JiraIssueWithParent = Prisma.JiraIssueGetPayload<{
  include: { parent: true };
}>;

export interface JiraIssueUpsertInput {
  key: string;
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
  await prisma.jiraIssue.upsert({
    where: { key: issue.key },
    update: {
      jiraId: issue.jiraId ?? undefined,
      summary: issue.summary,
      status: issue.status,
      issueType: issue.issueType,
      priority: issue.priority,
      epicKey: issue.epicKey ?? undefined,
      assigneeEmail: issue.assigneeEmail ?? undefined,
      syncedAt: new Date(),
      parent: issue.epicKey
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
      key: issue.key,
      jiraId: issue.jiraId ?? undefined,
      summary: issue.summary,
      status: issue.status,
      issueType: issue.issueType,
      priority: issue.priority,
      epicKey: issue.epicKey ?? undefined,
      syncedAt: new Date(),
      parent: issue.epicKey
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
    include: { parent: true },
    orderBy: { updatedAt: 'desc' },
  });
}

export async function getJiraIssuesByEmail(
  prisma: PrismaClient,
  email: string
): Promise<JiraIssueWithParent[]> {
  return prisma.jiraIssue.findMany({
    where: { assigneeEmail: email },
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
