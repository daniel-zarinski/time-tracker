import type { PrismaClient } from '@prisma/client';

export interface JiraStatusCategoryInput {
  name: string;
  key: string;
  colorName?: string | null;
}

export interface JiraStatusInput {
  id: string;
  name: string;
  categoryName?: string | null;
}

export interface JiraStatusWithCategory {
  id: string;
  name: string;
  categoryName: string | null;
  category: {
    name: string;
    key: string;
    colorName: string | null;
  } | null;
}

export async function upsertJiraStatusCategories(
  prisma: PrismaClient,
  categories: JiraStatusCategoryInput[]
): Promise<void> {
  for (const cat of categories) {
    await prisma.jiraStatusCategory.upsert({
      where: { name: cat.name },
      update: {
        key: cat.key,
        colorName: cat.colorName ?? undefined,
      },
      create: {
        name: cat.name,
        key: cat.key,
        colorName: cat.colorName ?? undefined,
      },
    });
  }
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
      },
      create: {
        id: s.id,
        name: s.name,
        categoryName: s.categoryName,
      },
    });
  }
}

export async function getJiraStatusesWithCategory(
  prisma: PrismaClient
): Promise<JiraStatusWithCategory[]> {
  return prisma.jiraStatus.findMany({
    include: { category: true },
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
  jiraStatusId: string,
  categoryName: string | null
): Promise<void> {
  await prisma.jiraStatus.update({
    where: { id: jiraStatusId },
    data: { categoryName },
  });
}
