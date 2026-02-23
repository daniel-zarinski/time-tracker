import type {
  JiraConfigInput,
  JiraMyselfResponse,
  JiraProject,
  JiraIssue,
  JiraStatusInfo,
} from '@time-tracker/jira';
import type { JiraIssueWithParent } from '@time-tracker/database';

/** Database IPC API exposed to the renderer */
export interface DatabaseApi {
  getPath: () => Promise<string>;
  delete: () => Promise<{ success: boolean; error?: string }>;
}

/** Store IPC API exposed to the renderer */
export interface StoreApi {
  get: (key: string) => Promise<unknown>;
  set: (key: string, value: unknown) => Promise<void>;
  getJiraConfig: () => Promise<JiraConfigInput | undefined>;
  setJiraConfig: (config: JiraConfigInput) => Promise<void>;
}

/** Jira IPC API exposed to the renderer */
export interface JiraApi {
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
  getJiraIssues: () => Promise<JiraIssueWithParent[]>;
}

/** Shell / app IPC API exposed to the renderer */
export interface ElectronApi {
  getAppVersion: () => Promise<string>;
  openExternal: (url: string) => Promise<void>;
  showItemInFolder: (path: string) => Promise<void>;
  platform: string;
}
