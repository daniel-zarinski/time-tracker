import type { Prisma, PrismaClient } from '@prisma/client';

/** Input for upserting a worklog from an external source (e.g. Tempo API). */
export type WorklogUpsertInput = Omit<Prisma.WorklogUncheckedCreateInput, 'id'>;

export async function upsertWorklog(
  prisma: PrismaClient,
  input: WorklogUpsertInput
): Promise<void> {
  await prisma.worklog.upsert({
    where: { tempoWorklogId: input.tempoWorklogId },
    update: {
      jiraWorklogId: input.jiraWorklogId ?? undefined,
      issue: input.issueId
        ? {
            connectOrCreate: {
              where: { jiraId: input.issueId },
              create: { jiraId: input.issueId },
            },
          }
        : undefined,
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
      issue: input.issueId
        ? {
            connectOrCreate: {
              where: { jiraId: input.issueId },
              create: { jiraId: input.issueId },
            },
          }
        : undefined,
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
