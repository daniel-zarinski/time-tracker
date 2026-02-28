import { autoUpdater } from 'electron-updater';
import { dialog } from 'electron';

export default class UpdateEvents {
  static initAutoUpdateService() {
    console.log('Initializing auto update service...\n');
    autoUpdater.checkForUpdatesAndNotify();
  }
}

autoUpdater.on('update-downloaded', (info) => {
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

autoUpdater.on('error', (err) => {
  console.error('Auto-update error:', err.message);
});
