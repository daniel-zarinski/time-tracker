import type {
  JiraConfigInput,
  JiraMyselfResponse,
  JiraProject,
  JiraIssue,
  JiraStatusInfo,
} from '@time-tracker/jira';

interface ElectronJira {
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
  getJiraIssues: () => Promise<JiraIssue[]>;
}

interface ElectronStore {
  get: (key: string) => Promise<unknown>;
  set: (key: string, value: unknown) => Promise<void>;
  getJiraConfig: () => Promise<JiraConfigInput | undefined>;
  setJiraConfig: (config: JiraConfigInput) => Promise<void>;
}

interface ElectronCache {
  clearCache: () => Promise<void>;
}

interface ElectronDatabase {
  getPath: () => Promise<string>;
  delete: () => Promise<{ success: boolean; error?: string }>;
}

declare global {
  interface Window {
    electron: {
      getAppVersion: () => Promise<string>;
      openExternal: (url: string) => Promise<void>;
      showItemInFolder: (path: string) => Promise<void>;
      platform: string;
      database: ElectronDatabase;
      cache: ElectronCache;
      store: ElectronStore;
      jira: ElectronJira;
    };
  }
}

export {};
