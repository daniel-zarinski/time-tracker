import { app, nativeImage } from 'electron';
import { join } from 'path';
import type { NativeImage } from 'electron';

const TRAY_ICON_SIZE = 16;

/** Idle = stopwatch, Running = stopwatch-running. */
const TRAY_ICON_IDLE = 'stopwatch.png';
const TRAY_ICON_RUNNING = 'stopwatch-running.png';

function getTrayIconPath(filename: string): string {
  return app.isPackaged
    ? join(app.getAppPath(), 'assets', filename)
    : join(__dirname, 'assets', filename);
}

export class TrayIconProvider {
  private idleIcon: NativeImage | null = null;
  private runningIcon: NativeImage | null = null;

  getIcon(isRunning: boolean): NativeImage {
    if (process.platform === 'darwin') {
      return this.getMacOSIcon(isRunning);
    }
    return isRunning ? this.getRunningIcon() : this.getIdleIcon();
  }

  private getMacOSIcon(isRunning: boolean): NativeImage {
    const sfSymbol = isRunning ? 'stop.fill' : 'stopwatch.fill';
    try {
      let img = nativeImage.createFromNamedImage(sfSymbol);
      if (img.isEmpty()) {
        return isRunning ? this.getRunningIcon() : this.getIdleIcon();
      }
      img = img.resize({ width: TRAY_ICON_SIZE, height: TRAY_ICON_SIZE });
      img.setTemplateImage(true);
      return img;
    } catch {
      return isRunning ? this.getRunningIcon() : this.getIdleIcon();
    }
  }

  private getIdleIcon(): NativeImage {
    if (!this.idleIcon) {
      this.idleIcon = this.loadFileIcon(TRAY_ICON_IDLE);
    }
    return this.idleIcon;
  }

  private getRunningIcon(): NativeImage {
    if (!this.runningIcon) {
      this.runningIcon = this.loadFileIcon(TRAY_ICON_RUNNING);
    }
    return this.runningIcon;
  }

  private loadFileIcon(filename: string): NativeImage {
    const path = getTrayIconPath(filename);
    let img = nativeImage.createFromPath(path);
    if (img.isEmpty()) {
      img = nativeImage.createEmpty();
    } else {
      img = img.resize({ width: TRAY_ICON_SIZE, height: TRAY_ICON_SIZE });
      if (process.platform === 'darwin') {
        img.setTemplateImage(true);
      }
    }
    return img;
  }
}
