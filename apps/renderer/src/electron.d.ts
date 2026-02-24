import type {
  DatabaseApi,
  StoreApi,
  JiraApi,
  ElectronApi,
  TimeTrackingApi,
} from '@time-tracker/utils';

declare global {
  interface Window {
    database: DatabaseApi;
    store: StoreApi;
    jira: JiraApi;
    electron: ElectronApi;
    timeTracking: TimeTrackingApi;
  }
}

export {};
