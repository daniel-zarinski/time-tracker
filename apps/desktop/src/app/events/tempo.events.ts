import { TempoApiError } from '@time-tracker/tempo';
import { ipcMain } from 'electron';
import { TempoService, resolveTempoConfig } from '../services/tempo-service';

function serializeError(err: unknown): {
  message: string;
  statusCode?: number;
} {
  if (err instanceof TempoApiError) {
    return { message: err.message, statusCode: err.statusCode };
  }
  const error = err instanceof Error ? err : new Error(String(err));
  return { message: error.message };
}

export function bootstrapTempoEvents(): void {
  ipcMain.handle(
    'tempo:test-connection',
    async (_event, config?: { token: string }): Promise<void> => {
      const resolved = resolveTempoConfig(config);
      try {
        const service = new TempoService(resolved);
        await service.testConnection();
      } catch (err) {
        const { message } = serializeError(err);
        console.error('[tempo:test-connection]', err);
        throw new Error(message);
      }
    }
  );

  ipcMain.handle('tempo:sync-worklogs', async (): Promise<number> => {
    const config = resolveTempoConfig();
    try {
      const service = new TempoService(config);
      return service.syncWorklogs();
    } catch (err) {
      const { message } = serializeError(err);
      console.error('[tempo:sync-worklogs]', err);
      throw new Error(message);
    }
  });
}
