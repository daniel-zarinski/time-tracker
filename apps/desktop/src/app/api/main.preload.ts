import { contextBridge, ipcRenderer } from 'electron';
import type {
  DatabaseApi,
  ElectronApi,
  JiraApi,
  StoreApi,
  TempoApi,
  TimeTrackingApi,
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
  getJiraIssueByKey: (key: string) =>
    ipcRenderer.invoke('database:get-jira-issue-by-key', key),
  getMyJiraIssues: () => ipcRenderer.invoke('database:get-my-jira-issues'),
  getRelevantJiraIssues: (options) =>
    ipcRenderer.invoke('database:get-relevant-jira-issues', options),
  getAllJiraIssues: () => ipcRenderer.invoke('database:get-all-jira-issues'),
  getTimeEntries: (options) =>
    ipcRenderer.invoke('database:get-time-entries', options),
  getTimeEntriesByIssueKey: (issueKey: string) =>
    ipcRenderer.invoke('database:get-time-entries-by-issue-key', issueKey),
  getActiveTimeEntry: () =>
    ipcRenderer.invoke('database:get-active-time-entry'),
  deleteTimeEntry: (entryId: string) =>
    ipcRenderer.invoke('database:delete-time-entry', entryId),
  updateTimeEntry: (
    entryId: string,
    updates: { startedAt?: Date; timeSpentSeconds?: number; description?: string }
  ) => {
    const payload: {
      startedAt?: string;
      timeSpentSeconds?: number;
      description?: string;
    } = {};
    if (updates.startedAt != null) payload.startedAt = updates.startedAt.toISOString();
    if (updates.timeSpentSeconds != null) payload.timeSpentSeconds = updates.timeSpentSeconds;
    if (updates.description !== undefined) payload.description = updates.description;
    return ipcRenderer.invoke('database:update-time-entry', entryId, payload);
  },
};

const storeApi: StoreApi = {
  get: (key: string) => ipcRenderer.invoke('store:get', key),
  set: (key: string, value: unknown) =>
    ipcRenderer.invoke('store:set', key, value),
  getJiraConfig: () => ipcRenderer.invoke('store:get-jira-config'),
  setJiraConfig: (config: { company: string; email: string; token: string }) =>
    ipcRenderer.invoke('store:set-jira-config', config),
  getTempoConfig: () => ipcRenderer.invoke('store:get-tempo-config'),
  setTempoConfig: (config: { token: string }) =>
    ipcRenderer.invoke('store:set-tempo-config', config),
  getAppTheme: () => ipcRenderer.invoke('store:get-app-theme'),
  setAppTheme: (theme: 'light' | 'dark') =>
    ipcRenderer.invoke('store:set-app-theme', theme),
  getAccentColor: () => ipcRenderer.invoke('store:get-accent-color'),
  setAccentColor: (color) =>
    ipcRenderer.invoke('store:set-accent-color', color),
};

const jiraApi: JiraApi = {
  saveConfig: (config: { company: string; email: string; token: string }) =>
    ipcRenderer.invoke('jira:save-config', config),
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
  syncMyIssues: () => ipcRenderer.invoke('jira:sync-my-issues'),
  getStatusMappings: () => ipcRenderer.invoke('jira:get-status-mappings'),
  updateStatusMapping: (params: {
    statusId: number;
    categoryName: string | null;
  }) => ipcRenderer.invoke('jira:update-status-mapping', params),
};

const tempoApi: TempoApi = {
  testConnection: (config?: { token: string }) =>
    ipcRenderer.invoke('tempo:test-connection', config),
  syncWorklogs: () => ipcRenderer.invoke('tempo:sync-worklogs'),
};

const timeTrackingApi: TimeTrackingApi = {
  startTracking: (issueKey: string, description?: string) =>
    ipcRenderer.invoke('time-tracking:start', issueKey, description),
  stopTracking: (entryId: string) =>
    ipcRenderer.invoke('time-tracking:stop', entryId),
  getTotalSecondsForDay: (date: Date) =>
    ipcRenderer.invoke(
      'time-tracking:get-total-seconds-for-day',
      date.toISOString()
    ),
};

contextBridge.exposeInMainWorld('electron', electronApi);
contextBridge.exposeInMainWorld('database', databaseApi);
contextBridge.exposeInMainWorld('store', storeApi);
contextBridge.exposeInMainWorld('jira', jiraApi);
contextBridge.exposeInMainWorld('tempo', tempoApi);
contextBridge.exposeInMainWorld('timeTracking', timeTrackingApi);
