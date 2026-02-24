import type { Prisma, PrismaClient } from '@prisma/client';

/** Input for upserting a worklog from an external source (e.g. Tempo API). */
export type WorklogUpsertInput = Omit<
  Prisma.WorklogUncheckedCreateInput,
  'id'
>;

export async function upsertWorklog(
  prisma: PrismaClient,
  input: WorklogUpsertInput
): Promise<void> {
  const issueKey = input.issueKey ?? null;
  if (issueKey != null && typeof issueKey !== 'string') {
    throw new Error(
      `Worklog ${input.tempoWorklogId} has invalid issueKey: ${String(issueKey)}`
    );
  }
  if (issueKey) {
    await prisma.jiraIssue.upsert({
      where: { key: issueKey },
      create: { key: issueKey },
      update: {},
    });
  }

  await prisma.worklog.upsert({
    where: { tempoWorklogId: input.tempoWorklogId },
    update: {
      jiraWorklogId: input.jiraWorklogId ?? undefined,
      issueKey,
      issueId: input.issueId,
      timeSpentSeconds: input.timeSpentSeconds,
      billableSeconds: input.billableSeconds,
      startedAt: input.startedAt,
      description: input.description,
      authorAccountId: input.authorAccountId,
      authorName: input.authorName ?? undefined,
      tempoCreatedAt: input.tempoCreatedAt ?? undefined,
      tempoUpdatedAt: input.tempoUpdatedAt ?? undefined,
    },
    create: {
      tempoWorklogId: input.tempoWorklogId,
      jiraWorklogId: input.jiraWorklogId ?? undefined,
      issueKey,
      issueId: input.issueId,
      timeSpentSeconds: input.timeSpentSeconds,
      billableSeconds: input.billableSeconds,
      startedAt: input.startedAt,
      description: input.description,
      authorAccountId: input.authorAccountId,
      authorName: input.authorName ?? undefined,
      tempoCreatedAt: input.tempoCreatedAt ?? undefined,
      tempoUpdatedAt: input.tempoUpdatedAt ?? undefined,
    },
  });
}

export async function upsertWorklogs(
  prisma: PrismaClient,
  inputs: WorklogUpsertInput[]
): Promise<void> {
  for (const input of inputs) {
    await upsertWorklog(prisma, input);
  }
}
