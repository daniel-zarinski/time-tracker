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
    electron: ElectronApi;
    database: DatabaseApi;
    store: StoreApi;
    jira: JiraApi;
    tempo: TempoApi;
    timeTracking: TimeTrackingApi;
  }
}
