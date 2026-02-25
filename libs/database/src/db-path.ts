import { join } from 'path';

const DEFAULT_FILENAME = 'database.sqlite3';

/**
 * Returns the absolute filesystem path to the database file.
 * Path: join(userDataPath, "database.sqlite3")
 */
export function getDatabasePath(userDataPath: string): string {
  return join(userDataPath, DEFAULT_FILENAME);
}

/**
 * Returns a Prisma-compatible `file:` database URL.
 */
export function getDatabaseUrl(userDataPath: string): string {
  return `file:${getDatabasePath(userDataPath)}`;
}

/**
 * Sets `process.env.DATABASE_URL` so Prisma picks it up
 * when the client is instantiated.
 */
export function setDatabaseUrl(url: string): void {
  process.env['DATABASE_URL'] = url;
}
