import type {
  DatabaseApi,
  ElectronApi,
  JiraApi,
  StoreApi,
  TempoApi,
  TimeTrackingApi,
} from '@time-tracker/utils';

declare global {
  interface Window {
    database: DatabaseApi;
    store: StoreApi;
    jira: JiraApi;
    tempo: TempoApi;
    electron: ElectronApi;
    timeTracking: TimeTrackingApi;
  }
}

export {};
