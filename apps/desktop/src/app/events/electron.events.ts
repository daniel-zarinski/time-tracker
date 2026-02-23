/**
 * This module is responsible on handling all the inter process communications
 * between the frontend to the electron backend.
 */

import { app, ipcMain, shell } from 'electron';
import { existsSync, unlinkSync } from 'fs';
import { getDatabasePath, disconnect } from '@time-tracker/database';
import { environment } from '../../environments/environment';
import { clearCache } from '../store/cache-store';
import {
  configStore,
  getJiraConfig,
  setJiraConfig,
} from '../store/config-store';

export default class ElectronEvents {
  static bootstrapElectronEvents(): Electron.IpcMain {
    return ipcMain;
  }
}

ipcMain.handle('shell:open-external', (_, url: string) =>
  shell.openExternal(url)
);
ipcMain.handle('shell:show-item-in-folder', (_, path: string) =>
  shell.showItemInFolder(path)
);

ipcMain.handle('database:get-path', () =>
  app.isPackaged
    ? getDatabasePath(app.getPath('userData'))
    : getDatabasePath()
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

// Retrieve app version
ipcMain.handle('get-app-version', () => {
  console.log(`Fetching application version... [v${environment.version}]`);

  return environment.version;
});

// Handle App termination
ipcMain.on('quit', (event, code) => {
  app.exit(code);
});

// Store persistence (electron-store)
// @see https://github.com/sindresorhus/electron-store
ipcMain.handle('store:get', (_, key: string) => configStore.get(key));
ipcMain.handle('store:set', (_, key: string, value: unknown) =>
  configStore.set(key, value)
);
ipcMain.handle('store:get-jira-config', () => getJiraConfig());
ipcMain.handle('store:set-jira-config', (_, config) => setJiraConfig(config));

ipcMain.handle('cache:clear', () => clearCache());
