import { join } from 'path';

/**
 * Returns a Prisma-compatible `file:` database URL.
 * - With userDataPath: production DB at `<userDataPath>/<filename>`.
 * - Without userDataPath: dev DB at `libs/database/prisma/dev.db` (shares CLI migrations).
 */
export function getDatabaseUrl(
  userDataPath?: string,
  filename = 'time-tracker.db'
): string {
  if (userDataPath) {
    return `file:${join(userDataPath, filename)}`;
  }
  return `file:${join(process.cwd(), 'libs/database/prisma/dev.db')}`;
}

/**
 * Sets `process.env.DATABASE_URL` so Prisma picks it up
 * when the client is instantiated.
 */
export function setDatabaseUrl(url: string): void {
  process.env['DATABASE_URL'] = url;
}
