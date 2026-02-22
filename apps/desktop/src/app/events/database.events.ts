import { app } from 'electron';
import {
  setDatabaseUrl,
  getDatabaseUrl,
  getClient,
  disconnect,
} from '@time-tracker/database';

export function bootstrapDatabase(): void {
  const dbUrl = getDatabaseUrl(app.getPath('userData'));
  setDatabaseUrl(dbUrl);
  getClient();
  app.on('before-quit', async () => {
    await disconnect();
  });
}
