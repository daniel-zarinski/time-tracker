import { Tray, Menu, nativeImage, BrowserWindow, app } from 'electron';
import { join } from 'path';
import {
  getClient,
  getActiveTimeEntry,
  getRelevantJiraIssues,
  getTimeEntries,
  stopTimeEntry,
} from '@time-tracker/database';
import type {
  TimeEntryWithIssue,
  JiraIssueWithParent,
} from '@time-tracker/database';
import { getJiraConfig } from './store/config-store';
import { TimeTrackingService } from './services/time-tracking-service';

let tray: Tray | null = null;
let updateInterval: ReturnType<typeof setInterval> | null = null;

const DEFAULT_ISSUE_LIMIT = 5;

function getIconPath(): string {
  return app.isPackaged
    ? join(app.getAppPath(), 'assets', 'icon.png')
    : join(__dirname, 'assets', 'icon.png');
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

    const [timeEntries, relevantIssues] = await Promise.all([
      getTimeEntries(getClient(), { limit: 20 }),
      getRelevantJiraIssues(getClient(), config.email, { limit: limit + 2 }),
    ]);

    const last2: JiraIssueWithParent[] = [];
    const last2Keys = new Set<string>();
    for (const entry of timeEntries) {
      const issue = entry.issue;
      if (
        issue?.key &&
        issue.assigneeEmail === config.email &&
        !last2Keys.has(issue.key)
      ) {
        last2Keys.add(issue.key);
        last2.push(issue);
        if (last2.length >= 2) break;
      }
    }

    const seenKeys = new Set<string>();
    const result: JiraIssueWithParent[] = [];
    for (const issue of [...last2, ...relevantIssues]) {
      if (issue.key && !seenKeys.has(issue.key)) {
        seenKeys.add(issue.key);
        result.push(issue);
        if (result.length >= limit) break;
      }
    }
    return result.slice(0, limit);
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
    const label =
      formatIssueLabel(running.issue) || running.issueKey || 'Unknown';
    const entryId = running.id;
    menuItems.push(
      {
        label: `▶ ${label}`,
        enabled: false,
      },
      {
        label: 'Stop',
        click: () => void stopTimeEntry(getClient(), entryId),
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
    const timeTrackingService = new TimeTrackingService();
    for (const issue of issues) {
      const isRunning = running?.issueKey === issue.key;
      const issueKey = issue.key;
      const canStart = !!issueKey && !isRunning;
      menuItems.push({
        label: `  ${isRunning ? '⏱' : '○'} ${formatIssueLabel(issue)}`,
        enabled: canStart,
        ...(canStart && {
          click: () => void timeTrackingService.startTracking(issueKey),
        }),
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
