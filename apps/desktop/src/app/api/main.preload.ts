import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  openExternal: (url: string) => ipcRenderer.invoke('shell:open-external', url),
  showItemInFolder: (path: string) =>
    ipcRenderer.invoke('shell:show-item-in-folder', path),
  platform: process.platform,
});

contextBridge.exposeInMainWorld('database', {
  getPath: () => ipcRenderer.invoke('database:get-path'),
  delete: () => ipcRenderer.invoke('database:delete'),
});

contextBridge.exposeInMainWorld('store', {
  get: (key: string) => ipcRenderer.invoke('store:get', key),
  set: (key: string, value: unknown) =>
    ipcRenderer.invoke('store:set', key, value),
  getJiraConfig: () => ipcRenderer.invoke('store:get-jira-config'),
  setJiraConfig: (config: { domain: string; email: string; token: string }) =>
    ipcRenderer.invoke('store:set-jira-config', config),
});

contextBridge.exposeInMainWorld('jira', {
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
  getJiraIssues: () => ipcRenderer.invoke('jira:get-issues'),
});
