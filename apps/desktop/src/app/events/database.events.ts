import { app, ipcMain } from 'electron';
import { existsSync, closeSync, openSync, unlinkSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { spawn } from 'child_process';
import {
  setDatabaseUrl,
  getDatabaseUrl,
  getClient,
  disconnect,
  getDatabasePath,
  getJiraIssuesByEmail,
  getJiraIssueByKey,
  getJiraIssues,
  getRelevantJiraIssues,
  getTimeEntries,
  getActiveTimeEntry,
  deleteTimeEntry,
  updateTimeEntry,
} from '@time-tracker/database';
import { JiraApiError } from '@time-tracker/jira';
import { resolveConfig } from '../services/jira-service';
import { destroyTray } from '../tray';

async function runMigrations(dbUrl: string): Promise<void> {
  const appPath = app.getAppPath();
  const basePath = appPath.replace('app.asar', 'app.asar.unpacked');
  const schemaPath = join(basePath, 'prisma', 'schema.prisma');

  if (!existsSync(schemaPath)) {
    throw new Error(
      `Prisma schema not found at ${schemaPath} (appPath: ${appPath})`
    );
  }

  const prismaPkg = require.resolve('prisma/package.json') as string;
  const prismaPath = resolve(dirname(prismaPkg), 'build', 'index.js');
  const configPath = join(basePath, 'prisma.config.ts');

  if (!existsSync(configPath)) {
    throw new Error(
      `Prisma config not found at ${configPath} (appPath: ${appPath})`
    );
  }

  return new Promise((resolvePromise, reject) => {
    const child = spawn(
      'node',
      [
        prismaPath,
        'migrate',
        'deploy',
        '--schema',
        schemaPath,
        '--config',
        configPath,
      ],
      {
        env: { ...process.env, DATABASE_URL: dbUrl },
        stdio: ['ignore', 'pipe', 'pipe'],
      }
    );

    let stderr = '';
    child.stderr?.on('data', (chunk) => {
      stderr += chunk.toString();
    });
    child.stdout?.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('close', (code) => {
      if (code === 0) resolvePromise();
      else {
        console.error('[migrations] stderr:', stderr);
        reject(new Error(`Prisma migrate deploy failed (${code}): ${stderr}`));
      }
    });
    child.on('error', reject);
  });
}

export async function bootstrapDatabase(): Promise<void> {
  const userData = app.getPath('userData');
  const dbUrl = getDatabaseUrl(userData);

  setDatabaseUrl(dbUrl);

  const dbPath = getDatabasePath(userData);
  if (!existsSync(dbPath)) {
    closeSync(openSync(dbPath, 'w'));
  }
  try {
    await runMigrations(dbUrl);
  } catch (err) {
    console.error('Migration failed:', err);
  }

  getClient();

  app.on('before-quit', async () => {
    destroyTray();
    await disconnect();
  });
}

ipcMain.handle('database:get-path', () =>
  getDatabasePath(app.getPath('userData'))
);

ipcMain.handle('database:delete', async () => {
  await disconnect();
  const path = getDatabasePath(app.getPath('userData'));
  if (existsSync(path)) {
    unlinkSync(path);
    return { success: true };
  }
  return { success: false, error: 'Database file not found' };
});

ipcMain.handle(
  'database:get-jira-issue-by-key',
  async (_event, key: string) => {
    const client = getClient();
    return getJiraIssueByKey(client, key);
  }
);

ipcMain.handle('database:get-my-jira-issues', async () => {
  const config = resolveConfig();
  if (!config.email) {
    throw new JiraApiError('Jira email is not configured');
  }
  const client = getClient();
  return getJiraIssuesByEmail(client, config.email);
});

ipcMain.handle(
  'database:get-relevant-jira-issues',
  async (_event, options?: { limit?: number }) => {
    const config = resolveConfig();
    if (!config.email) {
      throw new JiraApiError('Jira email is not configured');
    }
    const client = getClient();
    return getRelevantJiraIssues(client, config.email, options);
  }
);

ipcMain.handle('jira:get-issues', async () => {
  const client = getClient();
  return getJiraIssues(client);
});

ipcMain.handle(
  'database:get-time-entries',
  async (_event, options?: { limit?: number }) => {
    return getTimeEntries(getClient(), options);
  }
);

ipcMain.handle('database:get-active-time-entry', async () => {
  return getActiveTimeEntry(getClient());
});

ipcMain.handle('database:delete-time-entry', async (_event, entryId: string) =>
  deleteTimeEntry(getClient(), entryId)
);

ipcMain.handle(
  'database:update-time-entry',
  async (
    _event,
    entryId: string,
    updates: {
      startedAt?: string;
      timeSpentSeconds?: number;
      description?: string;
    }
  ) => {
    const data: {
      startedAt?: Date;
      timeSpentSeconds?: number;
      description?: string;
    } = {};
    if (updates.startedAt != null) data.startedAt = new Date(updates.startedAt);
    if (updates.timeSpentSeconds != null)
      data.timeSpentSeconds = updates.timeSpentSeconds;
    if (updates.description !== undefined)
      data.description = updates.description;
    return updateTimeEntry(getClient(), entryId, data);
  }
);
