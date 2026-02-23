import { contextBridge, ipcRenderer } from 'electron';
import type {
  DatabaseApi,
  ElectronApi,
  JiraApi,
  StoreApi,
} from '@time-tracker/utils';

const electronApi: ElectronApi = {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  openExternal: (url: string) => ipcRenderer.invoke('shell:open-external', url),
  openJiraExternal: (issueKey: string) =>
    ipcRenderer.invoke('shell:open-jira-external', issueKey),
  showItemInFolder: (path: string) =>
    ipcRenderer.invoke('shell:show-item-in-folder', path),
  platform: process.platform,
};

const databaseApi: DatabaseApi = {
  getPath: () => ipcRenderer.invoke('database:get-path'),
  delete: () => ipcRenderer.invoke('database:delete'),
  getMyJiraIssues: () => ipcRenderer.invoke('database:get-my-jira-issues'),
  getAllJiraIssues: () => ipcRenderer.invoke('database:get-all-jira-issues'),
};

const storeApi: StoreApi = {
  get: (key: string) => ipcRenderer.invoke('store:get', key),
  set: (key: string, value: unknown) =>
    ipcRenderer.invoke('store:set', key, value),
  getJiraConfig: () => ipcRenderer.invoke('store:get-jira-config'),
  setJiraConfig: (config: { domain: string; email: string; token: string }) =>
    ipcRenderer.invoke('store:set-jira-config', config),
};

const jiraApi: JiraApi = {
  testConnection: (config?: unknown) =>
    ipcRenderer.invoke('jira:test-connection', config),
  fetchProjects: () => ipcRenderer.invoke('jira:fetch-projects'),
  fetchIssue: (key: string) => ipcRenderer.invoke('jira:fetch-issue', key),
  fetchIssues: (options?: unknown) =>
    ipcRenderer.invoke('jira:fetch-issues', options),
  fetchMyIssues: (project?: string) =>
    ipcRenderer.invoke('jira:fetch-my-issues', project),
  fetchStatuses: () => ipcRenderer.invoke('jira:fetch-statuses'),
  fetchStatusesForKeys: (keys: string[]) =>
    ipcRenderer.invoke('jira:fetch-statuses-for-keys', keys),
  fetchMissingIssues: () => ipcRenderer.invoke('jira:fetch-missing-issues'),
};

contextBridge.exposeInMainWorld('electron', electronApi);
contextBridge.exposeInMainWorld('database', databaseApi);
contextBridge.exposeInMainWorld('store', storeApi);
contextBridge.exposeInMainWorld('jira', jiraApi);
