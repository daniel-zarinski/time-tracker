import { app, ipcMain } from 'electron';
import { existsSync, mkdirSync, unlinkSync } from 'fs';
import { join } from 'path';
import {
  setDatabaseUrl,
  getDatabaseUrl,
  getClient,
  disconnect,
  getDatabasePath,
  getJiraIssuesByEmail,
  getJiraIssues,
} from '@time-tracker/database';
import { JiraApiError } from '@time-tracker/jira';
import { resolveConfig } from '../services/jira-service';

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

ipcMain.handle('database:get-path', () =>
  app.isPackaged ? getDatabasePath(app.getPath('userData')) : getDatabasePath()
);

ipcMain.handle('database:delete', async () => {
  await disconnect();
  const path = app.isPackaged
    ? getDatabasePath(app.getPath('userData'))
    : getDatabasePath();
  if (existsSync(path)) {
    unlinkSync(path);
    return { success: true };
  }
  return { success: false, error: 'Database file not found' };
});

ipcMain.handle('database:get-my-jira-issues', async () => {
  const config = resolveConfig();
  if (!config.email) {
    throw new JiraApiError('Jira email is not configured');
  }
  const client = getClient();
  return getJiraIssuesByEmail(client, config.email);
});

ipcMain.handle('jira:get-issues', async () => {
  const client = getClient();
  return getJiraIssues(client);
});
