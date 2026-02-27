import type {
  JiraConfigInput,
  JiraMyselfResponse,
  JiraIssue,
  JiraStatusInfo,
  JiraStatusWithCategory,
  TempoConfig,
} from '@time-tracker/schema';
import type { JiraProject } from '@time-tracker/jira';
import type {
  JiraIssueWithParent,
  TimeEntryWithIssue,
} from '@time-tracker/database';

/** Time Tracking IPC API exposed to the renderer */
export interface TimeTrackingApi {
  startTracking: (
    issueKey: string,
    description?: string
  ) => Promise<TimeEntryWithIssue>;
  stopTracking: (entryId: string) => Promise<void>;
  getTotalSecondsForDay: (date: Date) => Promise<number>;
}

/** Database IPC API exposed to the renderer */
export interface DatabaseApi {
  getPath: () => Promise<string>;
  delete: () => Promise<{ success: boolean; error?: string }>;
  getMyJiraIssues: () => Promise<JiraIssueWithParent[]>;
  getRelevantJiraIssues: (options?: {
    limit?: number;
  }) => Promise<JiraIssueWithParent[]>;
  getJiraIssueByKey: (key: string) => Promise<JiraIssueWithParent | null>;
  getAllJiraIssues: () => Promise<JiraIssueWithParent[]>;
  getTimeEntries: (options?: {
    limit?: number;
  }) => Promise<TimeEntryWithIssue[]>;
  getTimeEntriesByIssueKey: (issueKey: string) => Promise<TimeEntryWithIssue[]>;
  getActiveTimeEntry: () => Promise<TimeEntryWithIssue | null>;
  deleteTimeEntry: (entryId: string) => Promise<void>;
  updateTimeEntry: (
    entryId: string,
    updates: { startedAt?: Date; timeSpentSeconds?: number; description?: string }
  ) => Promise<TimeEntryWithIssue>;
}

/** Store IPC API exposed to the renderer */
export interface StoreApi {
  get: (key: string) => Promise<unknown>;
  set: (key: string, value: unknown) => Promise<void>;
  getJiraConfig: () => Promise<JiraConfigInput | undefined>;
  setJiraConfig: (config: JiraConfigInput) => Promise<void>;
  getTempoConfig: () => Promise<TempoConfig | undefined>;
  setTempoConfig: (config: TempoConfig) => Promise<void>;
  getAppTheme: () => Promise<'light' | 'dark' | undefined>;
  setAppTheme: (theme: 'light' | 'dark') => Promise<void>;
}

/** Jira IPC API exposed to the renderer */
export interface JiraApi {
  saveConfig: (config: JiraConfigInput) => Promise<void>;
  testConnection: (config?: JiraConfigInput) => Promise<JiraMyselfResponse>;
  fetchProjects: () => Promise<JiraProject[]>;
  fetchIssue: (key: string) => Promise<JiraIssue | null>;
  fetchIssues: (options?: {
    project?: string;
    assigneeCurrentUser?: boolean;
  }) => Promise<JiraIssue[]>;
  fetchMyIssues: (project?: string) => Promise<JiraIssue[]>;
  fetchStatuses: () => Promise<JiraStatusInfo[]>;
  fetchStatusesForKeys: (keys: string[]) => Promise<Record<string, string>>;
  fetchMissingIssues: () => Promise<void>;
  syncMyIssues: () => Promise<{ synced: number; missing: number }>;
  getStatusMappings: () => Promise<JiraStatusWithCategory[]>;
  updateStatusMapping: (params: {
    statusId: number;
    categoryName: string | null;
  }) => Promise<void>;
}

/** Tempo IPC API exposed to the renderer */
export interface TempoApi {
  testConnection: (config?: TempoConfig) => Promise<void>;
  syncWorklogs: () => Promise<number>;
}

/** Shell / app IPC API exposed to the renderer */
export interface ElectronApi {
  getAppVersion: () => Promise<string>;
  openExternal: (url: string) => Promise<void>;
  openJiraExternal: (issueKey: string) => Promise<void>;
  showItemInFolder: (path: string) => Promise<void>;
  platform: string;
}
