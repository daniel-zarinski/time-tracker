import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import { dialog } from 'electron';

// Route all electron-updater logs to electron-log (persisted to file)
autoUpdater.logger = log;

export default class UpdateEvents {
  static initAutoUpdateService() {
    log.info('[auto-update] Initializing auto update service...');
    autoUpdater.checkForUpdatesAndNotify().catch((err) => {
      log.error('[auto-update] Check failed:', err);
    });
  }
}

autoUpdater.on('update-downloaded', (info) => {
  log.info(`[auto-update] Downloaded v${info.version}`);
  dialog
    .showMessageBox({
      type: 'info',
      buttons: ['Restart', 'Later'],
      title: 'Application Update',
      message: `Version ${info.version} has been downloaded.`,
      detail: 'Restart the application to apply the update.',
    })
    .then((result) => {
      if (result.response === 0) autoUpdater.quitAndInstall();
    });
});
