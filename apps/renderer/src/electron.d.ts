import type {
  JiraConfig,
  JiraMyselfResponse,
  JiraProject,
  JiraIssue,
  JiraStatusInfo,
} from '@time-tracker/jira';

interface ElectronJira {
  testConnection: (config: JiraConfig) => Promise<JiraMyselfResponse>;
  fetchProjects: (config: JiraConfig) => Promise<JiraProject[]>;
  fetchIssue: (config: JiraConfig, key: string) => Promise<JiraIssue | null>;
  fetchIssues: (
    config: JiraConfig,
    options?: { project?: string; assigneeCurrentUser?: boolean }
  ) => Promise<JiraIssue[]>;
  fetchMyIssues: (config: JiraConfig, project?: string) => Promise<JiraIssue[]>;
  fetchStatuses: (config: JiraConfig) => Promise<JiraStatusInfo[]>;
  fetchStatusesForKeys: (
    config: JiraConfig,
    keys: string[]
  ) => Promise<Record<string, string>>;
}

declare global {
  interface Window {
    electron: {
      getAppVersion: () => Promise<string>;
      platform: string;
      jira: ElectronJira;
    };
  }
}

export {};
