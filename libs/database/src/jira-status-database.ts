import type { PrismaClient } from '@prisma/client';

export interface JiraStatusInput {
  id: number;
  name: string;
  categoryName?: string | null;
  categoryKey?: string | null;
  colorName?: string | null;
}

export interface JiraStatusWithCategory {
  id: number;
  name: string;
  categoryName: string | null;
  categoryKey: string | null;
  colorName: string | null;
}

export async function upsertJiraStatuses(
  prisma: PrismaClient,
  statuses: JiraStatusInput[]
): Promise<void> {
  for (const s of statuses) {
    await prisma.jiraStatus.upsert({
      where: { id: s.id },
      update: {
        name: s.name,
        categoryName: s.categoryName,
        categoryKey: s.categoryKey,
        colorName: s.colorName,
      },
      create: {
        id: s.id,
        name: s.name,
        categoryName: s.categoryName,
        categoryKey: s.categoryKey,
        colorName: s.colorName,
      },
    });
  }
}

export async function getJiraStatusesWithCategory(
  prisma: PrismaClient
): Promise<JiraStatusWithCategory[]> {
  return prisma.jiraStatus.findMany({
    select: {
      id: true,
      name: true,
      categoryName: true,
      categoryKey: true,
      colorName: true,
    },
    orderBy: [{ categoryName: 'asc' }, { name: 'asc' }],
  });
}

export async function getStatusNamesByCategory(
  prisma: PrismaClient,
  categoryName: string
): Promise<string[]> {
  const statuses = await prisma.jiraStatus.findMany({
    where: { categoryName },
    select: { name: true },
  });
  return statuses.map((s) => s.name);
}

export async function updateStatusCategory(
  prisma: PrismaClient,
  jiraStatusId: number,
  categoryName: string | null
): Promise<void> {
  await prisma.jiraStatus.update({
    where: { id: jiraStatusId },
    data: { categoryName },
  });
}
