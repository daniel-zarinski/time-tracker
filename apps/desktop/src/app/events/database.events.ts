import { app, dialog, ipcMain } from 'electron';
import { existsSync, closeSync, openSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fork } from 'child_process';
import { createRequire } from 'module';
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
  getTimeEntriesByIssueKey,
  getActiveTimeEntry,
  deleteTimeEntry,
  updateTimeEntry,
} from '@time-tracker/database';
import { JiraApiError } from '@time-tracker/jira';
import { resolveConfig } from '../services/jira-service';
import { destroyTray } from '../tray';

function getSchemaEngineName(): string {
  if (process.platform === 'win32') return 'schema-engine-windows.exe';
  if (process.platform === 'darwin') {
    return process.arch === 'arm64'
      ? 'schema-engine-darwin-arm64'
      : 'schema-engine-darwin';
  }
  if (process.platform === 'linux')
    return 'schema-engine-debian-openssl-3.0.x';
  throw new Error(`Unsupported platform: ${process.platform}`);
}

async function runMigrations(dbUrl: string): Promise<void> {
  // Schema, config, engine: extraResources in packaged, app path in dev
  const basePath = app.isPackaged ? process.resourcesPath : app.getAppPath();
  const schemaPath = join(basePath, 'prisma', 'schema.prisma');
  const configPath = join(basePath, 'prisma.config.ts');

  if (!existsSync(schemaPath)) {
    throw new Error(
      `Prisma schema not found at ${schemaPath} (basePath: ${basePath})`
    );
  }

  // Prisma CLI: inside ASAR — fork() handles this transparently
  const appPath = app.getAppPath();
  const req = createRequire(join(appPath, 'package.json'));
  const prismaCliPath = join(
    dirname(req.resolve('prisma/package.json')),
    'build',
    'index.js'
  );

  // Schema engine: extraResources in packaged, auto-resolved in dev
  const env: Record<string, string | undefined> = {
    ...process.env,
    DATABASE_URL: dbUrl,
  };
  if (app.isPackaged) {
    const schemaEngineName = getSchemaEngineName();
    env.PRISMA_SCHEMA_ENGINE_BINARY = join(
      process.resourcesPath,
      schemaEngineName
    );
  }

  return new Promise((resolvePromise, reject) => {
    const child = fork(
      prismaCliPath,
      ['migrate', 'deploy', '--schema', schemaPath, '--config', configPath],
      {
        env,
        cwd: app.isPackaged ? process.resourcesPath : undefined,
        stdio: ['ignore', 'pipe', 'pipe', 'ipc'],
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
    const message = err instanceof Error ? err.message : String(err);
    console.error('Migration failed:', message);
    dialog.showErrorBox('Migration failed', message);
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

ipcMain.handle(
  'database:get-time-entries-by-issue-key',
  async (_event, issueKey: string) =>
    getTimeEntriesByIssueKey(getClient(), issueKey)
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
