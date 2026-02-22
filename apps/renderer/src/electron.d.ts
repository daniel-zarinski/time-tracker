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
  fetchIssues: (
    options?: { project?: string; assigneeCurrentUser?: boolean }
  ) => Promise<JiraIssue[]>;
  fetchMyIssues: (project?: string) => Promise<JiraIssue[]>;
  fetchStatuses: () => Promise<JiraStatusInfo[]>;
  fetchStatusesForKeys: (keys: string[]) => Promise<Record<string, string>>;
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
