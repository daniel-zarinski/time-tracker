import type {
  JiraConfigInput,
  JiraIssue,
  JiraMyselfResponse,
  JiraProject,
  JiraStatusInfo,
} from '@time-tracker/jira';
import { JiraApiError } from '@time-tracker/jira';
import { ipcMain } from 'electron';
import { JiraService } from '../services';
import { resolveConfig } from '../services/jira-service';

function serializeError(err: unknown): {
  message: string;
  statusCode?: number;
} {
  if (err instanceof JiraApiError) {
    return { message: err.message, statusCode: err.statusCode };
  }
  return {
    message: err instanceof Error ? err.message : String(err),
  };
}

export function bootstrapJiraEvents(): void {
  ipcMain.handle(
    'jira:test-connection',
    async (_event, input?: JiraConfigInput): Promise<JiraMyselfResponse> => {
      const config = resolveConfig(input);
      try {
        const service = new JiraService(config);
        return service.testConnection();
      } catch (err) {
        throw serializeError(err);
      }
    }
  );

  ipcMain.handle('jira:fetch-projects', async (): Promise<JiraProject[]> => {
    const config = resolveConfig();
    try {
      const service = new JiraService(config);
      return service.fetchProjects();
    } catch (err) {
      throw serializeError(err);
    }
  });

  ipcMain.handle(
    'jira:fetch-issue',
    async (_event, key: string): Promise<JiraIssue | null> => {
      const config = resolveConfig();
      try {
        const service = new JiraService(config);
        return service.fetchIssue(key);
      } catch (err) {
        throw serializeError(err);
      }
    }
  );

  ipcMain.handle(
    'jira:fetch-issues',
    async (
      _event,
      options?: { project?: string; assigneeCurrentUser?: boolean }
    ): Promise<JiraIssue[]> => {
      const config = resolveConfig();
      try {
        const service = new JiraService(config);
        return service.fetchIssues(options);
      } catch (err) {
        throw serializeError(err);
      }
    }
  );

  ipcMain.handle(
    'jira:fetch-my-issues',
    async (_event, project?: string): Promise<JiraIssue[]> => {
      const normalizedProject =
        project === 'all' || !project ? undefined : project;
      const config = resolveConfig();
      try {
        const service = new JiraService(config);
        return service.fetchMyIssues(normalizedProject);
      } catch (err) {
        throw serializeError(err);
      }
    }
  );

  ipcMain.handle('jira:fetch-statuses', async (): Promise<JiraStatusInfo[]> => {
    const config = resolveConfig();
    try {
      const service = new JiraService(config);
      return service.fetchStatuses();
    } catch (err) {
      throw serializeError(err);
    }
  });

  ipcMain.handle(
    'jira:fetch-statuses-for-keys',
    async (_event, keys: string[]): Promise<Record<string, string>> => {
      const config = resolveConfig();
      try {
        const service = new JiraService(config);
        return service.fetchStatusesForKeys(keys);
      } catch (err) {
        throw serializeError(err);
      }
    }
  );

  ipcMain.handle('jira:fetch-missing-issues', async () => {
    const config = resolveConfig();
    try {
      const service = new JiraService(config);
      return service.fetchMissingIssues();
    } catch (err) {
      throw serializeError(err);
    }
  });
}
