import { Tray, Menu, nativeImage, BrowserWindow, app } from 'electron';
import { join } from 'path';
import {
  getClient,
  getActiveTimeEntry,
  getRelevantJiraIssues,
} from '@time-tracker/database';
import type { TimeEntryWithIssue } from '@time-tracker/database';
import type { JiraIssueWithParent } from '@time-tracker/database';
import { getJiraConfig } from './store/config-store';

let tray: Tray | null = null;
let updateInterval: ReturnType<typeof setInterval> | null = null;

const DEFAULT_ISSUE_LIMIT = 5;

function getIconPath(): string {
  return join(__dirname, 'assets', 'icon.png');
}

async function getRunningEntry(): Promise<TimeEntryWithIssue | null> {
  try {
    return await getActiveTimeEntry(getClient());
  } catch {
    return null;
  }
}

async function getRelevantIssues(
  limit = DEFAULT_ISSUE_LIMIT
): Promise<JiraIssueWithParent[]> {
  try {
    const config = getJiraConfig();
    if (!config?.email) return [];
    return getRelevantJiraIssues(getClient(), config.email, { limit });
  } catch {
    return [];
  }
}

function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return hours > 0
    ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
    : `${pad(minutes)}:${pad(seconds)}`;
}

function formatIssueLabel(issue: JiraIssueWithParent): string {
  const key = issue.key ?? '';
  const summary = issue.summary?.trim() ?? '';
  return summary ? `${key}: ${summary}` : key || 'Unknown';
}

function showMainWindow(): void {
  const win = BrowserWindow.getAllWindows()[0];
  if (win) {
    win.show();
    win.focus();
  }
}

async function buildContextMenu(): Promise<Menu> {
  const [running, issues] = await Promise.all([
    getRunningEntry(),
    getRelevantIssues(DEFAULT_ISSUE_LIMIT),
  ]);

  const menuItems: Electron.MenuItemConstructorOptions[] = [];

  if (running) {
    const elapsed = Date.now() - running.startedAt.getTime();
    const label =
      running.issue.summary?.trim() || running.issueKey || 'Unknown';
    menuItems.push(
      {
        label: `▶ ${label}`,
        enabled: false,
      },
      {
        label: `   ${formatElapsed(elapsed)}`,
        enabled: false,
      },
      { type: 'separator' }
    );
  } else {
    menuItems.push(
      { label: 'No timer running', enabled: false },
      { type: 'separator' }
    );
  }

  if (issues.length > 0) {
    menuItems.push({ label: 'Relevant Issues', enabled: false });
    for (const issue of issues) {
      const isRunning = running?.issueKey === issue.key;
      menuItems.push({
        label: `  ${isRunning ? '⏱' : '○'} ${formatIssueLabel(issue)}`,
        enabled: false,
      });
    }
    menuItems.push({ type: 'separator' });
  }

  menuItems.push(
    {
      label: 'Open Tempo Tracker',
      click: showMainWindow,
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => app.quit(),
    }
  );

  return Menu.buildFromTemplate(menuItems);
}

async function updateTray(): Promise<void> {
  if (!tray) return;

  try {
    const running = await getRunningEntry();
    if (running) {
      const elapsed = Date.now() - running.startedAt.getTime();
      const label =
        running.issue.summary?.trim() || running.issueKey || 'Unknown';
      tray.setTitle(` ${formatElapsed(elapsed)}`);
      tray.setToolTip(`${label} - ${formatElapsed(elapsed)}`);
    } else {
      tray.setTitle('');
      tray.setToolTip('Tempo Tracker');
    }
  } catch {
    tray.setTitle('');
    tray.setToolTip('Tempo Tracker');
  }
}

export function createTray(): void {
  const iconPath = getIconPath();
  let trayIcon = nativeImage.createFromPath(iconPath);
  trayIcon = trayIcon.resize({ width: 16, height: 16 });
  if (process.platform === 'darwin') {
    trayIcon.setTemplateImage(true);
  }

  tray = new Tray(trayIcon);
  tray.setToolTip('Tempo Tracker');

  tray.on('click', () => {
    void buildContextMenu().then((menu) => {
      tray?.setContextMenu(menu);
      tray?.popUpContextMenu();
    });
  });
  tray.on('right-click', () => {
    void buildContextMenu().then((menu) => {
      tray?.setContextMenu(menu);
      tray?.popUpContextMenu();
    });
  });

  void updateTray();
  updateInterval = setInterval(() => void updateTray(), 1000);
}

export function destroyTray(): void {
  if (updateInterval) {
    clearInterval(updateInterval);
    updateInterval = null;
  }
  if (tray) {
    tray.destroy();
    tray = null;
  }
}
