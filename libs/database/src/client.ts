import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

let prisma: PrismaClient | null = null;

export function getClient(dbPath?: string): PrismaClient {
  if (!prisma) {
    const resolvedPath =
      dbPath ?? process.env['DATABASE_URL']?.replace('file:', '');
    if (!resolvedPath) {
      throw new Error(
        'Database path not configured. Call setDatabaseUrl() before getClient().'
      );
    }
    const adapter = new PrismaBetterSqlite3({ url: resolvedPath });
    prisma = new PrismaClient({ adapter });
  }
  return prisma;
}

export async function disconnect(): Promise<void> {
  if (prisma) {
    await prisma.$disconnect();
    prisma = null;
  }
}
