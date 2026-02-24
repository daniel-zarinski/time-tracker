import type { Prisma } from '@prisma/client';

export type TimeEntryWithIssue = Prisma.TimeEntryGetPayload<{
  include: { issue: { include: { parent: true } } };
}>;
