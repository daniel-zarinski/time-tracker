import { ipcMain } from 'electron';
import { TimeTrackingService } from '../services/time-tracking-service';

ipcMain.handle(
  'time-tracking:start',
  async (_, issueKey: string, description?: string) => {
    const timeTrackingService = new TimeTrackingService();

    const timeEntry = await timeTrackingService.startTracking(
      issueKey,
      description
    );

    return timeEntry;
  }
);

ipcMain.handle('time-tracking:stop', async (_, entryId: string) => {
  const timeTrackingService = new TimeTrackingService();
  return timeTrackingService.stopTracking(entryId);
});
