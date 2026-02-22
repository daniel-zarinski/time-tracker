import type {
  JiraConfigInput,
  JiraMyselfResponse,
  JiraProject,
  JiraIssue,
  JiraStatusInfo,
} from '@time-tracker/jira';

interface ElectronJira {
  testConnection: (config: JiraConfigInput) => Promise<JiraMyselfResponse>;
  fetchProjects: (config: JiraConfigInput) => Promise<JiraProject[]>;
  fetchIssue: (config: JiraConfigInput, key: string) => Promise<JiraIssue | null>;
  fetchIssues: (
    config: JiraConfigInput,
    options?: { project?: string; assigneeCurrentUser?: boolean }
  ) => Promise<JiraIssue[]>;
  fetchMyIssues: (
    config: JiraConfigInput,
    project?: string
  ) => Promise<JiraIssue[]>;
  fetchStatuses: (config: JiraConfigInput) => Promise<JiraStatusInfo[]>;
  fetchStatusesForKeys: (
    config: JiraConfigInput,
    keys: string[]
  ) => Promise<Record<string, string>>;
}

declare global {
  interface Window {
    electron: {
      getAppVersion: () => Promise<string>;
      openExternal: (url: string) => Promise<void>;
      platform: string;
      store: {
        get: (key: string) => Promise<unknown>;
        set: (key: string, value: unknown) => Promise<void>;
        getJiraConfig: () => Promise<JiraConfigInput | undefined>;
        setJiraConfig: (config: JiraConfigInput) => Promise<void>;
      };
      jira: ElectronJira;
    };
  }
}

export {};
