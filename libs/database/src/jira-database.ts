import type { Prisma, PrismaClient } from '@prisma/client';

export type JiraIssueWithParent = Prisma.JiraIssueGetPayload<{
  include: { parent: true };
}>;

export interface JiraIssueUpsertInput {
  key: string;
  summary: string;
  status: string;
  issueType: string;
  priority: string;
  epicKey?: string | null;
  assigneeEmail?: string | null;
}

export async function upsertJiraIssue(
  prisma: PrismaClient,
  issue: JiraIssueUpsertInput
): Promise<void> {
  await prisma.jiraIssue.upsert({
    where: { key: issue.key },
    update: {
      summary: issue.summary,
      status: issue.status,
      issueType: issue.issueType,
      priority: issue.priority,
      epicKey: issue.epicKey ?? undefined,
      assigneeEmail: issue.assigneeEmail ?? undefined,
    },
    create: {
      key: issue.key,
      summary: issue.summary,
      status: issue.status,
      issueType: issue.issueType,
      priority: issue.priority,
      epicKey: issue.epicKey ?? undefined,
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
