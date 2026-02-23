import { app } from 'electron';
import { mkdirSync } from 'fs';
import { join } from 'path';
import {
  setDatabaseUrl,
  getDatabaseUrl,
  getClient,
  disconnect,
} from '@time-tracker/database';

export function bootstrapDatabase(): void {
  // In development, use dev.db (no arg) so we share CLI migrations.
  // In production, use userData/database path.
  const dbUrl = app.isPackaged
    ? getDatabaseUrl(app.getPath('userData'))
    : getDatabaseUrl();

  if (app.isPackaged) {
    mkdirSync(join(app.getPath('userData'), 'database'), { recursive: true });
  }

  setDatabaseUrl(dbUrl);
  getClient();

  app.on('before-quit', async () => {
    await disconnect();
  });
}
