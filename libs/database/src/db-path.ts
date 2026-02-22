import { join } from 'path';

/**
 * Returns a Prisma-compatible `file:` database URL
 * pointing to `<userDataPath>/<filename>`.
 */
export function getDatabaseUrl(
  userDataPath: string,
  filename = 'time-tracker.db'
): string {
  return `file:${join(userDataPath, filename)}`;
}

/**
 * Sets `process.env.DATABASE_URL` so Prisma picks it up
 * when the client is instantiated.
 */
export function setDatabaseUrl(url: string): void {
  process.env['DATABASE_URL'] = url;
}
