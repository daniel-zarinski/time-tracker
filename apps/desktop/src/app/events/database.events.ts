import { app } from 'electron';
import {
  setDatabaseUrl,
  getDatabaseUrl,
  getClient,
  disconnect,
} from '@time-tracker/database';

export function bootstrapDatabase(): void {
  // In development, use dev.db (no arg) so we share CLI migrations.
  // In production, use userData path.
  const dbUrl = app.isPackaged
    ? getDatabaseUrl(app.getPath('userData'))
    : getDatabaseUrl();

  setDatabaseUrl(dbUrl);
  getClient();

  app.on('before-quit', async () => {
    await disconnect();
  });
}
