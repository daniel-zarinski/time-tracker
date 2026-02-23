import { join } from 'path';

/**
 * Returns the absolute filesystem path to the database file.
 * - With userDataPath: production DB at `<userDataPath>/<subfolder>/<filename>`.
 * - Without userDataPath: dev DB at `libs/database/prisma/dev.db` (shares CLI migrations).
 */
export function getDatabasePath(
  userDataPath?: string,
  filename = 'time-tracker.db',
  subfolder = 'database'
): string {
  if (userDataPath) {
    return join(userDataPath, subfolder, filename);
  }
  return join(process.cwd(), 'libs/database/prisma/dev.db');
}

/**
 * Returns a Prisma-compatible `file:` database URL.
 * - With userDataPath: production DB at `<userDataPath>/<subfolder>/<filename>`.
 * - Without userDataPath: dev DB at `libs/database/prisma/dev.db` (shares CLI migrations).
 */
export function getDatabaseUrl(
  userDataPath?: string,
  filename = 'time-tracker.db',
  subfolder = 'database'
): string {
  return `file:${getDatabasePath(userDataPath, filename, subfolder)}`;
}

/**
 * Sets `process.env.DATABASE_URL` so Prisma picks it up
 * when the client is instantiated.
 */
export function setDatabaseUrl(url: string): void {
  process.env['DATABASE_URL'] = url;
}
