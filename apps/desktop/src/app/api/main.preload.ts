import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  platform: process.platform,
  jira: {
    testConnection: (config: unknown) =>
      ipcRenderer.invoke('jira:test-connection', config),
    fetchProjects: (config: unknown) =>
      ipcRenderer.invoke('jira:fetch-projects', config),
    fetchIssue: (config: unknown, key: string) =>
      ipcRenderer.invoke('jira:fetch-issue', config, key),
    fetchIssues: (config: unknown, options?: unknown) =>
      ipcRenderer.invoke('jira:fetch-issues', config, options),
    fetchMyIssues: (config: unknown, project?: string) =>
      ipcRenderer.invoke('jira:fetch-my-issues', config, project),
    fetchStatuses: (config: unknown) =>
      ipcRenderer.invoke('jira:fetch-statuses', config),
    fetchStatusesForKeys: (config: unknown, keys: string[]) =>
      ipcRenderer.invoke('jira:fetch-statuses-for-keys', config, keys),
  },
});
